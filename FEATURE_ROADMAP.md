# Feature Roadmap: Financial Compass & Vermietify

**Stand:** 25. März 2026
**Ziel:** Die beiden Kern-Apps auf ein Level bringen, das sevdesk und andere Wettbewerber übertrifft, indem eine gemeinsame Infrastruktur genutzt wird.

---

## 1. Priorität 1: Die "Shared Infrastructure" (Woche 1-2)

Bevor wir neue Features in den einzelnen Apps bauen, müssen wir die Basis vereinheitlichen.

| Feature | Aktueller Ort | Ziel-Ort | Aufwand |
|---------|---------------|----------|---------|
| **Dokumenten-Upload UI** | `vermietify` | `packages/shared` | Mittel |
| **OCR & KI-Erkennung** | `vermietify` | `packages/shared` | Mittel |
| **Banking-Hook (FinAPI)** | `vermietify` | `packages/shared` | Hoch |
| **Workspace-Switcher** | `fintutto-biz` | `packages/shared` | Mittel |

**Ziel:** Ein zentrales `packages/shared/src/components/documents` und `packages/shared/src/hooks/useBanking.ts`, das von beiden Apps importiert wird.

---

## 2. Priorität 2: Financial Compass (Woche 3-4)
*Fokus: Ablösung von sevdesk/Lexoffice für deine eigenen Firmen.*

### 2.1 KI-Belegerfassung (Ausgaben)
- **Was fehlt:** Integration des Shared-Upload-Dialogs in die `Expenses.tsx`.
- **Workflow:** Du ziehst eine PDF-Rechnung per Drag & Drop rein -> OCR liest Betrag, Datum, Lieferant aus -> Erstellt automatisch einen Eintrag in `biz_expenses`.
- **Bulk-Upload:** Möglichkeit, 10 Belege gleichzeitig hochzuladen und verarbeiten zu lassen.

### 2.2 Banking & Zahlungsabgleich
- **Was fehlt:** Eine eigene `Banking.tsx` Seite in `fintutto-biz`.
- **Workflow:** Bankkonto verbinden -> Transaktionen werden geladen -> System gleicht automatisch ab: "Transaktion -119€ an Telekom" = "Beleg Telekom 119€".
- **Status:** Rechnungen und Ausgaben wechseln automatisch auf "Bezahlt".

### 2.3 Rechnungsstellung (Einnahmen)
- **Was fehlt:** PDF-Generierung für Rechnungen.
- **Workflow:** Rechnung im UI erstellen -> Klick auf "PDF generieren" -> PDF wird im Supabase Storage gespeichert und kann per E-Mail versendet werden.
- **Zukunft:** E-Rechnung (ZUGFeRD) Export hinzufügen (Pflicht ab 2025/2026).

---

## 3. Priorität 3: Vermietify (Monat 2)
*Fokus: Stabilisierung des Kern-Workflows für die Immobilienverwaltung.*

### 3.1 Dokumenten-Management (Bulk)
- **Was fehlt:** Massen-Upload von Dokumenten (z.B. 20 Nebenkostenabrechnungen).
- **Workflow:** PDFs hochladen -> KI erkennt automatisch, zu welchem Mieter/welcher Einheit das Dokument gehört und ordnet es zu.

### 3.2 Banking für Vermieter
- **Was fehlt:** Der bestehende Banking-Hook muss robuster werden.
- **Workflow:** Mieteinnahmen werden automatisch den Mietverträgen zugeordnet. Das System warnt, wenn eine Miete am 5. des Monats noch nicht eingegangen ist.

### 3.3 UI/UX Konsolidierung
- **Was fehlt:** Das Lovable-Design aus `vermieter-freude` muss vollständig in die Logik-Seiten von `vermietify` integriert werden (wie im Konsolidierungsplan beschrieben).

---

## 4. Zusammenfassung: Der "Unfair Advantage"

Wenn diese Roadmap umgesetzt ist, hast du etwas, das **sevdesk nicht hat**:
Du loggst dich ein. Oben links wählst du deine **Freelance-Tätigkeit**. Du lädst deine Tankquittung hoch, sie wird verbucht.
Dann klickst du auf deine **GmbH**. Du schreibst eine Rechnung an einen Kunden.
Dann klickst du auf **Immobilien**. Du siehst sofort, ob Mieter X seine Miete überwiesen hat, weil das gleiche Banking-Modul im Hintergrund arbeitet.

Alles in einem System. Alles mit derselben UI-KI-Belegerfassung. Alles mit demselben Banking-Sync.
