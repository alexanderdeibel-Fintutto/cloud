# Migrationsplan: Fintutto-Ökosystem → Vermietify Lovable App

## Executive Summary

Dieses Dokument beschreibt die vollständige Migration und Kondensierung der Features aus dem bestehenden Fintutto-Ökosystem (Admin-Dashboard, Monorepo) in die neue Lovable-App **Vermietify** (https://vermietify.lovable.app).

---

## 1. IST-Analyse: Bestehendes Fintutto-Ökosystem

### 1.1 Technologie-Stack (Alt)
| Komponente | Technologie |
|------------|-------------|
| Framework | Next.js 14 (App Router) |
| UI | shadcn/ui, Radix UI, Tailwind CSS |
| State | Zustand, SWR |
| Charts | Recharts |
| Monorepo | Turborepo + npm workspaces |
| Types | @fintutto/types (zentral) |
| Utils | @fintutto/utils |

### 1.2 Vorhandene Module & Features

#### A. Dashboard-Übersicht
- [x] KPI-Cards (Umsatz, MRR, ARR, Nutzer, Abos)
- [x] Umsatz-Charts (Area, gestackt)
- [x] Nutzerwachstum-Charts (Bar)
- [x] Produkt-Performance Übersicht
- [x] Letzte Aktivitäten Feed
- [x] Letzte Bestellungen

#### B. Benutzerverwaltung
- [x] Benutzer-Liste mit DataTable
- [x] Such- und Filterfunktion
- [x] Status-Management (active, inactive, suspended, pending)
- [x] Rollen-System (admin, manager, support, viewer)
- [x] User Details Dialog
- [x] Aktionen (Bearbeiten, Sperren, Löschen)

#### C. Produkte & Preise
- [x] Produkt-Liste mit Status-Toggle
- [x] Preismodelle (Flat, Tiered, Per Unit, Volume)
- [x] Billing-Intervalle (Monat, Jahr, Woche, Tag, Einmalig)
- [x] Feature-Listen pro Produkt
- [x] Trial-Perioden

#### D. Bundles
- [x] Bundle-Erstellung
- [x] Rabatt-Typen (Prozent, Festbetrag)
- [x] Redemption-Tracking

#### E. Angebote & Promotionen
- [x] Discount-Codes
- [x] Offer-Typen (Discount, Trial Extension, Free Add-on, Upgrade)
- [x] Zielgruppen-Targeting
- [x] Status-Workflow (Draft → Scheduled → Active → Completed)

#### F. Analytics & Berichte
- [x] Revenue Analytics (12 Monate)
- [x] User Growth Metriken
- [x] Product Performance
- [x] Cohort Retention
- [x] Geographic Data

#### G. Systemeinstellungen
- [x] General Settings
- [x] Billing Settings
- [x] Email Settings
- [x] Integration Settings (Stripe, Analytics, CRM)

---

## 2. ZIEL-Architektur: Vermietify Lovable

### 2.1 Lovable Technologie-Stack
| Komponente | Technologie |
|------------|-------------|
| Framework | Vite + React 18 |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| UI | Tailwind CSS, shadcn/ui |
| State | React Query (TanStack) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |

### 2.2 Vermietify-spezifische Domain

Da **Vermietify** eine Immobilien-/Vermietungs-App ist, müssen die generischen Fintutto-Features auf den Vermietungs-Kontext angepasst werden:

| Fintutto-Konzept | Vermietify-Konzept |
|------------------|-------------------|
| Users | Vermieter, Mieter, Hausverwalter |
| Products | Mietobjekte, Wohnungen, Häuser |
| Bundles | Objektgruppen, Portfolios |
| Offers | Mietangebote, Sonderkonditionen |
| Orders | Mietverträge, Buchungen |
| Revenue | Mieteinnahmen, Nebenkosten |
| Subscriptions | Laufende Mietverhältnisse |

---

## 3. Migrations-Phasen

### Phase 1: Datenbank-Schema (Supabase)
**Priorität: HOCH** | **Aufwand: 3-5 Tage**

#### 3.1.1 Core Tables

```sql
-- Vermieter/Eigentümer
CREATE TABLE landlords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_name TEXT,
  tax_id TEXT,
  iban TEXT,
  address JSONB,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mietobjekte (Properties)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES landlords(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('apartment', 'house', 'commercial', 'parking', 'storage')),
  status TEXT CHECK (status IN ('available', 'rented', 'maintenance', 'inactive')) DEFAULT 'available',
  address JSONB NOT NULL,
  features JSONB DEFAULT '[]',
  images TEXT[] DEFAULT '{}',
  base_rent INTEGER NOT NULL, -- in cents
  additional_costs INTEGER DEFAULT 0,
  deposit INTEGER DEFAULT 0,
  size_sqm DECIMAL,
  rooms INTEGER,
  floor INTEGER,
  year_built INTEGER,
  energy_rating TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mieter (Tenants)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  occupation TEXT,
  income INTEGER, -- monthly in cents
  documents JSONB DEFAULT '[]',
  status TEXT CHECK (status IN ('active', 'pending', 'former', 'blacklisted')) DEFAULT 'pending',
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mietverträge (Leases)
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  tenant_id UUID REFERENCES tenants(id),
  landlord_id UUID REFERENCES landlords(id),
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount INTEGER NOT NULL, -- in cents
  additional_costs INTEGER DEFAULT 0,
  deposit_amount INTEGER DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  payment_day INTEGER DEFAULT 1 CHECK (payment_day BETWEEN 1 AND 28),
  status TEXT CHECK (status IN ('draft', 'active', 'terminated', 'expired')) DEFAULT 'draft',
  notice_period_months INTEGER DEFAULT 3,
  special_terms TEXT,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zahlungen (Payments)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID REFERENCES leases(id),
  tenant_id UUID REFERENCES tenants(id),
  amount INTEGER NOT NULL, -- in cents
  type TEXT CHECK (type IN ('rent', 'deposit', 'additional_costs', 'repair', 'other')),
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue', 'partial', 'refunded')) DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wartung/Reparaturen (Maintenance)
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  tenant_id UUID REFERENCES tenants(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('plumbing', 'electrical', 'heating', 'appliance', 'structural', 'other')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('reported', 'in_progress', 'scheduled', 'completed', 'cancelled')) DEFAULT 'reported',
  estimated_cost INTEGER,
  actual_cost INTEGER,
  scheduled_date DATE,
  completed_date DATE,
  images TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dokumente (Documents)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'property', 'lease', 'tenant', 'payment'
  entity_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('contract', 'invoice', 'protocol', 'certificate', 'photo', 'other')),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktivitätsprotokoll (Activity Log)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.1.2 Views für Analytics

```sql
-- Dashboard KPIs
CREATE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM properties WHERE status != 'inactive') as total_properties,
  (SELECT COUNT(*) FROM properties WHERE status = 'rented') as rented_properties,
  (SELECT COUNT(*) FROM tenants WHERE status = 'active') as active_tenants,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid' AND EXTRACT(MONTH FROM paid_date) = EXTRACT(MONTH FROM CURRENT_DATE)) as revenue_this_month,
  (SELECT COUNT(*) FROM payments WHERE status = 'overdue') as overdue_payments,
  (SELECT COUNT(*) FROM maintenance_requests WHERE status IN ('reported', 'in_progress')) as open_maintenance;

