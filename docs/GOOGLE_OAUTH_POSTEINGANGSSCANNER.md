# Google OAuth für den Posteingangsscanner

## Hintergrund: Was fehlt noch?

Der Posteingangsscanner hat bereits **15 E-Mail-Metadaten** in SecondBrain importiert. Was noch fehlt, sind die **PDF-Binärdateien** der Anhänge — also die eigentlichen Dokumente in Supabase Storage.

Dafür wird ein **Google OAuth 2.0 Refresh Token** benötigt, der dauerhaft (ohne Ablauf) die Gmail API aufrufen kann.

---

## Schritt 1: Google Cloud Console — OAuth-App einrichten

### 1.1 Projekt öffnen oder erstellen

1. Öffne [console.cloud.google.com](https://console.cloud.google.com)
2. Wähle dein bestehendes Fintutto-Projekt (oder erstelle ein neues: `fintutto-posteingang`)

### 1.2 Gmail API aktivieren

1. Navigiere zu **APIs & Services → Library**
2. Suche nach **Gmail API**
3. Klicke **Enable**

### 1.3 OAuth-Consent-Screen konfigurieren

1. Navigiere zu **APIs & Services → OAuth consent screen**
2. Wähle **Internal** (nur für dich, kein Review nötig)
3. App-Name: `Fintutto Posteingangsscanner`
4. Support-E-Mail: deine E-Mail
5. Scopes hinzufügen:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify` (für Label-Setzen nach Import)
6. Speichern

### 1.4 OAuth-Client-ID erstellen

1. Navigiere zu **APIs & Services → Credentials**
2. Klicke **Create Credentials → OAuth client ID**
3. Application type: **Desktop app**
4. Name: `fintutto-scanner`
5. Klicke **Create**
6. **Lade die JSON-Datei herunter** (`client_secret_xxx.json`)

---

## Schritt 2: Refresh Token generieren (einmalig)

Führe dieses Python-Skript lokal auf deinem Mac aus:

```python
# Speichere als: generate_gmail_token.py
# Benötigt: pip install google-auth-oauthlib

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
]

# Pfad zur heruntergeladenen JSON-Datei:
flow = InstalledAppFlow.from_client_secrets_file(
    'client_secret_xxx.json',
    scopes=SCOPES
)

# Öffnet Browser-Fenster für OAuth-Bestätigung:
creds = flow.run_local_server(port=0)

print("=== DEINE TOKENS (sicher aufbewahren!) ===")
print(f"Access Token:  {creds.token}")
print(f"Refresh Token: {creds.refresh_token}")
print(f"Client ID:     {creds.client_id}")
print(f"Client Secret: {creds.client_secret}")
```

```bash
pip install google-auth-oauthlib
python generate_gmail_token.py
```

Du wirst im Browser nach deiner Google-Anmeldung gefragt. Nach der Bestätigung gibt das Skript den **Refresh Token** aus.

---

## Schritt 3: Tokens in Supabase Vault speichern

Öffne den Supabase SQL-Editor und führe aus:

```sql
-- Supabase Vault für sichere Secret-Speicherung
SELECT vault.create_secret(
  'gmail_refresh_token',
  '<DEIN_REFRESH_TOKEN>'
);

SELECT vault.create_secret(
  'gmail_client_id', 
  '<DEINE_CLIENT_ID>'
);

SELECT vault.create_secret(
  'gmail_client_secret',
  '<DEIN_CLIENT_SECRET>'
);
```

Alternativ: Im Supabase Dashboard unter **Edge Functions → Secrets**:
- `GMAIL_REFRESH_TOKEN` = dein Refresh Token
- `GMAIL_CLIENT_ID` = deine Client ID  
- `GMAIL_CLIENT_SECRET` = dein Client Secret

---

## Schritt 4: Edge Function `email-scanner` deployen

Die Edge Function liest die Secrets aus Supabase Vault und ruft die Gmail API direkt auf:

```typescript
// supabase/functions/email-scanner/index.ts
// (bereits im Repository unter scripts/secondbrain_email_scanner.py als Referenz)

// Ablauf:
// 1. Refresh Token aus Vault laden
// 2. Neuen Access Token via OAuth holen
// 3. Gmail API: Neue E-Mails mit Anhängen abrufen
// 4. Anhänge als Base64 herunterladen
// 5. In Supabase Storage hochladen (Bucket: secondbrain-documents)
// 6. sb_documents-Eintrag erstellen
// 7. analyze-and-suggest-links aufrufen
// 8. E-Mail mit Label "SecondBrain-Imported" markieren
```

Deployment:
```bash
supabase functions deploy email-scanner --no-verify-jwt
```

---

## Schritt 5: Cron-Job einrichten

Im Supabase SQL-Editor (pg_cron):

```sql
-- Täglich um 08:00 Uhr (Berliner Zeit = 06:00 UTC):
SELECT cron.schedule(
  'secondbrain-email-scan',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/email-scanner',
    headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

## Aktueller Status ohne OAuth

Auch ohne OAuth ist der Scanner bereits funktionsfähig:

| Feature | Status |
|---|---|
| E-Mail-Metadaten importieren | **Aktiv** — 15 Dokumente importiert |
| E-Mail-Betreff, Absender, Datum | **Aktiv** — in `sb_documents` gespeichert |
| PDF-Binärdateien hochladen | **Ausstehend** — benötigt OAuth |
| OCR-Text extrahieren | **Ausstehend** — benötigt PDF-Upload |
| KI-Zuordnungsvorschläge | **Ausstehend** — benötigt OCR-Text |

Der Manus-Gmail-MCP-Server hat bereits OAuth-Zugriff auf dein Gmail-Konto. Falls du den MCP-Token-Pfad kennst (`~/.config/manus/gmail_token.json` o.ä.), kann dieser direkt als Refresh Token verwendet werden — ohne neue OAuth-App.

---

## Schnellstart: Hast du schon einen Token?

Der Manus-Gmail-MCP-Server ist bereits mit deinem Gmail-Konto verbunden. Führe auf deinem Mac aus:

```bash
# Suche nach dem MCP-Token:
find ~ -name "*.json" | xargs grep -l "refresh_token" 2>/dev/null | head -5
find ~ -name "*gmail*" -o -name "*manus*" 2>/dev/null | head -10
```

Falls du einen Token findest, kannst du Schritt 1-2 überspringen und direkt mit Schritt 3 beginnen.
