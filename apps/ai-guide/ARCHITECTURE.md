# AI-Guide — Architektur & Spezifikation

*Fintutto Ecosystem — Live-Übersetzer für Tour-Guides*
*Stand: 20.02.2026*

---

## 1. Produktvision

**AI-Guide** ist eine native iOS/Android-App, die Tour-Guides ermöglicht, in ihrer Muttersprache zu sprechen, während Zuhörer die Übersetzung in Echtzeit auf ihren eigenen Geräten empfangen — in ihrer gewählten Sprache, als Text und/oder Sprachausgabe.

### Kernproblem
Apples eingebaute Translate-App arbeitet im **Ping-Pong-Modus** (Conversation Mode): Während die Übersetzung ausgeliefert wird, nimmt das Gerät nicht mehr auf. Das macht sie untauglich für **Monologe** (Führungen, Vorträge).

### Lösung
AI-Guide löst das durch:
1. **Kontinuierliche Aufnahme** — der Sprachkanal bleibt offen, auch während Übersetzungen ausgeliefert werden
2. **Inkrementelle Übersetzung** — Häppchen für Häppchen, nicht erst am Satzende
3. **Manueller Deploy-Button** — Guide bestimmt selbst, wann ein Übersetzungs-Chunk gesendet wird
4. **Mono-direktional** — optimiert für einen Sprecher, viele Zuhörer

---

## 2. Technische Rahmenbedingungen

| Parameter | Wert |
|---|---|
| **App-Name** | AI-Guide |
| **Plattformen** | iOS (Guide + Listener), Android (Listener + Fallback-Guide) |
| **Min. iOS** | iOS 26+ |
| **Min. Android** | Android 12+ (API 31) |
| **Sprache iOS** | Swift 6, SwiftUI |
| **Sprache Android** | Kotlin, Jetpack Compose |
| **Übersetzung iOS** | Apple Translation Framework (`TranslationSession`) |
| **Übersetzung Android** | Empfang fertig übersetzter Texte vom Guide; Fallback: Google ML Kit Translation |
| **Speech-to-Text** | `SpeechAnalyzer` (iOS 26+) |
| **Kommunikation** | WebSocket (cross-platform) + Multipeer Connectivity (iOS-only) |
| **Offline** | Ja — alle Kern-Features funktionieren ohne Internet |

---

## 3. Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        GUIDE DEVICE (iOS)                       │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ SpeechAnalyzer│───▶│  Sentence    │───▶│ TranslationService│  │
│  │ (continuous   │    │  Detector +  │    │ (N parallel       │  │
│  │  recording)   │    │  Deploy Btn  │    │  TranslationSess.)│  │
│  └──────────────┘    └──────────────┘    └────────┬─────────┘  │
│                                                    │            │
│                                          ┌─────────▼────────┐  │
│                                          │  SessionServer   │  │
│                                          │  (WebSocket +    │  │
│                                          │   Multipeer)     │  │
│                                          └─────────┬────────┘  │
└────────────────────────────────────────────────────┼────────────┘
                                                     │
                    ┌────────────────────────────────┼──────────┐
                    │              NETZWERK (lokal)              │
                    │  WiFi / Bluetooth / Multipeer Connectivity │
                    └────────┬──────────────┬───────────────────┘
                             │              │
              ┌──────────────▼──┐   ┌───────▼──────────────┐
              │ LISTENER (iOS)  │   │ LISTENER (Android)   │
              │                 │   │                      │
              │ ┌─────────────┐ │   │ ┌──────────────────┐ │
              │ │ Text Display│ │   │ │ Text Display     │ │
              │ │ (Untertitel)│ │   │ │ (Untertitel)     │ │
              │ └─────────────┘ │   │ └──────────────────┘ │
              │ ┌─────────────┐ │   │ ┌──────────────────┐ │
              │ │ TTS Output  │ │   │ │ TTS Output       │ │
              │ │ (optional)  │ │   │ │ (optional)       │ │
              │ └─────────────┘ │   │ └──────────────────┘ │
              │                 │   │ ┌──────────────────┐ │
              │                 │   │ │ Fallback: lokale │ │
              │                 │   │ │ Übersetzung      │ │
              │                 │   │ │ (Google ML Kit)  │ │
              │                 │   │ └──────────────────┘ │
              └─────────────────┘   └──────────────────────┘