-- Monatliche Einnahmen
CREATE VIEW monthly_revenue AS
SELECT
  DATE_TRUNC('month', paid_date) as month,
  SUM(CASE WHEN type = 'rent' THEN amount ELSE 0 END) as rent_revenue,
  SUM(CASE WHEN type = 'additional_costs' THEN amount ELSE 0 END) as additional_revenue,
  SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as deposits,
  SUM(amount) as total_revenue
FROM payments
WHERE status = 'paid'
GROUP BY DATE_TRUNC('month', paid_date)
ORDER BY month DESC;
```

---

### Phase 2: Authentifizierung & Rollen
**Priorität: HOCH** | **Aufwand: 2-3 Tage**

#### 3.2.1 Supabase Auth Setup

```typescript
// types/auth.ts
export type UserRole = 'landlord' | 'tenant' | 'property_manager' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  settings: UserSettings;
  createdAt: Date;
}

export interface UserSettings {
  language: 'de' | 'en';
  currency: 'EUR' | 'CHF';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  timezone: string;
}
```

#### 3.2.2 Row Level Security (RLS)

```sql
-- Landlords können nur ihre eigenen Properties sehen
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can view own properties"
ON properties FOR SELECT
USING (landlord_id IN (
  SELECT id FROM landlords WHERE user_id = auth.uid()
));

