-- Migration 006: Weitere Blog-Artikel und Landing Pages

-- ============================================
-- Weitere Blog-Artikel (5 neue)
-- ============================================
INSERT INTO public.blog_posts (slug, title, excerpt, content, category, tags, related_checker, related_rechner, published, featured, published_at) VALUES
(
  'mieterhoehung-wann-ist-sie-unwirksam',
  'Mieterhöhung erhalten? Wann sie unwirksam ist',
  'Nicht jede Mieterhöhung ist rechtmäßig. Erfahren Sie, welche Voraussetzungen erfüllt sein müssen und wann Sie widersprechen können.',
  '## Mieterhöhung nach §558 BGB

Der Vermieter kann die Miete bis zur **ortsüblichen Vergleichsmiete** erhöhen. Dafür müssen aber strenge Voraussetzungen erfüllt sein.

## Formelle Voraussetzungen

Damit eine Mieterhöhung wirksam ist, muss der Vermieter:

1. **Schriftlich** erhöhen (E-Mail reicht nicht!)
2. Die Erhöhung **begründen** (Mietspiegel, Gutachten oder Vergleichswohnungen)
3. Die **Kappungsgrenze** einhalten (max. 20% in 3 Jahren, in vielen Städten nur 15%)
4. Die **Wartefrist** einhalten (frühestens 15 Monate nach Einzug oder letzter Erhöhung)
5. Eine **Zustimmungsfrist** von mindestens 2 Monaten gewähren

## Häufige Fehler bei Mieterhöhungen

### 1. Falscher Mietspiegel
Der Vermieter muss den **aktuellen qualifizierten Mietspiegel** verwenden. Veraltete Mietspiegel sind ungültig.

### 2. Kappungsgrenze überschritten
In vielen Städten gilt die verschärfte Kappungsgrenze von **15% in 3 Jahren**. Prüfen Sie, ob Ihre Stadt dazugehört.

### 3. Formfehler
Die Erhöhung muss alle Mieter erreichen, die im Mietvertrag stehen. Fehlt ein Adressat, ist sie unwirksam.

### 4. Fehlende Begründung
Eine bloße Behauptung "Die Miete wird erhöht" reicht nicht. Der Vermieter muss nachvollziehbar begründen.

### 5. Falsche Berechnung der Vergleichsmiete
Die Wohnungsmerkmale (Baujahr, Ausstattung, Lage, Größe) müssen korrekt eingestuft sein.

## Ihre Optionen

1. **Zustimmen** – wenn die Erhöhung berechtigt ist
2. **Teilweise zustimmen** – wenn nur ein Teil berechtigt ist
3. **Ablehnen** – der Vermieter muss dann klagen
4. **Nichts tun** – nach Ablauf der Frist kann der Vermieter auf Zustimmung klagen

## Was passiert bei Ablehnung?

Der Vermieter kann **innerhalb von 3 Monaten** nach Ablauf der Zustimmungsfrist Klage auf Zustimmung einreichen. Bis zum Urteil zahlen Sie die alte Miete.

> **Tipp:** Nutzen Sie unseren Mieterhöhungs-Checker für eine sofortige Einschätzung, ob die Erhöhung rechtmäßig ist.',
  'mietrecht',
  ARRAY['mieterhoehung', 'mietrecht', 'kappungsgrenze', 'mietspiegel'],
  'mieterhoehung',
  NULL,
  TRUE,
  FALSE,
  NOW()
),
(
  'mietminderung-wann-und-wie-viel',
  'Mietminderung: Wann und wie viel dürfen Sie mindern?',
  'Schimmel, Lärm oder Heizungsausfall? Erfahren Sie, wann Sie die Miete mindern dürfen und in welcher Höhe.',
  '## Wann ist eine Mietminderung erlaubt?

Eine Mietminderung ist nach **§536 BGB** erlaubt, wenn die Wohnung einen **Mangel** aufweist, der die **Gebrauchstauglichkeit** einschränkt.

## Typische Mängel und Minderungsquoten

| Mangel | Minderungsquote |
|--------|----------------|
| Schimmelbefall | 10-100% |
| Heizungsausfall im Winter | 50-100% |
| Warmwasserausfall | 10-30% |
| Lärmbelästigung durch Baustelle | 10-40% |
| Aufzug defekt (obere Stockwerke) | 5-15% |
| Feuchtigkeit im Keller | 5-10% |
| Ungeziefer (Kakerlaken etc.) | 10-100% |
| Wohnfläche kleiner als im Vertrag (>10%) | Anteilig |

## So gehen Sie richtig vor

### 1. Mangel dokumentieren
Fotos, Videos und schriftliche Beschreibungen sichern. Datum und Uhrzeit notieren.

### 2. Mängelanzeige an den Vermieter
**Sofort schriftlich** den Vermieter informieren (per Einschreiben). Ohne Mängelanzeige keine Minderung!

### 3. Frist setzen
Geben Sie dem Vermieter eine **angemessene Frist** zur Beseitigung (meist 14 Tage).

### 4. Miete mindern
Erst nach Ablauf der Frist und wenn der Mangel fortbesteht, dürfen Sie mindern.

## Wichtige Regeln

- Die Minderung bezieht sich auf die **Bruttomiete** (inkl. Nebenkosten)
- Sie müssen den Mangel **nicht selbst verursacht** haben
- Bei **Kenntnis des Mangels** vor Einzug ist keine Minderung möglich
- **Vorsicht:** Zu hohe Minderung kann zur Kündigung führen!

> **Empfehlung:** Nutzen Sie unseren Mietminderungs-Checker, um die angemessene Minderungsquote zu berechnen.',
  'mietrecht',
  ARRAY['mietminderung', 'mangel', 'schimmel', 'mietrecht'],
  'mietminderung',
  NULL,
  TRUE,
  FALSE,
  NOW()
),
(
  'schoenheitsreparaturen-muss-ich-beim-auszug-renovieren',
  'Schönheitsreparaturen: Muss ich beim Auszug renovieren?',
  'Viele Renovierungsklauseln im Mietvertrag sind unwirksam. Erfahren Sie, wann Sie beim Auszug renovieren müssen und wann nicht.',
  '## Die wichtigste Nachricht zuerst

**Über 80% aller Schönheitsreparaturklauseln** in Mietverträgen sind nach aktueller BGH-Rechtsprechung **unwirksam**. Das bedeutet: Sie müssen in vielen Fällen beim Auszug gar nicht renovieren!

## Was sind Schönheitsreparaturen?

Zu den Schönheitsreparaturen gehören:

- Tapezieren und Anstreichen der Wände und Decken
- Streichen der Heizkörper und Heizungsrohre
- Streichen der Innentüren und Fenster von innen
- Streichen der Fußböden (nicht: Abschleifen von Parkett)

**Nicht** dazu gehören: Teppichbodenerneuerung, Parkettabschleifen, Außenanstrich, Reparaturen.

## Wann sind Klauseln unwirksam?

### Starre Fristenregelungen
Klauseln wie *"Der Mieter hat alle 3 Jahre die Küche zu streichen"* sind **unwirksam** (BGH VIII ZR 178/05).

### Endrenovierungsklauseln
*"Bei Auszug ist die Wohnung renoviert zu übergeben"* – **unwirksam**, wenn bei Einzug unrenoviert übernommen (BGH VIII ZR 185/14).

### Farbwahlklauseln
*"Die Wohnung ist in weißer Farbe zurückzugeben"* – **unwirksam** während der Mietzeit, erlaubt nur bei Auszug (BGH VIII ZR 198/10).

### Quotenabgeltungsklauseln
*"Bei Auszug vor Ablauf der Frist zahlt der Mieter anteilig"* – **unwirksam** (BGH VIII ZR 242/13).

## Wann MUSS ich renovieren?

Sie müssen renovieren, wenn:

1. Die Klausel **wirksam** formuliert ist (flexible Fristen, keine starre Regelung)
2. Sie die Wohnung **renoviert** übernommen haben
3. **Tatsächlicher Renovierungsbedarf** besteht

## Praxistipp

Auch wenn Sie nicht renovieren müssen, sollten Sie die Wohnung **besenrein** übergeben und grobe Verunreinigungen beseitigen.

> **Tipp:** Nutzen Sie unseren Schönheitsreparaturen-Checker, um zu prüfen, ob Ihre Klausel wirksam ist.',
  'mietrecht',
  ARRAY['schoenheitsreparaturen', 'renovierung', 'auszug', 'klausel'],
  'schoenheitsreparaturen',
  NULL,
  TRUE,
  FALSE,
  NOW()
),
(
  'kaufnebenkosten-alle-kosten-beim-immobilienkauf',
  'Kaufnebenkosten: Alle Kosten beim Immobilienkauf im Überblick',
  'Grunderwerbsteuer, Notar, Grundbuch, Makler – diese Kaufnebenkosten kommen auf Sie zu. Mit Beispielrechnung.',
  '## Unterschätzte Kosten beim Immobilienkauf

Viele Käufer unterschätzen die **Kaufnebenkosten**. Sie können **bis zu 15% des Kaufpreises** betragen und müssen in der Regel aus Eigenkapital bezahlt werden.

## Die vier Kostenblöcke

### 1. Grunderwerbsteuer (3,5% - 6,5%)

Die Grunderwerbsteuer variiert je nach Bundesland:

| Bundesland | Steuersatz |
|------------|-----------|
| Bayern, Sachsen | 3,5% |
| Baden-Württemberg | 5,0% |
| Berlin, Hessen | 6,0% |
| NRW, Schleswig-Holstein | 6,5% |
| Brandenburg, Thüringen | 6,5% |

### 2. Notarkosten (ca. 1,0-1,5%)

Der Notar beurkundet den Kaufvertrag. Die Kosten richten sich nach dem Kaufpreis und sind gesetzlich geregelt (GNotKG).

### 3. Grundbuchgebühren (ca. 0,5%)

Für die Eintragung des neuen Eigentümers im Grundbuch und ggf. einer Grundschuld.

### 4. Maklerkosten (0% - 7,14%)

Seit Dezember 2020 gilt das **Bestellerprinzip** bei Vermietungen. Beim Kauf teilen sich Käufer und Verkäufer die Kosten (meist 50/50).

## Beispielrechnung

**Kaufpreis: 300.000 EUR in NRW**

| Position | Kosten |
|----------|--------|
| Grunderwerbsteuer (6,5%) | 19.500 EUR |
| Notarkosten (1,5%) | 4.500 EUR |
| Grundbuchgebühren (0,5%) | 1.500 EUR |
| Makler (3,57% Käuferanteil) | 10.710 EUR |
| **Gesamt** | **36.210 EUR** |

Das sind **12,07%** des Kaufpreises!

## Tipps zum Sparen

- **Ohne Makler** kaufen (z.B. Privatverkauf)
- **Inventar separat** ausweisen (keine Grunderwerbsteuer auf Möbel)
- **Bundesland** vergleichen (3,5% vs. 6,5% = großer Unterschied)

> **Nutzen Sie unseren Kaufnebenkosten-Rechner** für eine exakte Berechnung mit Ihrem Bundesland.',
  'vermieter-tipps',
  ARRAY['kaufnebenkosten', 'immobilienkauf', 'grunderwerbsteuer', 'notar'],
  NULL,
  'kaufnebenkosten',
  TRUE,
  FALSE,
  NOW()
),
(
  'betriebskostenabrechnung-erstellen-vermieter-guide',
  'Betriebskostenabrechnung erstellen: Der Vermieter-Guide',
  'Als Vermieter müssen Sie jährlich eine Betriebskostenabrechnung erstellen. So machen Sie es richtig und vermeiden Fehler.',
  '## Pflicht zur Abrechnung

Wenn Sie als Vermieter **Betriebskostenvorauszahlungen** vereinbart haben, sind Sie verpflichtet, jährlich eine Abrechnung zu erstellen. Die Frist: **12 Monate** nach Ende des Abrechnungszeitraums.

## Die 17 umlagefähigen Kostenarten (§2 BetrKV)

1. Grundsteuer
2. Wasserversorgung
3. Entwässerung
4. Heizung
5. Warmwasser
6. Aufzug
7. Straßenreinigung
8. Müllabfuhr
9. Gebäudereinigung
10. Gartenpflege
11. Beleuchtung (Allgemeinflächen)
12. Schornsteinfeger
13. Sach- und Haftpflichtversicherung
14. Hauswart
15. Gemeinschafts-Antennenanlage / Kabelanschluss
16. Wascheinrichtung
17. Sonstige Betriebskosten

## Aufbau einer korrekten Abrechnung

### 1. Kopf
- Abrechnungszeitraum (exakt 12 Monate)
- Abrechnungseinheit (Gebäude/Wirtschaftseinheit)
- Name und Adresse des Mieters

### 2. Kostenaufstellung
- **Gesamtkosten** je Position
- **Verteilerschlüssel** (Fläche, Personenzahl, Verbrauch)
- **Mieteranteil** je Position

### 3. Abrechnung
- Summe der Mieteranteile
- Abzug geleisteter Vorauszahlungen
- **Nachzahlung oder Guthaben**

## Häufige Fehler vermeiden

- **Nicht umlagefähige Kosten** ausschließen (Verwaltung, Instandhaltung!)
- **Frist einhalten** (nach 12 Monaten verfällt Nachforderungsanspruch)
- **Belegeinsicht** ermöglichen (Mieter hat Recht darauf)
- **Verteilerschlüssel** korrekt anwenden

> **Nutzen Sie unseren Nebenkosten-Rechner** und unser **Betriebskostenabrechnung-Formular** für eine rechtssichere Abrechnung.',
  'vermieter-tipps',
  ARRAY['betriebskosten', 'vermieter', 'abrechnung', 'nebenkostenabrechnung'],
  'betriebskosten',
  'nebenkosten',
  TRUE,
  FALSE,
  NOW()
);

