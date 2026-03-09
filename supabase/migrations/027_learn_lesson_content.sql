-- 027_learn_lesson_content.sql
-- Seed lesson content for the first 3 free courses with structured JSONB content and quizzes

-- Helper: get course IDs by title (deterministic from 023_learn.sql seed)
-- We insert lessons for: Budgetierung Grundlagen, ETFs verstehen, Notfallfonds aufbauen

-- ─── Budgetierung Grundlagen (5 lessons) ─────────────────────────────────────

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Was ist ein Budget?',
  '[
    {"type": "heading", "content": "Was ist ein Budget?"},
    {"type": "text", "content": "Ein Budget ist ein Plan, der deine Einnahmen und Ausgaben fuer einen bestimmten Zeitraum festlegt. Es hilft dir, den Ueberblick ueber deine Finanzen zu behalten und sicherzustellen, dass du nicht mehr ausgibst, als du einnimmst."},
    {"type": "tip", "content": "Ein Budget ist kein Einschraenkungsinstrument - es ist ein Werkzeug, das dir Freiheit gibt, weil du genau weisst, wofuer dein Geld verwendet wird."},
    {"type": "list", "items": ["Einnahmen erfassen (Gehalt, Nebenjobs, Kindergeld)", "Fixkosten identifizieren (Miete, Versicherungen, Abos)", "Variable Ausgaben kategorisieren (Lebensmittel, Freizeit)", "Sparziel festlegen"]},
    {"type": "example", "title": "Beispiel: Monatsbudget", "content": "Lisa verdient 2.800 EUR netto. Sie plant: 900 EUR Miete, 400 EUR Lebensmittel, 150 EUR Mobilitaet, 100 EUR Abos, 200 EUR Freizeit, 500 EUR Sparen = 2.250 EUR verplant, 550 EUR Puffer."}
  ]'::jsonb,
  1,
  '[
    {"question": "Was ist der Hauptzweck eines Budgets?", "options": ["Geld sparen", "Einnahmen und Ausgaben planen", "Schulden abbauen", "Investieren"], "correct_index": 1, "explanation": "Ein Budget plant Einnahmen und Ausgaben - Sparen ist ein moegliches Ergebnis davon."},
    {"question": "Was gehoert zu den Fixkosten?", "options": ["Restaurant-Besuche", "Miete und Versicherungen", "Kleidung", "Geschenke"], "correct_index": 1, "explanation": "Fixkosten sind regelmaessige, gleichbleibende Ausgaben wie Miete und Versicherungen."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'Budgetierung Grundlagen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Die 50/30/20 Regel',
  '[
    {"type": "heading", "content": "Die 50/30/20 Regel"},
    {"type": "text", "content": "Eine der beliebtesten Budgetierungsmethoden ist die 50/30/20 Regel. Sie teilt dein Nettoeinkommen in drei Kategorien auf."},
    {"type": "list", "items": ["50% fuer Beduerfnisse: Miete, Lebensmittel, Versicherungen, Mobilitaet", "30% fuer Wuensche: Freizeit, Hobbys, Restaurantbesuche, Shopping", "20% fuer Sparen & Schuldenabbau: Notgroschen, Investitionen, Kreditrueckzahlung"]},
    {"type": "warning", "content": "In Grossstaedten wie Muenchen oder Hamburg kann die Miete allein schon 40% betragen. Passe die Regel an deine Lebensrealitaet an."},
    {"type": "example", "title": "Rechenbeispiel", "content": "Bei 3.000 EUR netto: 1.500 EUR Beduerfnisse, 900 EUR Wuensche, 600 EUR Sparen. Wenn deine Miete 1.100 EUR betraegt, reduziere Wuensche auf 700 EUR."}
  ]'::jsonb,
  2,
  '[
    {"question": "Wie viel Prozent sollte man laut 50/30/20 Regel sparen?", "options": ["10%", "20%", "30%", "50%"], "correct_index": 1, "explanation": "20% des Nettoeinkommens sollten fuer Sparen und Schuldenabbau verwendet werden."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'Budgetierung Grundlagen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Ausgaben tracken',
  '[
    {"type": "heading", "content": "Ausgaben tracken"},
    {"type": "text", "content": "Der wichtigste Schritt beim Budgetieren ist das Erfassen deiner tatsaechlichen Ausgaben. Viele Menschen ueberschaetzen ihre Einnahmen und unterschaetzen ihre Ausgaben."},
    {"type": "tip", "content": "Tracke mindestens 30 Tage lang JEDE Ausgabe. Du wirst ueberrascht sein, wohin dein Geld fliesst."},
    {"type": "list", "items": ["Nutze eine App oder ein Haushaltsbuch", "Kategorisiere jede Ausgabe sofort", "Pruefe woechentlich deine Kategorien", "Vergleiche Soll vs. Ist am Monatsende"]},
    {"type": "warning", "content": "Bargeldausgaben werden oft vergessen. Hebe Quittungen auf oder notiere Barausgaben sofort."}
  ]'::jsonb,
  3,
  '[
    {"question": "Wie lange sollte man mindestens Ausgaben tracken?", "options": ["1 Woche", "2 Wochen", "30 Tage", "1 Jahr"], "correct_index": 2, "explanation": "30 Tage geben dir einen vollstaendigen Ueberblick ueber dein monatliches Ausgabeverhalten."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'Budgetierung Grundlagen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Sparquote optimieren',
  '[
    {"type": "heading", "content": "Sparquote optimieren"},
    {"type": "text", "content": "Deine Sparquote ist der Anteil deines Einkommens, den du sparst. In Deutschland liegt die durchschnittliche Sparquote bei ca. 11%. Ziel sollte mindestens 20% sein."},
    {"type": "list", "items": ["Fixkosten verhandeln (Strom, Internet, Versicherungen)", "Abos pruefen und kuendigen", "Automatische Sparueberweisungen einrichten", "Gratifikationen direkt zum Sparen nutzen"]},
    {"type": "example", "title": "Quick Win", "content": "Durch Wechsel des Stromanbieters (Ersparnis ~200 EUR/Jahr), Kuendigung ungenutzter Abos (~30 EUR/Monat) und Versicherungsoptimierung (~150 EUR/Jahr) kannst du schnell 700+ EUR/Jahr mehr sparen."}
  ]'::jsonb,
  4,
  '[]'::jsonb