```

---

## 4. Datenfluss

```
Guide spricht
    │
    ▼
SpeechAnalyzer (kontinuierlich)
    │
    ├──▶ Partial Results (live Transkript auf Guide-Screen)
    │
    ▼
Sentence Boundary Detection
    │
    ├──▶ Automatisch: Redepause erkannt / Satzende
    ├──▶ Manuell: Guide drückt DEPLOY-Button
    │
    ▼
Finalisierter Text-Chunk
    │
    ▼
TranslationService
    │
    ├──▶ TranslationSession [DE→EN]  ──▶ "Welcome to the castle..."
    ├──▶ TranslationSession [DE→FR]  ──▶ "Bienvenue au château..."
    ├──▶ TranslationSession [DE→IT]  ──▶ "Benvenuti al castello..."
    │    (eine Session pro angeforderter Zielsprache)
    │
    ▼
SessionServer (WebSocket Broadcast)
    │
    ├──▶ Listener A (EN) empfängt englischen Text
    ├──▶ Listener B (FR) empfängt französischen Text
    ├──▶ Listener C (IT) empfängt italienischen Text
    │
    ▼
Listener zeigt Text an + optional TTS-Ausgabe
```

---

## 5. Kommunikationsprotokoll

### 5.1 WebSocket Messages (JSON)

```json
// Guide → Listener: Übersetzter Chunk
{
  "type": "translation",
  "id": "chunk_042",
  "sourceText": "Willkommen im Schloss...",
  "translatedText": "Welcome to the castle...",
  "targetLanguage": "en",
  "isFinal": true,
  "timestamp": 1708444800
}

// Guide → Listener: Session-Info
{
  "type": "session_info",
  "sessionId": "AG-7K2M",
  "guideName": "Marco",
  "sourceLanguage": "de",
  "availableLanguages": ["en", "fr", "it", "es", "ja"],
  "listenerCount": 12
}

// Listener → Guide: Sprachauswahl
{
  "type": "language_request",
  "targetLanguage": "fr",
  "deviceId": "listener_uuid",
  "deviceName": "iPhone von Sophie"
}

// Guide → Listener: Status
{
  "type": "status",
  "speaking": true,
  "paused": false
}
```

### 5.2 Session-Discovery

| Methode | Protokoll | Reichweite |
|---|---|---|
| Multipeer Connectivity | Bluetooth + WiFi | ~30m, automatisch |
| QR-Code | Encoded WebSocket URL + Session-ID | Visuell |
| Session-Code | 6-stelliger alphanumerischer Code (z.B. `AG-7K2M`) | Manuell |
| Bonjour | mDNS Service Discovery | Lokales Netzwerk |

---

## 6. App-Screens

### 6.1 Guide-App

```
┌─────────────────────────────┐
│       AI-Guide              │
│                             │
│  ┌───────────────────────┐  │
│  │    ROLLE WÄHLEN       │  │
│  │                       │  │
│  │  ┌─────────────────┐  │  │
│  │  │  🎤 ICH BIN     │  │  │
│  │  │    GUIDE        │  │  │
│  │  └─────────────────┘  │  │
│  │                       │  │
│  │  ┌─────────────────┐  │  │
│  │  │  👂 ICH BIN     │  │  │
│  │  │    ZUHÖRER      │  │  │
│  │  └─────────────────┘  │  │
│  │                       │  │
│  └───────────────────────┘  │
└─────────────────────────────┘

        ▼ Guide gewählt

