# Translator App: Offline-First + App-Store-Ready Plan

*Stand: 22.02.2026 — Fintutto GuideTranslator*

---

## Status Quo

| Komponente | Aktuell | Offline-fähig? |
|-----------|---------|---------------|
| **Translation** | Google Cloud → MyMemory → LibreTranslate (alle online) | Nein |
| **TTS** | Google Cloud Neural2/Chirp3HD → Browser SpeechSynthesis Fallback | Teilweise (Browser-Fallback nutzt System-Stimmen) |
| **STT** | Web Speech API (Chrome/Edge, braucht Netzwerk) | Nein |
| **PWA** | vite-plugin-pwa mit Workbox (cacht nur Static Assets) | Nur App-Shell |
| **Live-Session** | Supabase Realtime (zwingend online) | Nein (by design) |

**Fazit:** App ist zu 100% online-abhängig. Kein einziges Feature funktioniert offline.

---

## Architektur: Offline-First Translator

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GUIDETRANSLATOR - OFFLINE FIRST                       │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    TRANSLATION ENGINE                              │  │
│  │                                                                    │  │
│  │  ONLINE (Standard):                                                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐                    │  │
│  │  │ Google   │→ │ MyMemory │→ │ LibreTranslate│  (wie bisher)     │  │
│  │  │ Cloud    │  │          │  │               │                    │  │
│  │  └──────────┘  └──────────┘  └──────────────┘                    │  │
│  │                                                                    │  │
│  │  OFFLINE (Neu):                                                    │  │
│  │  ┌─────────────────────────────────────────────┐                  │  │
│  │  │  Mozilla Bergamot (WASM)                     │                  │  │
│  │  │  ~20MB pro Sprachpaar, läuft im Browser      │                  │  │
│  │  │  Unterstützt: DE↔EN, FR, ES, IT, PT, NL,    │                  │  │
│  │  │  PL, CS, RU, UK + weitere EU-Sprachen        │                  │  │
│  │  └─────────────────────────────────────────────┘                  │  │
│  │                                                                    │  │
│  │  HYBRID-CACHE (Neu):                                               │  │
│  │  ┌─────────────────────────────────────────────┐                  │  │
│  │  │  IndexedDB: Häufige Phrasen + API-Ergebnisse │                  │  │
│  │  │  ~5000 Einträge pro Sprachpaar               │                  │  │
│  │  │  Cruise-Phrasen vorgeladen: 500+ Sätze       │                  │  │
│  │  └─────────────────────────────────────────────┘                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    TTS ENGINE                                      │  │
│  │                                                                    │  │
│  │  ONLINE: Google Cloud TTS (Neural2 / Chirp 3 HD)                  │  │
│  │  OFFLINE: Web Speech API (SpeechSynthesis) — System-Stimmen       │  │
│  │           → bereits vorhanden als Fallback, wird promoted          │  │
│  │           → Audio-Cache für häufige Phrasen (IndexedDB)            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    STT ENGINE                                      │  │
│  │                                                                    │  │
│  │  ONLINE: Web Speech API (Chrome/Edge)                              │  │
│  │  OFFLINE: Transformers.js Whisper (WASM)                           │  │
│  │           → whisper-tiny-int8: ~45MB, schnell, gute Qualität       │  │
│  │           → Läuft komplett im Browser                               │  │
│  │           → 99 Sprachen unterstützt                                 │  │
│  │           → Alternative: Web Speech API auf Android mit             │  │
│  │             heruntergeladenen Sprachpaketen                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    OFFLINE STORAGE                                  │  │
│  │                                                                    │  │
│  │  Service Worker (Workbox):                                         │  │
│  │  ├── App Shell (HTML, CSS, JS) — precache                         │  │
│  │  ├── Fonts, Icons — cache-first                                    │  │
│  │  └── API Responses — stale-while-revalidate                        │  │
│  │                                                                    │  │
│  │  IndexedDB (Dexie.js):                                             │  │
│  │  ├── Translation Cache (persistent, TTL 30 Tage)                   │  │
│  │  ├── TTS Audio Cache (MP3 Blobs)                                   │  │
│  │  ├── Cruise Phrase Packs (vorgeladen)                              │  │
│  │  └── User History (letzte 1000 Übersetzungen)                      │  │
│  │                                                                    │  │
│  │  Cache Storage API:                                                │  │
│  │  ├── Bergamot WASM Models (~20MB pro Sprachpaar)                   │  │
│  │  └── Whisper WASM Model (~45MB)                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    NETWORK STATUS MANAGER                          │  │
│  │                                                                    │  │
│  │  navigator.onLine + Heartbeat → automatisches Switching:           │  │
│  │  ┌──────────┐     ┌──────────┐     ┌──────────┐                  │  │
│  │  │ ONLINE   │ ←→  │ DEGRADED │ ←→  │ OFFLINE  │                  │  │
│  │  │ Google+  │     │ Cache+   │     │ Bergamot │                  │  │
│  │  │ Chirp HD │     │ Bergamot │     │ + System │                  │  │
│  │  └──────────┘     └──────────┘     └──────────┘                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Offline Translation Engine (Bergamot WASM)

