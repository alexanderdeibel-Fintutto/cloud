# ⚠️ DEPRECATED – Bitte `vermieter-portal` verwenden

Diese App (`vermieterportal`) wurde am 19.04.2026 als **deprecated** markiert.

## Warum?

Es existieren zwei Vermieter-Apps im Portal-Repo:

| App | Status | Inhalt |
|---|---|---|
| `vermieter-portal` | ✅ **Aktiv** | Vollständige App mit Auth, Credits, 7 Rechnern, 5 Formularen, SEO, Supabase-Integration |
| `vermieterportal` | ❌ **Deprecated** | Ältere, einfachere Struktur – alle Seiten außer Dashboard sind Platzhalter |

## Was wurde übernommen?

- ✅ **Dashboard-Schnellzugriff-Karten** → in `vermieter-portal/src/pages/HomePage.tsx` integriert
- ✅ **FintuttoAIChat-Integration** → in `vermieter-portal/src/App.tsx` übernommen
- ✅ **Sidebar-Navigation** (Objekte, Mieter, Finanzen, Betriebskosten, Steuern) → als Roadmap für `vermieter-portal` dokumentiert

## Nächste Schritte

Diese App wird in einem zukünftigen Cleanup-Commit aus dem Repo entfernt.
Bis dahin bleibt sie als Referenz erhalten.

**Verwende stattdessen:** [`apps/vermieter-portal`](../vermieter-portal/)
