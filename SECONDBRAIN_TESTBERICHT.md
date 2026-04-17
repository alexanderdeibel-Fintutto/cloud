# SecondBrain Integration — Migrations- und Testbericht

**Datum:** 17. April 2026  
**Projekt:** Fintutto Portal — SecondBrain Cross-App-Integration  
**Supabase-Projekt:** `aaefocdqgdgexkcrjhks` (Fintutto, PRODUCTION)

---

## 1. Zusammenfassung

Die Migration `029_secondbrain_cross_app_links.sql` wurde vollständig und erfolgreich in die Produktionsdatenbank eingespielt. Alle 8 neuen Tabellen, 3 Views und 2 RPCs sind aktiv und funktionsfähig. Der automatisierte Integrations-Testlauf (10 Tests) wurde im Supabase SQL-Editor ausgeführt und hat alle Tests bestanden.

---

## 2. Ausgeführte Migrationen

| Block | Inhalt | Status |
|---|---|---|
| **Block 1** (001) | `sb_documents`, `sb_collections`, `sb_document_collections` | **PASS** |
| **Block 2** (001) | `sb_chat_sessions`, `sb_chat_messages`, `sb_activity_log`, RLS-Policies, Trigger | **PASS** |
| **Block 3** (029) | `sb_document_entity_links`, `sb_document_suggestions`, RLS-Policies | **PASS** |
| **Block 4** (029) | Views `v_building_documents`, `v_business_documents`, `v_tenant_documents`, RPCs `get_documents_for_entity`, `get_entity_links_for_document` | **PASS** |

---

## 3. Datenbankstruktur nach Migration

Die Strukturprüfung am Ende des Testlaufs hat **8 Tabellen** mit folgenden Spaltenanzahlen bestätigt:

| Tabelle | Spalten | Zweck |
|---|---|---|
| `sb_documents` | 18 | Kern-Dokumententabelle mit OCR, KI-Zusammenfassung, Tags |
| `sb_collections` | 9 | Sammlungen/Ordner für Dokumente |
| `sb_document_collections` | 4 | M:N-Verknüpfung Dokument ↔ Sammlung |
| `sb_document_entity_links` | 9 | **Cross-App-Verknüpfungen** (Dokument → Gebäude/Firma/Mieter/Zähler) |
| `sb_document_suggestions` | 11 | KI-Zuordnungsvorschläge mit Konfidenz-Score |
| `sb_chat_sessions` | 5 | Chat-Sessions für Dokument-Konversationen |
| `sb_chat_messages` | 6 | Chat-Nachrichten |
| `sb_activity_log` | 7 | Aktivitäts-Log (Upload, Zuordnung, etc.) |

---

## 4. Teststrategie

### 4.1 Testebenen

Die Teststrategie umfasst drei Ebenen:

**Ebene 1 — Datenbankstruktur (Schema-Tests)**  
Prüft, ob alle Tabellen, Views und RPCs mit den erwarteten Spalten existieren. Diese Tests laufen direkt in PostgreSQL ohne Authentifizierungskontext.

**Ebene 2 — Funktionale Tests (Integration-Tests)**  
Prüft das Schreiben, Lesen und Verknüpfen von Testdaten über alle neuen Tabellen hinweg. Beinhaltet Cleanup nach jedem Testlauf, um keine Testdaten in der Produktion zu hinterlassen.

**Ebene 3 — Cross-App-Tests (End-to-End)**  
Prüft, ob ein in SecondBrain hochgeladenes Dokument korrekt über die Views und RPCs in Vermietify und Financial Compass erscheint. Diese Tests erfordern einen authentifizierten Benutzer.

### 4.2 Testfälle (Ebene 1 + 2, automatisiert ausgeführt)

| Test | Beschreibung | Erwartetes Ergebnis | Tatsächliches Ergebnis |
|---|---|---|---|
| **T1** | `sb_documents` INSERT + SELECT | 1 Zeile eingefügt | **PASS** |
| **T2** | `sb_document_entity_links` INSERT (building) | Link-ID zurückgegeben | **PASS** |
| **T3** | View `v_building_documents` mit Test-Building-ID | ≥ 1 Dokument gefunden | **PASS** |
| **T4** | View `v_business_documents` abfragbar | Kein Fehler | **PASS** |
| **T5** | View `v_tenant_documents` abfragbar | Kein Fehler | **PASS** |
| **T6** | RPC `get_entity_links_for_document` aufrufbar | Aufruf erfolgreich (0 Zeilen, kein Auth-Kontext erwartet) | **PASS** |
| **T7** | RPC `get_documents_for_entity` aufrufbar | Aufruf erfolgreich | **PASS** |
| **T8** | `sb_document_suggestions` INSERT | KI-Vorschlag mit Konfidenz 0.87 angelegt | **PASS** |
| **T9** | `sb_collections` INSERT | Sammlung angelegt | **PASS** |
| **T10** | Mehrfach-Verknüpfung (building + business) | 2 Links für dasselbe Dokument | **PASS** |

