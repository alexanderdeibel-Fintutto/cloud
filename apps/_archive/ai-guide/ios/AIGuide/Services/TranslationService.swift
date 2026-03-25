import Foundation
import Translation
import SwiftUI

/// Manages parallel translation sessions — one per target language.
/// Uses Apple's Translation framework for on-device, offline translation.
@Observable
final class TranslationService {
    // MARK: - State

    /// Active translation configurations (one per target language)
    var activeConfigurations: [SupportedLanguage: TranslationSession.Configuration] = [:]

    /// Latest translations per language
    var latestTranslations: [SupportedLanguage: TranslationChunk] = [:]

    /// Whether translations are currently in progress
    var isTranslating: Bool = false

    /// Source language
    var sourceLanguage: SupportedLanguage = .german

    /// Target languages requested by connected listeners
    var requestedLanguages: Set<SupportedLanguage> = []

    /// Callback when a translation is ready
    var onTranslationReady: ((TranslationChunk) -> Void)?

    // MARK: - Private

    /// Active TranslationSession instances (obtained from SwiftUI view modifiers)
    private var sessions: [SupportedLanguage: TranslationSession] = [:]

    // MARK: - Public API

    /// Register a TranslationSession for a specific target language.
    /// Called from the SwiftUI view when the translationTask modifier provides a session.
    func registerSession(_ session: TranslationSession, for language: SupportedLanguage) {
        sessions[language] = session
    }

    /// Add a target language (when a new listener connects with that language).
    func addTargetLanguage(_ language: SupportedLanguage) {
        requestedLanguages.insert(language)

        // Create a configuration for this language pair
        let config = TranslationSession.Configuration(
            source: sourceLanguage.locale,
            target: language.locale
        )
        activeConfigurations[language] = config
    }

    /// Remove a target language (when all listeners of that language disconnect).
    func removeTargetLanguage(_ language: SupportedLanguage) {
        requestedLanguages.remove(language)
        activeConfigurations.removeValue(forKey: language)
        sessions.removeValue(forKey: language)
    }

    /// Translate a text chunk into all requested languages simultaneously.
    /// Returns an array of TranslationChunks (one per target language).
    func translateChunk(_ sourceText: String) async -> [TranslationChunk] {
        guard !sourceText.isEmpty else { return [] }

        isTranslating = true
        defer { isTranslating = false }

        // Launch parallel translations for all requested languages
        return await withTaskGroup(of: TranslationChunk?.self) { group in
            for language in requestedLanguages {
                guard let session = sessions[language] else { continue }

                group.addTask {
                    do {
                        let response = try await session.translate(sourceText)
                        let chunk = TranslationChunk(
                            sourceText: sourceText,
                            translatedText: response.targetText,
                            targetLanguage: language.rawValue
                        )
                        return chunk
                    } catch {
                        print("Translation to \(language.displayName) failed: \(error)")
                        return nil
                    }
                }
            }

            var results: [TranslationChunk] = []
            for await chunk in group {
                if let chunk {
                    results.append(chunk)
                    latestTranslations[SupportedLanguage(rawValue: chunk.targetLanguage) ?? .english] = chunk
                    onTranslationReady?(chunk)
                }
            }
            return results
        }
    }

    /// Get all configurations that need to be attached to the SwiftUI view
    /// via .translationTask() modifiers.
    func configurationsForView() -> [(SupportedLanguage, TranslationSession.Configuration)] {
        activeConfigurations.map { ($0.key, $0.value) }
    }

    /// Check which language packs are available offline.
    func checkLanguageAvailability() async -> [SupportedLanguage: LanguageAvailability.Status] {
        let availability = LanguageAvailability()
        var results: [SupportedLanguage: LanguageAvailability.Status] = [:]

        for language in SupportedLanguage.allCases where language != sourceLanguage {
            let status = await availability.status(
                from: sourceLanguage.locale,
                to: language.locale
            )
            results[language] = status
        }

        return results
    }
}