┌─────────────────────────────┐
│  SESSION ERSTELLEN          │
│                             │
│  Meine Sprache: [Deutsch ▼] │
│                             │
│  Offline-Sprachen:          │
│  ☑ Englisch (geladen)       │
│  ☑ Französisch (geladen)    │
│  ☑ Italienisch (geladen)    │
│  ☐ Spanisch (laden...)      │
│                             │
│  Session-Code: AG-7K2M      │
│  [QR-Code anzeigen]         │
│                             │
│  ┌───────────────────────┐  │
│  │   FÜHRUNG STARTEN     │  │
│  └───────────────────────┘  │
│                             │
│  Verbunden: 8 Zuhörer       │
│  EN: 5 | FR: 2 | IT: 1     │
└─────────────────────────────┘

        ▼ Führung gestartet

┌─────────────────────────────┐
│  LIVE GUIDING          ● REC│
│                             │
│  ┌───────────────────────┐  │
│  │ Transkript (live):    │  │
│  │                       │  │
│  │ "Willkommen im        │  │
│  │  Schloss Neuschwanst-  │  │
│  │  ein. Dieses Schloss   │  │
│  │  wurde 1869 von König  │  │
│  │  Ludwig dem Zweiten..." │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  Letzter Deploy:            │
│  "Welcome to Neuschwanstein │
│   Castle. This castle was   │
│   built in 1869..."         │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    ╔═══════════════╗  │  │
│  │    ║   DEPLOY  ▶   ║  │  │
│  │    ╚═══════════════╝  │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  👥 8 Zuhörer | ⏱ 00:12:34  │
│  [⏸ Pause]    [⏹ Beenden]  │
└─────────────────────────────┘
```

### 6.2 Listener-App

```
┌─────────────────────────────┐
│  SESSION BEITRETEN          │
│                             │
│  ┌───────────────────────┐  │
│  │  📷 QR-Code scannen   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  🔤 Code eingeben:    │  │
│  │  [AG-7K2M          ]  │  │
│  └───────────────────────┘  │
│                             │
│  In der Nähe gefunden:      │
│  ┌───────────────────────┐  │
│  │  Marco's Tour          │  │
│  │  Deutsch → 3 Sprachen  │  │
│  │  8 Zuhörer verbunden   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘

        ▼ Verbunden

┌─────────────────────────────┐
│  MEINE SPRACHE              │
│                             │
│  ○ English                  │
│  ● Français                 │
│  ○ Italiano                 │
│                             │
│  Ausgabe:                   │
│  ☑ Text anzeigen            │
│  ☐ Sprachausgabe (TTS)      │
│                             │
│  [WEITER →]                 │
└─────────────────────────────┘

        ▼ Sprache gewählt