FROM public.learn_courses c WHERE c.title = 'Budgetierung Grundlagen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Budget-Tools und Automatisierung',
  '[
    {"type": "heading", "content": "Budget-Tools und Automatisierung"},
    {"type": "text", "content": "Moderne Tools machen Budgetierung einfach. Der Schluessel ist Automatisierung: Je weniger du manuell tun musst, desto konsequenter bleibst du."},
    {"type": "list", "items": ["Separate Konten fuer Fixkosten, Sparen und Freizeit (Mehrkontenmodell)", "Dauerauftraege fuer Sparen am Gehaltstag einrichten", "Finance Coach fuer automatisches Tracking nutzen", "Monatlichen Budget-Review einplanen (15 Min am Monatsende)"]},
    {"type": "tip", "content": "Das 3-Konten-Modell: Gehaltskonto (Fixkosten), Sparkonto (Sparrate), Spasskonto (Freizeit-Budget). Alles per Dauerauftrag am 1. des Monats."}
  ]'::jsonb,
  5,
  '[
    {"question": "Was ist der Vorteil des Mehrkontenmodells?", "options": ["Mehr Zinsen", "Automatische Trennung von Ausgabenkategorien", "Niedrigere Bankgebuehren", "Besserer Schufa-Score"], "correct_index": 1, "explanation": "Das Mehrkontenmodell trennt automatisch verschiedene Ausgabenkategorien, sodass du nie versehentlich dein Sparbudget angreifst."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'Budgetierung Grundlagen'
ON CONFLICT DO NOTHING;

-- ─── ETFs verstehen (6 lessons) ──────────────────────────────────────────────

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Was sind ETFs?',
  '[
    {"type": "heading", "content": "Was sind ETFs?"},
    {"type": "text", "content": "ETF steht fuer Exchange Traded Fund - ein boersengehandelter Fonds. Ein ETF buendelt viele Aktien oder Anleihen in einem einzigen Wertpapier und bildet einen Index wie den DAX oder MSCI World nach."},
    {"type": "list", "items": ["Breit diversifiziert: Ein ETF enthaelt hunderte oder tausende Aktien", "Guenstig: Verwaltungskosten (TER) typisch 0,1-0,5% pro Jahr", "Transparent: Du siehst jederzeit, was im ETF enthalten ist", "Liquide: Jederzeit an der Boerse kauf- und verkaufbar"]},
    {"type": "example", "title": "Vergleich", "content": "Ein MSCI World ETF enthaelt ca. 1.500 Aktien aus 23 Laendern. Einzeln muesste man 1.500 Aktien kaufen - mit einem ETF reicht ein einziger Kauf."}
  ]'::jsonb,
  1,
  '[
    {"question": "Wofuer steht ETF?", "options": ["European Trading Fund", "Exchange Traded Fund", "Electronic Transfer Fee", "Equity Trust Fund"], "correct_index": 1, "explanation": "ETF steht fuer Exchange Traded Fund - ein boersengehandelter Indexfonds."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'ETFs verstehen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Warum ETFs fuer Einsteiger ideal sind',
  '[
    {"type": "heading", "content": "Warum ETFs fuer Einsteiger ideal sind"},
    {"type": "text", "content": "ETFs sind das perfekte Einsteigerprodukt: Sie bieten breite Diversifikation bei niedrigen Kosten und erfordern kein Expertenwissen ueber einzelne Aktien."},
    {"type": "tip", "content": "Warren Buffett empfiehlt seiner eigenen Familie, in einen S&P 500 Indexfonds zu investieren. Wenn es fuer Buffett gut genug ist, ist es fuer die meisten Anleger auch gut genug."},
    {"type": "list", "items": ["Kein Stock-Picking noetig", "Historisch 7-9% Rendite p.a. (MSCI World, langfristig)", "Schon ab 25 EUR/Monat per Sparplan moeglich", "Keine Mindestlaufzeit oder Kuendigungsfrist"]}
  ]'::jsonb,
  2,
  '[]'::jsonb
