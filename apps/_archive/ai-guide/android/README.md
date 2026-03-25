# AI-Guide — Android Listener App

## Status: Phase 2 (geplant)

Die Android-App dient primär als **Listener** (Zuhörer) und empfängt übersetzte Texte
vom iOS-Guide-Gerät über WebSocket.

## Technologie

- **Sprache**: Kotlin
- **UI**: Jetpack Compose
- **Netzwerk**: OkHttp WebSocket
- **TTS**: Android TextToSpeech API
- **Fallback-Übersetzung**: Google ML Kit Translation (on-device)
- **QR-Scanner**: ML Kit Barcode Scanning
- **Min. Android**: API 31 (Android 12)

## Architektur

```
android/
├── app/
│   └── src/main/
│       ├── java/com/fintutto/aiguide/
│       │   ├── MainActivity.kt
│       │   ├── ui/
│       │   │   ├── JoinSessionScreen.kt
│       │   │   ├── LanguageSelectionScreen.kt
│       │   │   └── TranslationDisplayScreen.kt
│       │   ├── service/
│       │   │   ├── WebSocketService.kt
│       │   │   ├── TTSService.kt
│       │   │   └── FallbackTranslationService.kt
│       │   └── model/
│       │       ├── TranslationChunk.kt
│       │       └── Session.kt
│       ├── res/
│       └── AndroidManifest.xml
├── build.gradle.kts
└── settings.gradle.kts
```

## Hybrid-Modus

- **Standard**: Empfängt fertig übersetzte Texte vom iOS-Guide (Apple-Qualität)
- **Fallback**: Bei Verbindungsabbruch übersetzt lokal mit Google ML Kit
  - ML Kit Translation ist ebenfalls on-device und offline-fähig
  - Unterstützt 59 Sprachen
  - Sprachmodelle müssen vorab heruntergeladen werden (~30MB pro Sprache)

## Implementierung folgt in Phase 2

Das Kommunikationsprotokoll (WebSocket JSON Messages) ist identisch mit der
iOS-Listener-Implementierung — siehe `ARCHITECTURE.md` Abschnitt 5.
