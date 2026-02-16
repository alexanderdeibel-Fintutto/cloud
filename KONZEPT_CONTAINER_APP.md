# Fintutto Container-App: Konzept & Umsetzungsplan

## 1. Vision

Eine **Hybrid-Architektur** aus gemeinsamen Kern-Bibliotheken und separaten App-Shells,
die als Vorlage für alle Fintutto-Ökosystem-Apps dient.

**Prinzip:** Maximale Code-Wiederverwendung bei eigenständigen App-Identitäten.

```
┌─────────────────────────────────────────────────────────┐
│                    App Store / PWA                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Fintutto │ │ Mieter   │ │Hausm.Pro │ │ Zähler   │   │
│  │  (Full)  │ │          │ │          │ │          │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       │             │            │             │          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │Bescheid- │ │Vermietify│ │Hausm.Go  │                 │
│  │ Boxer    │ │ (mobil)  │ │  (lite)  │                 │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘                 │
│       │             │            │                        │
│  ─────┴─────────────┴────────────┴───────────────────    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │            SHARED PACKAGES (Core)               │     │
│  │  @fintutto/core   │ Auth, Supabase, Stripe, API │     │
│  │  @fintutto/ui     │ Design System (shadcn)      │     │
│  │  @fintutto/pwa    │ Service Worker, Manifest     │     │
│  │  @fintutto/shared │ Types, Utils (existiert)     │     │
│  │  @fintutto/ai-chat│ KI-Chat Widget (existiert)   │     │
│  └─────────────────────────────────────────────────┘     │
│                          │                               │
│  ─────────────────────────────────────────────────────   │
│                          │                               │
│  ┌─────────────────────────────────────────────────┐     │
│  │              BACKEND SERVICES                    │     │
│  │  Supabase (PostgreSQL + Auth + Storage + RLS)    │     │
│  │  Go API Server (Performance-kritische Endpoints) │     │
│  │  Stripe (Payments + Subscriptions)               │     │
│  └─────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Architektur-Entscheidungen

### 2.1 Warum Hybrid (Shared Core + Separate Shells)?

| Kriterium | White-Label (eine App) | Template (Copy-Paste) | **Hybrid (unser Weg)** |
|-----------|----------------------|----------------------|----------------------|
| Code-Wiederverwendung | Hoch | Niedrig | **Hoch** |
| Eigenständige App-Stores | Schwer | Ja | **Ja** |
| Unabhängige Releases | Nein | Ja | **Ja** |
| Eigenes Branding/UX | Begrenzt | Voll | **Voll** |
| Wartungsaufwand | Niedrig | Hoch | **Mittel** |

**Fazit:** Jede App hat eigene Identität, eigenen App-Store-Eintrag, eigenes Branding —
aber teilt 70-80% des Codes über die `@fintutto/*`-Packages.

### 2.2 PWA-First-Strategie

```
Phase 1: PWA (installierbar, offline-fähig)
   ↓
Phase 2: App-Store via PWABuilder / Trusted Web Activity (TWA)
   ↓
Phase 3: Optional → Capacitor-Wrapper für native Features (Push, Kamera)
```

**Vorteile PWA-First:**
- Kein neuer Tech-Stack nötig (bleibt React/Vite/TS)
- Sofort installierbar auf iOS + Android
- Ein Codebase für Web + "App"
- App-Store-Einreichung über TWA (Android) / PWABuilder (Windows/iOS)
- Offline-Fähigkeit über Service Worker

### 2.3 Go-Backend (Dual-Bedeutung)

**a) Fintutto Go-Edition:** Abgespeckte mobile Lightweight-Version
- Reduzierter Feature-Satz: Dashboard, Schnellaktionen, Push-Benachrichtigungen
- Optimiert für kleine Bildschirme und schlechte Verbindungen
- Offline-First mit Background-Sync

**b) Go API Server:** Performanter Backend-Service
- Ablösung der Vercel Serverless Functions für kritische Pfade
- Supabase JWT-Validierung
- Stripe Webhook-Handling
- Batch-Operationen (Nebenkostenabrechnung, Reports)
- WebSocket-Server für Echtzeit-Features

---

## 3. Verzeichnisstruktur (Ziel)

```
portal/
├── packages/
│   ├── core/                        # @fintutto/core (NEU)
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── AuthProvider.tsx       # Supabase Auth Context
│   │   │   │   ├── useAuth.ts             # Auth Hook
│   │   │   │   ├── ProtectedRoute.tsx     # Route Guard
│   │   │   │   └── types.ts              # User, Session Types
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts             # Singleton Supabase Client
│   │   │   │   ├── hooks.ts              # useQuery-basierte DB-Hooks
│   │   │   │   └── types.ts              # Database Types (generated)
│   │   │   ├── stripe/
│   │   │   │   ├── StripeProvider.tsx     # Stripe Elements Context
│   │   │   │   ├── useSubscription.ts    # Abo-Status Hook
│   │   │   │   ├── PricingTable.tsx       # Wiederverwendbare Preistabelle
│   │   │   │   └── CheckoutButton.tsx    # One-Click Checkout
│   │   │   ├── api/
│   │   │   │   ├── client.ts             # API Client (Go Backend)
│   │   │   │   └── hooks.ts              # API Query Hooks
│   │   │   └── index.ts                  # Barrel Export
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                          # @fintutto/ui (NEU)
│   │   ├── src/
│   │   │   ├── primitives/               # Basis-Komponenten
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Dialog.tsx
│   │   │   │   ├── Sheet.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   └── ...                   # Alle shadcn-Komponenten
│   │   │   ├── composed/                 # Zusammengesetzte Komponenten
│   │   │   │   ├── AppShell.tsx          # Layout-Rahmen (Sidebar, Header, Content)
│   │   │   │   ├── BottomNav.tsx         # Mobile Bottom Navigation
│   │   │   │   ├── DataTable.tsx         # Wiederverwendbare Datentabelle
│   │   │   │   ├── EmptyState.tsx        # Leerzustands-Anzeige
│   │   │   │   ├── LoadingState.tsx      # Lade-Skeleton
│   │   │   │   ├── ErrorBoundary.tsx     # Fehlerbehandlung
│   │   │   │   ├── OnboardingFlow.tsx    # Mehrstufiges Onboarding
│   │   │   │   └── SettingsLayout.tsx    # Einstellungen-Layout
│   │   │   ├── domain/                   # Fachspezifische Komponenten
│   │   │   │   ├── PropertyCard.tsx      # Immobilien-Karte
│   │   │   │   ├── TenantCard.tsx        # Mieter-Karte
│   │   │   │   ├── MeterReading.tsx      # Zählerstand-Eingabe
│   │   │   │   ├── PaymentStatus.tsx     # Zahlungsstatus
│   │   │   │   └── DocumentViewer.tsx    # Dokumenten-Anzeige
│   │   │   ├── theme/
│   │   │   │   ├── tokens.ts             # Design Tokens (Farben, Spacing)
│   │   │   │   ├── presets.ts            # App-spezifische Themes
│   │   │   │   └── ThemeProvider.tsx     # Theme Context
│   │   │   └── index.ts
│   │   ├── tailwind.preset.js            # Shared Tailwind-Konfiguration
│   │   └── package.json
│   │
│   ├── pwa/                         # @fintutto/pwa (NEU)
│   │   ├── src/
│   │   │   ├── register-sw.ts            # Service Worker Registration
│   │   │   ├── manifest-generator.ts     # Dynamische Manifest-Generierung
│   │   │   ├── install-prompt.tsx        # "App installieren"-Banner
│   │   │   ├── offline-indicator.tsx     # Offline-Status-Anzeige
│   │   │   ├── update-prompt.tsx         # "Update verfügbar"-Banner
│   │   │   ├── cache-strategies.ts       # Caching-Strategien
│   │   │   └── background-sync.ts       # Background Sync für Offline
│   │   └── package.json
│   │
│   ├── shared/                      # @fintutto/shared (EXISTIERT → erweitern)
│   └── ai-chat/                     # @fintutto/ai-chat (EXISTIERT)
│
├── apps/
│   ├── fintutto/                    # 🎯 ERSTE APP: Fintutto Full
│   │   ├── src/
│   │   │   ├── main.tsx                  # Entry Point
│   │   │   ├── App.tsx                   # App mit Routing
│   │   │   ├── app-config.ts             # ⭐ APP-KONFIGURATION
│   │   │   ├── features/                 # Feature-Module
│   │   │   │   ├── dashboard/
│   │   │   │   ├── properties/
│   │   │   │   ├── tenants/
│   │   │   │   ├── meters/
│   │   │   │   ├── documents/
│   │   │   │   ├── payments/
│   │   │   │   ├── calculators/
│   │   │   │   ├── checkers/
│   │   │   │   ├── bescheide/
│   │   │   │   └── settings/
│   │   │   └── routes.tsx                # App-spezifische Routen
│   │   ├── public/
│   │   │   ├── icons/                    # App-Icons (192, 512, maskable)
│   │   │   ├── manifest.json             # PWA Manifest
│   │   │   └── sw.js                     # Service Worker
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js            # Nutzt @fintutto/ui Preset
│   │   └── package.json
│   │
│   ├── fintutto-go/                 # Fintutto Lightweight (Phase 2)
│   ├── mieter/                      # Mieter-App (Phase 2)
│   ├── hausmeister-pro/             # HausmeisterPro (Phase 2)
│   ├── zaehler/                     # Zähler-App (Phase 2)
│   ├── bescheidboxer/               # BescheidBoxer (Phase 3)
│   ├── vermietify/                  # Vermietify Mobile (Phase 3)
│   └── hausmeister-go/              # HausmeisterGo Lite (Phase 4)
│
├── services/
│   └── api-go/                      # Go Backend (Phase 2)
│       ├── cmd/
│       │   └── server/
│       │       └── main.go               # Server Entry Point
│       ├── internal/
│       │   ├── auth/
│       │   │   └── supabase.go           # JWT-Validierung
│       │   ├── handlers/
│       │   │   ├── stripe.go             # Stripe Webhooks
│       │   │   ├── properties.go         # Immobilien-API
│       │   │   └── reports.go            # Report-Generierung
│       │   ├── middleware/
│       │   │   ├── cors.go
│       │   │   └── ratelimit.go
│       │   └── db/
│       │       └── supabase.go           # Direct PostgreSQL
│       ├── go.mod
│       ├── go.sum
│       ├── Dockerfile
│       └── docker-compose.yml
│
├── templates/
│   └── app-scaffold/                # Generator für neue Apps
│       ├── scaffold.sh                   # CLI-Script
│       ├── src/
│       │   ├── main.tsx.template
│       │   ├── App.tsx.template
│       │   └── app-config.ts.template
│       ├── public/
│       │   └── manifest.json.template
│       ├── package.json.template
│       └── vite.config.ts.template
│
├── supabase/                        # EXISTIERT → erweitern
│   └── migrations/
│       ├── 001-009 ...                   # Existierende Migrationen
│       ├── 010_multi_app_support.sql     # App-Registrierung + Berechtigungen
│       └── 011_push_notifications.sql    # Push-Subscriptions
│
└── docs/
    └── CONTAINER_ARCHITEKTUR.md     # Dieses Dokument
```

---

## 4. Die App-Konfiguration (Herzstück)

Jede App wird über eine einzige Konfigurationsdatei definiert — `app-config.ts`:

```typescript
// apps/fintutto/src/app-config.ts
import type { AppConfig } from '@fintutto/core';

export const appConfig: AppConfig = {
  // Identität
  id: 'fintutto',
  name: 'Fintutto',
  displayName: 'Fintutto',
  version: '1.0.0',
  description: 'Die All-in-One Immobilien- & Finanz-App',

  // Branding
  theme: {
    primary: '#2563eb',       // Blau
    secondary: '#7c3aed',    // Violett
    accent: '#f59e0b',       // Amber
    logo: '/icons/logo.svg',
    favicon: '/icons/favicon.ico',
  },

  // Features (welche Module aktiv sind)
  features: {
    dashboard: true,
    properties: true,
    tenants: true,
    meters: true,
    documents: true,
    payments: true,
    calculators: true,
    checkers: true,
    bescheide: true,
    aiChat: true,
    settings: true,
  },

  // Rollen
  defaultRole: 'owner',      // owner | tenant | caretaker | admin
  availableRoles: ['owner', 'tenant', 'caretaker', 'admin'],

  // Stripe-Produkte für diese App
  stripe: {
    products: {
      starter: {
        monthly: 'price_fintutto_starter_monthly',
        yearly: 'price_fintutto_starter_yearly',
      },
      pro: {
        monthly: 'price_fintutto_pro_monthly',
        yearly: 'price_fintutto_pro_yearly',
      },
      unlimited: {
        monthly: 'price_fintutto_unlimited_monthly',
        yearly: 'price_fintutto_unlimited_yearly',
      },
    },
    features: {
      free: ['dashboard', 'calculators:3/month'],
      starter: ['dashboard', 'properties:3', 'calculators:10/month', 'aiChat:basic'],
      pro: ['all', 'properties:20', 'aiChat:advanced', 'documents:export'],
      unlimited: ['all', 'unlimited'],
    },
  },

  // PWA
  pwa: {
    name: 'Fintutto',
    shortName: 'Fintutto',
    startUrl: '/',
    display: 'standalone',
    orientation: 'any',
    backgroundColor: '#ffffff',
    themeColor: '#2563eb',
    categories: ['finance', 'business', 'utilities'],
  },

  // Supabase
  supabase: {
    url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
    // Anon Key wird über .env injiziert
  },

  // Navigation
  navigation: {
    sidebar: [
      { icon: 'LayoutDashboard', label: 'Dashboard', path: '/' },
      { icon: 'Building2', label: 'Immobilien', path: '/properties' },
      { icon: 'Users', label: 'Mieter', path: '/tenants' },
      { icon: 'Gauge', label: 'Zähler', path: '/meters' },
      { icon: 'FileText', label: 'Dokumente', path: '/documents' },
      { icon: 'CreditCard', label: 'Zahlungen', path: '/payments' },
      { icon: 'Calculator', label: 'Rechner', path: '/calculators' },
      { icon: 'CheckCircle', label: 'Checker', path: '/checkers' },
      { icon: 'FileBox', label: 'Bescheide', path: '/bescheide' },
    ],
    bottomNav: [
      { icon: 'Home', label: 'Home', path: '/' },
      { icon: 'Building2', label: 'Objekte', path: '/properties' },
      { icon: 'Plus', label: 'Neu', path: '/new', primary: true },
      { icon: 'Bell', label: 'Alerts', path: '/notifications' },
      { icon: 'User', label: 'Profil', path: '/settings' },
    ],
  },
};
```

### Beispiel: Mieter-App (reduzierter Feature-Satz)

```typescript
// apps/mieter/src/app-config.ts
export const appConfig: AppConfig = {
  id: 'mieter',
  name: 'Mieter',
  displayName: 'Mieter-Portal',
  theme: { primary: '#10b981', /* Grün */ },
  features: {
    dashboard: true,
    properties: false,        // Sieht nur eigene Wohnung
    tenants: false,
    meters: true,             // Eigene Zähler ablesen
    documents: true,          // Eigene Dokumente
    payments: true,           // Eigene Zahlungen sehen
    calculators: true,        // Mietrechner nutzen
    checkers: true,           // Miet-Checker nutzen
    bescheide: false,
    aiChat: true,
    settings: true,
  },
  defaultRole: 'tenant',
  availableRoles: ['tenant'],
  // ...
};
```

---

## 5. Die Apps im Überblick

| App | Rolle | Features | Stripe-Tier | Phase |
|-----|-------|----------|-------------|-------|
| **Fintutto Full** | Vermieter/Alle | Alle Module | Free → Unlimited | **1** |
| **Fintutto Go** | Vermieter mobil | Dashboard, Schnellaktionen, Push | An Full gebunden | 2 |
| **Mieter** | Mieter | Wohnung, Zähler, Dokumente, Checker | Free → Pro | 2 |
| **HausmeisterPro** | Hausmeister | Aufgaben, Zähler, Objekte, Kommunikation | Pro → Enterprise | 2 |
| **Zähler** | Alle | Zählerablesung, OCR, Verbrauchsanalyse | Free → Starter | 2 |
| **BescheidBoxer** | Vermieter | Bescheide prüfen, Widerspruch, Tracking | Starter → Pro | 3 |
| **Vermietify** | Vermieter mobil | Objekte, Mieter, Zahlungen (mobil-optimiert) | Pro → Unlimited | 3 |
| **HausmeisterGo** | Mitarbeiter | Aufgaben abhaken, Fotos, Status-Updates | An Pro/Enterprise | 4 |

---

## 6. Datenbank-Erweiterung (Multi-App-Support)

```sql
-- Migration 010: Multi-App Support
CREATE TABLE app_installations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  app_id TEXT NOT NULL,                    -- 'fintutto', 'mieter', etc.
  installed_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now(),
  app_version TEXT,
  platform TEXT DEFAULT 'web',             -- 'web', 'pwa', 'android-twa', 'ios'
  push_subscription JSONB,                 -- Web Push Subscription
  preferences JSONB DEFAULT '{}',          -- App-spezifische Einstellungen
  UNIQUE(user_id, app_id)
);

