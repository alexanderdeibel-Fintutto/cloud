import Foundation
import AVFoundation

/// Text-to-Speech service for listener devices.
/// Reads out translated text using Apple's AVSpeechSynthesizer.
@Observable
final class TTSService {
    // MARK: - State

    var isEnabled: Bool = false
    var isSpeaking: Bool = false
    var speechRate: Float = AVSpeechUtteranceDefaultSpeechRate

    // MARK: - Private

    private let synthesizer = AVSpeechSynthesizer()
    private var utteranceQueue: [AVSpeechUtterance] = []

    // MARK: - Public API

    /// Speak translated text in the specified language.
    func speak(_ text: String, language: SupportedLanguage) {
        guard isEnabled, !text.isEmpty else { return }

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: language.rawValue)
        utterance.rate = speechRate
        utterance.pitchMultiplier = 1.0
        utterance.preUtteranceDelay = 0.1
        utterance.postUtteranceDelay = 0.2

        synthesizer.speak(utterance)
        isSpeaking = true
    }

    /// Stop any ongoing speech.
    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        isSpeaking = false
    }

    /// Toggle TTS on/off.
    func toggle() {
        isEnabled.toggle()
        if !isEnabled {
            stop()
        }
    }

    /// Adjust speech rate (0.0 to 1.0).
    func setRate(_ rate: Float) {
        speechRate = max(AVSpeechUtteranceMinimumSpeechRate,
                        min(rate, AVSpeechUtteranceMaximumSpeechRate))
    }
}
