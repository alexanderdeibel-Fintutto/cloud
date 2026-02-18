-- Migration: Add blog posts and landing page tables for Phase 2

-- ============================================
-- 1. Blog Posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT, -- Kurzfassung für Listenansicht
    content TEXT NOT NULL, -- Markdown-Inhalt
    category TEXT NOT NULL, -- mietrecht, vermieter-tipps, nebenkosten, kaution, kuendigung, finanzierung
    tags TEXT[] DEFAULT '{}',
    author TEXT DEFAULT 'Fintutto Redaktion',
    cover_image TEXT, -- URL zum Titelbild
    seo_title TEXT, -- Eigener SEO-Titel (falls abweichend)
    seo_description TEXT, -- Meta-Description
    related_checker TEXT, -- Verlinkung zu passendem Checker
    related_rechner TEXT, -- Verlinkung zu passendem Rechner
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Jeder kann veröffentlichte Artikel lesen
CREATE POLICY "Anyone can read published posts" ON public.blog_posts
    FOR SELECT USING (published = TRUE);

-- Service-Role kann alles
CREATE POLICY "Service can manage posts" ON public.blog_posts
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_published ON public.blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_featured ON public.blog_posts(featured) WHERE featured = TRUE;

-- ============================================
-- 2. Landing Pages (für Domain-/Themen-spezifische Seiten)
-- ============================================
CREATE TABLE IF NOT EXISTS public.landing_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL, -- z.B. 'mietpreisbremse-berlin', 'nebenkosten-pruefen-muenchen'
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT, -- Markdown
    city TEXT, -- z.B. Berlin, München, Hamburg
    bundesland TEXT,
    topic TEXT NOT NULL, -- mietpreisbremse, nebenkosten, kaution, etc.
    related_checker TEXT, -- Verlinkung zum Checker
    related_rechner TEXT,
    seo_title TEXT,
    seo_description TEXT,
    published BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published landing pages" ON public.landing_pages
    FOR SELECT USING (published = TRUE);

CREATE POLICY "Service can manage landing pages" ON public.landing_pages
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_landing_slug ON public.landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_city ON public.landing_pages(city);
CREATE INDEX IF NOT EXISTS idx_landing_topic ON public.landing_pages(topic);

-- ============================================
-- 3. Email Automations (Tracking gesendeter Automationen)
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_automations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    automation_type TEXT NOT NULL, -- welcome_1, welcome_2, welcome_3, checker_followup, seasonal, segment_newsletter
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can manage automations" ON public.email_automations
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_automations_email ON public.email_automations(email);
CREATE INDEX IF NOT EXISTS idx_automations_type ON public.email_automations(automation_type);

