# LernApp

Eine Next.js App, die Schülern ermöglicht, Fotos von Aufgaben zu machen und eine KI-Erklärung zu erhalten.

## Tech Stack
- **Framework:** Next.js (App Router)
- **KI:** Anthropic Claude (Vision)
- **Styling:** Tailwind CSS

## Wichtige Hinweise
- Diese App ist eine **Next.js App** (kein Vite/React wie die anderen Apps im Portal)
- Sie benötigt einen eigenen Deployment-Prozess (z.B. Vercel)
- **Keine Supabase-Verbindung** – die App ist zustandslos (nur API-Calls)

## Umgebungsvariablen
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Lokaler Start
```bash
cd apps/lernapp
npm install
npm run dev
```