-- RLS: Nutzer sieht nur eigene Installationen
ALTER TABLE app_installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_installations" ON app_installations
  FOR ALL USING (auth.uid() = user_id);

-- Erweiterung users-Tabelle
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_apps TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_role TEXT DEFAULT 'owner';

-- App-übergreifende Benachrichtigungen
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  app_id TEXT NOT NULL,
  type TEXT NOT NULL,                      -- 'payment', 'meter', 'task', 'document'
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);
```

---

## 7. Umsetzungsplan

### Phase 1: Fundament (Woche 1-3)

**Ziel:** Container-Infrastruktur + Fintutto Full als erste lauffähige App

#### 1.1 Shared Packages aufbauen (Woche 1)

| Schritt | Aufgabe | Quelle |
|---------|---------|--------|
| 1.1.1 | `@fintutto/core` Package erstellen | Neu |
| 1.1.2 | AuthProvider + useAuth aus bestehenden Apps extrahieren | `src/lib/auth.ts`, `apps/vermietify/` |
| 1.1.3 | Supabase Client + Query Hooks zentralisieren | `src/integrations/supabase/` |
| 1.1.4 | Stripe Provider + Subscription Hooks extrahieren | `src/lib/credits.ts`, `api/` |
| 1.1.5 | `@fintutto/ui` Package erstellen | Neu |
| 1.1.6 | shadcn-Komponenten aus Root-App extrahieren | `src/components/ui/` |
| 1.1.7 | AppShell, BottomNav, DataTable als Composed Components | Neu |
| 1.1.8 | Theme-System mit App-spezifischen Presets | Neu |
| 1.1.9 | `@fintutto/pwa` Package erstellen | Neu |
| 1.1.10 | Service Worker + Install Prompt + Offline-Indicator | Neu |

#### 1.2 Fintutto Full App-Shell (Woche 2)

| Schritt | Aufgabe |
|---------|---------|
| 1.2.1 | App-Verzeichnis `apps/fintutto/` mit Vite + TS + Tailwind |
| 1.2.2 | `app-config.ts` als zentrale Konfiguration |
| 1.2.3 | Layout mit AppShell (Sidebar Desktop / BottomNav Mobile) |
| 1.2.4 | Routing basierend auf `features`-Config |
| 1.2.5 | Auth-Flow (Login → Onboarding → Dashboard) |
| 1.2.6 | PWA-Setup (Manifest, Service Worker, Icons) |
| 1.2.7 | Stripe-Integration (Pricing Page, Checkout, Abo-Verwaltung) |

#### 1.3 Features migrieren (Woche 3)

| Schritt | Aufgabe | Quelle |
|---------|---------|--------|
| 1.3.1 | Dashboard mit echten Daten | `src/pages/Dashboard.tsx` |
| 1.3.2 | Rechner-Module übernehmen (9 Rechner) | `src/components/calculators/` |
| 1.3.3 | Checker-Module übernehmen (11 Checker) | `src/components/checkers/` |
| 1.3.4 | Immobilien-CRUD (Properties) | `apps/vermietify/` + DB |
| 1.3.5 | Mieter-Verwaltung (Tenants) | `apps/vermietify/` + DB |
| 1.3.6 | Zähler-Modul | `apps/leserally/` + DB |
| 1.3.7 | Monetarisierung (Affiliates, Ads, Lead-Gen) | `MONETARISIERUNG-STRATEGIE.md` |

---

### Phase 2: Ökosystem-Ausbau (Woche 4-8)

#### 2.1 App-Scaffold-Generator

```bash
# Neue App in 30 Sekunden erstellen:
./templates/app-scaffold/scaffold.sh \
  --name "mieter" \
  --display-name "Mieter-Portal" \
  --primary-color "#10b981" \
  --role "tenant" \
  --features "dashboard,meters,documents,payments,calculators,checkers,aiChat,settings"
