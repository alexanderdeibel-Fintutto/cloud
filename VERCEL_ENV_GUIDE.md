# Vercel Environment Variables - Konfigurationsguide

*Stand: 10.02.2026*

---

## 1. Team-Level Variablen (gelten f\u00fcr ALLE Apps)

Diese Variablen setzt du EINMAL unter:
`vercel.com/fintutto/~/settings/environment-variables`

### Bereits gesetzt:
| Variable | Typ | Verwendung |
|----------|-----|------------|
| `SUPABASE_URL` | Server-Side | Supabase API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Side (geheim!) | Supabase Admin-Zugang |
| `STRIPE_SECRET_KEY` | Server-Side (geheim!) | Stripe Payments |
| `STRIPE_WEBHOOK_SECRET` | Server-Side (geheim!) | Stripe Webhooks |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Client-Side | Stripe \u00f6ffentlicher Key |
| `ANTHROPIC_API_KEY` | Server-Side (geheim!) | Claude AI |
| `BREVO_API_KEY` | Server-Side (geheim!) | E-Mail Versand |
| `NEXT_PUBLIC_APP_URL` | Client-Side | App URL |

### FEHLT NOCH - Bitte hinzuf\u00fcgen:
| Variable | Wert | Warum |
|----------|------|-------|
| **`VITE_SUPABASE_URL`** | `https://aaefocdqgdgexkcrjhks.supabase.co` | Alle Vite/Lovable-Apps brauchen den `VITE_` Prefix |
| **`VITE_SUPABASE_ANON_KEY`** | (aus Supabase Dashboard) | Der PUBLIC Anon Key f\u00fcr Client-Side Auth |

### Wo findest du den Anon Key?
1. Gehe zu deinem Supabase Dashboard
2. Settings \u2192 API
3. Unter "Project API keys" steht der `anon` / `public` Key
4. Diesen als `VITE_SUPABASE_ANON_KEY` in Vercel eintragen

---

## 2. Warum `VITE_` Prefix?

**Vite** (das Build-Tool aller Lovable-Apps) hat eine Sicherheitsregel:

- Variablen **MIT** `VITE_` Prefix \u2192 sind im Browser/Frontend verf\u00fcgbar
- Variablen **OHNE** `VITE_` Prefix \u2192 sind nur auf dem Server verf\u00fcgbar

Die Lovable-Apps greifen im Frontend auf Supabase zu (`import.meta.env.VITE_SUPABASE_URL`), deshalb brauchen sie den `VITE_` Prefix.

**Wichtig:** Der Anon Key ist ein PUBLIC Key - er darf im Frontend stehen. Der `SERVICE_ROLE_KEY` hingegen darf **NIEMALS** als `VITE_` Variable gesetzt werden!

---

## 3. Vercel Projekte \u2192 GitHub Repos Mapping

| Vercel-Projekt | Domain | GitHub Repo | Team-Vars? |
|----------------|--------|-------------|------------|
| **vermietify** | vermietify.vercel.app | `vermieter-freude` | \u2705 erbt automatisch |
| **hausmeister-pro** | hausmeister-pro.vercel.app | `hausmeisterPro` | \u2705 erbt automatisch |
| **ablesung** | ablesung.vercel.app | `ablesung` | \u2705 erbt automatisch |
| **mieter** | mieter-kw8d.vercel.app | `mieter` | \u2705 erbt automatisch |
| **fintutto** | fintutto.vercel.app | `fintutto-your-financial-compass` | \u2705 erbt automatisch |
| **betriebskosten** | betriebskosten-helfer.vercel.app | `betriebskosten` | \u2705 erbt automatisch |
| **fintutto-admin-hub** | fintutto-admin-hub.vercel.app | `fintutto-admin-hub` | \u2705 erbt automatisch |
| **portal-vermieter** | vermieterportal.fintutto.cloud | Portal-V Repo | \u2705 erbt automatisch |
| **portal-mieter** | mieterportal.fintutto.cloud | Portal-M Repo | \u2705 erbt automatisch |
| **fintutto-portal** (NEU) | portal.fintutto.cloud | `fintutto-ecosystem` (apps/fintutto-portal) | \u2705 erbt automatisch |

---

## 4. Vercel-Projekte die gel\u00f6scht werden k\u00f6nnen

| Vercel-Projekt | Grund |
|----------------|-------|
| `ft-nebenkostenabrechnung` | Legacy JavaScript |
| `ft-nebenkostenabrechnung-vrju` | Duplikat |
| `ft-formulare-alle` | Legacy JavaScript |
| `x_mieter` | Duplikat von "mieter" |
| `command-center` | In admin-hub konsolidieren |

---

## 5. Supabase-Projekt: Welches nutzen?

Alle Apps sollten auf **EINE** Supabase-Instanz zeigen:

```
URL: https://aaefocdqgdgexkcrjhks.supabase.co
```

Die Lovable-Apps haben eigene Supabase-Projekte erstellt, die NICHT verwendet werden sollen. Durch die Vercel Team-Variablen wird automatisch die richtige Supabase-URL injected.

**Problem:** Die Lovable-Apps haben die Supabase-URL teilweise **hardcoded** im Code:
```typescript
// SO NICHT (hardcoded Lovable-Supabase):
const supabaseUrl = "https://xxxlovablesupabase.supabase.co"

// SO RICHTIG (liest aus Umgebungsvariable):
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
```

F\u00fcr jede App musst du pr\u00fcfen, ob die Supabase-URL als Environment Variable gelesen wird oder hardcoded ist. Falls hardcoded, muss der Code ge\u00e4ndert werden.

---

## 6. Custom Domains auf Vercel

Empfohlene Domain-Struktur:
| App | Domain |
|-----|--------|
| Fintutto (Firma) | fintutto.cloud |
| Vermietify | vermietify.fintutto.cloud |
| Zähler (Ablesung) | ablesung.fintutto.cloud |
| Mieter | mieter.fintutto.cloud |
| Hausmeister | hausmeister.fintutto.cloud |
| Portal | portal.fintutto.cloud |
| Admin | admin.fintutto.cloud |