-- ============================================
-- Weitere Landing Pages (7 neue Städte/Themen)
-- ============================================
INSERT INTO public.landing_pages (slug, title, subtitle, content, city, topic, related_checker, seo_title, seo_description, published) VALUES
(
  'mietpreisbremse-frankfurt',
  'Mietpreisbremse in Frankfurt am Main',
  'Prüfen Sie kostenlos, ob Ihre Miete in Frankfurt zu hoch ist',
  '## Mietpreisbremse in Frankfurt am Main

Frankfurt gehört zu den **teuersten Städten** Deutschlands. Die Mietpreisbremse gilt hier seit 2015 und begrenzt Neuvermietungsmieten auf **10% über der ortsüblichen Vergleichsmiete**.

### Frankfurter Mietspiegel
- **Einfache Lage**: 9,50 - 12,50 EUR/m²
- **Mittlere Lage**: 11,00 - 15,00 EUR/m²
- **Gute Lage**: 13,50 - 19,00 EUR/m²

### Besonders betroffen
Stadtteile wie Bornheim, Nordend, Sachsenhausen und Westend haben besonders hohe Mietpreise.

**Nutzen Sie unseren kostenlosen Mietpreisbremse-Checker!**',
  'Frankfurt',
  'mietpreisbremse',
  'mietpreisbremse',
  'Mietpreisbremse Frankfurt: Kostenlos Miete prüfen | Fintutto',
  'Ist Ihre Miete in Frankfurt zu hoch? Prüfen Sie kostenlos in 2 Minuten, ob die Mietpreisbremse greift.',
  TRUE
),
(
  'mietpreisbremse-koeln',
  'Mietpreisbremse in Köln',
  'Prüfen Sie kostenlos, ob Ihre Miete in Köln zu hoch ist',
  '## Mietpreisbremse in Köln

Köln ist einer der **angespanntesten Wohnungsmärkte** in NRW. Die Mietpreisbremse gilt hier seit 2015.

### Kölner Mietspiegel
- **Einfache Lage**: 8,00 - 10,50 EUR/m²
- **Mittlere Lage**: 9,50 - 13,00 EUR/m²
- **Gute Lage**: 11,50 - 16,00 EUR/m²

### Besonders betroffen
Die Südstadt, Ehrenfeld, Nippes und die Altstadt-Nord gehören zu den teuersten Vierteln.

**Prüfen Sie jetzt kostenlos mit unserem Mietpreisbremse-Checker!**',
  'Köln',
  'mietpreisbremse',
  'mietpreisbremse',
  'Mietpreisbremse Köln: Kostenlos Miete prüfen | Fintutto',
  'Ist Ihre Miete in Köln zu hoch? Prüfen Sie kostenlos in 2 Minuten, ob die Mietpreisbremse greift.',
  TRUE
),
(
  'mietpreisbremse-stuttgart',
  'Mietpreisbremse in Stuttgart',
  'Prüfen Sie kostenlos, ob Ihre Miete in Stuttgart zu hoch ist',
  '## Mietpreisbremse in Stuttgart

Stuttgart gehört zu den **teuersten Städten** Baden-Württembergs. Die Mietpreisbremse begrenzt Neuvermietungsmieten auf **10% über der ortsüblichen Vergleichsmiete**.

### Stuttgarter Mietspiegel
- **Einfache Lage**: 10,00 - 13,00 EUR/m²
- **Mittlere Lage**: 12,00 - 16,00 EUR/m²
- **Gute Lage**: 14,00 - 20,00 EUR/m²

**Nutzen Sie unseren kostenlosen Mietpreisbremse-Checker!**',
  'Stuttgart',
  'mietpreisbremse',
  'mietpreisbremse',
  'Mietpreisbremse Stuttgart: Kostenlos Miete prüfen | Fintutto',
  'Ist Ihre Miete in Stuttgart zu hoch? Kostenloser Check in 2 Minuten.',
  TRUE
),
(
  'mietpreisbremse-duesseldorf',
  'Mietpreisbremse in Düsseldorf',
  'Prüfen Sie kostenlos, ob Ihre Miete in Düsseldorf zu hoch ist',
  '## Mietpreisbremse in Düsseldorf

Düsseldorf zählt zu den **teuersten Städten** in NRW.

### Düsseldorfer Mietspiegel
- **Einfache Lage**: 8,50 - 11,00 EUR/m²
- **Mittlere Lage**: 10,00 - 14,00 EUR/m²
- **Gute Lage**: 12,50 - 18,00 EUR/m²

**Nutzen Sie unseren kostenlosen Mietpreisbremse-Checker!**',
  'Düsseldorf',
  'mietpreisbremse',
  'mietpreisbremse',
  'Mietpreisbremse Düsseldorf: Kostenlos Miete prüfen | Fintutto',
  'Ist Ihre Miete in Düsseldorf zu hoch? Kostenloser Check in 2 Minuten.',
  TRUE
),
(
  'nebenkosten-pruefen-berlin',
  'Nebenkostenabrechnung prüfen in Berlin',
  'Prüfen Sie Ihre Berliner Nebenkostenabrechnung kostenlos auf Fehler',
  '## Nebenkostenabrechnung in Berlin

Berliner Mieter zahlen im Durchschnitt **2,75 EUR/m² Nebenkosten** pro Monat. Die **Grundsteuerreform** hat viele Abrechnungen verändert.

### Typische Fehler in Berlin
- **Grundsteuer**: Neue Berechnung nach Bundesmodell oft fehlerhaft
- **Straßenreinigung**: BSR-Kosten werden häufig falsch verteilt
- **Aufzugskosten**: Erdgeschoss-Mieter werden zu Unrecht belastet

### Durchschnittliche Rückerstattung
Berliner Mieter erhalten im Schnitt **340 EUR** zurück, wenn sie ihre Abrechnung prüfen.

**Nutzen Sie unseren kostenlosen Nebenkosten-Checker!**',
  'Berlin',
  'nebenkosten',
  'nebenkosten',
  'Nebenkostenabrechnung prüfen Berlin | Fintutto',
  'Prüfen Sie Ihre Nebenkostenabrechnung in Berlin kostenlos. Jede 3. Abrechnung enthält Fehler.',
  TRUE
),
(
  'nebenkosten-pruefen-muenchen',
  'Nebenkostenabrechnung prüfen in München',
  'Prüfen Sie Ihre Münchener Nebenkostenabrechnung kostenlos auf Fehler',
  '## Nebenkostenabrechnung in München

München hat die **höchsten Nebenkosten** Bayerns mit durchschnittlich **3,10 EUR/m²** pro Monat.

### Typische Fehler in München
- **Heizkosten**: Bei Fernwärme oft überhöht
- **Versicherungskosten**: Häufig nicht umlagefähige Versicherungen enthalten
- **Gartenpflege**: Kosten werden oft zu hoch angesetzt

### Unser Tipp
Münchener Mieter erhalten durchschnittlich **420 EUR** zurück!

**Nutzen Sie unseren kostenlosen Nebenkosten-Checker!**',
  'München',
  'nebenkosten',
  'nebenkosten',
  'Nebenkostenabrechnung prüfen München | Fintutto',
  'Prüfen Sie Ihre Nebenkostenabrechnung in München kostenlos. Durchschnittlich 420 EUR Rückerstattung.',
  TRUE
),
(
  'kaution-zurueck-berlin',
  'Kaution zurückfordern in Berlin',
  'Kaution nicht zurückbekommen? So fordern Berliner Mieter ihr Geld zurück',
  '## Kaution zurückfordern in Berlin

In Berlin beträgt die durchschnittliche Mietkaution **2.500 EUR**. Nach dem Auszug haben Sie Anspruch auf Rückzahlung.

### Berliner Besonderheiten
- Die Kaution muss auf einem **separaten Konto** angelegt sein
- Der Vermieter hat **3-6 Monate** Prüfungsfrist
- **Zinsen** müssen mit ausgezahlt werden
- Bei Eigentümerwechsel haftet der neue Eigentümer

### Häufige Probleme in Berlin
- Vermieter reagiert nicht auf Rückforderung
- Unberechtigte Abzüge für "Schönheitsreparaturen"
- Kaution wird mit offener Betriebskostenabrechnung verrechnet

> **Tipp:** Nutzen Sie unseren Kautions-Checker um Ihre Ansprüche zu prüfen.',
  'Berlin',
  'kaution',
  'kaution',
  'Kaution zurückfordern Berlin: So geht es | Fintutto',
  'Kaution in Berlin nicht zurückbekommen? Prüfen Sie kostenlos Ihre Ansprüche und erfahren Sie, wie Sie vorgehen.',
  TRUE
);