```

#### 2.2 Weitere Apps ausrollen

| App | Basis | Besonderheiten |
|-----|-------|---------------|
| **Mieter** | Fintutto (reduziert) | Tenant-Rolle, eigene Wohnung, Mängelmeldung |
| **HausmeisterPro** | Fintutto (angepasst) | Aufgaben-Management, Multi-Objekt, Team-Features |
| **Zähler** | Fintutto (minimal) | Zähler-Fokus, OCR-Kamera, Verbrauchsgraphen |
| **Fintutto Go** | Fintutto (abgespeckt) | Nur Dashboard + Schnellaktionen, Offline-First |

#### 2.3 Go-Backend aufbauen

| Schritt | Aufgabe |
|---------|---------|
| 2.3.1 | Go-Projekt-Struktur mit Chi/Fiber Router |
| 2.3.2 | Supabase JWT-Middleware (Auth-Validierung) |
| 2.3.3 | Stripe Webhook Handler (Ablösung Vercel Function) |
| 2.3.4 | Report-Generierung (Nebenkostenabrechnung PDF) |
| 2.3.5 | WebSocket-Server für Echtzeit-Benachrichtigungen |
| 2.3.6 | Docker + docker-compose für lokale Entwicklung |
| 2.3.7 | Deployment (Fly.io / Railway / eigener VPS) |

---

### Phase 3: App-Store-Vorbereitung (Woche 9-12)

| Schritt | Aufgabe |
|---------|---------|
| 3.1 | App-Icons generieren (alle Größen, alle Plattformen) |
| 3.2 | Screenshots für Store-Listings erstellen |
| 3.3 | Store-Beschreibungen (DE + EN) verfassen |
| 3.4 | Android: TWA (Trusted Web Activity) mit Bubblewrap |
| 3.5 | iOS: PWA-Optimierungen (Status Bar, Splash Screens) |
| 3.6 | Optional: Capacitor-Wrapper für Push-Notifications |
| 3.7 | BescheidBoxer + Vermietify ausrollen |
| 3.8 | Google Play Store Einreichung |
| 3.9 | Apple App Store Einreichung (via PWABuilder oder Capacitor) |

---

### Phase 4: Enterprise & Zukunft (Woche 13+)

| Schritt | Aufgabe |
|---------|---------|
| 4.1 | **HausmeisterGo** — Mitarbeiter-App (Lite, Aufgaben-fokussiert) |
| 4.2 | Enterprise-Tier (SSO, Multi-Verwaltung, API-Zugang) |
| 4.3 | White-Label-SDK für Hausverwaltungen |
| 4.4 | Marktplatz (Handwerker, Versicherungen, Energieberater) |

---

## 8. Tech-Stack Zusammenfassung

| Bereich | Technologie | Grund |
|---------|-------------|-------|
| **Frontend** | React 18 + TypeScript + Vite | Bestehend, bewährt |
| **Styling** | Tailwind CSS + shadcn/ui | Bestehend, Design System |
| **State** | TanStack Query + Zustand | Server State + Client State |
| **Auth** | Supabase Auth | Bestehend, OAuth ready |
| **Datenbank** | Supabase (PostgreSQL) | Bestehend, RLS |
| **Payments** | Stripe | Bestehend, 4 Tiers |
| **PWA** | Workbox + vite-plugin-pwa | Branchenstandard |
| **Go Backend** | Go + Chi/Fiber + sqlc | Performance, Type Safety |
| **Deployment Web** | Vercel | Bestehend |
| **Deployment Go** | Fly.io oder Railway | Go-optimiert |
| **App Store** | TWA (Android) + PWABuilder | PWA-native Bridge |
| **Monorepo** | pnpm Workspaces | Bestehend |

---

## 9. Risikoanalyse

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| PWA-Limitierungen iOS | Hoch | Mittel | Capacitor als Fallback vorbereiten |
| Zu viele Apps parallel | Mittel | Hoch | Strikt sequentiell: Fintutto Full zuerst |
| Go-Backend Komplexität | Mittel | Mittel | Vercel Functions als Fallback behalten |
| App Store Ablehnung | Niedrig | Hoch | TWA + Capacitor als Alternativen |
| Shared Package Breaking Changes | Mittel | Hoch | Semantic Versioning + Changesets |

---

## 10. Nächster Schritt

**Sofort starten mit Phase 1.1:** Die drei neuen Packages aufbauen:
1. `@fintutto/core` — Auth, Supabase, Stripe
2. `@fintutto/ui` — Design System
3. `@fintutto/pwa` — PWA-Infrastruktur

Dann `apps/fintutto/` als erste vollständige App-Shell, die alle Packages nutzt.