**Gesamtergebnis: 10/10 Tests bestanden ✓**

---

## 5. Implementierte Dateien

### Neue Dateien im Repository

| Datei | Beschreibung |
|---|---|
| `supabase/migrations/029_secondbrain_cross_app_links.sql` | Vollständige, idempotente Migration |
| `packages/shared/src/hooks/useSecondBrainDocuments.ts` | 6 React-Hooks für Cross-App-Dokumentenzugriff |
| `packages/shared/src/components/documents/SecondBrainDocumentsPanel.tsx` | Einbettbare Panel-Komponente für alle Apps |
| `apps/secondbrain/src/components/documents/DocumentEntityLinker.tsx` | Zuordnungs-UI in SecondBrain |

### Geänderte Dateien

| Datei | Änderung |
|---|---|
| `apps/vermietify/src/components/buildings/BuildingDocumentsTab.tsx` | Vollständige Neuimplementierung mit SecondBrain-Integration |
| `apps/secondbrain/src/pages/UploadPage.tsx` | URL-Kontext-Handler (`?context=building&id=...`) |
| `packages/shared/src/hooks/index.ts` | SecondBrain-Hooks exportiert |
| `packages/shared/src/components/documents/index.ts` | SecondBrainDocumentsPanel exportiert |
| `packages/shared/src/deeplinks.ts` | SecondBrain Deep-Links ergänzt |

---

## 6. Bekannte Einschränkungen und offene Punkte

### Offener Punkt: `bank_transactions.amount_cents`

In den Postgres-Logs wurde ein bestehender Fehler sichtbar, der **nicht** durch diese Migration verursacht wurde:

```
ERROR: column bank_transactions.amount_cents does not exist
```

Dieser Fehler existierte bereits vor der Migration und betrifft eine andere Tabelle. Er sollte in einem separaten Task behoben werden.

### Offener Punkt: RLS im Produktionsbetrieb

Die RPCs `get_documents_for_entity` und `get_entity_links_for_document` verwenden `auth.uid()` für die Zugriffskontrolle. Im Test ohne Authentifizierungskontext liefern sie 0 Zeilen zurück — das ist korrekt. Im Produktionsbetrieb mit eingeloggtem Benutzer liefern sie die Daten des jeweiligen Benutzers.

### Noch nicht implementiert (P2/P3)

| Feature | Priorität | Aufwand |
|---|---|---|
| Financial Compass: `SecondBrainDocumentsPanel` in Firmen-Detailansicht | P2 | 1h |
| Ablesung: `SecondBrainDocumentsPanel` in Zähler-Detailansicht | P2 | 1h |
| Edge Function `analyze-and-suggest-links` (KI-Zuordnungsvorschläge nach OCR) | P3 | 4h |
| Fintutto Biz: Generierte Rechnungen automatisch in SecondBrain archivieren | P3 | 3h |
| Supabase Storage Bucket `secondbrain-documents` konfigurieren | P2 | 30min |

---

## 7. Nächste Schritte

**Sofort** (keine Migration erforderlich):
1. `SecondBrainDocumentsPanel` in Financial Compass Firmen-Detailansicht einbetten
2. `SecondBrainDocumentsPanel` in Ablesung Zähler-Detailansicht einbetten
3. Supabase Storage Bucket `secondbrain-documents` mit RLS-Policy anlegen

**Mittelfristig**:
4. Edge Function für KI-Zuordnungsvorschläge implementieren
5. `bank_transactions.amount_cents` Fehler beheben

**Verwendungsbeispiel** für alle Apps:
```tsx
import { SecondBrainDocumentsPanel } from '@fintutto/shared';

// In Gebäude-Detailansicht (Vermietify) — bereits implementiert
<SecondBrainDocumentsPanel entityType="building" entityId={building.id} />

// In Firmen-Detailansicht (Financial Compass)
<SecondBrainDocumentsPanel entityType="business" entityId={business.id} />

// In Zähler-Detailansicht (Ablesung)
<SecondBrainDocumentsPanel entityType="meter" entityId={meter.id} />

// In Mieter-Detailansicht (Vermietify)
<SecondBrainDocumentsPanel entityType="tenant" entityId={tenant.id} />
```
