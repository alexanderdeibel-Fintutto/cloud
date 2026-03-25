import Foundation
import Speech
import AVFoundation

/// Continuous speech recognition service using SpeechAnalyzer (iOS 26+).
/// Keeps the audio channel open at all times — the core feature that fixes
/// Apple's ping-pong problem for monologue use cases.
@Observable
final class SpeechRecognitionService {
    // MARK: - Published State

    /// The current partial transcript (live, not yet finalized)
    var partialTranscript: String = ""

    /// All finalized text segments that have been "deployed"
    var finalizedSegments: [String] = []

    /// Whether the service is actively recording
    var isRecording: Bool = false

    /// Error state
    var error: Error?

    // MARK: - Private

    private var speechAnalyzer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    /// Buffer for text accumulated since the last deploy
    private var accumulatedText: String = ""

    /// Callback when a chunk is ready to be translated
    var onChunkReady: ((String) -> Void)?

    // MARK: - Initialization

    init(locale: Locale = Locale(identifier: "de-DE")) {
        self.speechAnalyzer = SFSpeechRecognizer(locale: locale)
    }

    // MARK: - Public API

    /// Start continuous speech recognition.
    /// Audio capture remains active even when translation is being delivered.
    func startRecording() async throws {
        guard let speechAnalyzer, speechAnalyzer.isAvailable else {
            throw SpeechError.recognizerUnavailable
        }

        // Request authorization
        let status = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }

        guard status == .authorized else {
            throw SpeechError.notAuthorized
        }

        // Configure audio session — crucial: allow playback + recording simultaneously
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)

        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest else {
            throw SpeechError.requestCreationFailed
        }

        recognitionRequest.shouldReportPartialResults = true
        recognitionRequest.requiresOnDeviceRecognition = true
        recognitionRequest.addsPunctuation = true

        // Start recognition task
        recognitionTask = speechAnalyzer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            guard let self else { return }

            if let result {
                let transcript = result.bestTranscription.formattedString
                Task { @MainActor in
                    self.partialTranscript = transcript
                    self.accumulatedText = transcript
                }
            }

            if let error {
                Task { @MainActor in
                    self.error = error
                }
            }
        }

        // Install audio tap on the microphone input
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
        }

        audioEngine.prepare()
        try audioEngine.start()

        isRecording = true
    }

    /// Stop recording and clean up.
    func stopRecording() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
        isRecording = false
    }

    /// Deploy the current accumulated text as a translation chunk.
    /// This is the "DEPLOY button" action — the guide manually triggers this
    /// to send the current text for translation, even before sentence detection kicks in.
    func deployCurrentChunk() -> String? {
        let text = accumulatedText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return nil }

        finalizedSegments.append(text)
        let chunk = text
        accumulatedText = ""

        // Reset recognition to start fresh for the next segment
        // The audio engine stays running — this is the key difference from Apple's Translate app
        restartRecognition()

        onChunkReady?(chunk)
        return chunk
    }

    /// Auto-deploy: called when silence/sentence-end is detected.
    func autoDeployIfReady() -> String? {
        let text = accumulatedText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard text.count > 10 else { return nil } // minimum chunk size
        return deployCurrentChunk()
    }

    // MARK: - Private

    /// Restart the recognition task without stopping the audio engine.
    /// This allows continuous recording while resetting the text buffer.
    private func restartRecognition() {
        recognitionTask?.cancel()
        recognitionRequest?.endAudio()

        guard let speechAnalyzer else { return }

        let newRequest = SFSpeechAudioBufferRecognitionRequest()
        newRequest.shouldReportPartialResults = true
        newRequest.requiresOnDeviceRecognition = true
        newRequest.addsPunctuation = true
        recognitionRequest = newRequest

        recognitionTask = speechAnalyzer.recognitionTask(with: newRequest) { [weak self] result, error in
            guard let self else { return }

            if let result {
                let transcript = result.bestTranscription.formattedString
                Task { @MainActor in
                    self.partialTranscript = transcript
                    self.accumulatedText = transcript
                }
            }

            if let error {
                Task { @MainActor in
                    self.error = error
                }
            }
        }

        // Re-install audio tap
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
        }
    }

    func updateLocale(_ locale: Locale) {
        let wasRecording = isRecording
        if wasRecording { stopRecording() }
        speechAnalyzer = SFSpeechRecognizer(locale: locale)
        if wasRecording {
            Task { try? await startRecording() }
        }
    }
}

// MARK: - Errors

enum SpeechError: LocalizedError {
    case recognizerUnavailable
    case notAuthorized
    case requestCreationFailed

    var errorDescription: String? {
        switch self {
        case .recognizerUnavailable:
            "Speech recognition is not available on this device."
        case .notAuthorized:
            "Speech recognition permission was denied."
        case .requestCreationFailed:
            "Failed to create speech recognition request."
        }
    }
}