-- Tenants können nur ihre Mietverträge sehen
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view own leases"
ON leases FOR SELECT
USING (tenant_id IN (
  SELECT id FROM tenants WHERE user_id = auth.uid()
));
```

---

### Phase 3: Core Features Implementation
**Priorität: HOCH** | **Aufwand: 10-15 Tage**

#### 3.3.1 Feature-Matrix für Lovable

| Feature | Komponenten | Supabase Tables | Priorität |
|---------|-------------|-----------------|-----------|
| **Dashboard** | StatCards, Charts, ActivityFeed | dashboard_stats view | P0 |
| **Objekte verwalten** | PropertyList, PropertyForm, PropertyDetail | properties | P0 |
| **Mieter verwalten** | TenantList, TenantForm, TenantDetail | tenants | P0 |
| **Mietverträge** | LeaseList, LeaseForm, LeaseDetail | leases | P0 |
| **Zahlungen** | PaymentList, PaymentTracker, Reminders | payments | P1 |
| **Wartung** | MaintenanceList, RequestForm | maintenance_requests | P1 |
| **Dokumente** | DocumentManager, Upload | documents, Supabase Storage | P1 |
| **Analytics** | RevenueChart, OccupancyChart | Views | P2 |
| **Einstellungen** | SettingsForm, ProfileForm | user_settings | P2 |

#### 3.3.2 Lovable Prompts für Feature-Generierung

**Prompt 1: Dashboard**
```
Erstelle ein Dashboard mit folgenden KPI-Cards:
- Gesamteinnahmen (diesen Monat)
- Vermietete Objekte / Gesamt
- Aktive Mieter
- Offene Zahlungen
- Ausstehende Wartungsanfragen

Füge zwei Charts hinzu:
1. Monatliche Einnahmen (AreaChart, letzte 12 Monate)
2. Belegungsrate (DonutChart)

Füge eine "Letzte Aktivitäten" Liste hinzu.
```

**Prompt 2: Objektverwaltung**
```
Erstelle eine Objektverwaltung mit:
- DataTable mit Spalten: Name, Adresse, Typ, Status, Miete, Mieter, Aktionen
- Filter nach Status (Verfügbar, Vermietet, Wartung)
- Suchfunktion
- "Objekt hinzufügen" Dialog mit Formular:
  - Name, Beschreibung
  - Typ (Wohnung, Haus, Gewerbe, Stellplatz)
  - Adresse (Straße, PLZ, Stadt)
  - Kaltmiete, Nebenkosten, Kaution
  - Größe (m²), Zimmer, Etage
  - Features (Balkon, Keller, Aufzug, etc.)
  - Bildupload
```

**Prompt 3: Mieterverwaltung**
```
Erstelle eine Mieterverwaltung mit:
- DataTable: Name, E-Mail, Telefon, Objekt, Status, Miete seit
- Status-Badge (Aktiv, Ausstehend, Ehemalig)
- Mieter-Detail-Ansicht mit:
  - Kontaktdaten
  - Miethistorie
  - Zahlungsübersicht
  - Dokumente
- "Mieter hinzufügen" Formular
```

**Prompt 4: Mietverträge**
```
Erstelle eine Vertragsverwaltung mit:
- Liste aller Mietverträge
- Status (Entwurf, Aktiv, Gekündigt, Abgelaufen)
- Vertragsdetails:
  - Objekt und Mieter Verknüpfung
  - Mietbeginn, Mietende
  - Monatliche Miete, Nebenkosten
  - Kaution (gezahlt ja/nein)
  - Kündigungsfrist
  - Sondervereinbarungen
- PDF-Export für Vertrag
```

**Prompt 5: Zahlungsmanagement**
```
Erstelle ein Zahlungsmodul mit:
- Übersicht aller Zahlungen
- Status (Ausstehend, Bezahlt, Überfällig)
- Fälligkeitsdatum-Tracking
- Automatische Mahnung bei überfälligen Zahlungen
- Zahlungseingang verbuchen
- Export für Buchhaltung
```

---

### Phase 4: UI-Komponenten Migration
**Priorität: MITTEL** | **Aufwand: 5-7 Tage**

#### 3.4.1 Zu migrierende Komponenten

| Fintutto-Komponente | Lovable-Äquivalent | Anpassung |
|---------------------|-------------------|-----------|
| StatCard | Card + Badge | Labels anpassen |
| DataTable | Table + Pagination | Bereits verfügbar |
| AreaChart | Recharts integrieren | Gleich |
| BarChart | Recharts integrieren | Gleich |
| StatusBadge | Badge mit Varianten | Farben für Vermietung |
| PageHeader | Eigenes Component | Neu erstellen |
| EmptyState | Eigenes Component | Neu erstellen |
| ConfirmDialog | AlertDialog | Vorhanden |

#### 3.4.2 Custom Komponenten für Vermietify

```typescript
// components/PropertyCard.tsx
interface PropertyCardProps {
  property: Property;
  onEdit: () => void;
  onView: () => void;
}

