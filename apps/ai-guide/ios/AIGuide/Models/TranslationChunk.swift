import Foundation

struct TranslationChunk: Identifiable, Codable {
    let id: String
    let sourceText: String
    let translatedText: String
    let targetLanguage: String
    let isFinal: Bool
    let timestamp: Date

    init(
        sourceText: String,
        translatedText: String,
        targetLanguage: String,
        isFinal: Bool = true
    ) {
        self.id = "chunk_\(UUID().uuidString.prefix(8))"
        self.sourceText = sourceText
        self.translatedText = translatedText
        self.targetLanguage = targetLanguage
        self.isFinal = isFinal
        self.timestamp = Date()
    }
}

// WebSocket message types
enum WSMessageType: String, Codable {
    case translation
    case sessionInfo = "session_info"
    case languageRequest = "language_request"
    case status
}

struct WSMessage: Codable {
    let type: WSMessageType
    let payload: Data

    static func translation(_ chunk: TranslationChunk) throws -> Data {
        let wrapper = WSMessage(
            type: .translation,
            payload: try JSONEncoder().encode(chunk)
        )
        return try JSONEncoder().encode(wrapper)
    }

    static func sessionInfo(_ session: GuideSession) throws -> Data {
        let wrapper = WSMessage(
            type: .sessionInfo,
            payload: try JSONEncoder().encode(session)
        )
        return try JSONEncoder().encode(wrapper)
    }
}
