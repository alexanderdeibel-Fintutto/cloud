# Integration Guide: Portal-Apps an AMS anbinden

Das AMS (Account Management System) dient als zentraler Hub für alle Fintutto-Apps. Damit Nutzerdaten, Abonnements und Aktivitäten im AMS zusammenlaufen, müssen alle Apps an dieselbe Supabase-Instanz (`aaefocdqgdgexkcrjhks`) angebunden werden.

## Status der Integration (Stand: April 2026)

Von 25 Apps im Portal-Repository sind **18 Apps** bereits vollständig oder teilweise integriert. Die folgenden **7 Apps** sind noch nicht integriert:

1. `betriebskosten-helfer`
2. `financial-compass`
3. `hausmeister`
4. `leserally`
5. `miet-check-pro`
6. `miet-recht`
7. `vermieter-freude`

## Integrationsschritte für neue/bestehende Apps

Um eine App an das AMS anzubinden, müssen folgende Schritte durchgeführt werden:

### 1. Supabase-Client einrichten

Erstellen Sie die Datei `src/integrations/supabase/client.ts` in der App:

```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL or Anon Key is missing in environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 2. Authentifizierung umstellen

Ersetzen Sie lokale oder Mock-Authentifizierung durch Supabase Auth. Nutzen Sie dazu den zentralen Auth-Provider aus dem `@fintutto/shared`-Package oder implementieren Sie einen eigenen Provider, der `supabase.auth` nutzt.

Wichtig: Bei der Registrierung muss ein Eintrag in der zentralen `profiles`-Tabelle angelegt werden.

### 3. Vercel-Deployment konfigurieren

1. Erstellen Sie eine `vercel.json` im App-Verzeichnis:
```json
{
  "framework": "vite",
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./"
}
```

2. Fügen Sie das Projekt in Vercel hinzu (Root Directory: `apps/app-name`).
3. Setzen Sie die Umgebungsvariablen `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` in Vercel auf die Werte der zentralen Supabase-Instanz.

### 4. App-Aktivität tracken (Optional aber empfohlen)

Damit die App im AMS-Wachstums-Dashboard unter "App-Aktivität" erscheint, sollte die App bei wichtigen Nutzeraktionen (Login, Feature-Nutzung) einen Eintrag in einer Aktivitäts-Tabelle (z.B. `user_activity_log`) hinterlassen, der die `app_id` enthält.