### Was ist Bergamot?
- Mozilla's **clientseitige** Übersetzungs-Engine (Firefox Translate nutzt es)
- Läuft als **WebAssembly** komplett im Browser — kein Server, kein API-Key
- Qualität: ~85-90% von Google Translate für EU-Sprachen
- Modellgröße: ~20-25MB pro Sprachpaar (komprimiert ~12-15MB)
- Open Source (MPL 2.0)

### Verfügbare Sprachpaare (Cruise-relevant):

| # | Von | Nach | Modell | Relevanz |
|---|-----|------|--------|----------|
| 1 | DE | EN | ✅ | Kernsprache |
| 2 | EN | DE | ✅ | Kernsprache |
| 3 | EN | FR | ✅ | Mittelmeer, Karibik |
| 4 | EN | ES | ✅ | Karibik, Mittelmeer |
| 5 | EN | IT | ✅ | Mittelmeer |
| 6 | EN | PT | ✅ | Atlantik, Brasilien |
| 7 | EN | NL | ✅ | Nordsee, Fluss-Kreuzfahrt |
| 8 | EN | PL | ✅ | Ostsee |
| 9 | EN | CS | ✅ | Fluss (Donau) |
| 10 | EN | RU | ✅ | Ostsee, Nordkap |
| 11 | EN | UK | ✅ | Schwarzes Meer |
| 12 | FR | EN | ✅ | Rückrichtung |
| 13 | ES | EN | ✅ | Rückrichtung |
| 14 | IT | EN | ✅ | Rückrichtung |

**Strategie:** Alle Paare laufen über EN als Pivot-Sprache.
DE→IT = DE→EN (Bergamot) + EN→IT (Bergamot)
Für direkte Paare wo verfügbar (DE↔EN) direkt übersetzen.

### Implementierung:

```typescript
// src/lib/offline/bergamot-engine.ts

interface BergamotEngine {
  translate(text: string, from: string, to: string): Promise<string>
  isModelLoaded(from: string, to: string): boolean
  downloadModel(from: string, to: string, onProgress: (pct: number) => void): Promise<void>
  getAvailableLanguages(): string[]
  getStorageUsed(): Promise<number>
}
```

### Model Download Manager:
- User wählt Sprachpaare in Settings
- Download im Hintergrund mit Progress-Bar
- Gespeichert in **Cache Storage API** (persistent, überlebt App-Updates)
- Empfehlung beim Onboarding: "Shore Excursion Pack" = DE↔EN + EN↔IT + EN↔ES + EN↔FR (~100MB)

---

## Phase 2: Offline TTS (Browser Speech Synthesis)

### Was schon da ist:
- `useSpeechSynthesis.ts` hat bereits Browser-Fallback eingebaut
- Wenn Google Cloud TTS fehlschlägt → `window.speechSynthesis`

### Was verbessert werden muss:
1. **System-Stimmen-Qualität prüfen und anzeigen**
   - iOS/macOS: Hochwertige "Enhanced" Stimmen (Siri-Qualität)
   - Android: Google TTS Stimmen (gut)
   - Windows: SAPI Stimmen (mittelmäßig)

