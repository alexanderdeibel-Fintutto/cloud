# Fintutto Translator

Kostenloser Online-Übersetzer mit Spracheingabe und Sprachausgabe in über 20 Sprachen.

## Features

- Übersetzung in 22 Sprachen (DE, EN, FR, ES, IT, PT, NL, PL, TR, RU, UK, AR, ZH, JA, KO, HI, SV, DA, CS, RO, EL, HU)
- Google Cloud Text-to-Speech (Neural2/WaveNet Stimmen)
- Spracheingabe per Mikrofon (Chrome/Edge)
- Übersetzungsverlauf (lokal gespeichert)
- Schnelle Redewendungen
- Dark Mode

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Google Cloud TTS API
- MyMemory Translation API

## Setup

```bash
npm install
npm run dev
```

## Environment Variables (optional)

```bash
cp .env.example .env
```

| Variable | Beschreibung |
|---|---|
| `VITE_GOOGLE_TTS_API_KEY` | Google Cloud TTS API Key (überschreibt den eingebauten Key) |

## Build

```bash
npm run build
npm run preview
```
