# Project Guidelines — fintutto.cloud

## Code Quality
- NIEMALS Git-Konfliktmarker in Code committen (`<<<<<<<`, `=======`, `>>>>>>>`). Merge-Konflikte müssen IMMER vollständig aufgelöst werden bevor committed wird.
- `npm run build` MUSS vor jedem Commit fehlerfrei durchlaufen.
- Keine `console.error` oder TypeScript-Fehler in geänderten Dateien.

## Design
- IMMER `docs/DESIGN_SYSTEM.md` und `docs/DESIGN_SYSTEM_CATALOG.md` lesen bevor neue Seiten erstellt werden.
- Hintergrund: `#2d1b4e` + `fintutto-logo.svg` als `fixed inset-0 w-full h-full object-cover opacity-70`
- Karten: IMMER `.glass-card` Klasse verwenden — nie eigene Background-Styles erfinden.
- Niemals `bg-white` oder helle Hintergründe.

## Communication
- Antworten auf Deutsch, wenn der User Deutsch schreibt.
- Immer korrekte deutsche Umlaute verwenden (ä, ö, ü, ß).
- Niemals "FitTutto" — immer **fintutto** (mit N, klein).

## Architektur
- Framework: Vite + React (KEIN Next.js)
- Routing: React Router v6
- CSS: Tailwind v4 mit `@import "tailwindcss"` in index.css
- Deployment: Vercel, automatisch bei Push auf `main`