2. **Audio-Cache für häufige Phrasen**
   - Cloud TTS Ergebnisse in IndexedDB cachen (als MP3 Blobs)
   - Beim Cruise Phrase Pack: Alle Phrasen vorab mit Cloud TTS generieren
   - Offline werden gecachte MP3s abgespielt → Cloud-Qualität ohne Internet!

3. **Stimmen-Download Empfehlung**
   - iOS: Settings → Accessibility → Spoken Content → Voices → Download
   - Android: Settings → Languages & Input → TTS → Download voices
   - User-Hinweis im App wenn keine gute Offline-Stimme verfügbar

```typescript
// src/lib/offline/tts-cache.ts

interface TTSCache {
  getCachedAudio(text: string, lang: string): Promise<Blob | null>
  cacheAudio(text: string, lang: string, blob: Blob): Promise<void>
  preloadPhrasePack(phrases: string[], lang: string): Promise<void>
  getStorageUsed(): Promise<number>
}
```

---

## Phase 3: Offline STT (Whisper WASM)

### Optionen verglichen:

| Engine | Größe | Qualität | Sprachen | Browser-Support |
|--------|-------|----------|----------|----------------|
| **Whisper tiny (int8)** | ~45MB | Gut | 99 | Alle modernen |
| **Whisper base** | ~150MB | Sehr gut | 99 | Alle modernen |
| **Vosk** | ~40MB/Sprache | Gut | ~20 | Experimentell |
| **Web Speech API offline** | 0MB (System) | Gut | ~30 | Android only |

### Empfehlung: Whisper tiny via @huggingface/transformers

- **45MB einmaliger Download** für ALLE 99 Sprachen
- Läuft via WebAssembly + WASM SIMD
- Erkennt automatisch die gesprochene Sprache
- ~2-3x Echtzeit auf modernen Geräten (iPhone 13+, moderne Androids)

### Implementierung:

```typescript
// src/lib/offline/whisper-engine.ts

interface WhisperEngine {
  readonly isLoaded: boolean
  readonly isSupported: boolean
  load(onProgress: (pct: number) => void): Promise<void>
  transcribe(audioData: Float32Array, lang?: string): Promise<{
    text: string
    language: string
    confidence: number
  }>
  unload(): void
}
```

### Fallback-Strategie für STT:
1. **Online + Chrome/Edge:** Web Speech API (0 Latenz, Streaming)
2. **Online + Safari/Firefox:** Whisper WASM (leichte Verzögerung)
3. **Offline + Whisper geladen:** Whisper WASM
4. **Offline + Kein Whisper:** Fehlermeldung + Download-Empfehlung

---

## Phase 4: Network Status Manager

```typescript
// src/lib/offline/network-status.ts

type NetworkMode = 'online' | 'degraded' | 'offline'

interface NetworkStatus {
  mode: NetworkMode
  isOnline: boolean
  lastOnline: Date | null
  translationProvider: 'google' | 'bergamot' | 'cache'
  ttsProvider: 'cloud' | 'cache' | 'browser'
  sttProvider: 'web-speech' | 'whisper'
}
```

### Automatisches Switching:
- `navigator.onLine` + periodischer Healthcheck (fetch mit Timeout)
- Bei Netzwerkverlust: Sofort auf Offline-Engine umschalten (kein Warten auf Timeout)
- Bei Netzwerkrückkehr: Sanft zurück zu Cloud (pending Requests beenden lassen)
- UI-Indicator: Grün (Online/Cloud) | Gelb (Degraded/Cache) | Orange (Offline/Bergamot)

---

## Phase 5: Cruise Phrase Packs (Shore Excursion Fokus)

### Vordefinierte Phrasen-Pakete:

| Pack | Sprachen | Phrasen | Audio | Gesamt |
|------|----------|---------|-------|--------|
| **Mittelmeer** | DE↔EN, EN↔IT, EN↔ES, EN↔FR, EN↔EL | 500 | ~25MB | ~150MB |
| **Nordeuropa** | DE↔EN, EN↔SV, EN↔DA, EN↔NL, EN↔PL | 500 | ~25MB | ~150MB |
| **Karibik** | DE↔EN, EN↔ES, EN↔FR, EN↔PT | 400 | ~20MB | ~100MB |
| **Asien** | DE↔EN, EN↔JA, EN↔KO, EN↔ZH | 400 | ~20MB | ~120MB |