FROM public.learn_courses c WHERE c.title = 'ETFs verstehen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Die wichtigsten ETF-Indizes',
  '[
    {"type": "heading", "content": "Die wichtigsten ETF-Indizes"},
    {"type": "text", "content": "Ein ETF bildet immer einen Index ab. Die bekanntesten Indizes fuer ETF-Anleger:"},
    {"type": "list", "items": ["MSCI World: ~1.500 Aktien aus 23 Industrielaendern", "MSCI ACWI: Wie MSCI World + Schwellenlaender (~3.000 Aktien)", "S&P 500: Die 500 groessten US-Unternehmen", "FTSE All-World: Aehnlich wie MSCI ACWI, von Vanguard", "DAX: Die 40 groessten deutschen Unternehmen"]},
    {"type": "warning", "content": "Der DAX allein ist KEINE gute Diversifikation. Er enthaelt nur 40 Unternehmen aus einem Land. Bevorzuge globale Indizes."},
    {"type": "example", "title": "Der Klassiker", "content": "Ein MSCI World ETF (z.B. iShares Core MSCI World, TER 0,20%) ist fuer viele Einsteiger die perfekte Ein-ETF-Loesung."}
  ]'::jsonb,
  3,
  '[
    {"question": "Wie viele Aktien enthaelt ungefaehr der MSCI World Index?", "options": ["40", "500", "1.500", "10.000"], "correct_index": 2, "explanation": "Der MSCI World enthaelt ca. 1.500 Aktien aus 23 Industrielaendern."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'ETFs verstehen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'ETF-Sparplan einrichten',
  '[
    {"type": "heading", "content": "ETF-Sparplan einrichten"},
    {"type": "text", "content": "Ein ETF-Sparplan ist der einfachste Weg, regelmaessig zu investieren. Du legst einen festen Betrag fest, der monatlich automatisch in deinen ETF investiert wird."},
    {"type": "list", "items": ["Depot bei einem Neobroker eroeffnen (Trade Republic, Scalable Capital, etc.)", "ETF auswaehlen (z.B. MSCI World)", "Sparrate festlegen (ab 25 EUR/Monat)", "Ausfuehrungstag waehlen (z.B. 1. oder 15. des Monats)", "Automatisch laufen lassen - nicht staendig reinschauen!"]},
    {"type": "tip", "content": "Cost-Average-Effekt: Durch regelmaessiges Investieren kaufst du bei niedrigen Kursen mehr und bei hohen Kursen weniger Anteile. Das glaettet deinen Einstiegskurs."}
  ]'::jsonb,
  4,
  '[]'::jsonb
