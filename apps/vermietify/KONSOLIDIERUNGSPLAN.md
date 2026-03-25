# Konsolidierungsplan: Vermietify

**Stand:** 25. März 2026
**Ziel:** Zusammenführung des Lovable-Designs (`vermieter-freude`) mit der lokalen Logik (`apps/vermietify`) und Stabilisierung des Kern-Workflows.

---

## 1. Ausgangslage

Vermietify ist das größte Projekt im Repository (362 Dateien, 92 Seiten). Es leidet aktuell unter einer Diskrepanz zwischen:
- **Design:** Die archivierte App `vermieter-freude` enthält das finale, von Lovable generierte UI/UX.
- **Logik:** Die lokale App `apps/vermietify` enthält die funktionierende Supabase-Anbindung, React Query Hooks und komplexe Formulare.

---

## 2. Feature-Freeze

Ab sofort gilt ein strikter **Feature-Freeze** für Vermietify.
- Keine neuen Module (wie CO2-Rechner, WhatsApp-Integration) mehr anfangen.
- Fokus liegt zu 100% auf dem "Happy Path" für den Vermieter-Alltag.

---

## 3. UI/UX Merge-Strategie

Die Zusammenführung erfolgt schrittweise, Seite für Seite, nach folgendem Muster:

### Schritt 1: Layout & Navigation
- Das `AppLayout.tsx` und die Sidebar aus dem Lovable-Design übernehmen.
- Sicherstellen, dass die Navigation alle bestehenden Routen der lokalen Version abdeckt.

### Schritt 2: Dashboard
- Das visuell ansprechende Dashboard aus Lovable übernehmen.
- Die statischen Daten durch die echten Supabase-Queries (`useProperties`, `useBanking`) ersetzen.

### Schritt 3: Immobilien & Einheiten (Properties & Units)
- Listenansicht (Cards/Table) aus Lovable übernehmen.
- Detailansicht und Bearbeitungsformulare aus der lokalen Version beibehalten (da hier die komplexe Validierung liegt), aber das Styling (Tailwind-Klassen) an Lovable anpassen.

### Schritt 4: Mieter & Verträge (Tenants & Contracts)
- Analog zu Immobilien: UI aus Lovable, Logik aus lokal.

---

## 4. Kern-Workflow Test (Happy Path)

Um die App für erste externe Beta-Tester (oder für dich selbst) nutzbar zu machen, muss folgender Workflow fehlerfrei und intuitiv durchlaufen werden können:

1. **Onboarding:** User registriert sich und landet auf dem leeren Dashboard.
2. **Immobilie anlegen:** Klick auf "Neue Immobilie", Eingabe von Adresse und Typ (Mehrfamilienhaus).
3. **Einheit anlegen:** Innerhalb der Immobilie eine Wohnung (z.B. "EG links") anlegen.
4. **Mieter anlegen:** Stammdaten des Mieters erfassen.
5. **Mietvertrag hinterlegen:** Mieter mit Einheit verknüpfen, Kaltmiete und Nebenkosten definieren.
6. **Banking-Sync:** Bankkonto verbinden (via FinAPI/GoCardless Mock oder manueller CSV-Upload).
7. **Zahlungsabgleich:** System erkennt automatisch, dass die Miete von "Max Mustermann" für "EG links" eingegangen ist und markiert den Monat als "Bezahlt".

### Test-Kriterien für den Happy Path:
- Keine Konsolen-Fehler (Red Screens).
- Ladezustände (Skeletons/Spinner) sind überall vorhanden.
- Leere Zustände (Empty States) leiten den User zur nächsten Aktion (z.B. "Noch keine Immobilien vorhanden. Klicke hier, um eine anzulegen.").

---

## 5. Nächste konkrete Schritte (Monat 2-3)

1. **Woche 1:** Layout und Dashboard mergen.
2. **Woche 2:** Immobilien- und Einheiten-Verwaltung mergen und testen.
3. **Woche 3:** Mieter- und Vertrags-Verwaltung mergen und testen.
4. **Woche 4:** Banking-Sync und Zahlungsabgleich stabilisieren.
5. **Woche 5-6:** End-to-End Testing des Happy Paths und Bugfixing.
