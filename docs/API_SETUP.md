# API-Integration Einrichtung

Diese Anleitung erklärt, wie Sie die externen API-Integrationen für Fintutto einrichten.

## 1. Anthropic/Claude AI API (Beleganalyse)

Die Claude AI API wird für intelligente Beleganalyse und KI-gestützte Buchungsvorschläge verwendet.

### API-Key erhalten

1. Besuchen Sie [console.anthropic.com](https://console.anthropic.com/)
2. Erstellen Sie einen Account oder melden Sie sich an
3. Navigieren Sie zu "API Keys"
4. Klicken Sie auf "Create Key"
5. Geben Sie einen Namen ein (z.B. "Fintutto Production")
6. Kopieren Sie den API-Key

### Konfiguration

```bash
# .env Datei
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Kosten

- Claude 3.5 Sonnet: ~$3 pro 1M Input Tokens, ~$15 pro 1M Output Tokens
- Typische Beleganalyse: ~1000-2000 Tokens = ~$0.01-0.02 pro Beleg
- Empfehlung: Setzen Sie ein monatliches Limit in der Console

---

## 2. FinAPI Bank-Integration

FinAPI ermöglicht die direkte Anbindung von Bankkonten für automatischen Transaktionsimport.

### Account erstellen

1. Besuchen Sie [finapi.io](https://www.finapi.io/)
2. Registrieren Sie sich für einen Developer Account
3. Nach Freischaltung erhalten Sie Zugang zum Portal

### Sandbox-Zugang (Entwicklung)

1. Im FinAPI Portal: "Sandbox" auswählen
2. Unter "Applications" eine neue App erstellen
3. Notieren Sie `Client ID` und `Client Secret`

```bash
# .env Datei (Sandbox)
FINAPI_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
FINAPI_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
FINAPI_SANDBOX=true
FINAPI_REDIRECT_URI=http://localhost:5173/bank-callback
```

### Test-Bankverbindung (Sandbox)

Im Sandbox-Modus können Sie folgende Test-Bank nutzen:

- **Bank:** FinAPI Test Bank
- **BLZ:** 00000000
- **Benutzer:** demo
- **PIN:** demo

### Production-Zugang

1. Kontaktieren Sie FinAPI für Produktions-Zugang
2. Durchlaufen Sie das Onboarding
3. Erhalten Sie Production-Credentials

```bash
# .env Datei (Production)
FINAPI_CLIENT_ID=prod-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
FINAPI_CLIENT_SECRET=prod-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
FINAPI_SANDBOX=false
FINAPI_REDIRECT_URI=https://app.fintutto.cloud/bank-callback
```

### OAuth-Flow

Der Bank-Verbindungsflow funktioniert wie folgt:

1. Benutzer klickt "Bank verbinden"
2. API generiert Authorization URL
3. Benutzer wird zu FinAPI Web Form weitergeleitet
4. Nach erfolgreicher Authentifizierung: Redirect zurück zu Callback URL
5. Backend tauscht Authorization Code gegen Access Token
6. Tokens werden sicher in der Datenbank gespeichert

### Wichtig für Produktion

- PSD2/PSD3 Compliance beachten
- SCA (Strong Customer Authentication) ist erforderlich
- Tokens regelmäßig erneuern (Refresh Token)
- Bank-Verbindungen können nach 90 Tagen ablaufen

---

## 3. SMTP E-Mail (Optional)

Für E-Mail-Versand (Rechnungen, Benachrichtigungen).

```bash
# .env Datei
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@fintutto.cloud
```

### Empfohlene Anbieter

- **SendGrid** - Guter Free Tier
- **Mailgun** - Entwicklerfreundlich
- **Amazon SES** - Günstig bei hohem Volumen

---

## 4. S3/Object Storage (Optional)

Für Beleg-Uploads und Dokumentenspeicherung.

```bash
# .env Datei (AWS S3)
S3_REGION=eu-central-1
S3_BUCKET=fintutto-uploads
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_PUBLIC_URL=https://fintutto-uploads.s3.eu-central-1.amazonaws.com
```

### Alternative: MinIO (Self-Hosted)

```bash
# .env Datei (MinIO)
S3_REGION=us-east-1
S3_BUCKET=fintutto-uploads
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_ENDPOINT=http://localhost:9000
S3_PUBLIC_URL=http://localhost:9000/fintutto-uploads
```

---

## 5. Stripe (Abonnements, Optional)

Falls Sie ein SaaS-Modell mit Abonnements anbieten möchten.

```bash
# .env Datei
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Sicherheitshinweise

1. **Niemals** API-Keys in Code committen
2. Verwenden Sie `.env.local` für lokale Entwicklung
3. In Produktion: Secrets via Umgebungsvariablen (z.B. Docker Secrets, Kubernetes Secrets)
4. Rotieren Sie API-Keys regelmäßig
5. Setzen Sie IP-Whitelisting wo möglich
6. Loggen Sie keine sensiblen Daten

---

## Troubleshooting

### FinAPI Fehler: "Invalid client credentials"

- Prüfen Sie Client ID und Secret auf Tippfehler
- Sandbox vs Production verwechselt?
- Account noch nicht freigeschaltet?

### Claude API Fehler: "Invalid API key"

- Key beginnt mit `sk-ant-`?
- Key abgelaufen oder gelöscht?
- Kreditlimit erreicht?

### E-Mail wird nicht gesendet

- SMTP-Credentials korrekt?
- Port 587 (TLS) oder 465 (SSL)?
- Firewall-Regeln?

---

## Support

Bei Fragen zur Integration:

- **FinAPI Support:** support@finapi.io
- **Anthropic Support:** support@anthropic.com
- **Fintutto Support:** support@fintutto.cloud