FROM public.learn_courses c WHERE c.title = 'ETFs verstehen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Kosten und Steuern bei ETFs',
  '[
    {"type": "heading", "content": "Kosten und Steuern bei ETFs"},
    {"type": "text", "content": "ETFs sind guenstig, aber nicht kostenlos. Diese Kosten solltest du kennen:"},
    {"type": "list", "items": ["TER (Total Expense Ratio): Jaehrliche Verwaltungsgebuehr (0,1-0,5%)", "Spread: Differenz zwischen Kauf- und Verkaufskurs", "Transaktionskosten: Gebuehr pro Kauf/Verkauf beim Broker", "Steuern: 26,375% Abgeltungssteuer auf Gewinne (inkl. Soli)"]},
    {"type": "tip", "content": "Sparerpauschbetrag nutzen! 1.000 EUR Kapitalertraege pro Person sind steuerfrei. Bei Paaren 2.000 EUR. Freistellungsauftrag beim Broker einrichten!"},
    {"type": "example", "title": "Kostenvergleich", "content": "Aktiver Fonds: 1,5% TER/Jahr. ETF: 0,2% TER/Jahr. Bei 10.000 EUR Anlage und 7% Rendite macht das nach 30 Jahren ueber 40.000 EUR Unterschied!"}
  ]'::jsonb,
  5,
  '[
    {"question": "Wie hoch ist der Sparerpauschbetrag in Deutschland (pro Person)?", "options": ["500 EUR", "801 EUR", "1.000 EUR", "2.000 EUR"], "correct_index": 2, "explanation": "Seit 2023 betraegt der Sparerpauschbetrag 1.000 EUR pro Person (2.000 EUR fuer Ehepaare)."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'ETFs verstehen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Haeufige ETF-Fehler vermeiden',
  '[
    {"type": "heading", "content": "Haeufige ETF-Fehler vermeiden"},
    {"type": "text", "content": "ETF-Investieren ist einfach, aber einige Fehler koennen teuer werden:"},
    {"type": "list", "items": ["Panikverkauf bei Kurseinbruechen - Historisch erholen sich Maerkte immer", "Zu viele ETFs kaufen - 1-3 reichen voellig aus", "Market Timing versuchen - Niemand kann den Markt zuverlaessig timen", "Themen-ETFs jagen (Cannabis, Metaverse) - Bleib beim Weltportfolio", "Zu oft ins Depot schauen - Quartalsweise reicht"]},
    {"type": "warning", "content": "Der groesste Feind des Anlegers sind seine Emotionen. Setze einen Sparplan auf und lass ihn laufen - mindestens 10-15 Jahre."},
    {"type": "tip", "content": "Mantra fuer ETF-Anleger: Breit gestreut, nie bereut. Time in the market beats timing the market."}
  ]'::jsonb,
  6,
  '[
    {"question": "Was ist der groesste Fehler bei ETF-Investitionen?", "options": ["Zu wenig investieren", "Panikverkauf bei Kurseinbruechen", "Zu viele verschiedene ETFs", "Nicht genug recherchieren"], "correct_index": 1, "explanation": "Panikverkaeufe bei Kurseinbruechen realisieren Verluste, die sich bei Geduld wieder erholen wuerden."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'ETFs verstehen'
ON CONFLICT DO NOTHING;

-- ─── Notfallfonds aufbauen (3 lessons) ───────────────────────────────────────

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Warum ein Notgroschen lebenswichtig ist',
  '[
    {"type": "heading", "content": "Warum ein Notgroschen lebenswichtig ist"},
    {"type": "text", "content": "Ein Notfallfonds (Notgroschen) ist eine Geldreserve fuer unvorhergesehene Ausgaben: Autoreparatur, Waschmaschine kaputt, Jobverlust. Ohne Notgroschen fuehren solche Ereignisse oft zu Schulden."},
    {"type": "list", "items": ["Schuetzt vor Dispokrediten (Zinsen bis 15%!)", "Gibt finanzielle Sicherheit und Seelenfrieden", "Ermoeglicht bessere Entscheidungen (kein Panik-Handeln)", "Ist die Grundlage fuer jede weitere Finanzplanung"]},
    {"type": "warning", "content": "40% der Deutschen koennten eine unerwartete Ausgabe von 1.000 EUR nicht sofort stemmen. Sei nicht Teil dieser Statistik."},
    {"type": "tip", "content": "Dein Notgroschen sollte 3-6 Monatsausgaben betragen. Bei 2.000 EUR monatlichen Ausgaben also 6.000-12.000 EUR."}
  ]'::jsonb,
  1,
  '[
    {"question": "Wie viele Monatsausgaben sollte ein Notgroschen idealerweise abdecken?", "options": ["1 Monat", "3-6 Monate", "12 Monate", "24 Monate"], "correct_index": 1, "explanation": "3-6 Monatsausgaben gelten als ideal. Wer selbststaendig ist, sollte eher 6 Monate anpeilen."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'Notfallfonds aufbauen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Strategie: Notgroschen schnell aufbauen',
  '[
    {"type": "heading", "content": "Strategie: Notgroschen schnell aufbauen"},
    {"type": "text", "content": "Den Notgroschen aufzubauen hat hoechste Prioritaet - noch vor Investitionen oder Schuldenabbau (ausser hochverzinste Schulden)."},
    {"type": "list", "items": ["Schritt 1: Mini-Notgroschen von 1.000 EUR (sofort starten)", "Schritt 2: Fixkosten senken und Differenz sparen", "Schritt 3: Automatischen Dauerauftrag einrichten", "Schritt 4: Extras (Steuerrueckerstattung, Bonus) direkt einzahlen", "Schritt 5: Auf 3-6 Monatsausgaben aufstocken"]},
    {"type": "example", "title": "Schnellstart", "content": "200 EUR/Monat sparen = 1.000 EUR Mini-Notgroschen in 5 Monaten. Danach weitersparen bis 6.000 EUR = ca. 2,5 Jahre. Mit Extras (Steuern, Weihnachtsgeld) deutlich schneller."}
  ]'::jsonb,
  2,
  '[]'::jsonb