### Phrase-Kategorien (Shore Excursions):
1. **Hafen & Transport**: "Wo ist der Shuttlebus?", "Wann fährt das Tenderboot?"
2. **Sehenswürdigkeiten**: "Zwei Eintrittskarten bitte", "Ist das Museum geöffnet?"
3. **Essen & Trinken**: "Die Rechnung bitte", "Haben Sie vegetarische Gerichte?"
4. **Shopping**: "Wie viel kostet das?", "Akzeptieren Sie Euro?"
5. **Notfälle**: "Ich brauche Hilfe", "Wo ist das nächste Krankenhaus?"
6. **Navigation**: "Wie komme ich zurück zum Hafen?", "Wann legt das Schiff ab?"
7. **Kultur**: "Ist Trinkgeld üblich?", "Darf man hier fotografieren?"

### Audio-Vorab-Generierung:
- Bei WLAN (z.B. auf dem Schiff): Alle Phrasen mit Google Cloud TTS (Chirp 3 HD) vorlesen lassen
- MP3s in IndexedDB speichern
- Offline: Gecachte Cloud-Qualität abspielen!

---

## Phase 6: App-Store Readiness

### PWA → Native Wrapper

| Plattform | Technologie | Vorteil |
|-----------|-------------|---------|
| **iOS** | **Capacitor** (Ionic) | WebView-Wrapper mit Native APIs, App Store ready |
| **Android** | **TWA** (Trusted Web Activity) | Nutzt Chrome direkt, kein WebView-Overhead |
| **Alternative** | **Capacitor** für beide | Ein Wrapper, ein Build-Process |

### Warum Capacitor?
- PWA bleibt die Basis (ein Codebase!)
- Zugriff auf native APIs: Mikrofon, Storage, Push Notifications
- App Store / Play Store Distribution
- Kein React Native Rewrite nötig
- Vite-Integration ist trivial

### App Store Anforderungen Checklist:

