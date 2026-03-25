import Foundation
import Translation

enum SupportedLanguage: String, Codable, CaseIterable, Identifiable {
    case german = "de"
    case english = "en"
    case french = "fr"
    case italian = "it"
    case spanish = "es"
    case portuguese = "pt"
    case japanese = "ja"
    case korean = "ko"
    case chinese = "zh-Hans"
    case dutch = "nl"
    case polish = "pl"
    case russian = "ru"
    case turkish = "tr"
    case arabic = "ar"
    case czech = "cs"
    case swedish = "sv"
    case danish = "da"
    case finnish = "fi"
    case greek = "el"
    case hindi = "hi"
    case thai = "th"
    case ukrainian = "uk"
    case romanian = "ro"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .german: "Deutsch"
        case .english: "English"
        case .french: "Français"
        case .italian: "Italiano"
        case .spanish: "Español"
        case .portuguese: "Português"
        case .japanese: "日本語"
        case .korean: "한국어"
        case .chinese: "中文"
        case .dutch: "Nederlands"
        case .polish: "Polski"
        case .russian: "Русский"
        case .turkish: "Türkçe"
        case .arabic: "العربية"
        case .czech: "Čeština"
        case .swedish: "Svenska"
        case .danish: "Dansk"
        case .finnish: "Suomi"
        case .greek: "Ελληνικά"
        case .hindi: "हिन्दी"
        case .thai: "ไทย"
        case .ukrainian: "Українська"
        case .romanian: "Română"
        }
    }

    var flag: String {
        switch self {
        case .german: "🇩🇪"
        case .english: "🇬🇧"
        case .french: "🇫🇷"
        case .italian: "🇮🇹"
        case .spanish: "🇪🇸"
        case .portuguese: "🇵🇹"
        case .japanese: "🇯🇵"
        case .korean: "🇰🇷"
        case .chinese: "🇨🇳"
        case .dutch: "🇳🇱"
        case .polish: "🇵🇱"
        case .russian: "🇷🇺"
        case .turkish: "🇹🇷"
        case .arabic: "🇸🇦"
        case .czech: "🇨🇿"
        case .swedish: "🇸🇪"
        case .danish: "🇩🇰"
        case .finnish: "🇫🇮"
        case .greek: "🇬🇷"
        case .hindi: "🇮🇳"
        case .thai: "🇹🇭"
        case .ukrainian: "🇺🇦"
        case .romanian: "🇷🇴"
        }
    }

    var locale: Locale.Language {
        Locale.Language(identifier: rawValue)
    }
}