FROM public.learn_courses c WHERE c.title = 'Notfallfonds aufbauen'
ON CONFLICT DO NOTHING;

INSERT INTO public.learn_lessons (course_id, title, content, sort_order, quiz)
SELECT c.id, 'Wo den Notgroschen anlegen?',
  '[
    {"type": "heading", "content": "Wo den Notgroschen anlegen?"},
    {"type": "text", "content": "Der Notgroschen muss jederzeit verfuegbar sein. Rendite ist zweitrangig - Sicherheit und Liquiditaet stehen an erster Stelle."},
    {"type": "list", "items": ["Tagesgeldkonto (empfohlen): Taegliche Verfuegbarkeit, Einlagensicherung", "Nicht auf dem Girokonto: Zu leicht fuer Alltagsausgaben erreichbar", "Nicht in Aktien/ETFs: Koennen im falschen Moment im Minus sein", "Nicht unter der Matratze: Keine Zinsen, Diebstahlrisiko"]},
    {"type": "tip", "content": "Separates Tagesgeldkonto bei einer anderen Bank als dein Girokonto. So ist die Hemmschwelle hoeher, das Geld fuer Alltagsausgaben zu nutzen."},
    {"type": "warning", "content": "Dein Notgroschen ist KEIN Investmentgeld. Auch wenn es bei 2% Tagesgeld frustrierend scheint - der Zweck ist Sicherheit, nicht Rendite."}
  ]'::jsonb,
  3,
  '[
    {"question": "Wo sollte man den Notgroschen am besten anlegen?", "options": ["In Aktien", "Auf dem Girokonto", "Auf einem separaten Tagesgeldkonto", "In Kryptowaehrungen"], "correct_index": 2, "explanation": "Ein separates Tagesgeldkonto bietet taegliche Verfuegbarkeit, Einlagensicherung und eine kleine Hemmschwelle gegen vorschnelles Ausgeben."}
  ]'::jsonb
FROM public.learn_courses c WHERE c.title = 'Notfallfonds aufbauen'
ON CONFLICT DO NOTHING;

-- Update lesson counts
UPDATE public.learn_courses SET lesson_count = (
  SELECT COUNT(*) FROM public.learn_lessons WHERE course_id = learn_courses.id
) WHERE title IN ('Budgetierung Grundlagen', 'ETFs verstehen', 'Notfallfonds aufbauen');
