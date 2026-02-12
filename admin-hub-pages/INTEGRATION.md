# Domain-Verwaltung Integration in Admin Hub

## Schritt 1: Dateien kopieren

```bash
# Vom fintutto-ecosystem ins admin-hub Repo kopieren:

# Pages
cp admin-hub-pages/pages/Domains.tsx       ../fintutto-admin-hub/src/pages/
cp admin-hub-pages/pages/DomainDetail.tsx   ../fintutto-admin-hub/src/pages/
cp admin-hub-pages/pages/LinkChecker.tsx    ../fintutto-admin-hub/src/pages/

# Hooks
cp admin-hub-pages/hooks/useDomains.ts     ../fintutto-admin-hub/src/hooks/
cp admin-hub-pages/hooks/usePages.ts       ../fintutto-admin-hub/src/hooks/
cp admin-hub-pages/hooks/usePageLinks.ts   ../fintutto-admin-hub/src/hooks/

# Migration
cp admin-hub-pages/migrations/005_domain_management.sql ../fintutto-admin-hub/supabase/migrations/
```

## Schritt 2: App.tsx - Routes hinzufügen

In `src/App.tsx` diese Imports hinzufügen:

```tsx
import Domains from "./pages/Domains";
import DomainDetail from "./pages/DomainDetail";
import LinkChecker from "./pages/LinkChecker";
```

Und diese Routes in die `<Routes>`:

```tsx
<Route path="/domains" element={<Domains />} />
<Route path="/domains/:id" element={<DomainDetail />} />
<Route path="/link-checker" element={<LinkChecker />} />
```

## Schritt 3: Sidebar.tsx - Navigation hinzufügen

In `src/components/layout/Sidebar.tsx` importieren:

```tsx
import { Globe, Link2 } from 'lucide-react';
```

Und in `navItems` hinzufügen:

```tsx
{ path: "/domains", label: "Domain-Verwaltung", icon: Globe },
{ path: "/link-checker", label: "Link Checker", icon: Link2 },
```

## Schritt 4: Supabase Migration ausführen

```bash
supabase db push
```

Oder die Migration manuell im Supabase Dashboard SQL Editor ausführen.

## Fertig!

Die neuen Seiten sind:
- `/domains` - Übersicht aller Fintutto-Domains
- `/domains/:id` - Detail einer Domain mit allen Unterseiten + Checkboxen
- `/link-checker` - Kaputte Links finden und reparieren
