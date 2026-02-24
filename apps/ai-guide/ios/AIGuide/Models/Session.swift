import Foundation

struct GuideSession: Identifiable, Codable {
    let id: String
    let guideName: String
    let sourceLanguage: SupportedLanguage
    var availableLanguages: [SupportedLanguage]
    var listenerCount: Int
    let createdAt: Date

    static func generateCode() -> String {
        let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        let code = String((0..<4).map { _ in chars.randomElement()! })
        return "AG-\(code)"
    }
}

struct ConnectedListener: Identifiable, Codable {
    let id: String
    let deviceName: String
    var targetLanguage: SupportedLanguage
    let connectedAt: Date
}