#### iOS App Store:
- [ ] Capacitor iOS Projekt einrichten
- [ ] App Icons (1024x1024 + alle Größen)
- [ ] Splash Screens
- [ ] Privacy Policy URL
- [ ] App Store Beschreibung (DE + EN)
- [ ] Screenshots (6.7", 6.5", 5.5")
- [ ] Mikrofon-Permission String ("Für Spracheingabe und Live-Übersetzung")
- [ ] NSAppTransportSecurity (erlaubt HTTPS zu Google APIs)
- [ ] Review Guidelines: Keine Duplicate-App Bedenken (einzigartiges Feature: Cruise + Offline)

#### Google Play Store:
- [ ] TWA oder Capacitor Android Projekt
- [ ] Feature Graphic (1024x500)
- [ ] Screenshots (Phone + Tablet)
- [ ] Privacy Policy
- [ ] Content Rating Fragebogen
- [ ] Target API Level (API 34+)
- [ ] Mikrofon-Permission

### App-Größen-Budget:

| Komponente | iOS | Android |
|-----------|-----|---------|
| App Shell (HTML/CSS/JS) | ~2MB | ~2MB |
| Bergamot WASM Engine | ~5MB | ~5MB |
| Whisper tiny Model | ~45MB | ~45MB |
| Default Sprachpaar (DE↔EN) | ~25MB | ~25MB |
| **Basis-Download** | **~77MB** | **~77MB** |
| + Mittelmeer-Pack (optional) | +125MB | +125MB |
| + Audio-Cache (wächst) | variabel | variabel |

---

## Phase 7: UI-Erweiterungen für Offline

### Offline-Indicator in Header:
```
┌─────────────────────────────────────┐
│ 🟢 Online | ☁️ Google Cloud TTS     │  ← Grün = Online
│ 🟡 Schwach | 📦 Cache + Bergamot    │  ← Gelb = Degraded
│ 🟠 Offline | 🔧 Bergamot + System   │  ← Orange = Offline
└─────────────────────────────────────┘
```

### Settings-Seite (NEU):
```
┌─────────────────────────────────────┐
│  ⚙️  Einstellungen                   │
│                                      │
│  OFFLINE-SPRACHEN                    │
│  ┌────────────────────────────────┐ │
│  │ ✅ DE ↔ EN    25MB  [Geladen]  │ │
│  │ ⬜ EN → IT    12MB  [Laden]    │ │
│  │ ⬜ EN → ES    12MB  [Laden]    │ │
│  │ ⬜ EN → FR    12MB  [Laden]    │ │
│  │    ...                          │ │
│  └────────────────────────────────┘ │
│                                      │
│  PHRASE PACKS                        │
│  ┌────────────────────────────────┐ │
│  │ 🚢 Mittelmeer   150MB [Laden]  │ │
│  │ ⛵ Nordeuropa    150MB [Laden]  │ │
│  │ 🏖️ Karibik      100MB          │ │
│  └────────────────────────────────┘ │
│                                      │
│  SPRACHERKENNUNG                     │
│  ┌────────────────────────────────┐ │
│  │ Whisper Offline    45MB [Laden] │ │
│  └────────────────────────────────┘ │
│                                      │
│  SPEICHER                            │
│  Verwendet: 89MB / 500MB verfügbar   │
│  [Cache leeren]                      │
└─────────────────────────────────────┘
```

---

## Implementierungs-Reihenfolge

| # | Schritt | Dateien | Aufwand |
|---|---------|---------|---------|
| **1** | **IndexedDB + Dexie Setup** | `src/lib/offline/db.ts` | 1h |
| **2** | **Persistent Translation Cache** | `src/lib/offline/translation-cache.ts` | 2h |
| **3** | **Network Status Manager** | `src/lib/offline/network-status.ts`, Hook | 2h |
| **4** | **Bergamot WASM Integration** | `src/lib/offline/bergamot-engine.ts` | 4h |
| **5** | **Model Download Manager** | `src/lib/offline/model-manager.ts` | 3h |
| **6** | **Translate.ts Refactor** | `src/lib/translate.ts` → online/offline switching | 2h |
| **7** | **TTS Audio Cache** | `src/lib/offline/tts-cache.ts` | 2h |
| **8** | **TTS.ts Refactor** | `src/lib/tts.ts` → cache-first | 1h |
| **9** | **Whisper STT Integration** | `src/lib/offline/whisper-engine.ts` | 4h |
| **10** | **STT.ts Refactor** | `src/lib/stt.ts` → provider switching | 2h |
| **11** | **Cruise Phrase Packs** | `src/lib/offline/phrase-packs.ts` + JSON data | 3h |
| **12** | **Settings Page** | `src/pages/SettingsPage.tsx` | 3h |
| **13** | **Offline Indicator UI** | Header-Komponente | 1h |
| **14** | **Service Worker Upgrade** | `vite.config.ts` Workbox config | 2h |
| **15** | **Capacitor Setup (iOS + Android)** | Root config | 3h |
| **16** | **App Icons + Splash Screens** | Assets | 2h |
| **17** | **App Store Metadaten** | Texte, Screenshots | 2h |
| | | **GESAMT** | **~37h** |

---

## Entscheidungen / Risiken

### Bergamot vs. Alternative Translation Engines:
- **Bergamot (empfohlen):** Battle-tested (Firefox nutzt es), gute EU-Sprachen, WASM-ready
- **Opus-MT:** Bessere Qualität für einige Paare, aber schwerere Modelle
- **Risiko:** Asiatische Sprachen (JA, KO, ZH) haben geringere Qualität → dort Cache + Phrase Packs bevorzugen

### Whisper tiny vs. base:
- **tiny (empfohlen für App Start):** 45MB, schnell, gute Qualität für klare Sprache
- **base:** 150MB, bessere Qualität bei Akzenten/Lärm
- **Empfehlung:** Start mit tiny, base als optionaler "Pro" Download

### Capacitor vs. TWA vs. Expo:
- **Capacitor (empfohlen):** Beide Plattformen, PWA bleibt Lead, kein Rewrite
- **TWA:** Nur Android, begrenzte native APIs
- **Expo/React Native:** Kompletter Rewrite nötig → zu aufwändig

---

*Erstellt: 22.02.2026*
*Version: 1.0*
