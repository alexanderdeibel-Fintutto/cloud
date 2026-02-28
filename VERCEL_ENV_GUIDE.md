# Vercel Deployment Guide - Alle 8 Fintutto Apps

*Stand: 14.02.2026 - Lovable komplett entfernt, alles auf Vercel*

---

## 1. Alle Apps im Überblick

| # | App | GitHub Repo | Vercel Domain | Framework |
|---|-----|-------------|---------------|-----------|
| 1 | **Vermietify** | `vermietify_final` | vermietify.fintutto.cloud | Vite + React |
| 2 | **Portal** | `portal` (apps/fintutto-portal) | portal.fintutto.cloud | Vite + React |
| 3 | **Ablesung** | `ablesung` | ablesung.fintutto.cloud | Vite + React |
| 4 | **HausmeisterPro** | `hausmeisterPro` | hausmeister.fintutto.cloud | Vite + React |
| 5 | **Mieter** | `mieter` | mieter.fintutto.cloud | Vite + React |
| 6 | **BescheidBoxer** | `bescheidboxer` | bescheidboxer.fintutto.cloud | Vite + React |
| 7 | **Admin-Hub** | `fintutto-admin-hub` | admin.fintutto.cloud | Vite + React |
| 8 | **Financial Compass** | `fintutto-your-financial-compass` | fintutto.cloud | Vite + React |

---

## 2. Team-Level Environment Variables (Vercel)

Setze diese EINMAL unter: `vercel.com/fintutto/~/settings/environment-variables`

### Client-Side (VITE_ prefix - sichtbar im Browser)

| Variable | Wert | Hinweis |
|----------|------|---------|
| `VITE_SUPABASE_URL` | `https://aaefocdqgdgexkcrjhks.supabase.co` | Alle Apps |
| `VITE_SUPABASE_ANON_KEY` | (aus Supabase Dashboard → Settings → API) | Public key, OK im Frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | gleicher Wert wie ANON_KEY | Vermietify nutzt diesen Namen |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_xxx` | Stripe public key |

### Server-Side (GEHEIM - niemals VITE_ prefix!)

| Variable | Wert | Hinweis |
|----------|------|---------|
| `SUPABASE_URL` | `https://aaefocdqgdgexkcrjhks.supabase.co` | API Routes |
| `SUPABASE_SERVICE_ROLE_KEY` | (aus Supabase Dashboard) | Admin-Zugang |
| `STRIPE_SECRET_KEY` | `sk_live_xxx` | Zahlungen |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` | Webhook-Verifikation |
| `ANTHROPIC_API_KEY` | `sk-ant-xxx` | Claude AI |
| `BREVO_API_KEY` | (aus Brevo Dashboard) | E-Mail Versand |

---

## 3. Vercel-Projekt pro App anlegen

### Für jedes Standalone-Repo:

```bash
# In Vercel Dashboard → "Add New Project"
# 1. Import GitHub Repo auswählen
# 2. Framework: Vite
# 3. Root Directory: ./ (Standard)
# 4. Build Command: npm run build
# 5. Output Directory: dist
# 6. Install Command: npm install
```

### Für Portal-Monorepo (apps/fintutto-portal):

```bash
# Root Directory: apps/fintutto-portal
# Alles andere gleich wie oben
```

### Für Vermietify im Monorepo (apps/vermietify):

```bash
# Root Directory: apps/vermietify
# Build Command: npm run build
# Output Directory: dist
```

---

## 4. Custom Domains einrichten

In jedem Vercel-Projekt unter Settings → Domains:

```
fintutto.cloud          → Financial Compass
vermietify.fintutto.cloud → Vermietify
portal.fintutto.cloud     → Portal
ablesung.fintutto.cloud   → Ablesung
hausmeister.fintutto.cloud → HausmeisterPro
mieter.fintutto.cloud     → Mieter
bescheidboxer.fintutto.cloud → BescheidBoxer
admin.fintutto.cloud      → Admin-Hub
```

DNS bei deinem Domain-Provider:
- A Record: `76.76.21.21`
- CNAME: `cname.vercel-dns.com`

---

## 5. Supabase OAuth einrichten (ersetzt Lovable OAuth)

In Supabase Dashboard → Authentication → Providers:

### Google OAuth:
1. Google Cloud Console → APIs & Services → Credentials
2. OAuth 2.0 Client erstellen
3. Authorized redirect URI: `https://aaefocdqgdgexkcrjhks.supabase.co/auth/v1/callback`
4. Client ID + Secret in Supabase eintragen

### Apple OAuth:
1. Apple Developer → Certificates, Identifiers & Profiles
2. Service ID erstellen mit Sign In with Apple
3. Redirect URL: `https://aaefocdqgdgexkcrjhks.supabase.co/auth/v1/callback`
4. In Supabase eintragen

---

## 6. Standalone-Apps: Lovable entfernen

Für jede Standalone-App (ablesung, hausmeisterPro, mieter, bescheidboxer):

```bash
# 1. package.json: Entferne
"@lovable.dev/cloud-auth-js": "..."
"lovable-tagger": "..."

# 2. vite.config.ts: Entferne
import { componentTagger } from "lovable-tagger";
# und
mode === "development" && componentTagger()

# 3. Falls vorhanden: src/integrations/lovable/index.ts
# Ersetze Lovable OAuth mit nativem Supabase OAuth (siehe apps/vermietify als Vorlage)

# 4. index.html: Ersetze lovable.dev OG-Images

# 5. .lovable/ Verzeichnis löschen
```

---

## 7. Vercel-Projekte die gelöscht werden können

| Vercel-Projekt | Grund |
|----------------|-------|
| `ft-nebenkostenabrechnung` | Legacy |
| `ft-nebenkostenabrechnung-vrju` | Duplikat |
| `ft-formulare-alle` | Legacy |
| `x_mieter` | Duplikat |
| `betriebskosten` | In Portal integriert |
| `portal-vermieter` | In fintutto-portal konsolidiert (/vermieter) |
| `portal-mieter` | In fintutto-portal konsolidiert (/mieter) |
