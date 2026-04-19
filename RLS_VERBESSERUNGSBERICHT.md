# Analyse und Verbesserungsvorschläge für RLS-Policies (Migrationen 004–006)

Dieser Bericht analysiert die Row Level Security (RLS) Policies der Tabellen aus den Migrationen `004_create_property_tables.sql`, `005_create_meter_and_maintenance_tables.sql` und `006_create_bescheidboxer_tables.sql`. Die Policies wurden primär in `007_rls_policies.sql` und `20260419004353_rls_harden_core_tables.sql` definiert.

## 1. Analysierte Tabellen

Die Analyse umfasst folgende 13 Kern-Tabellen:

| Migration | Tabelle | Zweck |
| :--- | :--- | :--- |
| 004 | `properties` | Immobilien/Gebäude |
| 004 | `units` | Mieteinheiten (Wohnungen/Gewerbe) |
| 004 | `tenants` | Mieter-Profile |
| 004 | `rental_contracts` | Mietverträge |
| 004 | `payments` | Miet- und Kautionszahlungen |
| 004 | `documents` | Dokumentenablage |
| 005 | `meters` | Zähler (Strom, Wasser, etc.) |
| 005 | `meter_readings` | Zählerstände |
| 005 | `maintenance_requests` | Mängelmeldungen / Tickets |
| 005 | `tasks` | Aufgaben (Hausmeister) |
| 006 | `tax_notices` | Steuerbescheide (BescheidBoxer) |
| 006 | `tax_notice_checks` | KI-Prüfergebnisse für Bescheide |

## 2. Aktueller Sicherheitsstatus

Durch die kürzlich durchgeführte Härtung (`20260419004353_rls_harden_core_tables.sql`) ist das grundlegende Sicherheitsniveau bereits hoch:

1.  **RLS ist aktiviert:** Alle 13 Tabellen haben `ENABLE ROW LEVEL SECURITY`.
2.  **Idempotenz:** Alle Policies verwenden `DROP POLICY IF EXISTS`, was saubere Deployments garantiert.
3.  **Anonyme Zugriffe blockiert:** Jede Tabelle besitzt eine explizite `FOR ALL TO anon USING (false)` Policy.
4.  **Superadmin-Zugriff:** Die Funktion `public.is_superadmin()` ist in den Owner-Policies integriert, was administrativen Support ermöglicht.

## 3. Identifizierte Lücken und Verbesserungsvorschläge

Trotz der guten Basis gibt es architektonische und sicherheitsrelevante Lücken, die geschlossen werden sollten.

### 3.1. Performance-Probleme durch tiefe Joins in Policies

**Problem:**
Viele Policies (z.B. für `rental_contracts`, `payments`, `meters`) prüfen die Berechtigung über mehrstufige Joins.
Beispiel aus `meters`:
```sql
USING (
  unit_id IN (
    SELECT u.id FROM public.units u
    JOIN public.properties p ON p.id = u.property_id
    WHERE p.user_id = auth.uid()
  )
)
```
Solche Subqueries in RLS-Policies werden bei *jeder* Zeile ausgeführt und können bei großen Datenmengen zu massiven Performance-Einbrüchen (Table Scans) führen.

**Verbesserungsvorschlag:**
Denormalisierung der Eigentümerschaft. Fügen Sie eine `user_id` (oder `organization_id`, siehe Punkt 3.3) direkt in die Tabellen `units`, `meters`, `rental_contracts` und `payments` ein. Die Policy vereinfacht sich dann zu:
`USING (user_id = auth.uid())`
Dies erfordert eine Schema-Anpassung und Trigger, um die `user_id` bei der Erstellung automatisch vom übergeordneten `property` zu erben.

### 3.2. Fehlende Mandantenfähigkeit (Multi-Tenancy) für Vermieter

**Problem:**
Die aktuelle Struktur bindet Immobilien (`properties`) direkt an eine `user_id`. Wenn eine Hausverwaltung aus mehreren Mitarbeitern besteht, können diese nicht gemeinsam auf denselben Datenbestand zugreifen.

**Verbesserungsvorschlag:**
Die neuere Migration `20260419100005_vermietify_fusion_part6_rls_policies.sql` führt bereits eine `organization_id` ein (via `get_user_organization_id()`). Die Tabellen aus 004-006 sollten auf dieses Organisations-Modell migriert werden.
Statt `user_id = auth.uid()` sollte geprüft werden, ob der Nutzer Mitglied der Organisation ist, der die Immobilie gehört.

### 3.3. Lücken in der Mieter-Sichtbarkeit (Tenant Portal)

**Problem:**
Die Policies für Mieter (z.B. `readings_tenant_select`) prüfen, ob der Mieter aktiv ist (`is_active = true`).
```sql
WHERE m.unit_id IN (
  SELECT unit_id FROM public.tenants
  WHERE user_id = auth.uid() AND is_active = true
)
```
Wenn ein Mieter auszieht (`is_active = false`), verliert er sofort den Zugriff auf seine historischen Zählerstände, Dokumente und Zahlungen. Dies ist rechtlich problematisch (z.B. für die Nebenkostenabrechnung im Folgejahr).

**Verbesserungsvorschlag:**
Die Sichtbarkeit für Mieter sollte nicht an `is_active` gebunden sein, sondern an die Verknüpfung in der `tenants`-Tabelle selbst. Ein ehemaliger Mieter sollte weiterhin lesenden Zugriff (`SELECT`) auf Daten haben, die in seinem Mietzeitraum (`move_in_date` bis `move_out_date`) generiert wurden.

### 3.4. Fehlende Update/Delete-Policies für Mieter

**Problem:**
Mieter können Zählerstände eintragen (`readings_tenant_insert`), aber es fehlen Policies, um eigene Fehleingaben zu korrigieren (`UPDATE`) oder zu löschen (`DELETE`), solange diese noch nicht vom Vermieter abgerechnet wurden.

**Verbesserungsvorschlag:**
Ergänzen von `UPDATE` und `DELETE` Policies für `meter_readings` und `maintenance_requests` für den Ersteller (`read_by = auth.uid()` bzw. `reported_by = auth.uid()`), idealerweise eingeschränkt auf einen bestimmten Status (z.B. `status = 'open'`).

### 3.5. BescheidBoxer: Fehlende Freigabe-Logik

**Problem:**
In `tax_notices` hat nur der Eigentümer (`user_id = auth.uid()`) Zugriff. Wenn ein Nutzer seinen Steuerberater einladen möchte, um die Bescheide zu prüfen, ist dies aktuell auf Datenbankebene nicht möglich.

**Verbesserungsvorschlag:**
Einführung einer Freigabe-Tabelle (z.B. `tax_notice_shares`) und Erweiterung der RLS-Policy, sodass Nutzer mit einer aktiven Freigabe ebenfalls lesenden Zugriff auf die `tax_notices` und `tax_notice_checks` erhalten.

## 4. Zusammenfassung der nächsten Schritte

Um die Architektur zukunftssicher und performant zu machen, empfehle ich folgende Priorisierung:

1.  **Kurzfristig:** Behebung des Mieter-Zugriffs (Punkt 3.3). Entfernen der `is_active = true` Bedingung für historische Lesezugriffe.
2.  **Mittelfristig:** Denormalisierung der `user_id` / `organization_id` in Kind-Tabellen (Punkt 3.1) zur Vermeidung von Performance-Engpässen bei wachsendem Datenbestand.
3.  **Langfristig:** Vollständige Umstellung der 004-006 Tabellen auf das neue Organisations-Modell (`organization_id`), um Team-Kollaboration für Hausverwaltungen zu ermöglichen (Punkt 3.2).
