import Foundation
import SwiftUI
import Translation

/// ViewModel for the Guide role — orchestrates speech recognition,
/// translation, and distribution to listeners.
@Observable
final class GuideViewModel {
    // MARK: - Services

    let speechService = SpeechRecognitionService()
    let translationService = TranslationService()
    let sessionServer = SessionServer()
    let multipeerService = MultipeerService()

    // MARK: - State

    var sourceLanguage: SupportedLanguage = .german
    var isSessionActive: Bool = false
    var isGuiding: Bool = false
    var elapsedTime: TimeInterval = 0
    var translationHistory: [TranslationChunk] = []
    var languageAvailability: [SupportedLanguage: LanguageAvailability.Status] = [:]

    // MARK: - Private

    private var timer: Timer?
    private var guidingStartTime: Date?

    // MARK: - Session Lifecycle

    /// Create a new guide session and start the server.
    func createSession() async throws {
        translationService.sourceLanguage = sourceLanguage

        // Start WebSocket server
        try sessionServer.start()

        // Start Multipeer advertising
        multipeerService.startAdvertising(
            sessionCode: sessionServer.sessionCode,
            guideName: UIDevice.current.name
        )

        // Listen for language requests from connecting listeners
        sessionServer.onLanguageRequested = { [weak self] language in
            self?.translationService.addTargetLanguage(language)
        }

        // Set up translation callback — broadcast results to listeners
        translationService.onTranslationReady = { [weak self] chunk in
            self?.sessionServer.broadcast(chunk)
            Task { @MainActor in
                self?.translationHistory.append(chunk)
            }
        }

        // Check language availability
        languageAvailability = await translationService.checkLanguageAvailability()

        isSessionActive = true
    }

    /// End the session and clean up.
    func endSession() {
        stopGuiding()
        sessionServer.stop()
        multipeerService.disconnect()
        isSessionActive = false
    }

    // MARK: - Guiding Lifecycle

    /// Start the live guiding session (begin recording).
    func startGuiding() async throws {
        speechService.updateLocale(Locale(identifier: sourceLanguage.rawValue))

        // Wire up the speech service to trigger translations
        speechService.onChunkReady = { [weak self] chunk in
            guard let self else { return }
            Task {
                await self.translationService.translateChunk(chunk)
            }
        }

        try await speechService.startRecording()

        guidingStartTime = Date()
        startTimer()
        isGuiding = true
    }

    /// Stop the live guiding.
    func stopGuiding() {
        speechService.stopRecording()
        stopTimer()
        isGuiding = false
        guidingStartTime = nil
    }

    /// Pause guiding (stop recording but keep session open).
    func pauseGuiding() {
        speechService.stopRecording()
        stopTimer()
        isGuiding = false
    }

    // MARK: - Deploy

    /// Manual deploy: the guide presses the DEPLOY button to send
    /// the current accumulated text for translation immediately.
    func deploy() {
        _ = speechService.deployCurrentChunk()
    }

    // MARK: - Translation Session Registration

    /// Called from the SwiftUI view when a translationTask provides a session.
    func registerTranslationSession(_ session: TranslationSession, for language: SupportedLanguage) {
        translationService.registerSession(session, for: language)
    }

    // MARK: - Computed

    var listenerCount: Int {
        sessionServer.connectedListeners.count
    }

    var listenersByLanguage: [SupportedLanguage: Int] {
        var counts: [SupportedLanguage: Int] = [:]
        for listener in sessionServer.connectedListeners {
            counts[listener.targetLanguage, default: 0] += 1
        }
        return counts
    }

    var formattedElapsedTime: String {
        let minutes = Int(elapsedTime) / 60
        let seconds = Int(elapsedTime) % 60
        let hours = minutes / 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes % 60, seconds)
        }
        return String(format: "%02d:%02d", minutes, seconds)
    }

    // MARK: - Private

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self, let start = self.guidingStartTime else { return }
            Task { @MainActor in
                self.elapsedTime = Date().timeIntervalSince(start)
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
}
