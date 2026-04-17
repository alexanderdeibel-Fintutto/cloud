# Integrationskonzept: SecondBrain als zentraler Dokumenten-Hub

## 1. Ausgangslage und Zielsetzung

Das Fintutto-Ökosystem besteht aus mehreren spezialisierten Applikationen (Vermietify, Financial Compass, Ablesung, etc.), die alle Dokumente verarbeiten. Derzeit ist die Dokumentenverwaltung fragmentiert. Die Applikation **SecondBrain** wurde als intelligentes Wissensmanagement-System mit KI-gestützter OCR und Volltextsuche entwickelt.

Das Ziel ist die vollständige Integration von SecondBrain als zentraler Dokumenten-Hub für das gesamte Portal-Repository. Dokumente sollen in SecondBrain hochgeladen, automatisch analysiert und anschließend nahtlos den Entitäten anderer Apps (z.B. Immobilien in Vermietify, Firmen in Financial Compass) zugeordnet werden können.

## 2. Architektur-Konzept

Die Integration basiert auf der bestehenden Monorepo-Architektur mit einer zentralen Supabase-Instanz. SecondBrain fungiert als zentraler Speicher- und Verarbeitungsdienst für alle Dokumente.

### 2.1 Zentrales Datenmodell

Die bestehende Tabelle `sb_documents` in SecondBrain und die Tabelle `documents` in Vermietify/Shared müssen konsolidiert werden. Das neue zentrale Datenmodell für Dokumente sieht wie folgt aus:

```sql
-- Zentrale Dokumententabelle (Konsolidierung von sb_documents und documents)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Metadaten
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'other',
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  file_url TEXT,
  
  -- Kategorisierung
  document_type TEXT, -- invoice, contract, receipt, etc.
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  
  -- KI & OCR (aus SecondBrain)
  ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_text TEXT,
  ocr_confidence REAL,
  summary TEXT,
  ai_metadata JSONB DEFAULT '{}',
  
  -- Entitäten-Verknüpfungen (Cross-App)
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE SET NULL,
  expense_id UUID REFERENCES public.biz_expenses(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.biz_invoices(id) ON DELETE SET NULL,
  meter_id UUID REFERENCES public.meters(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Verknüpfungstabellen für n:m Beziehungen

Da ein Dokument mehreren Entitäten zugeordnet werden kann (z.B. eine Rechnung, die zwei verschiedene Gebäude betrifft), implementieren wir Verknüpfungstabellen:

```sql
-- Dokument <-> Gebäude (Vermietify)
CREATE TABLE IF NOT EXISTS public.document_buildings (
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, building_id)
);

-- Dokument <-> Firmen (Financial Compass)
CREATE TABLE IF NOT EXISTS public.document_businesses (
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.biz_businesses(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, business_id)
);
```

## 3. Implementierungsplan

### Phase 1: Datenbank-Migration und Konsolidierung

1. **Migration erstellen**: Eine neue Supabase-Migration (`029_consolidate_documents.sql`) erstellen, die die Tabellen `sb_documents` und `documents` zusammenführt.
2. **Daten migrieren**: Bestehende Daten aus beiden Tabellen in die neue Struktur überführen.
3. **Storage-Buckets anpassen**: Den Storage-Bucket `secondbrain-docs` als primären Speicherort für alle Apps konfigurieren.
4. **RLS-Policies aktualisieren**: Die Row Level Security so anpassen, dass Benutzer über alle Apps hinweg auf ihre Dokumente zugreifen können.

### Phase 2: Shared Package Aktualisierung

1. **Typen anpassen**: Die TypeScript-Interfaces in `@fintutto/shared/src/types/` aktualisieren, um das neue Datenmodell abzubilden.
2. **Hooks überarbeiten**: Den `useDocuments`-Hook in `@fintutto/shared/src/hooks/` erweitern, sodass er die neuen Verknüpfungen (business_id, building_id) unterstützt.
3. **UI-Komponenten zentralisieren**: Die Dokumenten-Upload- und Anzeige-Komponenten aus SecondBrain in das Shared-Package verschieben, damit sie in allen Apps einheitlich genutzt werden können.

### Phase 3: App-spezifische Integrationen

#### SecondBrain (Der Hub)
- **UI-Erweiterung**: Die Detailansicht eines Dokuments um Auswahlfelder für Gebäude, Einheiten, Mieter (Vermietify) und Firmen, Ausgaben (Financial Compass) erweitern.
- **KI-Kategorisierung**: Die OCR-Pipeline so anpassen, dass sie automatisch Vorschläge für die Zuordnung zu Gebäuden oder Firmen macht (z.B. durch Erkennung von Adressen oder Firmennamen im Text).

#### Vermietify
- **Dokumenten-Ansicht**: Die bestehende Dokumenten-Ansicht auf die Shared-Komponenten umstellen.
- **Gebäude/Mieter-Details**: In den Detailansichten von Gebäuden und Mietern eine Sektion "Verknüpfte Dokumente" hinzufügen, die alle relevanten Dokumente aus dem SecondBrain anzeigt.

#### Financial Compass (Fintutto Biz)
- **Beleg-Verknüpfung**: Bei der Erfassung von Ausgaben (`biz_expenses`) die Möglichkeit bieten, ein Dokument aus dem SecondBrain auszuwählen oder direkt hochzuladen.
- **Rechnungs-Archiv**: Generierte Rechnungen (`biz_invoices`) automatisch im SecondBrain archivieren und mit der Firma verknüpfen.

## 4. Workflow-Beispiele

### Szenario 1: Posteingang und Rechnungsverarbeitung
1. Der Nutzer lädt einen Stapel gescannter Briefe in SecondBrain hoch.
2. Die KI von SecondBrain führt OCR durch und erkennt eine Handwerkerrechnung für "Musterstraße 1".
3. SecondBrain schlägt automatisch die Verknüpfung mit dem Gebäude "Musterstraße 1" (Vermietify) und der Kategorie "Reparaturkosten" vor.
4. Der Nutzer bestätigt den Vorschlag.
5. Wenn der Nutzer später Vermietify öffnet und das Gebäude "Musterstraße 1" betrachtet, ist die Rechnung dort unter "Dokumente" sichtbar.

### Szenario 2: Beleg für die Buchhaltung
1. Der Nutzer fotografiert einen Tankbeleg mit der mobilen Ansicht von SecondBrain.
2. Die KI extrahiert Betrag, Datum und Steuer.
3. Der Nutzer ordnet das Dokument seiner Firma "Max Mustermann IT" (Financial Compass) zu.
4. Im Financial Compass kann der Nutzer mit einem Klick aus diesem Dokument eine neue Ausgabe (`biz_expense`) erstellen, wobei die erkannten Daten vorausgefüllt sind.

## 5. Zusammenfassung

Durch die Konsolidierung der Dokumentenverwaltung in SecondBrain und die Nutzung der Shared-Packages wird eine redundante Datenhaltung vermieden. SecondBrain wird zum intelligenten Posteingang und Archiv für das gesamte Fintutto-Ökosystem, während die spezialisierten Apps (Vermietify, Financial Compass) nahtlos auf diese Dokumente zugreifen und sie in ihren spezifischen Workflows nutzen können.
