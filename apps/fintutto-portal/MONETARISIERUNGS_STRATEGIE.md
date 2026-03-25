# Monetarisierungsstrategie: Fintutto Portal

**Stand:** 25. März 2026
**Ziel:** Das `fintutto-portal` als organischen Lead-Generator nutzen und durch gezielte Affiliate-Integrationen erste Umsätze generieren ("Quick Wins").

---

## 1. Das Konzept: "Tool-Led Growth"

Das Portal bündelt zahlreiche kostenlose Rechner und Checker für Mieter und Vermieter. Diese Tools lösen ein konkretes, akutes Problem des Nutzers. Genau in dem Moment, in dem das Problem gelöst (oder identifiziert) wird, ist die Bereitschaft für ein passendes Angebot am höchsten.

**Der Funnel:**
1. User googelt "Mieterhöhung prüfen" oder "Kaufnebenkosten berechnen".
2. User landet auf dem entsprechenden Tool im `fintutto-portal`.
3. User gibt seine Daten ein und erhält ein Ergebnis.
4. **Monetarisierung:** Auf der Ergebnisseite wird ein kontextuell passendes Affiliate-Angebot oder ein Upsell auf eine Fintutto-Kern-App platziert.

---

## 2. Die "Quick Wins" (Affiliate-Strategie)

Hier sind die konkreten Einbaupunkte für Affiliate-Links, die mit minimalem Entwicklungsaufwand maximalen Ertrag versprechen:

### 2.1 Mietrecht-Checker -> Rechtsschutzversicherung
- **Tools:** `MieterhoehungsRechner.tsx`, `MietpreisbremseChecker.tsx`, `NebenkostenPruefer.tsx`
- **Trigger:** Wenn das Ergebnis zeigt, dass die Mieterhöhung unzulässig ist oder die Nebenkostenabrechnung fehlerhaft erscheint.
- **Angebot:** "Dein Vermieter hat einen Fehler gemacht. Sichere dich jetzt ab, bevor du in den Widerspruch gehst."
- **Partner:** ARAG, GetSafe, Roland Rechtsschutz (via Awin oder FinanceAds).

### 2.2 Kautionsrechner -> Kautionsversicherung
- **Tool:** `KautionsRechner.tsx`
- **Trigger:** Wenn die berechnete Kaution sehr hoch ist (z.B. > 2.000 €).
- **Angebot:** "Kaution zu hoch? Behalte dein Geld und nutze eine Kautionsbürgschaft ab X € / Monat."
- **Partner:** Kautionsfrei.de, kautionskasse.de.

### 2.3 Kaufnebenkosten / Rendite -> Baufinanzierung
- **Tools:** `KaufnebenkostenRechner.tsx`, `RenditeRechner.tsx`
- **Trigger:** Nach erfolgreicher Berechnung der Gesamtkosten.
- **Angebot:** "Finde jetzt die beste Baufinanzierung für dein Projekt. Vergleiche Angebote von über 400 Banken."
- **Partner:** Interhyp, Dr. Klein, Check24.

### 2.4 Kündigungs-Checker -> Umzugsservice / DSL / Strom
- **Tool:** `KuendigungsfristChecker.tsx`
- **Trigger:** Wenn der Auszugstermin feststeht.
- **Angebot:** "Dein Auszugstermin steht fest. Vergleiche jetzt Umzugsunternehmen und wechsle deinen Stromanbieter für die neue Wohnung."
- **Partner:** Check24 (Strom/DSL), Umzugsauktion.de.

---

## 3. Upselling in die eigenen Kern-Apps

Neben Affiliate-Einnahmen soll das Portal Nutzer in die eigenen SaaS-Produkte leiten:

### 3.1 Vermieter-Tools -> Vermietify
- **Tools:** `RenditeRechner.tsx`, `GrundsteuerRechner.tsx`, `BetriebskostenFormular.tsx`
- **Angebot:** "Verwaltest du deine Immobilien noch mit Excel? Teste Vermietify – die All-in-One Lösung für private Vermieter."
- **Ziel:** Lead-Generierung für die Beta-Phase von Vermietify.

### 3.2 Freelancer-Tools -> Fintutto Biz
- **Tools:** (Zukünftige Tools wie `StundensatzRechner.tsx` oder `UmsatzsteuerRechner.tsx`)
- **Angebot:** "Schluss mit dem Zettelchaos. Schreibe Rechnungen und erfasse deine Zeiten mit Fintutto Biz."
- **Ziel:** Nutzergewinnung für den Financial Compass.

---

## 4. Technische Umsetzung (Nächste Schritte)

1. **Affiliate-Netzwerke:** Anmeldung bei Awin, FinanceAds und Check24 Partnerprogramm.
2. **Komponenten-Bau:** Erstellung einer wiederverwendbaren `<AffiliateBanner />` Komponente in React.
3. **Integration:** Einbau der Komponente auf den Ergebnisseiten der jeweiligen Rechner.
4. **Tracking:** Einbau von Plausible Analytics oder PostHog, um die Conversion-Rate (Tool-Nutzung -> Affiliate-Klick) zu messen.
