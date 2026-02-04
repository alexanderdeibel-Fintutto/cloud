# Fintutto - Vollständige Finanzbuchhaltung

> **Professionelle Finanzbuchhaltung für alle gängigen Kapital- und Personengesellschaften**
>
> KI-gestützt, GoBD-konform, DATEV-kompatibel

## Features

### Kernfunktionen

- **Multi-Mandanten-Fähigkeit**: Beliebig viele Firmen (GmbH, UG, AG, KG, OHG, GbR, Einzelunternehmen, etc.) in einem Account
- **Doppelte Buchführung**: Vollständiger Kontenrahmen (SKR03/SKR04) mit Journal, Kontoauszügen und allen Auswertungen
- **KI-Belegerkennung**: Automatische Erkennung und Verbuchung von Belegen mit Claude AI
- **Intelligenter Wizard**: KI-Unterstützung bei jedem Schritt - vom Setup bis zur täglichen Buchung

### Rechnungswesen

- **Rechnungserstellung**: Professionelle Rechnungen mit anpassbaren Vorlagen
- **PDF-Editor**: Rechnungen direkt im Browser bearbeiten
- **Mahnwesen**: Automatische Zahlungserinnerungen und Mahnungen
- **E-Mail-Versand**: Rechnungen direkt per E-Mail versenden

### Belege & Banking

- **E-Mail-Upload**: Belege einfach per E-Mail an Ihre Buchhaltung weiterleiten
- **OCR-Erkennung**: Automatische Texterkennung aus Bildern und PDFs
- **Banking-Integration**: Kontoabruf und intelligente Transaktionszuordnung
- **Kategorisierung**: KI-basierte automatische Kategorisierung von Ausgaben

### Auswertungen

- **BWA**: Betriebswirtschaftliche Auswertung in Echtzeit
- **GuV**: Gewinn- und Verlustrechnung
- **Bilanz**: Automatische Bilanzerstellung
- **UStVA**: Umsatzsteuer-Voranmeldung

### Exporte & Schnittstellen

- **DATEV-Export**: Nahtlose Übergabe an Ihren Steuerberater
- **GDPdU-Export**: Für Betriebsprüfungen
- **CSV/Excel**: Flexible Datenexporte

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Hono (TypeScript), Node.js
- **Datenbank**: PostgreSQL mit Prisma ORM
- **KI**: Anthropic Claude API
- **Storage**: S3-kompatibel (AWS S3, MinIO, etc.)
- **Monorepo**: Turborepo mit pnpm Workspaces

## Projektstruktur

```
fintutto-ecosystem/
├── apps/
│   ├── api/                 # Backend API (Hono)
│   │   └── src/
│   │       ├── routes/      # API-Endpunkte
│   │       ├── services/    # Business Logic
│   │       └── middleware/  # Auth, Error Handling, etc.
│   └── web/                 # Frontend (Next.js)
│       └── src/
│           ├── app/         # App Router Pages
│           └── components/  # React Komponenten
├── packages/
│   └── database/            # Prisma Schema & Client
│       └── prisma/
│           └── schema.prisma
├── turbo.json               # Turborepo Konfiguration
└── package.json             # Root Package
```

## Installation

### Voraussetzungen

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+
- (Optional) Docker & Docker Compose

### Setup

```bash
# Repository klonen
git clone https://github.com/your-org/fintutto-ecosystem.git
cd fintutto-ecosystem

# Dependencies installieren
pnpm install

# Umgebungsvariablen kopieren
cp .env.example .env

# Datenbank migrieren
pnpm db:push

# Seed-Daten einspielen (Demo-Account)
pnpm db:seed

# Entwicklungsserver starten
pnpm dev
```

### Mit Docker

```bash
# Alle Services starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f
```

## API-Dokumentation

### Authentifizierung

```bash
# Registrierung
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "Max",
  "lastName": "Mustermann"
}

# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Organisationen

```bash
# Neue Organisation erstellen
POST /api/v1/organizations
Authorization: Bearer <token>
{
  "name": "Meine GmbH",
  "legalForm": "GMBH",
  "taxId": "12/345/67890",
  "vatId": "DE123456789"
}
```

### Belege

```bash
# Beleg hochladen und KI-Erkennung starten
POST /api/v1/uploads
Authorization: Bearer <token>
X-Organization-ID: <org-id>
Content-Type: multipart/form-data

# KI-Belegerkennung
POST /api/v1/ai/recognize-receipt
{
  "receiptId": "<receipt-id>"
}
```

### Rechnungen

```bash
# Rechnung erstellen
POST /api/v1/invoices
{
  "contactId": "<contact-id>",
  "invoiceDate": "2026-02-04",
  "lineItems": [
    {
      "description": "Beratungsleistung",
      "quantity": 10,
      "unitPrice": 120.00,
      "taxRate": 19
    }
  ]
}

# Rechnung finalisieren und PDF generieren
POST /api/v1/invoices/<id>/finalize

# Rechnung per E-Mail senden
POST /api/v1/invoices/<id>/send
{
  "to": "kunde@example.com"
}
```

## Rechtsformen

Unterstützte Unternehmensformen:

| Typ | Rechtsform |
|-----|-----------|
| **Personengesellschaften** | Einzelunternehmen, GbR, OHG, KG, PartG, PartG mbB |
| **Kapitalgesellschaften** | GmbH, UG (haftungsbeschränkt), AG, KGaA, SE |
| **Mischformen** | GmbH & Co. KG, UG & Co. KG, AG & Co. KG |
| **Sonstige** | e.V., Stiftung, eG, Freiberufler |

## Kontenrahmen

- **SKR03**: Standard für Industrie und Handel
- **SKR04**: Alternative mit anderer Kontenstruktur
- **Benutzerdefiniert**: Eigene Konten anlegen

## Sicherheit & Compliance

- **GoBD-konform**: Revisionssichere Archivierung aller Belege und Buchungen
- **DSGVO**: Datenschutz-konform, Hosting in Deutschland
- **Audit-Trail**: Lückenlose Protokollierung aller Änderungen
- **2FA**: Zwei-Faktor-Authentifizierung (optional)

## Lizenz

Proprietary - All rights reserved

## Support

- **Dokumentation**: https://docs.fintutto.cloud
- **E-Mail**: support@fintutto.cloud
- **GitHub Issues**: Für Bug Reports und Feature Requests

---

Entwickelt mit ❤️ vom Fintutto Team