┌─────────────────────────────┐
│  AI-Guide        🔊 FR  ●  │
│  Marco's Tour               │
│─────────────────────────────│
│                             │
│                             │
│                             │
│                             │
│  Bienvenue au château de    │
│  Neuschwanstein. Ce château │
│  a été construit en 1869    │
│  par le roi Louis II de     │
│  Bavière...                 │
│                             │
│                             │
│─────────────────────────────│
│  ▶ Précédent:               │
│  "Bonjour et bienvenue      │
│   à cette visite guidée."   │
│                             │
│  🔊 [TTS Ein/Aus]  📏 [Aa]  │
└─────────────────────────────┘
```

---

## 7. Monetarisierung

| Tier | Preis | Features |
|---|---|---|
| **Free** | 0€ | 1-2 Zuhörer, 1 Zielsprache, alle Kern-Features |
| **Guide Pro** | 9,99€/Monat | Bis 20 Zuhörer, bis 3 Sprachen gleichzeitig |
| **Guide Business** | 24,99€/Monat | Unbegrenzte Zuhörer, alle Sprachen, Prioritäts-Support |
| **Enterprise** | Individuell | Custom Branding, API-Zugang, Flottenmanagement |

**Technische Umsetzung:**
- StoreKit 2 (iOS) / Google Play Billing (Android)
- Subscription-basiert (Auto-Renewable)
- Listener-App ist immer kostenlos
- Abrechnung erfolgt auf dem Guide-Gerät
- Token/Key-System: Guide generiert Session, Listener-Limit wird serverseitig geprüft

---

## 8. Technische Risiken & Mitigationen

| Risiko | Mitigation |
|---|---|
| App Store Guideline 3.2.2(ii) — Monetarisierung von OS-Features | App bietet erheblichen Mehrwert: Monolog-Modus, Multi-Listener, Deploy-Button, Session-Management. Kein reiner API-Wrapper. |
| TranslationSession: nur 1 Zielsprache pro Session | Parallele Sessions instanziieren (eine pro Zielsprache). Memory-Profiling nötig. |
| SpeechAnalyzer nur auf iOS 26+ | Fallback auf SFSpeechRecognizer für ältere Geräte (optional, aktuell nicht geplant). |
| Kein Glossar/Custom-Vocabulary bei Apple Translation | Transparent kommunizieren. In v2: eigene Glossar-Schicht über die Translation-Ergebnisse legen (Post-Processing). |
| Multipeer Connectivity Reichweite ~30m | WebSocket über lokales WiFi als Alternative (größere Reichweite). |
| Latenz bei mehreren parallelen Übersetzungen | Übersetzungen asynchron starten, Ergebnisse sofort senden sobald verfügbar. |

---

## 9. Projektstruktur

```
apps/ai-guide/
├── ARCHITECTURE.md              ← dieses Dokument
├── ios/
│   └── AIGuide/
│       ├── App/
│       │   ├── AIGuideApp.swift
│       │   └── ContentView.swift
│       ├── Models/
│       │   ├── Session.swift
│       │   ├── Language.swift
│       │   ├── TranslationChunk.swift
│       │   └── Listener.swift
│       ├── Services/
│       │   ├── SpeechRecognitionService.swift
│       │   ├── TranslationService.swift
│       │   ├── SessionServer.swift
│       │   ├── MultipeerService.swift
│       │   └── TTSService.swift
│       ├── ViewModels/
│       │   ├── GuideViewModel.swift
│       │   └── ListenerViewModel.swift
│       ├── Views/
│       │   ├── Guide/
│       │   │   ├── GuideSetupView.swift
│       │   │   ├── LiveGuidingView.swift
│       │   │   └── DeployButton.swift
│       │   ├── Listener/
│       │   │   ├── JoinSessionView.swift
│       │   │   ├── LanguageSelectionView.swift
│       │   │   └── TranslationDisplayView.swift
│       │   └── Common/
│       │       ├── RoleSelectionView.swift
│       │       ├── QRCodeView.swift
│       │       └── SessionCodeView.swift
│       └── Resources/
│           └── Info.plist
└── android/
    └── (Kotlin/Compose — Phase 2)
```

---

## 10. Apple Frameworks im Einsatz

| Framework | Verwendung |
|---|---|
| `Speech` (`SpeechAnalyzer`) | Kontinuierliche Spracherkennung, On-Device |
| `Translation` (`TranslationSession`) | Text-Übersetzung, On-Device, Offline |
| `MultipeerConnectivity` | iOS-to-iOS Geräte-Discovery & Kommunikation |
| `Network` | WebSocket-Server für Cross-Platform-Kommunikation |
| `AVFoundation` (`AVSpeechSynthesizer`) | Text-to-Speech auf Listener-Geräten |
| `CoreImage` | QR-Code-Generierung (Guide) |
| `AVFoundation` (Camera) | QR-Code-Scanning (Listener) |
| `StoreKit` (v2) | In-App Subscriptions |

---

## 11. Quellen & Referenzen

- [Apple Translation Framework](https://developer.apple.com/documentation/translation/)
- [TranslationSession API](https://developer.apple.com/documentation/translation/translationsession)
- [SpeechAnalyzer (WWDC25)](https://developer.apple.com/videos/play/wwdc2025/277/)
- [Meet the Translation API (WWDC24)](https://developer.apple.com/videos/play/wwdc2024/10117/)
- [Multipeer Connectivity](https://developer.apple.com/documentation/multipeerconnectivity)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Streaming Audio via MPC](https://thoughtbot.com/blog/streaming-audio-to-multiple-listeners-via-ios-multipeer-connectivity)