-- ============================================
-- 4. Seed: Erste Blog-Artikel (Starter-Content)
-- ============================================
INSERT INTO public.blog_posts (slug, title, excerpt, content, category, tags, related_checker, published, featured, published_at) VALUES
(
  'mietpreisbremse-so-pruefen-sie-ihre-miete',
  'Mietpreisbremse: So prüfen Sie ob Ihre Miete zu hoch ist',
  'Erfahren Sie, wie die Mietpreisbremse funktioniert und wie Sie in wenigen Minuten prüfen können, ob Ihre Miete zu hoch ist.',
  '## Was ist die Mietpreisbremse?

Die Mietpreisbremse ist eine gesetzliche Regelung nach **§556d BGB**, die in angespannten Wohnungsmärkten die Miethöhe bei Neuvermietungen begrenzt. Die Miete darf maximal **10% über der ortsüblichen Vergleichsmiete** liegen.

## Wo gilt die Mietpreisbremse?

Die Mietpreisbremse gilt nicht überall in Deutschland. Sie wird von den **Landesregierungen** für Gebiete mit angespannten Wohnungsmärkten per Verordnung festgelegt. Aktuell gilt sie in den meisten Großstädten:

- Berlin
- München
- Hamburg
- Frankfurt am Main
- Köln
- Stuttgart
- Düsseldorf
- und viele weitere Städte

## So prüfen Sie Ihre Miete

1. **Vergleichsmiete ermitteln**: Nutzen Sie den lokalen Mietspiegel Ihrer Stadt
2. **Grenzwert berechnen**: Vergleichsmiete + 10% = maximale Miete
3. **Vergleichen**: Ist Ihre tatsächliche Miete höher?

### Unser Tipp

Nutzen Sie unseren **kostenlosen Mietpreisbremse-Checker**, um in wenigen Minuten zu prüfen, ob Ihre Miete zu hoch ist. Sie erhalten sofort eine Einschätzung und erfahren, wie viel Sie möglicherweise zurückfordern können.

## Was tun, wenn die Miete zu hoch ist?

Wenn Ihre Miete die zulässige Höchstmiete überschreitet, können Sie:

1. **Rüge beim Vermieter** einlegen (qualifizierte Rüge nach §556g BGB)
2. **Zu viel gezahlte Miete zurückfordern** (ab dem Zeitpunkt der Rüge)
3. Bei Bedarf einen **Anwalt für Mietrecht** hinzuziehen

> **Wichtig:** Die Rückforderung ist nur möglich ab dem Zeitpunkt der Rüge, nicht rückwirkend. Handeln Sie daher schnell!

## Ausnahmen von der Mietpreisbremse

Die Mietpreisbremse gilt nicht, wenn:

- Die Wohnung **erstmalig nach dem 1. Oktober 2014 genutzt und vermietet** wurde (Neubau)
- Eine **umfassende Modernisierung** durchgeführt wurde
- Die **Vormiete** bereits über der Grenze lag

## Fazit

Die Mietpreisbremse ist ein wichtiges Instrument für Mieter in angespannten Wohnungsmärkten. Prüfen Sie jetzt kostenlos, ob auch Sie zu viel Miete zahlen.',
  'mietrecht',
  ARRAY['mietpreisbremse', 'miete', 'vergleichsmiete', 'mietrecht'],
  'mietpreisbremse',
  TRUE,
  TRUE,
  NOW()
),
(
  'nebenkostenabrechnung-pruefen-haeufige-fehler',
  'Nebenkostenabrechnung prüfen: Die 10 häufigsten Fehler',
  'Jede dritte Nebenkostenabrechnung enthält Fehler. Erfahren Sie, welche Fehler am häufigsten vorkommen und wie Sie Ihre Abrechnung prüfen.',
  '## Jede dritte Abrechnung ist fehlerhaft

Studien zeigen, dass **rund 34% aller Nebenkostenabrechnungen** Fehler enthalten. Im Durchschnitt können Mieter **317 EUR pro Jahr** zurückerhalten, wenn sie ihre Abrechnung prüfen lassen.

## Die 10 häufigsten Fehler

### 1. Nicht umlagefähige Kosten
Vermieter dürfen nur die in **§2 BetrKV** aufgeführten Kostenarten auf Mieter umlegen. Häufig werden fälschlicherweise Kosten für Verwaltung, Instandhaltung oder Reparaturen umgelegt.

### 2. Falscher Abrechnungszeitraum
Die Abrechnung muss sich auf einen Zeitraum von **genau 12 Monaten** beziehen. Abweichungen sind nur in Ausnahmefällen zulässig.

### 3. Verspätete Zustellung
Die Abrechnung muss dem Mieter **innerhalb von 12 Monaten** nach Ende des Abrechnungszeitraums zugehen. Danach kann der Vermieter keine Nachzahlung mehr verlangen.

### 4. Falscher Verteilerschlüssel
Der Verteilerschlüssel muss dem entsprechen, was im Mietvertrag vereinbart wurde. Häufige Fehler: Verteilung nach Wohnfläche statt nach Personenzahl oder umgekehrt.

### 5. Fehlende Gesamtkosten
Die Abrechnung muss die **Gesamtkosten** des Gebäudes ausweisen, nicht nur den Mieteranteil.

### 6. Rechenfehler
Einfache Rechenfehler kommen häufiger vor als man denkt. Prüfen Sie alle Berechnungen nach.

### 7. Doppelte Kostenansätze
Manche Kosten werden unter verschiedenen Positionen doppelt berechnet.

### 8. Zu hohe Heizkosten
Die Heizkostenabrechnung muss nach der **Heizkostenverordnung** erfolgen, mit mindestens 50% verbrauchsabhängiger Verteilung.

### 9. Leerstehende Wohnungen
Die Kosten für leer stehende Wohnungen dürfen **nicht auf die anderen Mieter umgelegt** werden.

### 10. Fehlende Vorauszahlungen
Geleistete Vorauszahlungen müssen korrekt angerechnet werden.

## So prüfen Sie Ihre Abrechnung

Nutzen Sie unseren **kostenlosen Nebenkosten-Checker** für eine schnelle Ersteinschätzung. Das Tool prüft die häufigsten Fehlerquellen und gibt Ihnen eine sofortige Einschätzung.

## Fazit

Lassen Sie keine Nebenkostenabrechnung ungeprüft! Mit unserem kostenlosen Checker erkennen Sie die häufigsten Fehler in wenigen Minuten.',
  'nebenkosten',
  ARRAY['nebenkosten', 'betriebskosten', 'abrechnung', 'fehler'],
  'nebenkosten',
  TRUE,
  TRUE,
  NOW()
),
(
  'eigenbedarfskuendigung-rechte-als-mieter',
  'Eigenbedarfskündigung: Ihre Rechte als Mieter',
  'Was tun bei einer Eigenbedarfskündigung? Erfahren Sie alles über Ihre Rechte, Fristen und wie Sie sich wehren können.',
  '## Was ist eine Eigenbedarfskündigung?

Eine Eigenbedarfskündigung liegt vor, wenn der Vermieter die Wohnung **für sich selbst, Familienangehörige oder Haushaltsangehörige** benötigt. Sie ist in **§573 Abs. 2 Nr. 2 BGB** geregelt.

## Voraussetzungen für eine wirksame Eigenbedarfskündigung

Der Vermieter muss:

1. Den **Eigenbedarf konkret begründen** (wer benötigt die Wohnung und warum?)
2. Die gesetzlichen **Kündigungsfristen** einhalten
3. Die Kündigung **schriftlich** aussprechen
4. Auf das **Widerspruchsrecht** des Mieters hinweisen

## Kündigungsfristen

Die Kündigungsfrist hängt von der **Dauer des Mietverhältnisses** ab:

| Mietdauer | Kündigungsfrist |
|-----------|-----------------|
| Bis 5 Jahre | 3 Monate |
| 5 bis 8 Jahre | 6 Monate |
| Über 8 Jahre | 9 Monate |

## Wann ist eine Eigenbedarfskündigung unwirksam?

- **Vorgeschobener Eigenbedarf**: Der Vermieter hat keinen tatsächlichen Bedarf
- **Fehlende Begründung**: Die Kündigung enthält keine oder eine unzureichende Begründung
- **Alternativwohnung vorhanden**: Der Vermieter hat eine andere freie Wohnung im selben Haus
- **Rechtsmissbrauch**: z.B. Kündigung kurz nach Erwerb einer vermieteten Wohnung

## Härtefall-Widerspruch

Als Mieter können Sie der Kündigung **widersprechen**, wenn die Beendigung des Mietverhältnisses eine besondere **Härte** bedeuten würde (§574 BGB):

- Hohes Alter
- Schwere Krankheit
- Schwangerschaft
- Lange Mietdauer
- Keine vergleichbare Ersatzwohnung findbar

## Was Sie jetzt tun sollten

1. **Kündigung genau prüfen** mit unserem Eigenbedarf-Checker
2. **Fristen notieren** (Widerspruch bis 2 Monate vor Mietende)
3. **Rechtsschutzversicherung** informieren
4. Bei Bedarf einen **Fachanwalt für Mietrecht** konsultieren

> **Unser Tipp:** Prüfen Sie jetzt kostenlos mit unserem Eigenbedarf-Checker, ob die Kündigung wirksam ist.',
  'mietrecht',
  ARRAY['eigenbedarf', 'kuendigung', 'mietrecht', 'mieterrechte'],
  'eigenbedarf',
  TRUE,
  FALSE,
  NOW()
),
(
  'kaution-zurueckfordern-so-gehts',
  'Kaution zurückfordern: So bekommen Sie Ihr Geld zurück',
  'Nach dem Auszug haben Sie Anspruch auf Rückzahlung der Kaution. Erfahren Sie, welche Fristen gelten und wie Sie vorgehen.',
  '## Wann muss die Kaution zurückgezahlt werden?

Nach Ende des Mietverhältnisses hat der Vermieter eine **angemessene Überlegungsfrist**, in der er prüfen kann, ob berechtigte Ansprüche gegen den Mieter bestehen. Diese Frist beträgt in der Regel **3 bis 6 Monate**.

## Höhe der Kaution

Die Mietkaution darf maximal **3 Nettokaltmieten** betragen (§551 BGB). Der Vermieter muss die Kaution auf einem **separaten Konto** anlegen und die Zinsen bei Rückgabe mit auszahlen.

## Gründe für Einbehalt

Der Vermieter darf die Kaution (teilweise) einbehalten für:

- **Ausstehende Mietzahlungen**
- **Nachzahlungen** aus der Betriebskostenabrechnung
- **Schäden an der Wohnung** (über normale Abnutzung hinaus)
- **Nicht durchgeführte Schönheitsreparaturen** (nur bei wirksamer Klausel)

## So fordern Sie Ihre Kaution zurück

1. **Schriftlich auffordern**: Setzen Sie eine Frist von 2 Wochen
2. **Übergabeprotokoll** bereithalten (als Nachweis des Wohnungszustands)
3. **Abzüge prüfen**: Sind die geltend gemachten Ansprüche berechtigt?
4. **Zinsen einfordern**: Sie haben Anspruch auf die angefallenen Zinsen

### Mustertext für die Rückforderung

> Sehr geehrte/r [Vermieter], hiermit fordere ich Sie auf, die von mir hinterlegte Mietkaution in Höhe von [Betrag] EUR zzgl. aufgelaufener Zinsen innerhalb von 14 Tagen auf mein Konto [IBAN] zu überweisen.

## Unser Tipp

Nutzen Sie unseren **kostenlosen Kautions-Checker** um Ihre Ansprüche zu prüfen. Und mit unserer **Kautions-Rückforderungs-Vorlage** erstellen Sie in Minuten ein professionelles Schreiben.',
  'mietrecht',
  ARRAY['kaution', 'rueckzahlung', 'mietrecht', 'auszug'],
  'kaution',
  TRUE,
  FALSE,
  NOW()
),
(
  'immobilie-als-kapitalanlage-rendite-berechnen',
  'Immobilie als Kapitalanlage: So berechnen Sie die Rendite',
  'Lohnt sich der Kauf einer Immobilie als Kapitalanlage? Erfahren Sie, wie Sie Brutto- und Nettorendite richtig berechnen.',
  '## Warum Immobilien als Kapitalanlage?

Immobilien gelten als **sichere Wertanlage** mit stabilen Renditen. Besonders in Zeiten niedriger Zinsen und steigender Inflation bieten sie Schutz vor Kaufkraftverlust.

## Wichtige Rendite-Kennzahlen

### Bruttorendite
Die einfachste Berechnung:

**Bruttorendite = (Jahreskaltmiete / Kaufpreis) × 100**

Beispiel: 12.000 EUR Jahresmiete / 300.000 EUR Kaufpreis = **4,0% Bruttorendite**

### Nettorendite
Berücksichtigt alle laufenden Kosten:

**Nettorendite = ((Jahreskaltmiete - Bewirtschaftungskosten) / (Kaufpreis + Kaufnebenkosten)) × 100**

### Eigenkapitalrendite
Besonders relevant bei Fremdfinanzierung:

**EK-Rendite = (Jahresertrag nach Zinsen / Eigenkapital) × 100**

Durch den **Leverage-Effekt** kann die Eigenkapitalrendite deutlich höher sein als die Objektrendite.

## Kaufnebenkosten nicht vergessen

Beim Immobilienkauf fallen erhebliche Nebenkosten an:

| Kostenart | Anteil |
|-----------|--------|
| Grunderwerbsteuer | 3,5% - 6,5% (je nach Bundesland) |
| Notarkosten | ca. 1,5% |
| Grundbuchgebühren | ca. 0,5% |
| Maklerkosten | 0% - 7,14% |

**Insgesamt 5,5% - 15,64%** des Kaufpreises!

## Cashflow-Analyse

Ein positiver Cashflow bedeutet, dass die Mieteinnahmen die monatlichen Kosten (Kredit, Hausgeld, Rücklagen) übersteigen. Berechnen Sie:

1. **Mieteinnahmen** (Kaltmiete)
2. **Minus** Nicht-umlagefähige Nebenkosten
3. **Minus** Kreditrate (Zins + Tilgung)
4. **Minus** Instandhaltungsrücklage (ca. 1-1,5% des Gebäudewertes p.a.)
5. **Minus** Mietausfallwagnis (ca. 2-3%)

## Unsere Tools für Vermieter

Nutzen Sie unsere kostenlosen Rechner:
- **Rendite-Rechner**: Berechnen Sie Brutto-, Netto- und Eigenkapitalrendite
- **Kaufnebenkosten-Rechner**: Alle Kaufnebenkosten auf einen Blick
- **Eigenkapital-Rechner**: Wie viel Eigenkapital brauchen Sie?',
  'vermieter-tipps',
  ARRAY['rendite', 'kapitalanlage', 'immobilien', 'investition'],
  NULL,
  TRUE,
  FALSE,
  NOW()
);