// components/TenantAvatar.tsx
interface TenantAvatarProps {
  tenant: Tenant;
  showStatus?: boolean;
}

// components/RentStatusBadge.tsx
interface RentStatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue' | 'partial';
}

// components/OccupancyChart.tsx
interface OccupancyChartProps {
  data: { rented: number; available: number; maintenance: number };
}
```

---

### Phase 5: Integrationen
**Priorität: NIEDRIG** | **Aufwand: 5-8 Tage**

#### 3.5.1 Stripe Integration (für Mietinkasso)

```typescript
// Supabase Edge Function: create-payment-intent.ts
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  const { leaseId, amount } = await req.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: { leaseId },
  });

  return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }));
});
```

#### 3.5.2 E-Mail Benachrichtigungen (Resend/SendGrid)

```typescript
// Automatische Zahlungserinnerungen
// Mietvertrag-Benachrichtigungen
// Wartungs-Updates
```

#### 3.5.3 PDF-Generierung (für Verträge, Rechnungen)

```typescript
// Supabase Edge Function: generate-contract-pdf.ts
// Verwendet: @react-pdf/renderer oder pdfmake
```

---

## 4. Migrations-Timeline

```
Woche 1-2:  Phase 1 - Datenbank-Schema
            └── Supabase Setup, Tables, RLS, Views

Woche 2-3:  Phase 2 - Auth & Rollen
            └── Supabase Auth, User Profiles, Permissions

Woche 3-6:  Phase 3 - Core Features
            ├── Dashboard (Woche 3)
            ├── Objektverwaltung (Woche 3-4)
            ├── Mieterverwaltung (Woche 4)
            ├── Verträge (Woche 4-5)
            ├── Zahlungen (Woche 5)
            └── Wartung & Dokumente (Woche 5-6)

Woche 6-7:  Phase 4 - UI Polish
            └── Komponenten, Responsive, Dark Mode

Woche 7-8:  Phase 5 - Integrationen
            └── Stripe, E-Mail, PDF

Woche 8+:   Testing, Bugfixing, Launch
```

---

## 5. Daten-Migration (Falls vorhanden)

### 5.1 Export aus altem System
```bash
# Mock-Daten zu echten Supabase-Daten konvertieren
npm run export-data
```

### 5.2 Import nach Supabase
```sql
-- Bulk insert via Supabase Dashboard oder CLI
\copy properties FROM 'properties.csv' WITH CSV HEADER;
```

---

## 6. Checkliste für Lovable-Entwicklung

### 6.1 Vor dem Start
- [ ] Supabase-Projekt erstellen
- [ ] Lovable-Projekt mit Supabase verbinden
- [ ] Environment Variables setzen
- [ ] Auth Providers konfigurieren (Email, Google, Apple)

### 6.2 Entwicklung
- [ ] Datenbank-Schema implementieren
- [ ] TypeScript-Typen generieren (`supabase gen types typescript`)
- [ ] React Query Hooks für alle Entities
- [ ] Formular-Validierung mit Zod
- [ ] Error Handling & Loading States
- [ ] Responsive Design prüfen

### 6.3 Testing
- [ ] Unit Tests für kritische Funktionen
- [ ] E2E Tests für Hauptflows
- [ ] Security Audit (RLS, Auth)
- [ ] Performance Testing

### 6.4 Launch
- [ ] Domain konfigurieren
- [ ] SSL-Zertifikat
- [ ] Monitoring einrichten
- [ ] Backup-Strategie

---

## 7. Lovable-spezifische Hinweise

### 7.1 Best Practices

1. **Prompts präzise formulieren**: Je genauer der Prompt, desto besser das Ergebnis
2. **Iterativ arbeiten**: Kleine Features einzeln bauen und testen
3. **Supabase-Integration nutzen**: Lovable hat native Supabase-Unterstützung
4. **shadcn/ui verwenden**: Konsistente UI mit wenig Aufwand
5. **TypeScript strikt**: Verhindert Laufzeitfehler

### 7.2 Bekannte Limitierungen

- Komplexe State-Logik muss manuell implementiert werden
- Chart-Bibliotheken müssen manuell hinzugefügt werden
- Custom Animationen benötigen manuellen Code

---

## 8. Nächste Schritte

1. **Sofort**: Supabase-Projekt erstellen und Schema ausrollen
2. **Diese Woche**: Dashboard und Objektverwaltung implementieren
3. **Nächste Woche**: Mieter und Verträge
4. **In 2 Wochen**: Zahlungen und Analytics

---

*Erstellt: 2026-02-03*
*Version: 1.0*
*Autor: Claude (Migration Assistant)*
