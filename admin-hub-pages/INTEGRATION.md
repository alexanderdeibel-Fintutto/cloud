# Domain-Verwaltung Integration in Admin Panel

## Übersicht

Dieses Paket enthält alle Dateien um Domain-Management in das bestehende
Admin-Panel (admin.fintutto.cloud) zu integrieren:

- **3 Seiten**: Domains, DomainDetail, LinkChecker
- **4 Hooks**: useDomains, usePages, usePageLinks, useDomainActions
- **3 Edge Functions**: check-domains, crawl-domain, check-links
- **1 Migration**: Datenbankschema mit 5 Tabellen

## Schritt 1: Dateien kopieren

```bash
# Vom fintutto-ecosystem ins Admin-Repo kopieren:
ADMIN=../admin   # Pfad zum Admin-Repo anpassen

# Pages
cp admin-hub-pages/pages/Domains.tsx       $ADMIN/src/pages/
cp admin-hub-pages/pages/DomainDetail.tsx   $ADMIN/src/pages/
cp admin-hub-pages/pages/LinkChecker.tsx    $ADMIN/src/pages/

# Hooks
cp admin-hub-pages/hooks/useDomains.ts      $ADMIN/src/hooks/
cp admin-hub-pages/hooks/usePages.ts        $ADMIN/src/hooks/
cp admin-hub-pages/hooks/usePageLinks.ts    $ADMIN/src/hooks/
cp admin-hub-pages/hooks/useDomainActions.ts $ADMIN/src/hooks/

# Edge Functions
cp -r admin-hub-pages/edge-functions/check-domains  $ADMIN/supabase/functions/
cp -r admin-hub-pages/edge-functions/crawl-domain   $ADMIN/supabase/functions/
cp -r admin-hub-pages/edge-functions/check-links    $ADMIN/supabase/functions/

# Migration
cp admin-hub-pages/migrations/005_domain_management.sql $ADMIN/supabase/migrations/
```

## Schritt 2: Abhängigkeiten prüfen

Die Seiten benötigen folgende Pakete (sind im Admin-Panel vermutlich schon vorhanden):

```bash
npm install @tanstack/react-query @supabase/supabase-js sonner date-fns lucide-react
```

Falls `useToast` im Admin-Panel anders heißt, den Import in den Seiten anpassen:
```tsx
// Die Seiten importieren: import { useToast } from "@/hooks/use-toast"
// Falls euer Admin-Panel sonner direkt nutzt, ersetzen mit:
// import { toast } from "sonner"
```

## Schritt 3: DashboardLayout anpassen

Die Seiten wrappen sich in `<DashboardLayout>`. Falls das Admin-Panel einen
anderen Wrapper nutzt (z.B. `AdminLayout`, `PageLayout`), den Import in den
3 Seiten anpassen:

```tsx
// In Domains.tsx, DomainDetail.tsx, LinkChecker.tsx:
import DashboardLayout from "@/components/layout/DashboardLayout";
// → Ändern zu eurem Layout-Wrapper
```

Falls kein Wrapper nötig ist (Layout kommt über Router), kann der Import
entfernt und `<DashboardLayout>...</DashboardLayout>` durch `<>...</>` ersetzt werden.

## Schritt 4: Routes hinzufügen

In der App-Routing-Datei (z.B. `App.tsx` oder `router.tsx`):

```tsx
import { lazy } from 'react'

const Domains = lazy(() => import('./pages/Domains'))
const DomainDetail = lazy(() => import('./pages/DomainDetail'))
const LinkChecker = lazy(() => import('./pages/LinkChecker'))

// In <Routes>:
<Route path="/domains" element={<Suspense fallback={<Loading />}><Domains /></Suspense>} />
<Route path="/domains/:id" element={<Suspense fallback={<Loading />}><DomainDetail /></Suspense>} />
<Route path="/link-checker" element={<Suspense fallback={<Loading />}><LinkChecker /></Suspense>} />
```

## Schritt 5: Navigation hinzufügen

In der Sidebar-Komponente zwei Einträge hinzufügen:

```tsx
import { Globe, Link2 } from 'lucide-react'

// In navItems/navigation Array:
{ path: "/domains", label: "Domain-Verwaltung", icon: Globe },
{ path: "/link-checker", label: "Link Checker", icon: Link2 },
```

## Schritt 6: Supabase Migration + Edge Functions deployen

```bash
# Migration
supabase db push

# Edge Functions
supabase functions deploy check-domains
supabase functions deploy crawl-domain
supabase functions deploy check-links
```

Oder die Migration manuell im Supabase Dashboard SQL Editor ausführen.

## Funktions-Übersicht

### Alle Buttons sind verdrahtet:

| Seite | Button | Hook |
|-------|--------|------|
| Domains | "Alle prüfen" | `useCheckAllDomains` |
| Domains | "Domain hinzufügen" | `useCreateDomain` |
| Domains | Löschen-Icon | `useDeleteDomain` |
| DomainDetail | "Domain prüfen" | `useCheckDomain` |
| DomainDetail | "Crawl starten" | `useCrawlDomain` |
| DomainDetail | Setup Checkboxen | `useUpdateDomain` |
| DomainDetail | Workflow Dropdown | `useUpdatePage` |
| DomainDetail | Seiten-Checkliste | `useUpdatePage` |
| DomainDetail | Bulk Actions | `useBulkUpdatePages` |
| DomainDetail | Link Approve/Fix | `useUpdateLink` |
| LinkChecker | Bulk URL Check | `useCheckLinks` |
| LinkChecker | Bulk Actions | `useBulkUpdateLinks` |

### Seiten:

- `/domains` — Übersicht aller Domains mit KPIs, Suche, Filter, Tabelle
- `/domains/:id` — Detail mit Tabs: Unterseiten, Einrichtung, Notizen
- `/link-checker` — Kaputte Links finden, filtern, reparieren

### Edge Functions:

- `check-domains` — Prüft HTTP-Status, SSL, SEO aller Domains
- `crawl-domain` — Crawlt eine Domain und entdeckt Unterseiten + Links
- `check-links` — Prüft Erreichbarkeit einzelner URLs

### Datenbank (5 Tabellen):

- `domains` — Domain-Stammdaten mit Health, SSL, GA/GTM, Seitenanzahl
- `pages` — Unterseiten pro Domain mit Workflow + 6 Prüfungscheckboxen
- `page_links` — Einzelne Links mit Status, Typ, Approve/Fix Flags
- `check_history` — Audit-Log aller Prüfungen
- `crawl_jobs` — Crawl-Aufträge mit Status und Ergebnissen