-- ============================================
-- 5. Seed: Erste Landing Pages
-- ============================================
INSERT INTO public.landing_pages (slug, title, subtitle, content, city, topic, related_checker, seo_title, seo_description, published) VALUES
(
  'mietpreisbremse-berlin',
  'Mietpreisbremse in Berlin',
  'Prüfen Sie kostenlos, ob Ihre Miete in Berlin zu hoch ist',
  '## Mietpreisbremse in Berlin

Berlin gehört zu den Städten mit den **strengsten Mietpreisregulierungen** in Deutschland. Seit 2015 gilt die Mietpreisbremse, die die Miete bei Neuvermietungen auf maximal **10% über der ortsüblichen Vergleichsmiete** begrenzt.

### Berliner Mietspiegel 2024

Der aktuelle Berliner Mietspiegel weist folgende Durchschnittswerte aus:
- **Einfache Lage**: 6,50 - 8,50 EUR/m²
- **Mittlere Lage**: 7,50 - 10,00 EUR/m²
- **Gute Lage**: 9,00 - 13,00 EUR/m²

### So prüfen Sie Ihre Miete

1. Ermitteln Sie Ihre ortsübliche Vergleichsmiete im Berliner Mietspiegel
2. Addieren Sie 10%
3. Vergleichen Sie mit Ihrer tatsächlichen Miete

**Oder nutzen Sie einfach unseren kostenlosen Mietpreisbremse-Checker!**',
  'Berlin',
  'mietpreisbremse',
  'mietpreisbremse',
  'Mietpreisbremse Berlin 2024: Kostenlos Miete prüfen | Fintutto',
  'Ist Ihre Miete in Berlin zu hoch? Prüfen Sie kostenlos in 2 Minuten, ob die Mietpreisbremse greift und wie viel Sie sparen können.',
  TRUE
),
(
  'mietpreisbremse-muenchen',
  'Mietpreisbremse in München',
  'Prüfen Sie kostenlos, ob Ihre Miete in München zu hoch ist',
  '## Mietpreisbremse in München

München hat den **teuersten Wohnungsmarkt** Deutschlands. Die Mietpreisbremse gilt hier seit 2015 und begrenzt Neuvermietungsmieten auf **10% über der ortsüblichen Vergleichsmiete**.

### Münchener Mietspiegel

Der Münchener Mietspiegel zeigt deutlich höhere Werte als der Bundesdurchschnitt:
- **Einfache Lage**: 12,00 - 16,00 EUR/m²
- **Mittlere Lage**: 14,00 - 19,00 EUR/m²
- **Gute Lage**: 17,00 - 24,00 EUR/m²

### Besonders betroffen: Innenstadtbezirke

In Bezirken wie Schwabing, Maxvorstadt und Haidhausen werden besonders häufig überhöhte Mieten verlangt. Prüfen Sie jetzt, ob auch Ihre Miete zu hoch ist!

**Nutzen Sie unseren kostenlosen Mietpreisbremse-Checker für eine sofortige Einschätzung.**',
  'München',
  'mietpreisbremse',
  'mietpreisbremse',
  'Mietpreisbremse München 2024: Kostenlos Miete prüfen | Fintutto',
  'Ist Ihre Miete in München zu hoch? Prüfen Sie kostenlos in 2 Minuten, ob die Mietpreisbremse greift. Durchschnittlich 317 EUR Ersparnis.',
  TRUE
),
(
  'nebenkosten-pruefen-hamburg',
  'Nebenkostenabrechnung prüfen in Hamburg',
  'Prüfen Sie Ihre Nebenkostenabrechnung kostenlos auf Fehler',
  '## Nebenkostenabrechnung in Hamburg prüfen

Hamburger Mieter zahlen im Durchschnitt **2,88 EUR/m² Nebenkosten** pro Monat. Das liegt deutlich über dem Bundesdurchschnitt. Umso wichtiger ist es, die Abrechnung genau zu prüfen!

### Häufige Fehler bei Hamburger Abrechnungen

- **Falscher Wasserverbrauch**: Hamburg hat überdurchschnittlich hohe Wasserkosten
- **Straßenreinigung**: Wird häufig falsch umgelegt
- **Grundsteuer**: Nach der Reform besonders fehleranfällig

### Unser kostenloser Nebenkosten-Checker

Prüfen Sie in wenigen Minuten, ob Ihre Nebenkostenabrechnung Fehler enthält. Im Durchschnitt erhalten Hamburger Mieter **380 EUR zurück**!',
  'Hamburg',
  'nebenkosten',
  'nebenkosten',
  'Nebenkostenabrechnung prüfen Hamburg: Kostenloser Check | Fintutto',
  'Prüfen Sie Ihre Nebenkostenabrechnung in Hamburg kostenlos. Jede 3. Abrechnung enthält Fehler – im Schnitt 380 EUR Rückerstattung.',
  TRUE
);
