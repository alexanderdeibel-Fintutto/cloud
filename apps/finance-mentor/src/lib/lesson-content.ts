/**
 * Educational lesson content for free lessons.
 * Key: `${courseId}::${lessonId}`
 *
 * Each entry contains structured content for rendering in the lesson viewer.
 */

export interface LessonContent {
  summary: string;
  sections: { heading: string; body: string }[];
  keyTakeaway: string;
  exercise?: string;
}

export const LESSON_CONTENT: Record<string, LessonContent> = {
  // ────────────────────────────────────────────────────────────────
  // Budgetierung 101
  // ────────────────────────────────────────────────────────────────
  "budgetierung-101::1": {
    summary:
      "Budgetierung ist kein Verzicht – es ist ein Plan, der dir zeigt, wohin dein Geld fliesst und wo du die Kontrolle uebernimmst.",
    sections: [
      {
        heading: "Warum ueberhaupt budgetieren?",
        body: "Studien zeigen: Die meisten Menschen ueberschaetzen, wie viel sie sparen, und unterschaetzen, wie viel sie ausgeben. Ein Budget schliesst diese Luecke. Es geht nicht darum, jeden Cent zu zaehlen, sondern bewusst zu entscheiden, wofuer du dein Geld einsetzt.",
      },
      {
        heading: "Das unsichtbare Geld-Leck",
        body: "Kleine Ausgaben – der taegliche Kaffee, das Abo das du vergessen hast, der Lieferdienst – summieren sich oft auf mehrere Hundert Euro im Monat. Ein Budget macht diese unsichtbaren Lecks sichtbar.",
      },
      {
        heading: "Budget als Freiheits-Tool",
        body: "Wer sein Geld bewusst steuert, hat weniger Schuldgefuehle bei Ausgaben und mehr Klarheit fuer grosse Ziele. Ein Budget gibt dir nicht weniger Freiheit, sondern mehr – weil du weisst, was du dir leisten kannst.",
      },
    ],
    keyTakeaway:
      "Ein Budget ist kein Verzichtsplan, sondern dein persoenlicher Finanzkompass.",
    exercise:
      "Notiere heute Abend alle Ausgaben der letzten 7 Tage aus dem Kopf. Vergleiche morgen mit deinem Kontoauszug – die Differenz zeigt dir dein unsichtbares Geld-Leck.",
  },
  "budgetierung-101::2": {
    summary:
      "Die 50/30/20-Regel teilt dein Netto-Einkommen in drei Kategorien: Beduerfnisse, Wuensche und Sparen/Schulden.",
    sections: [
      {
        heading: "So funktioniert die Regel",
        body: "50% fuer Fixkosten und Beduerfnisse (Miete, Versicherungen, Lebensmittel). 30% fuer Wuensche und Lifestyle (Essen gehen, Hobbys, Streaming). 20% fuer Sparen, Investieren und Schulden-Tilgung.",
      },
      {
        heading: "Wann die Regel nicht passt",
        body: "In teuren Staedten wie Muenchen oder Hamburg kann allein die Miete 40% verschlingen. In solchen Faellen ist 60/20/20 oder sogar 70/15/15 realistischer. Wichtig ist, dass du ueberhaupt eine Struktur hast.",
      },
      {
        heading: "Praktische Umsetzung",
        body: "Richte drei Unterkonten ein: Fixkosten-Konto, Spass-Konto, Spar-Konto. Per Dauerauftrag am Gehaltstag wird alles automatisch aufgeteilt. Du musst dann nur noch vom Spass-Konto ausgeben – ohne schlechtes Gewissen.",
      },
    ],
    keyTakeaway:
      "Die 50/30/20-Regel ist ein Startpunkt – passe die Prozente an dein Leben an, aber halte die Struktur bei.",
    exercise:
      "Berechne dein Netto-Einkommen und teile es nach 50/30/20 auf. Stimmen die Zahlen mit deiner Realitaet ueberein? Wo ist die groesste Abweichung?",
  },
  "budgetierung-101::3": {
    summary:
      "Die Umschlag-Methode ist eine analoge Budgetierungs-Technik, bei der du Bargeld in Umschlaege fuer verschiedene Ausgaben-Kategorien aufteilst.",
    sections: [
      {
        heading: "Das Prinzip",
        body: "Am Monatsanfang hebst du Bargeld ab und verteilst es in beschriftete Umschlaege: Lebensmittel, Freizeit, Kleidung usw. Wenn ein Umschlag leer ist, wird in der Kategorie nicht mehr ausgegeben.",
      },
      {
        heading: "Warum Bargeld wirkt",
        body: "Psychologische Forschung zeigt: Wir geben mit Bargeld weniger aus als mit Karte. Das physische Weggeben von Scheinen aktiviert den Schmerzbereich im Gehirn – Kartenzahlung fuehlt sich dagegen abstrakt an.",
      },
      {
        heading: "Die digitale Variante",
        body: "Wer kein Bargeld mag, kann das Prinzip mit mehreren Unterkonten oder Apps wie YNAB nachbilden. Der Kern bleibt gleich: Jeder Euro hat einen Job, bevor er ausgegeben wird.",
      },
    ],
    keyTakeaway:
      "Die Umschlag-Methode macht Ausgaben physisch spuerbar und hilft bei impulsiven Kaufentscheidungen.",
    exercise:
      "Teste die Methode eine Woche lang fuer eine Kategorie (z.B. Lebensmittel). Wie fuehlt es sich an, bar zu zahlen?",
  },
  "budgetierung-101::4": {
    summary:
      "Beim Zero-Based Budgeting bekommt jeder einzelne Euro einen Zweck – am Ende bleibt null uebrig, weil alles verplant ist.",
    sections: [
      {
        heading: "Jeder Euro hat einen Job",
        body: "Du planst dein Einkommen komplett durch: Miete, Essen, Sparen, Freizeit – bis der letzte Euro zugeteilt ist. Das heisst nicht, dass du alles ausgibst, sondern dass auch 'Sparen' eine bewusste Zuteilung ist.",
      },
      {
        heading: "Vorteile gegenueber anderen Methoden",
        body: "Im Gegensatz zur 50/30/20-Regel zwingt dich Zero-Based Budgeting, jede einzelne Ausgabe zu durchdenken. Das fuehrt haeufig zu 10-20% weniger unbewussten Ausgaben im ersten Monat.",
      },
      {
        heading: "Tools fuer ZBB",
        body: "Apps wie YNAB (You Need A Budget) basieren auf dem Zero-Based-Prinzip. Du kannst aber auch eine einfache Tabelle nutzen: Links Einkommen, rechts alle Ausgaben – die Summe muss null ergeben.",
      },
    ],
    keyTakeaway:
      "Zero-Based Budgeting ist die gruendlichste Methode – ideal fuer alle, die maximale Kontrolle wollen.",
    exercise:
      "Erstelle ein Zero-Based Budget fuer den naechsten Monat. Teile dein gesamtes Netto auf, bis null uebrig bleibt.",
  },
  "budgetierung-101::5": {
    summary:
      "Statt kleine Freuden zu streichen, fokussiere dich auf die grossen Hebel – dort liegt das wahre Sparpotenzial.",
    sections: [
      {
        heading: "Das Latte-Faktor-Problem",
        body: "Viele Finanzratgeber sagen: 'Verzichte auf den taeglichen Kaffee und du sparst 1.500 Euro im Jahr.' Das stimmt rechnerisch, aber es macht unzufrieden. Bewusstes Ausgeben heisst: Gib grosszuegig fuer das aus, was dir wichtig ist, und kuerze gnadenlos bei dem, was dir egal ist.",
      },
      {
        heading: "Die grossen drei Hebel",
        body: "Miete/Wohnen, Mobilitaet und Versicherungen machen oft 60-70% der Ausgaben aus. Eine Optimierung hier spart mehr als ein Jahr lang auf Kaffee verzichten. Beispiel: Ein Versicherungswechsel kann 50 Euro monatlich sparen – ohne Lebensqualitaetsverlust.",
      },
      {
        heading: "Die Zufriedenheits-Regel",
        body: "Frage dich bei jeder groesseren Ausgabe: 'Bringt mir das in einem Monat noch Freude?' Erlebnisse und Beziehungen schlagen fast immer materielle Kaeufe.",
      },
    ],
    keyTakeaway:
      "Optimiere die grossen Posten, geniesse die kleinen Freuden – das ist nachhaltiges Sparen.",
    exercise:
      "Liste deine 5 groessten monatlichen Ausgaben auf. Bei welcher koenntest du mit einem Anbieterwechsel oder einer Verhandlung am meisten sparen?",
  },
  "budgetierung-101::6": {
    summary:
      "Jetzt wird es praktisch: Du erstellst dein erstes Budget mit einer Methode, die zu deinem Leben passt.",
    sections: [
      {
        heading: "Schritt 1: Einnahmen erfassen",
        body: "Notiere alle monatlichen Einnahmen: Gehalt (netto), Kindergeld, Nebeneinkuenfte, regelmaessige Ueberweisungen. Bei variablem Einkommen nimm den Durchschnitt der letzten 3 Monate.",
      },
      {
        heading: "Schritt 2: Ausgaben kategorisieren",
        body: "Gehe deine Kontoauszuege der letzten 3 Monate durch. Sortiere jede Buchung in eine Kategorie: Wohnen, Essen, Mobilitaet, Versicherungen, Freizeit, Abos, Sonstiges. Die meisten sind ueberrascht, wie viel fuer 'Sonstiges' draufgeht.",
      },
      {
        heading: "Schritt 3: Budget-Methode waehlen",
        body: "Fuer Einsteiger: 50/30/20. Fuer Detailliebhaber: Zero-Based. Fuer Impulskaeufer: Umschlag-Methode. Wichtig: Starte einfach und passe an. Ein unperfektes Budget, das du einhaltst, schlaegt ein perfektes, das in der Schublade liegt.",
      },
      {
        heading: "Schritt 4: Automatisieren",
        body: "Richte Dauerauftraege ein, die am Gehaltstag ausloefen: Sparbetrag aufs Sparkonto, Fixkosten aufs Gemeinschaftskonto. Was auf dem Girokonto bleibt, ist dein freies Budget.",
      },
    ],
    keyTakeaway:
      "Das beste Budget ist das, das du tatsaechlich nutzt. Starte heute – perfektionieren kannst du spaeter.",
    exercise:
      "Erstelle jetzt dein erstes Budget mit den Schritten oben. Setze dir einen Kalender-Reminder fuer in 4 Wochen, um es zu ueberpruefen und anzupassen.",
  },

  // ────────────────────────────────────────────────────────────────
  // Finanz-Mindset
  // ────────────────────────────────────────────────────────────────
  "finanz-mindset::1": {
    summary:
      "Deine Beziehung zu Geld wurde geformt, bevor du dein erstes Gehalt bekommen hast. Verstehe sie – und du verstehst dein Kontoverhalten.",
    sections: [
      {
        heading: "Geld ist emotional",
        body: "Geld ist nie nur eine Zahl. Es traegt Bedeutungen: Sicherheit, Freiheit, Macht, Liebe, Angst. Wie du ueber Geld denkst, bestimmt mehr ueber dein Konto als dein Einkommen.",
      },
      {
        heading: "Dein Finanz-Selbstbild",
        body: "Manche Menschen sehen sich als 'nicht gut mit Geld'. Dieses Selbstbild wird zur selbsterfuellenden Prophezeiung. Wer glaubt, nicht sparen zu koennen, findet immer Gruende, nicht zu sparen.",
      },
      {
        heading: "Erste Schritte zur Veraenderung",
        body: "Beobachte eine Woche lang deine Geld-Gedanken ohne sie zu bewerten. Schreibe auf, was dir auffaellt. Bewusstsein ist der erste Schritt zur Veraenderung.",
      },
    ],
    keyTakeaway:
      "Dein Verhalten mit Geld spiegelt deine unbewussten Ueberzeugungen wider – nicht dein Wissen.",
    exercise:
      "Schreibe den Satz 'Geld ist...' auf und vervollstaendige ihn spontan 10 Mal. Was faellt dir auf?",
  },
  "finanz-mindset::2": {
    summary:
      "Limitierende Glaubenssaetze sind unsichtbare Mauern, die verhindern, dass du finanziell wachsen kannst.",
    sections: [
      {
        heading: "Typische limitierende Glaubenssaetze",
        body: "'Geld verdirbt den Charakter.' 'Reiche Menschen sind gierig.' 'Ich bin einfach nicht der Typ, der Geld hat.' 'Geld ist die Wurzel allen Uebels.' Diese Saetze klingen harmlos, sabotieren aber aktiv deinen finanziellen Erfolg.",
      },
      {
        heading: "Woher kommen sie?",
        body: "Die meisten Geld-Glaubenssaetze stammen aus der Kindheit: von Eltern, Lehrern, Medien. Wer als Kind gehoert hat 'Wir koennen uns das nicht leisten', hat ein anderes Geld-Programm als jemand, der gehoert hat 'Wie koennen wir uns das leisten?'",
      },
      {
        heading: "Glaubenssaetze umschreiben",
        body: "Aus 'Geld verdirbt den Charakter' wird: 'Geld verstaerkt, wer ich bereits bin.' Aus 'Ich kann nicht sparen' wird: 'Ich lerne, immer besser mit Geld umzugehen.' Der neue Satz muss sich glaubwuerdig anfuehlen – nicht uebertrieben positiv.",
      },
    ],
    keyTakeaway:
      "Du kannst Glaubenssaetze veraendern, wenn du sie erst erkennst und dann bewusst durch hilfreichere ersetzt.",
    exercise:
      "Identifiziere deinen staerksten limitierenden Geld-Glaubenssatz und formuliere eine glaubwuerdige Alternative.",
  },
  "finanz-mindset::3": {
    summary:
      "Mangel-Denken sieht ueberall Knappheit. Fuelle-Denken sieht Moeglichkeiten. Dein Fokus bestimmt deine Realitaet.",
    sections: [
      {
        heading: "Die Mangel-Spirale",
        body: "Wer staendig denkt 'Es reicht nicht', trifft Entscheidungen aus Angst: billig kaufen, nicht investieren, Chancen verpassen. Ironischerweise fuehrt Mangel-Denken oft zu mehr Geldproblemen.",
      },
      {
        heading: "Fuelle bedeutet nicht Verschwendung",
        body: "Fuelle-Denken heisst nicht, alles zu kaufen. Es bedeutet zu glauben, dass genug da ist und mehr kommen kann. Aus dieser Haltung triffst du ruhigere, bessere Entscheidungen.",
      },
      {
        heading: "Praktische Uebung: Dankbarkeits-Inventur",
        body: "Schreibe 10 Dinge auf, die du bereits hast und die Geld kosten wuerden. Dach ueber dem Kopf, Gesundheit, Bildung, Beziehungen. Diese Uebung verschiebt den Fokus von dem, was fehlt, zu dem, was da ist.",
      },
    ],
    keyTakeaway:
      "Fuelle-Denken ist keine Illusion – es ist eine Strategie, die zu besseren Finanzentscheidungen fuehrt.",
    exercise:
      "Fuehre eine Woche lang ein Fuelle-Tagebuch: Schreibe jeden Abend 3 Dinge auf, fuer die du finanziell dankbar bist.",
  },
  "finanz-mindset::4": {
    summary:
      "Dein Einkommen wird langfristig immer zu deinem Selbstwert-Level gravitieren.",
    sections: [
      {
        heading: "Das innere Thermostat",
        body: "Jeder Mensch hat ein 'finanzielles Thermostat' – ein Niveau, das sich richtig anfuehlt. Lottogewinner, die ihr Geld verlieren, und Unternehmer, die nach der Pleite wieder aufbauen, bestaetigen: Dein Selbstbild bestimmt dein Konto.",
      },
      {
        heading: "Selbstwert und Gehalt",
        body: "Wer sich 3.000 Euro wert fuehlt, wird sich unbewusst gegen 5.000 Euro wehren – durch Selbstsabotage, schlechte Verhandlung oder 'bescheidenes' Auftreten. Den Selbstwert zu erhoehen ist der wichtigste finanzielle Hebel.",
      },
      {
        heading: "Selbstwert steigern – praktisch",
        body: "Investiere in deine Faehigkeiten und dein Auftreten. Umgib dich mit Menschen, die mehr verdienen. Feiere finanzielle Erfolge bewusst, statt sie herunterzuspielen.",
      },
    ],
    keyTakeaway:
      "Arbeite an deinem Selbstwert, und dein Kontostand wird folgen.",
    exercise:
      "Welches Jahreseinkommen fuehlt sich fuer dich 'richtig' an? Ist diese Zahl eine Reflexion deiner Faehigkeiten oder deiner Ueberzeugungen?",
  },
  "finanz-mindset::5": {
    summary:
      "Was du als Kind ueber Geld gelernt hast, steuert noch heute dein finanzielles Verhalten.",
    sections: [
      {
        heading: "Die Geld-Skripte der Familie",
        body: "Psychologen nennen sie 'Money Scripts' – unbewusste Ueberzeugungen ueber Geld, die in der Kindheit geformt werden. Es gibt vier Haupttypen: Geld-Vermeidung ('Geld ist schlecht'), Geld-Verehrung ('Mehr Geld loest alles'), Geld-Status ('Mein Wert = mein Kontostand') und Geld-Wachsamkeit ('Man muss vorsichtig sein').",
      },
      {
        heading: "Dein Skript identifizieren",
        body: "Erinnere dich: Wie wurde in deiner Familie ueber Geld gesprochen? Wurde offen darueber geredet oder war es tabu? Wurde gespart oder gelebt? War Geld eine Quelle von Streit oder Sicherheit?",
      },
      {
        heading: "Das Skript umschreiben",
        body: "Du bist nicht deine Eltern. Du kannst die nuetzlichen Teile behalten und die schaedlichen bewusst ersetzen. Der erste Schritt ist Bewusstsein: 'Dieses Verhalten habe ich gelernt, nicht gewaehlt.'",
      },
    ],
    keyTakeaway:
      "Deine Geld-Skripte sind gelernt – und alles Gelernte kann umgelernt werden.",
    exercise:
      "Frage deine Eltern (oder erinnere dich): Was war der wichtigste Satz ueber Geld in deiner Familie? Passt er noch zu deinem heutigen Leben?",
  },
  "finanz-mindset::6": {
    summary:
      "Ein Finanz-Tagebuch bringt Klarheit ueber dein Geld-Verhalten, deine Emotionen und deine Fortschritte.",
    sections: [
      {
        heading: "Warum ein Finanz-Tagebuch?",
        body: "Ein Finanz-Tagebuch ist mehr als eine Ausgabenliste. Es verbindet deine Emotionen mit deinen Ausgaben: 'Ich habe 80 Euro fuer Online-Shopping ausgegeben, weil ich frustriert war.' Diese Verbindung ist der Schluessel zur Veraenderung.",
      },
      {
        heading: "Was reingehoert",
        body: "Notiere taeglich (5 Minuten genuegen): Einnahmen und Ausgaben des Tages. Dein Gefuehl dabei. Ob die Ausgabe geplant oder impulsiv war. Was du anders machen wuerdest.",
      },
      {
        heading: "Die Wochen-Reflexion",
        body: "Einmal pro Woche: Welche Ausgabe hat mich am gluecklichsten gemacht? Welche bereue ich? Was war mein groesster finanzieller Erfolg diese Woche? Dieses Ritual dauert 10 Minuten und veraendert langfristig dein Geld-Verhalten.",
      },
    ],
    keyTakeaway:
      "Was du misst, verbesserst du. Ein Finanz-Tagebuch macht unsichtbare Muster sichtbar.",
    exercise:
      "Starte heute dein Finanz-Tagebuch – eine Notiz-App genuegt. Schreibe deine Ausgaben und dein Gefuehl dabei auf.",
  },
  "finanz-mindset::7": {
    summary:
      "Du verdienst den Durchschnitt deiner fuenf engsten Kontakte. Dein Umfeld formt deine finanziellen Gewohnheiten.",
    sections: [
      {
        heading: "Sozialer Spiegel-Effekt",
        body: "Studien zeigen: Wenn dein engster Freundeskreis spart und investiert, tust du es mit hoher Wahrscheinlichkeit auch. Umgekehrt: Wenn alle konsumieren, steigt dein Konsumdruck enorm.",
      },
      {
        heading: "Finanz-Vorbilder finden",
        body: "Suche dir bewusst Menschen, die finanziell weiter sind als du – nicht um dich zu vergleichen, sondern um zu lernen. Das koennen Podcasts, Buecher, Communities oder echte Mentoren sein.",
      },
      {
        heading: "Grenzen setzen",
        body: "Du musst keine Freundschaften beenden. Aber du kannst lernen, 'Nein' zu sagen, wenn der teure Restaurantbesuch nicht ins Budget passt. Echte Freunde respektieren das.",
      },
    ],
    keyTakeaway:
      "Umgib dich bewusst mit Menschen, die deine finanziellen Ziele unterstuetzen.",
    exercise:
      "Liste deine 5 engsten Kontakte auf. Wie gehen sie mit Geld um? Gibt es jemanden, von dem du finanziell lernen koenntest?",
  },
  "finanz-mindset::8": {
    summary:
      "Wohlstand entsteht nicht durch einmalige Aktionen, sondern durch taegliche Gewohnheiten.",
    sections: [
      {
        heading: "Die 1%-Regel",
        body: "Jeden Tag 1% besser mit Geld umzugehen summiert sich dramatisch. Nach einem Jahr bist du nicht 365% besser, sondern ueber 37 Mal – wegen des Zinseszins-Effekts auf Gewohnheiten.",
      },
      {
        heading: "Die 5 Kern-Gewohnheiten",
        body: "1) Taeglich Ausgaben notieren. 2) Woechentlich Kontostand pruefen. 3) Monatlich Budget reviewen. 4) Quartalweise Sparziele anpassen. 5) Jaehrlich Versicherungen und Vertraege optimieren.",
      },
      {
        heading: "Gewohnheiten stapeln",
        body: "Verknuepfe neue Finanz-Gewohnheiten mit bestehenden: 'Nach dem Morgenkaffee pruefe ich meine Ausgaben-App.' So nutzt du bestehende Routinen als Anker.",
      },
    ],
    keyTakeaway:
      "Kleine taegliche Finanz-Gewohnheiten erzeugen ueber Jahre enorme Ergebnisse.",
    exercise:
      "Waehle eine der 5 Kern-Gewohnheiten und verknuepfe sie mit einer bestehenden Routine. Starte morgen.",
  },

  // ────────────────────────────────────────────────────────────────
  // Schulden abbauen
  // ────────────────────────────────────────────────────────────────
  "schulden-abbauen::1": {
    summary:
      "Der erste Schritt zur Schuldenfreiheit ist brutale Ehrlichkeit: Alles auf den Tisch legen.",
    sections: [
      {
        heading: "Warum Inventur so wichtig ist",
        body: "Viele Verschuldete kennen ihre Gesamtsumme nicht. Das ist kein Zufall – unser Gehirn vermeidet unangenehme Zahlen. Aber du kannst nur loesen, was du kennst.",
      },
      {
        heading: "Deine Schulden-Liste erstellen",
        body: "Erfasse jede einzelne Schuld: Glaeubiger, Restbetrag, Zinssatz, Mindestzahlung, Faelligkeit. Vergiss nichts – auch nicht den kleinen Betrag bei Klarna oder den Dispo.",
      },
      {
        heading: "Schulden-Gesamtbild",
        body: "Addiere alles. Die Zahl mag erschreckend sein, aber sie ist dein Startpunkt. Von hier geht es nur noch aufwaerts. Viele berichten von Erleichterung, wenn die Zahl endlich auf dem Papier steht.",
      },
    ],
    keyTakeaway:
      "Klarheit ueber deine Schulden ist der wichtigste Schritt – auch wenn die Zahl wehtut.",
    exercise:
      "Erstelle jetzt deine vollstaendige Schulden-Liste: Glaeubiger, Betrag, Zinssatz, Mindestzahlung.",
  },
  "schulden-abbauen::2": {
    summary:
      "Nicht alle Schulden sind gleich: Manche arbeiten fuer dich, andere arbeiten gegen dich.",
    sections: [
      {
        heading: "Schlechte Schulden",
        body: "Konsumschulden (Kreditkarte, Ratenkauf, Dispo) finanzieren Dinge, die an Wert verlieren. Die Zinsen fressen dein Vermoegen. Ein Dispo von 12% Zinsen bedeutet: Jeder Euro kostet dich im Laufe der Zeit fast doppelt so viel.",
      },
      {
        heading: "Gute Schulden",
        body: "Schulden fuer Vermoegenswerte, die Einkommen generieren oder im Wert steigen, koennen sich lohnen: Immobilienkredit fuer eine Mietwohnung, Studienkredit fuer besseres Einkommen, Geschaeftskredit fuer eine profitable Firma.",
      },
      {
        heading: "Die Grauzone",
        body: "Ein Autokredit ist schlecht, wenn das Auto nur Kosten verursacht. Er ist vertretbar, wenn du das Auto fuer deinen Beruf brauchst und dadurch mehr verdienst. Kontext entscheidet.",
      },
    ],
    keyTakeaway:
      "Tilge schlechte Schulden so schnell wie moeglich. Gute Schulden koennen ein Werkzeug sein.",
    exercise:
      "Markiere in deiner Schulden-Liste jede Position als 'gut' oder 'schlecht'. Priorisiere die Tilgung der schlechten Schulden.",
  },

  // ────────────────────────────────────────────────────────────────
  // Notgroschen aufbauen
  // ────────────────────────────────────────────────────────────────
  "notgroschen-aufbauen::1": {
    summary:
      "Ein Notgroschen ist dein finanzielles Sicherheitsnetz – er verhindert, dass ein Unfall zur Katastrophe wird.",
    sections: [
      {
        heading: "Was ist ein Notgroschen?",
        body: "Ein Notgroschen ist eine Geld-Reserve fuer ungeplante Ausgaben: kaputte Waschmaschine, Autoreparatur, Jobverlust. Er liegt auf einem separaten Konto und wird nur im echten Notfall angefasst.",
      },
      {
        heading: "Warum er so wichtig ist",
        body: "Ohne Notgroschen fuehrt jede ungeplante Ausgabe in den Dispo oder zum Kredit – und der kostet Zinsen. Ein Notgroschen ist die Grundlage, auf der alles andere aufbaut: Sparen, Investieren, finanzielle Freiheit.",
      },
      {
        heading: "Psychologischer Effekt",
        body: "Allein das Wissen, dass du 3-6 Monatsgehälter auf der Seite hast, veraendert deine gesamte finanzielle Haltung. Du triffst ruhigere Entscheidungen, verhandelst besser und hast weniger Geld-Stress.",
      },
    ],
    keyTakeaway:
      "Ein Notgroschen ist nicht optional – er ist die Basis jedes gesunden Finanzlebens.",
    exercise:
      "Hast du bereits einen Notgroschen? Wenn ja, fuer wie viele Monate reicht er? Wenn nein, starte heute mit einem separaten Tagesgeld-Konto.",
  },
  "notgroschen-aufbauen::2": {
    summary:
      "Die richtige Hoehe deines Notgroschens haengt von deiner Lebenssituation ab – nicht von einer Faustregel.",
    sections: [
      {
        heading: "Die Standard-Empfehlung",
        body: "Als Faustregel gelten 3-6 Monats-Nettoeinkommen. Fuer Angestellte mit sicherem Job reichen 3 Monate. Fuer Selbststaendige, Alleinverdiener oder Familien sind 6 Monate oder mehr empfehlenswert.",
      },
      {
        heading: "Dein persoenliches Minimum berechnen",
        body: "Addiere deine absoluten Fixkosten (Miete, Versicherungen, Essen, Strom, Internet, Mindest-Tilgungen). Multipliziere mit 3 oder 6. Das ist dein Ziel. Beispiel: 1.800 Euro Fixkosten x 3 = 5.400 Euro Minimum.",
      },
      {
        heading: "Stufenplan",
        body: "Stufe 1: 1.000 Euro (fuer die haeufigsten Notfaelle). Stufe 2: 1 Monat Fixkosten. Stufe 3: 3 Monate. Stufe 4: 6 Monate. Feiere jede Stufe – sie gibt dir mehr Sicherheit.",
      },
    ],
    keyTakeaway:
      "Berechne deinen persoenlichen Notgroschen basierend auf deinen Fixkosten – nicht auf pauschalen Ratschlaegen.",
    exercise:
      "Berechne jetzt dein Notgroschen-Ziel: Liste deine monatlichen Fixkosten auf, multipliziere mit deinem Sicherheitsfaktor (3 oder 6).",
  },

  // ────────────────────────────────────────────────────────────────
  // ETF-Investieren
  // ────────────────────────────────────────────────────────────────
  "etf-investieren::1": {
    summary:
      "ETFs sind Koerbe voller Aktien, die du mit einem einzigen Kauf besitzen kannst – einfach, guenstig und breit diversifiziert.",
    sections: [
      {
        heading: "Was ist ein ETF?",
        body: "ETF steht fuer 'Exchange Traded Fund' – ein boersengehandelter Fonds. Statt einzelne Aktien zu kaufen, kaufst du einen Korb von Hunderten oder Tausenden Aktien auf einmal. Ein MSCI-World-ETF enthaelt z.B. ueber 1.500 Unternehmen aus 23 Laendern.",
      },
      {
        heading: "Warum ETFs so beliebt sind",
        body: "Drei Gruende: 1) Diversifikation – dein Risiko verteilt sich auf viele Unternehmen. 2) Geringe Kosten – typisch 0,1-0,3% pro Jahr statt 1,5% bei aktiven Fonds. 3) Einfachheit – ein einziger ETF kann als Basis-Investment genuegen.",
      },
      {
        heading: "ETFs vs. aktive Fonds",
        body: "Studien zeigen: Ueber 90% der aktiven Fondsmanager schlagen ihren Vergleichsindex nach Kosten nicht – weder ueber 5, 10 noch 20 Jahre. ETFs bilden den Index einfach nach und sind damit langfristig die bessere Wahl fuer die meisten Anleger.",
      },
    ],
    keyTakeaway:
      "ETFs sind das einfachste und kostenguenstigste Werkzeug, um breit gestreut an den Aktienmaerkten zu investieren.",
    exercise:
      "Suche den MSCI World ETF von iShares (ISIN: IE00B4L5Y983) und schau dir an, welche Unternehmen darin enthalten sind.",
  },
  "etf-investieren::2": {
    summary:
      "Aktien, Anleihen und ETFs haben unterschiedliche Eigenschaften – verstehe die Unterschiede, um klug zu kombinieren.",
    sections: [
      {
        heading: "Aktien: Anteile an Unternehmen",
        body: "Mit einer Aktie besitzt du einen Bruchteil eines Unternehmens. Aktien bieten die hoechste Rendite-Chance (historisch ca. 7-9% pro Jahr), aber auch das hoechste Risiko. Einzelne Aktien koennen komplett wertlos werden.",
      },
      {
        heading: "Anleihen: Kredite an Staaten oder Firmen",
        body: "Mit einer Anleihe leihst du Geld an einen Staat oder ein Unternehmen und erhaeltst dafuer Zinsen. Anleihen sind stabiler als Aktien, bringen aber weniger Rendite (historisch ca. 2-4%). Sie daempfen Schwankungen im Portfolio.",
      },
      {
        heading: "ETFs: Das Beste aus beiden Welten",
        body: "Es gibt Aktien-ETFs, Anleihen-ETFs und Misch-ETFs. Der Clou: Ein einziger Aktien-ETF auf den MSCI World gibt dir mehr Diversifikation als 99% der Einzel-Aktien-Portfolios. Fuer die meisten Anleger ist ein Aktien-ETF + ein Anleihen-ETF (oder Tagesgeld) voellig ausreichend.",
      },
    ],
    keyTakeaway:
      "Aktien fuer Rendite, Anleihen fuer Stabilitaet, ETFs fuer beides in einem – einfach und breit gestreut.",
    exercise:
      "Ueberlege: Wie wuerdest du 10.000 Euro auf Aktien-ETFs und Tagesgeld aufteilen? Dein Alter minus 100 ergibt einen guten Richtwert fuer den Aktien-Anteil.",
  },

  // ────────────────────────────────────────────────────────────────
  // Psychologie des Geldes
  // ────────────────────────────────────────────────────────────────
  "psychologie-des-geldes::1": {
    summary:
      "Finanzielle Entscheidungen sind nie rein rational – sie werden von unserer persoenlichen Geschichte, Emotionen und Erfahrungen geformt.",
    sections: [
      {
        heading: "Warum kluge Menschen dumme Geldentscheidungen treffen",
        body: "Ein Physikprofessor kann am Aktienmarkt panisch verkaufen. Eine Kassiererin kann systematisch ein Vermoegen aufbauen. Intelligenz und Finanzverhalten haben erstaunlich wenig miteinander zu tun. Entscheidend ist das Verhalten – nicht das Wissen.",
      },
      {
        heading: "Dein Geld-Weltbild ist einzigartig",
        body: "Jemand, der die Finanzkrise 2008 als Berufseinsteiger erlebt hat, sieht Aktien anders als jemand, der den Boom der 90er miterlebt hat. Deine persoenliche Erfahrung praegt dein Risikoverhalten staerker als jede Statistik.",
      },
      {
        heading: "Demut als Finanzstrategie",
        body: "Die wichtigste Erkenntnis: Niemand ist verrueckt. Jede Finanzentscheidung macht Sinn aus der Perspektive desjenigen, der sie trifft. Statt andere zu verurteilen, lerne daraus, wie unterschiedlich Geld-Erfahrungen sein koennen.",
      },
    ],
    keyTakeaway:
      "Geld ist nie nur Mathematik. Dein Verhalten mit Geld ist wichtiger als dein Wissen darueber.",
    exercise:
      "Welches pragende Geld-Erlebnis aus deiner Vergangenheit beeinflusst dein heutiges Finanzverhalten am staerksten?",
  },
  "psychologie-des-geldes::2": {
    summary:
      "Deine persoenliche Erfahrung praegt dein Risikoverhalten staerker als jede Statistik – und das ist normal.",
    sections: [
      {
        heading: "Erfahrung schlaegt Daten",
        body: "Studien zeigen: Menschen, die in Zeiten hoher Inflation aufgewachsen sind, kaufen weniger Aktien – selbst Jahrzehnte spaeter. Deine fruehen Geld-Erfahrungen formen ein Weltbild, das sich nur schwer durch rationale Argumente aendern laesst.",
      },
      {
        heading: "Das Generations-Problem",
        body: "Deine Grosseltern haben vielleicht alles in Sparbuecher gesteckt – wegen der Erfahrung von Krieg und Waehrungsreform. Deine Eltern setzen auf Immobilien. Du investierst in ETFs oder Krypto. Keine Generation liegt 'richtig' – jede reagiert auf ihre praegenden Erfahrungen.",
      },
      {
        heading: "Bewusst gegensteuern",
        body: "Du kannst deine Praegung nicht loeschen, aber du kannst sie erkennen und bewusst gegensteuern. Wer weiss, dass er aus Angst zu konservativ investiert, kann sich bewusst fuer etwas mehr Risiko entscheiden.",
      },
    ],
    keyTakeaway:
      "Erkenne, welche Erfahrungen dein Finanzverhalten praegen – und entscheide bewusst, ob du ihnen folgen willst.",
    exercise:
      "Frage 3 Menschen unterschiedlichen Alters in deinem Umfeld, wo sie ihr Geld anlegen und warum. Du wirst ueberrascht sein, wie unterschiedlich die Antworten sind.",
  },

  // ────────────────────────────────────────────────────────────────
  // Finanzielle Freiheit
  // ────────────────────────────────────────────────────────────────
  "finanzielle-freiheit::1": {
    summary:
      "Finanzielle Freiheit ist kein Kontostand – es ist der Punkt, an dem dein passives Einkommen deine Lebenshaltungskosten deckt.",
    sections: [
      {
        heading: "Die Definition",
        body: "Finanzielle Freiheit bedeutet: Du musst nicht mehr arbeiten, um deine Rechnungen zu bezahlen. Dein Vermoegen und deine Einkommensquellen generieren genug, um deinen Lebensstil zu finanzieren. Arbeiten wird zur Wahl, nicht zur Pflicht.",
      },
      {
        heading: "Was es nicht bedeutet",
        body: "Finanzielle Freiheit heisst nicht: eine Million auf dem Konto haben, nie wieder arbeiten oder luxurioes leben. Fuer viele bedeutet es einfach: die Freiheit, Nein sagen zu koennen – zum falschen Job, zum Stress, zur Abhaengigkeit.",
      },
      {
        heading: "Warum es fuer jeden erreichbar ist",
        body: "Es geht weniger um die Hoehe deines Einkommens als um die Luecke zwischen Einnahmen und Ausgaben. Wer 3.000 Euro verdient und 2.000 Euro braucht, kommt schneller zur finanziellen Freiheit als jemand mit 10.000 Euro Einkommen und 9.500 Euro Ausgaben.",
      },
    ],
    keyTakeaway:
      "Finanzielle Freiheit ist kein Luxusziel – es ist Selbstbestimmung. Und die Luecke zwischen Einnahmen und Ausgaben ist der Schluessel.",
    exercise:
      "Berechne deine persoenliche Freiheitszahl: Wie viel brauchst du monatlich zum Leben? Multipliziere mit 300 (basierend auf der 4%-Regel) – das ist dein Zielvermoegen.",
  },
  "finanzielle-freiheit::2": {
    summary:
      "Die erste Stufe der finanziellen Freiheit ist die Absicherung: genug Puffer, um ruhig schlafen zu koennen.",
    sections: [
      {
        heading: "Stufe 1: Finanzielle Absicherung",
        body: "Du hast einen Notgroschen von 3-6 Monatsausgaben. Deine wichtigsten Versicherungen stehen (Haftpflicht, BU). Du hast keine hochverzinsten Konsumschulden mehr. Du zahlst mindestens 10% deines Einkommens automatisch auf ein Sparkonto.",
      },
      {
        heading: "Warum diese Stufe so wichtig ist",
        body: "Ohne finanzielle Absicherung bist du immer im Ueberlebensmodus. Jede ungeplante Ausgabe wird zur Krise. Du kannst nicht investieren, weil du keinen Puffer hast. Diese Stufe ist das Fundament fuer alles Weitere.",
      },
      {
        heading: "Zeitrahmen",
        body: "Die meisten Menschen erreichen Stufe 1 in 6-12 Monaten, wenn sie es ernst meinen. Schneller geht es mit: Fixkosten optimieren, Nebeneinkommen aufbauen und konsequent dem Sparplan folgen.",
      },
    ],
    keyTakeaway:
      "Finanzielle Absicherung ist das Fundament. Ohne sie wirst du immer wieder auf Start zurueckgeworfen.",
    exercise:
      "Pruefe: Erfuellst du bereits alle Kriterien der Stufe 1? Wenn nicht, was fehlt noch und bis wann kannst du es erreichen?",
  },

  // ────────────────────────────────────────────────────────────────
  // Denkfallen bei Geldentscheidungen
  // ────────────────────────────────────────────────────────────────
  "denkfallen-geldentscheidungen::1": {
    summary:
      "Dein Gehirn hat zwei Denksysteme – und bei Geldentscheidungen wird meist das falsche aktiv.",
    sections: [
      {
        heading: "System 1 vs. System 2",
        body: "System 1 ist schnell, intuitiv und emotional. Es entscheidet in Millisekunden. System 2 ist langsam, analytisch und rational. Beim Shopping, an der Boerse und bei Finanzentscheidungen uebernimmt fast immer System 1 – mit teuren Folgen.",
      },
      {
        heading: "Typische System-1-Fehler bei Finanzen",
        body: "Du kaufst eine Aktie, weil sie letzte Woche gestiegen ist (Recency Bias). Du haeltst an einer Verlustposition fest, weil Verkaufen wehtut (Verlustaversion). Du glaubst Finanzberater, die selbstsicher auftreten (Autoritaetsbias).",
      },
      {
        heading: "System 2 aktivieren",
        body: "Die wichtigste Regel: Schlafe eine Nacht ueber jede Finanzentscheidung ueber 100 Euro. Dieses einfache Prinzip zwingt dein Gehirn, von System 1 auf System 2 umzuschalten.",
      },
    ],
    keyTakeaway:
      "Die meisten teuren Geldentscheidungen entstehen durch schnelles Denken. Langsam denken spart bares Geld.",
    exercise:
      "Denke an deine letzte Finanzentscheidung, die du bereust. War es eine schnelle (System 1) oder ueberlegte (System 2) Entscheidung?",
  },
  "denkfallen-geldentscheidungen::2": {
    summary:
      "Verlustaversion bedeutet: Der Schmerz eines Verlusts wiegt psychologisch doppelt so schwer wie die Freude eines gleich grossen Gewinns.",
    sections: [
      {
        heading: "Das Experiment",
        body: "Wuerdest du eine Muenze werfen: Kopf = du gewinnst 1.000 Euro, Zahl = du verlierst 1.000 Euro? Die meisten lehnen ab. Rational ist die Wette fair – aber emotional wiegt der potenzielle Verlust doppelt. Erst bei 2.000 Euro Gewinn-Chance sagen die meisten Ja.",
      },
      {
        heading: "Auswirkungen auf dein Portfolio",
        body: "Verlustaversion erklaert, warum Anleger Verlust-Aktien zu lange halten ('Es wird schon wieder') und Gewinn-Aktien zu frueh verkaufen ('Lieber den Gewinn sichern'). Diese Kombination ist nachweislich rendite-schaedlich.",
      },
      {
        heading: "Gegenmittel",
        body: "1) Automatisiere deine Investments (Sparplaene entfernen Emotion). 2) Schau hoechstens einmal im Monat ins Depot. 3) Definiere vorher klare Regeln: 'Ich rebalance einmal jaehrlich, unabhaengig von Kursen.'",
      },
    ],
    keyTakeaway:
      "Verlustaversion ist normal – aber wenn du sie erkennst, kannst du bewusst gegen sie handeln.",
    exercise:
      "Hast du Positionen im Depot, die du nur deshalb haeltst, weil du den Verlust nicht realisieren willst? Wuerdest du sie heute zum aktuellen Preis kaufen?",
  },

  // ────────────────────────────────────────────────────────────────
  // Boersenpsychologie verstehen
  // ────────────────────────────────────────────────────────────────
  "boersenpsychologie::1": {
    summary:
      "Boersen sind keine rationalen Maschinen – sie werden von Millionen emotionaler Entscheidungen getrieben.",
    sections: [
      {
        heading: "Maerkte und Emotionen",
        body: "Wenn Anleger panisch verkaufen, fallen Kurse weit unter den fairen Wert. Wenn Euphorie herrscht, steigen sie weit darueber. Die Fundamentaldaten aendern sich dabei oft kaum – nur die Stimmung.",
      },
      {
        heading: "Ueberreaktion als System",
        body: "Studien zeigen: Maerkte ueberreagieren systematisch auf schlechte Nachrichten und unterreagieren auf gute. Wer das versteht, kann davon profitieren – durch Geduld und Disziplin.",
      },
      {
        heading: "Die Masse liegt oft falsch",
        body: "Am Tiefpunkt einer Krise ist die Stimmung am schlechtesten – aber historisch war das oft der beste Zeitpunkt zum Kaufen. Am Hoch ist die Euphorie groessten – und das Risiko am hoechsten.",
      },
    ],
    keyTakeaway:
      "Boersen spiegeln nicht die Realitaet, sondern die kollektive Emotion. Wer das versteht, bleibt ruhiger.",
    exercise:
      "Schau dir den Kursverlauf des DAX waehrend der Corona-Krise an (Maerz 2020). Wie hat sich der Index 12 Monate spaeter entwickelt?",
  },
  "boersenpsychologie::2": {
    summary:
      "Gier und Angst sind die beiden staerksten Kraefte an der Boerse – und sie fuehren fast immer zu schlechten Entscheidungen.",
    sections: [
      {
        heading: "Angst: Der Fluchtinstinkt",
        body: "Bei einem Crash sinkt nicht der Wert deiner Unternehmen – sondern der Preis, den andere bereit sind zu zahlen. Angst fuehrt dazu, dass du genau dann verkaufst, wenn alles guenstig ist.",
      },
      {
        heading: "Gier: Der Herdentrieb",
        body: "Wenn alle kaufen und die Kurse steigen, fuehlt sich Nicht-Investieren an wie Verlieren. FOMO (Fear Of Missing Out) treibt Menschen dazu, am Hoch einzusteigen – oft kurz vor der Korrektur.",
      },
      {
        heading: "Der dritte Weg: Systematik",
        body: "Die Loesung ist ein regelbasiertes System: feste Sparplaene, definierte Rebalancing-Termine, klare Regeln fuer Nachkaeufe. Automation entfernt Emotion aus der Gleichung.",
      },
    ],
    keyTakeaway:
      "Wer Angst und Gier erkennt, kann gegen sie handeln. Automatisierung ist der beste Schutz.",
    exercise:
      "Hattest du schon einmal einen FOMO-Moment an der Boerse? Was haette ein fester Sparplan in der Situation geaendert?",
  },

  // ────────────────────────────────────────────────────────────────
  // Krisensicheres Portfolio
  // ────────────────────────────────────────────────────────────────
  "krisensicheres-portfolio::1": {
    summary:
      "Ein robustes Portfolio ueberlebt nicht nur gute Zeiten, sondern vor allem Krisen – ohne dass du aktiv eingreifen musst.",
    sections: [
      {
        heading: "Robust vs. optimal",
        body: "Das 'beste' Portfolio fuer die Vergangenheit ist leicht zu finden. Aber die Zukunft ist unbekannt. Ein robustes Portfolio ist nicht das renditestaerkste – sondern das, das in jedem Szenario funktioniert.",
      },
      {
        heading: "Die drei Saeulen",
        body: "1) Diversifikation ueber Anlageklassen (Aktien, Anleihen, Rohstoffe, Immobilien). 2) Diversifikation ueber Regionen (Welt statt Heimatland). 3) Diversifikation ueber die Zeit (regelmaessig investieren statt Market Timing).",
      },
      {
        heading: "Einfachheit gewinnt",
        body: "Ein Portfolio aus 2-3 ETFs (Welt-Aktien, Anleihen, ggf. Rohstoffe) schlaegt langfristig die meisten komplizierten Strategien. Komplexitaet fuehrt zu Fehlern, Einfachheit zu Disziplin.",
      },
    ],
    keyTakeaway:
      "Das beste Portfolio ist das einfachste, das du in jeder Krise durchhaeltst.",
    exercise:
      "Skizziere dein ideales 3-ETF-Portfolio: Wie wuerdest du 100% auf Aktien-Welt, Anleihen und ggf. Rohstoffe aufteilen?",
  },
  "krisensicheres-portfolio::2": {
    summary:
      "Die Wirtschaft bewegt sich in Zyklen – wer die vier Jahreszeiten versteht, kann sein Portfolio auf alle vorbereiten.",
    sections: [
      {
        heading: "Die vier wirtschaftlichen Jahreszeiten",
        body: "1) Wachstum + steigende Inflation: Rohstoffe und Aktien profitieren. 2) Wachstum + fallende Inflation: Aktien und Anleihen profitieren. 3) Rezession + steigende Inflation (Stagflation): Gold und inflationsgeschuetzte Anleihen. 4) Rezession + fallende Inflation: Langfristige Anleihen.",
      },
      {
        heading: "Warum das wichtig ist",
        body: "Niemand weiss, welche Jahreszeit als naechstes kommt. Deshalb sollte dein Portfolio fuer alle vier vorbereitet sein. Das ist der Kern der Allwetter-Strategie.",
      },
      {
        heading: "Praktische Umsetzung",
        body: "Du brauchst nicht jede Jahreszeit perfekt abzudecken. Ein Mix aus Welt-Aktien (60%), Anleihen (30%) und Gold/Rohstoffe (10%) ist ein solider Startpunkt. Passe die Gewichtung an dein Alter und deine Risikobereitschaft an.",
      },
    ],
    keyTakeaway:
      "Bereite dein Portfolio auf alle Szenarien vor – nicht nur auf das wahrscheinlichste.",
    exercise:
      "In welcher wirtschaftlichen 'Jahreszeit' befinden wir uns deiner Meinung nach gerade? Ist dein Portfolio darauf vorbereitet?",
  },

  // ────────────────────────────────────────────────────────────────
  // Investor-Denken
  // ────────────────────────────────────────────────────────────────
  "investor-denken::1": {
    summary:
      "Ein Vermoegenswert bringt dir Geld ein. Eine Verbindlichkeit kostet dich Geld. Die meisten verwechseln beides.",
    sections: [
      {
        heading: "Die einfachste Definition",
        body: "Vermoegenswert: bringt Geld in deine Tasche (Mietwohnung, Dividenden-Aktien, Geschaeft). Verbindlichkeit: nimmt Geld aus deiner Tasche (Autokredit, Konsumschulden, teure Gadgets). Dein Eigenheim? Es kommt drauf an – Nebenkosten, Instandhaltung und Zinsen zaehlen.",
      },
      {
        heading: "Warum diese Unterscheidung entscheidend ist",
        body: "Wohlhabende Menschen kaufen Vermoegenswerte. Menschen in der Mittelschicht kaufen Verbindlichkeiten und glauben, es seien Vermoegenswerte. Das neue Auto, das Upgrade-Handy, die Designermoebel – sie verlieren an Wert und kosten Unterhalt.",
      },
      {
        heading: "Dein persoenlicher Vermoegenscheck",
        body: "Liste alles auf, was du besitzt. Frage dich bei jedem Posten: Bringt es mir Geld ein oder kostet es mich Geld? Das Verhaeltnis zeigt dir, wie ein Investor du bereits denkst.",
      },
    ],
    keyTakeaway:
      "Konzentriere dich darauf, Vermoegenswerte zu sammeln – sie sind dein Weg aus dem Hamsterrad.",
    exercise:
      "Erstelle zwei Listen: Links deine Vermoegenswerte (was Geld einbringt), rechts deine Verbindlichkeiten (was Geld kostet). Welche Seite ist laenger?",
  },
  "investor-denken::2": {
    summary:
      "Die meisten Menschen kennen nur eine Einkommens-Art. Wohlhabende nutzen alle vier.",
    sections: [
      {
        heading: "Die vier Einkommens-Typen",
        body: "1) Angestellten-Einkommen: Du tauschst Zeit gegen Geld. 2) Selbststaendigen-Einkommen: Du arbeitest fuer dich, aber immer noch Zeit gegen Geld. 3) Unternehmer-Einkommen: Ein System arbeitet fuer dich. 4) Investor-Einkommen: Dein Geld arbeitet fuer dich.",
      },
      {
        heading: "Warum die rechte Seite gewinnt",
        body: "Angestellte und Selbststaendige zahlen die hoechsten Steuern und haben die wenigste Freiheit. Unternehmer und Investoren haben steuerliche Vorteile und Hebelwirkung. Der Weg muss nicht radikal sein – auch als Angestellter kannst du Investor-Einkommen aufbauen.",
      },
      {
        heading: "Der Uebergang",
        body: "Starte als Angestellter, spare und investiere konsequent (Investor). Baue nebenbei etwas auf, das ohne dich funktioniert (Unternehmer). Du musst nicht kuendigen – du musst Einkommensquellen diversifizieren.",
      },
    ],
    keyTakeaway:
      "Finanzielle Freiheit entsteht, wenn du von der linken Seite (aktiv) zur rechten Seite (passiv) wechselst.",
    exercise:
      "Aus welchen Quellen beziehst du Einkommen? Welche Schritte koenntest du unternehmen, um eine passive Einkommensquelle hinzuzufuegen?",
  },

  // ────────────────────────────────────────────────────────────────
  // Zeitlose Geld-Prinzipien
  // ────────────────────────────────────────────────────────────────
  "zeitlose-geldprinzipien::1": {
    summary:
      "Die einfachste und wirksamste Finanzregel existiert seit ueber 4.000 Jahren: Lege mindestens 10% zurueck.",
    sections: [
      {
        heading: "Die aelteste Finanzregel",
        body: "Bereits in babylonischen Tontafeln aus 2.500 v. Chr. steht: 'Ein Teil von allem, was du verdienst, gehoert dir.' Gemeint: Bevor du andere bezahlst (Vermieter, Supermarkt, Netflix), bezahle dich selbst.",
      },
      {
        heading: "Warum 10% funktionieren",
        body: "10% sind spuerbar genug, um den Unterschied zu machen, aber niedrig genug, um den Lebensstil nicht einzuschraenken. Wer 3.000 Euro netto verdient, legt 300 Euro zurueck. Bei 7% Rendite sind das nach 30 Jahren ueber 340.000 Euro.",
      },
      {
        heading: "Automatisierung ist der Schluessel",
        body: "Richte einen Dauerauftrag ein, der am Gehaltstag 10% auf dein Sparkonto ueberweist. Was du nicht siehst, vermisst du nicht. Nach 2-3 Monaten passt sich dein Ausgabeverhalten automatisch an.",
      },
    ],
    keyTakeaway:
      "Lege mindestens 10% jedes Einkommens automatisch zurueck – bevor du irgendetwas anderes bezahlst.",
    exercise:
      "Berechne 10% deines Nettoeinkommens. Richte noch heute einen automatischen Dauerauftrag ein.",
  },
  "zeitlose-geldprinzipien::2": {
    summary:
      "Geld unter dem Kopfkissen verliert jedes Jahr an Wert. Investiertes Geld arbeitet rund um die Uhr fuer dich.",
    sections: [
      {
        heading: "Der Feind: Inflation",
        body: "Bei 3% Inflation verliert dein Geld in 24 Jahren die Haelfte seiner Kaufkraft. 10.000 Euro heute sind in 24 Jahren nur noch 5.000 Euro wert – wenn sie auf dem Girokonto liegen.",
      },
      {
        heading: "Der Verbundete: Zinseszins",
        body: "Albert Einstein nannte den Zinseszins das 'achte Weltwunder'. 10.000 Euro, die 30 Jahre lang mit 7% wachsen, werden zu ueber 76.000 Euro. Nicht weil du viel eingezahlt hast, sondern weil dein Geld Geld verdient hat, das wiederum Geld verdient.",
      },
      {
        heading: "Praktisch umsetzen",
        body: "Dein gespartes Geld muss mindestens die Inflation schlagen. Das bedeutet: Weg vom Girokonto, hin zu Tagesgeld (Minimum) oder besser: einem breit gestreuten Aktien-ETF (langfristig 7-9% Rendite).",
      },
    ],
    keyTakeaway:
      "Geld, das nicht arbeitet, verliert an Wert. Investiere es, damit es fuer dich arbeitet.",
    exercise:
      "Wie viel Geld liegt aktuell auf deinem Girokonto, das du in den naechsten 6 Monaten nicht brauchst? Das ist Geld, das fuer dich arbeiten koennte.",
  },

  // ────────────────────────────────────────────────────────────────
  // Paar-Finanzen
  // ────────────────────────────────────────────────────────────────
  "paar-finanzen::1": {
    summary:
      "Geld ist der haeufigste Streitgrund in Beziehungen. Offene Kommunikation ist die beste Praevention.",
    sections: [
      {
        heading: "Warum Geld-Gespraeche so schwer sind",
        body: "Geld ist mit Scham, Kontrolle und Machtgefuehlen verknuepft. Viele Paare vermeiden Geld-Gespraeche – bis es zu spaet ist. Dabei ist offene Kommunikation ueber Finanzen einer der staerksten Beziehungsschuetzer.",
      },
      {
        heading: "Das erste Geld-Gespraech",
        body: "Setzt euch entspannt zusammen und beantwortet je drei Fragen: Was bedeutet Geld fuer dich? Was ist dein groesstes finanzielles Ziel? Wovor hast du finanziell Angst? Zuhoeren, nicht bewerten.",
      },
      {
        heading: "Regelmaessigkeit schlaegt Intensitaet",
        body: "Ein monatlicher 15-Minuten-Check ueber Finanzen verhindert Konflikte besser als ein jaehrliches Marathon-Gespraech. Macht es zum Ritual – mit einem Glas Wein oder beim Sonntagsfruehstueck.",
      },
    ],
    keyTakeaway:
      "Redet frueh und regelmaessig ueber Geld – es ist der beste Schutz vor Beziehungskonflikten.",
    exercise:
      "Plant fuer diese Woche euer erstes (oder naechstes) Geld-Gespraech. Nutzt die drei Fragen als Einstieg.",
  },
  "paar-finanzen::2": {
    summary:
      "Es gibt drei bewaehrte Kontenmodelle fuer Paare – jedes mit eigenen Vor- und Nachteilen.",
    sections: [
      {
        heading: "Modell 1: Alles gemeinsam",
        body: "Ein gemeinsames Konto fuer alles. Vorteil: Volle Transparenz, einfache Verwaltung. Nachteil: Wenig finanzielle Unabhaengigkeit. Passt fuer: Paare mit aehnlichem Einkommen und gleichen Werten.",
      },
      {
        heading: "Modell 2: Drei-Konten-Modell",
        body: "Jeder hat ein eigenes Konto plus ein gemeinsames fuer geteilte Ausgaben. Beide zahlen einen festen Betrag (oder Prozentsatz) ein. Vorteil: Gemeinsam wirtschaften und trotzdem eigene Freiheit. Das beliebteste Modell.",
      },
      {
        heading: "Modell 3: Komplett getrennt",
        body: "Jeder verwaltet sein Geld selbst, Rechnungen werden aufgeteilt. Vorteil: Maximale Unabhaengigkeit. Nachteil: Kann zu 'Mein Geld, dein Geld'-Denken fuehren. Passt fuer: Frische Beziehungen oder Paare mit sehr unterschiedlichen Finanzkulturen.",
      },
    ],
    keyTakeaway:
      "Es gibt kein perfektes Modell – nur das, das zu euch passt. Wichtig ist, bewusst zu waehlen.",
    exercise:
      "Welches Modell nutzt ihr aktuell? Besprecht gemeinsam: Passt es noch oder waere ein anderes besser?",
  },
  "paar-finanzen::3": {
    summary:
      "50/50 klingt fair, ist aber oft ungerecht. Prozentuale Aufteilung nach Einkommen ist fairer.",
    sections: [
      {
        heading: "Das Problem mit 50/50",
        body: "Wenn einer 2.000 Euro netto verdient und der andere 4.000, dann sind 750 Euro gemeinsame Kosten fuer den einen 37,5% des Einkommens, fuer den anderen nur 18,75%. Gleicher Betrag ist nicht gleiche Belastung.",
      },
      {
        heading: "Prozentuale Aufteilung",
        body: "Fairer: Beide zahlen den gleichen Prozentsatz ihres Einkommens. Bei 1.500 Euro gemeinsamen Kosten und einem Gesamteinkommen von 6.000 Euro sind das 25%. Person A zahlt 500 Euro (25% von 2.000), Person B zahlt 1.000 Euro (25% von 4.000).",
      },
      {
        heading: "Jenseits der Zahlen",
        body: "Fairness hat auch nicht-monetaere Dimensionen: Wer mehr Care-Arbeit leistet, investiert Zeit statt Geld in die Partnerschaft. Besprecht auch diese unsichtbare Arbeit.",
      },
    ],
    keyTakeaway:
      "Fairness heisst nicht gleicher Betrag, sondern gleiche Belastung – teilt prozentual.",
    exercise:
      "Berechnet eure faire Aufteilung: Gesamteinkommen, Gesamtkosten, prozentualer Anteil jeder Person.",
  },
  "paar-finanzen::4": {
    summary:
      "Gemeinsame Finanzziele geben eurer Beziehung eine finanzielle Richtung – und machen Sparen motivierender.",
    sections: [
      {
        heading: "Warum gemeinsame Ziele so kraftvoll sind",
        body: "Ein Paar, das gemeinsam auf eine Weltreise spart, verzichtet leichter auf Impulse als zwei Einzelpersonen. Gemeinsame Ziele verwandeln Verzicht in Vorfreude.",
      },
      {
        heading: "Ziel-Typen fuer Paare",
        body: "Kurzfristig (1 Jahr): Urlaub, Notgroschen, schuldenfrei werden. Mittelfristig (2-5 Jahre): Eigenkapital fuer Wohnung, groessere Anschaffung. Langfristig (5+ Jahre): Eigenheim, finanzielle Freiheit, Familienplanung.",
      },
      {
        heading: "Die Umsetzung",
        body: "Richtet ein gemeinsames Unterkonto ein, das ihr 'Traumkonto' nennt. Definiert den Zielbetrag und den Zeithorizont. Richtet beide einen automatischen Dauerauftrag ein. Feiert Meilensteine gemeinsam.",
      },
    ],
    keyTakeaway:
      "Gemeinsame Finanzziele staerken die Beziehung und machen Sparen zum Teamsport.",
    exercise:
      "Definiert gemeinsam ein kurzfristiges und ein langfristiges Finanzziel. Was ist der erste Schritt?",
  },
  "paar-finanzen::5": {
    summary:
      "Ein monatlicher Finanz-Check als Ritual beugt Missverstaendnissen vor und haelt euch auf Kurs.",
    sections: [
      {
        heading: "Der Geld-Date Ablauf",
        body: "1) Gemeinsam Kontostaende checken (5 Min). 2) Letzen Monat reviewen: Wo lagen wir ueber/unter Budget? (5 Min). 3) Naechsten Monat planen: Besondere Ausgaben? (3 Min). 4) Fortschritt bei Zielen feiern (2 Min).",
      },
      {
        heading: "Tipps fuer ein gutes Geld-Gespraech",
        body: "Kein Vorwerfen, kein Schuldzuweisen. Nutzt 'Wir'-Sprache statt 'Du'-Sprache. Macht es gemuetlich – es soll kein Verhoer sein. Wenn es emotional wird, macht eine Pause und redet spaeter weiter.",
      },
      {
        heading: "Der jaehrliche Finanz-Review",
        body: "Einmal im Jahr groesser denken: Versicherungen pruefen, Anlagestrategie reviewen, Ziele fuer das neue Jahr setzen. Viele Paare machen das zwischen Weihnachten und Neujahr.",
      },
    ],
    keyTakeaway:
      "15 Minuten im Monat reichen, um als Paar finanziell auf Kurs zu bleiben.",
    exercise:
      "Tragt jetzt euer erstes monatliches Geld-Date in den Kalender ein. Wiederkehrend, gleicher Tag.",
  },
  "paar-finanzen::6": {
    summary:
      "Niemand plant eine Trennung – aber finanzielle Vorsorge ist keine Misstrauenserklaerung, sondern Verantwortung.",
    sections: [
      {
        heading: "Finanzielle Unabhaengigkeit bewahren",
        body: "Auch in einer gluecklichen Beziehung sollte jeder genug eigenes Geld haben, um 3 Monate unabhaengig leben zu koennen. Das ist kein Misstrauen – es ist Selbstfuersorge.",
      },
      {
        heading: "Gemeinsame Vertraege pruefen",
        body: "Wisst ihr, was bei einer Trennung mit dem gemeinsamen Mietvertrag, dem Bausparvertrag oder dem gemeinsamen Depot passiert? Klaert das jetzt, wenn ihr euch gut versteht – nicht im Streit.",
      },
      {
        heading: "Ehe vs. Partnerschaft",
        body: "Unverheiratete Paare haben kaum gesetzlichen Schutz. Kein automatisches Erbrecht, keine Hinterbliebenenrente, keine Vermoegens-Aufteilung. Wer nicht heiraten moechte, sollte einen Partnerschaftsvertrag in Betracht ziehen.",
      },
    ],
    keyTakeaway:
      "Finanzielle Vorsorge fuer den Ernstfall ist ein Zeichen von Reife – nicht von Misstrauen.",
    exercise:
      "Prueft gemeinsam: Hat jeder ein eigenes Konto mit Notgroschen? Sind die wichtigsten Vertraege klar geregelt?",
  },

  // ────────────────────────────────────────────────────────────────
  // Krypto verstehen
  // ────────────────────────────────────────────────────────────────
  "krypto-grundlagen::1": {
    summary:
      "Blockchain ist die Technologie hinter Krypto – eine dezentrale, faelschungssichere Datenbank.",
    sections: [
      {
        heading: "Was ist eine Blockchain?",
        body: "Stell dir eine Blockchain als digitales Kassenbuch vor, das tausende Kopien auf Computern weltweit hat. Jede Transaktion wird in einem 'Block' gespeichert, der mit dem vorherigen verkettet ist. Manipulation ist praktisch unmoeglich, weil man alle Kopien gleichzeitig aendern muesste.",
      },
      {
        heading: "Dezentral = kein Mittelsmann",
        body: "Bei einer normalen Ueberweisung braucht es eine Bank als Vermittler. Blockchain ermoeglicht Transaktionen direkt zwischen zwei Parteien – ohne Bank, ohne Gebuehren-Mittelsmann. Deshalb ist die Technologie revolutionaer.",
      },
      {
        heading: "Jenseits von Krypto",
        body: "Blockchain hat Anwendungen weit ueber Kryptowaehrungen hinaus: digitale Identitaet, Supply-Chain-Tracking, Smart Contracts, dezentrale Finanzen (DeFi). Die Technologie ist langfristig wichtiger als jeder einzelne Coin.",
      },
    ],
    keyTakeaway:
      "Blockchain ist eine revolutionaere Technologie – unabhaengig davon, was einzelne Krypto-Kurse machen.",
    exercise:
      "Erklaere einem Freund in 2 Saetzen, was eine Blockchain ist, ohne das Wort 'Krypto' zu benutzen.",
  },
  "krypto-grundlagen::2": {
    summary:
      "Bitcoin ist die erste und groesste Kryptowaehrung – mit Eigenschaften von Gold und gleichzeitig extremer Volatilitaet.",
    sections: [
      {
        heading: "Was macht Bitcoin besonders?",
        body: "Bitcoin hat eine festgelegte Maximalmenge: 21 Millionen Stueck. Wie Gold ist es knapp – aber digital, teilbar und weltweit transferierbar. Befuerworter sehen es als Wertspeicher gegen Inflation, Kritiker als spekulative Blase.",
      },
      {
        heading: "Die Risiken",
        body: "Bitcoin kann in wenigen Tagen 30-40% an Wert verlieren. Die Regulierung ist weltweit uneinheitlich. Es gibt keinen Kundenschutz – wenn du dein Passwort verlierst, ist dein Geld weg. Der Energieverbrauch ist enorm.",
      },
      {
        heading: "Bitcoin als Portfolio-Beimischung",
        body: "Viele Experten empfehlen maximal 1-5% des Portfolios in Bitcoin. So profitierst du von potenziellen Gewinnen, ohne bei einem Totalverlust finanziell ruiniert zu sein. Investiere nur Geld, das du komplett verlieren koenntest.",
      },
    ],
    keyTakeaway:
      "Bitcoin ist faszinierend, aber hochriskant. Maximal 1-5% des Portfolios – und nur Geld, das du verlieren kannst.",
    exercise:
      "Wenn du 10.000 Euro investierst und 3% in Bitcoin steckst (300 Euro) – wie wuerde sich ein 50% Kursrueckgang auf dein Gesamtportfolio auswirken?",
  },

  // ────────────────────────────────────────────────────────────────
  // Versicherungen optimieren
  // ────────────────────────────────────────────────────────────────
  "versicherungen-optimieren::1": {
    summary:
      "Nicht jede Versicherung ist noetig – aber die wichtigen koennen deine Existenz schuetzen.",
    sections: [
      {
        heading: "Pflichtversicherungen",
        body: "Krankenversicherung (GKV oder PKV) und Kfz-Haftpflicht (wenn du ein Auto hast) sind gesetzlich vorgeschrieben. Hier hast du keine Wahl – aber du kannst den Anbieter und Tarif optimieren.",
      },
      {
        heading: "Existenzielle Versicherungen",
        body: "Private Haftpflicht und Berufsunfaehigkeitsversicherung sind freiwillig, aber essenziell. Eine einzige unversicherte Haftpflichtsituation kann dich finanziell ruinieren. Ein BU-Fall ohne Versicherung bedeutet oft Altersarmut.",
      },
      {
        heading: "Ueberfluessige Versicherungen",
        body: "Handy-Versicherung, Brillen-Versicherung, Reisegepaeck-Versicherung – kleine Risiken, die du besser selbst traegst. Faustregel: Versichere nur, was dich finanziell ruinieren koennte. Alles andere zahlst du aus der Tasche.",
      },
    ],
    keyTakeaway:
      "Versichere die grossen, existenziellen Risiken – und spare dir die kleinen Policen.",
    exercise:
      "Liste alle deine aktuellen Versicherungen auf. Markiere, welche existenziell wichtig sind und welche du kuendigen koenntest.",
  },
  "versicherungen-optimieren::2": {
    summary:
      "Die private Haftpflichtversicherung kostet wenig, schuetzt aber vor dem groessten finanziellen Risiko.",
    sections: [
      {
        heading: "Warum sie so wichtig ist",
        body: "Du stolperst und stoesstst jemanden auf die Strasse. Ein Kind laeuft vor dein Fahrrad. Du verursachst einen Wasserschaden in der Mietwohnung. In Deutschland haftest du unbegrenzt mit deinem gesamten Vermoegen – auch zukuenftigem Einkommen.",
      },
      {
        heading: "Was sie kostet",
        body: "Eine gute Privathaftpflicht kostet 50-80 Euro pro Jahr fuer Einzelpersonen, 70-120 Euro fuer Familien. Fuer diesen Preis bist du gegen Schaeden bis 10 Millionen Euro und mehr abgesichert.",
      },
      {
        heading: "Worauf achten",
        body: "Deckungssumme mindestens 10 Mio. Euro. Schluesselschaeden eingeschlossen. Gefaelligkeitsschaeden abgedeckt. Deliktunfaehige Kinder mitversichert (bei Familien). Vergleiche jaehrlich – es gibt grosse Preisunterschiede bei gleicher Leistung.",
      },
    ],
    keyTakeaway:
      "Die Haftpflichtversicherung ist die wichtigste freiwillige Versicherung – fuer unter 100 Euro im Jahr.",
    exercise:
      "Hast du eine Haftpflichtversicherung? Wenn ja, pruefe die Deckungssumme und ob Schluesselschaeden eingeschlossen sind.",
  },

  // ────────────────────────────────────────────────────────────────
  // Steuern fuer Arbeitnehmer
  // ────────────────────────────────────────────────────────────────
  "steuern-fuer-arbeitnehmer::1": {
    summary:
      "Die Einkommensteuer ist die wichtigste Steuer fuer Arbeitnehmer – und bietet die meisten Gestaltungsmoeglichkeiten.",
    sections: [
      {
        heading: "So funktioniert die Einkommensteuer",
        body: "Die Einkommensteuer ist progressiv: Je mehr du verdienst, desto hoeher der Steuersatz – aber nur fuer den Teil ueber der jeweiligen Grenze. Der Grundfreibetrag (ca. 11.600 Euro in 2024) bleibt steuerfrei. Danach steigt der Satz von 14% bis maximal 45%.",
      },
      {
        heading: "Brutto vs. Netto verstehen",
        body: "Von deinem Bruttolohn werden abgezogen: Einkommensteuer, Solidaritaetszuschlag (ggf.), Kirchensteuer (ggf.) und Sozialabgaben (Rente, Kranken, Pflege, Arbeitslosenversicherung). Sozialabgaben machen oft mehr aus als die Steuer selbst.",
      },
      {
        heading: "Steuerklaerung lohnt sich fast immer",
        body: "Im Durchschnitt bekommen Arbeitnehmer ueber 1.000 Euro zurueck. Dein Arbeitgeber rechnet mit Pauschalen – deine tatsaechlichen Ausgaben koennen hoeher sein. Die Steuererklaerung ist keine Pflicht (meist), aber fast immer finanziell lohnend.",
      },
    ],
    keyTakeaway:
      "Verstehe dein Steuersystem – und hole dir zurueck, was dir zusteht.",
    exercise:
      "Schaue auf deine letzte Gehaltsabrechnung: Wie viel Prozent deines Bruttos geht an Steuern, wie viel an Sozialabgaben?",
  },

  // ────────────────────────────────────────────────────────────────
  // Steuern fuer Freelancer
  // ────────────────────────────────────────────────────────────────
  "steuern-fuer-freelancer::1": {
    summary:
      "Gewerbe und Freiberuf werden steuerlich unterschiedlich behandelt – die richtige Einordnung spart bares Geld.",
    sections: [
      {
        heading: "Freiberufler vs. Gewerbetreibende",
        body: "Freiberufler (Aerzte, Anwaelte, Kuenstler, Berater, IT-Entwickler, Journalisten) zahlen keine Gewerbesteuer und brauchen kein Gewerbe anmelden. Gewerbetreibende (Haendler, Gastronomen, viele Online-Unternehmer) zahlen Gewerbesteuer ab ca. 24.500 Euro Gewinn.",
      },
      {
        heading: "Warum die Unterscheidung wichtig ist",
        body: "Die Gewerbesteuer kann ab mittleren Gewinnen mehrere Tausend Euro im Jahr betragen. Ausserdem bringt ein Gewerbe Pflichtmitgliedschaft in der IHK mit sich. Freiberufler haben weniger buerokratische Pflichten.",
      },
      {
        heading: "Im Zweifel: Finanzamt fragen",
        body: "Die Grenze ist nicht immer klar – besonders bei digitalen Berufen. Manche Taetigkeiten sind je nach Auspraegung freiberuflich oder gewerblich. Das Finanzamt entscheidet verbindlich – frage lieber vorher als nachher.",
      },
    ],
    keyTakeaway:
      "Pruefe frueh, ob du freiberuflich oder gewerblich taetig bist – es hat erhebliche steuerliche Konsequenzen.",
    exercise:
      "Recherchiere, ob deine Taetigkeit als Freiberuf oder Gewerbe gilt. Tipp: Der Katalog der freien Berufe im Einkommensteuergesetz (§18 EStG) hilft.",
  },
  "steuern-fuer-freelancer::2": {
    summary:
      "Die Einnahmen-Ueberschuss-Rechnung (EUeR) ist die einfachste Gewinnermittlung fuer Selbststaendige.",
    sections: [
      {
        heading: "Das Prinzip",
        body: "EUeR ist simpel: Einnahmen minus Ausgaben = Gewinn. Keine Bilanz, keine doppelte Buchfuehrung. Aufzeichnungspflicht: Jede Einnahme und Ausgabe dokumentieren, Belege aufheben. Das Finanzamt akzeptiert die EUeR bei Umsaetzen unter 600.000 Euro und Gewinn unter 60.000 Euro.",
      },
      {
        heading: "Zuflussprinzip",
        body: "Entscheidend ist der Zeitpunkt des Geldflusses: Rechnest du im Dezember ab, zahlst du die Steuer fuer dieses Jahr nur, wenn das Geld auch in diesem Jahr eingeht. Geht es erst im Januar ein, zaehlt es fuer das naechste Jahr.",
      },
      {
        heading: "Praktische Umsetzung",
        body: "Nutze eine einfache Buchhaltungssoftware (Lexoffice, SevDesk, FastBill) oder eine Tabelle. Erfasse: Datum, Betrag, Kategorie, Beleg-Nummer. Am Jahresende generiert die Software deine EUeR automatisch.",
      },
    ],
    keyTakeaway:
      "Die EUeR ist einfach: Einnahmen minus Ausgaben. Halte Belege sauber und nutze Software.",
    exercise:
      "Richte dir eine einfache Tabelle ein mit den Spalten: Datum, Beschreibung, Einnahme, Ausgabe, Kategorie. Erfasse die letzten 5 geschaeftlichen Transaktionen.",
  },

  // ────────────────────────────────────────────────────────────────
  // Passives Einkommen
  // ────────────────────────────────────────────────────────────────
  "passives-einkommen::1": {
    summary:
      "Passives Einkommen ist nicht wirklich 'passiv' – es erfordert Vorarbeit, die sich danach langfristig auszahlt.",
    sections: [
      {
        heading: "Die ehrliche Definition",
        body: "Passives Einkommen fliesst, ohne dass du aktiv dafuer arbeiten musst – nachdem du einmalig Arbeit, Geld oder beides investiert hast. Es ist nicht 'Geld fuer nichts tun', sondern 'Geld fuer Arbeit, die du schon getan hast'.",
      },
      {
        heading: "Echtes vs. falsches passives Einkommen",
        body: "Echt: Dividenden, Mieteinnahmen, Buch-Tantiemen, Software-Lizenzen. Falsch: Trading (das ist aktive Arbeit), MLM/Network Marketing (das ist Vertrieb), 'passives Einkommen'-Kurse die sich als passiv vermarkten.",
      },
      {
        heading: "Der Aufbau dauert",
        body: "Erwarte keine schnellen Ergebnisse. Ein Dividenden-Portfolio braucht Jahre zum Aufbau. Ein Buch schreiben dauert Monate. Eine Mietwohnung erfordert Kapital. Aber: Einmal aufgebaut, arbeitet das System fuer dich.",
      },
    ],
    keyTakeaway:
      "Passives Einkommen erfordert Vorarbeit – aber es ist die einzige Art von Einkommen, die skaliert, ohne deine Zeit zu binden.",
    exercise:
      "Welche Faehigkeiten oder Ressourcen hast du, die sich in eine passive Einkommensquelle verwandeln liessen?",
  },
  "passives-einkommen::2": {
    summary:
      "Es gibt vier grundlegende Arten von Einkommen. Finanzielle Freiheit entsteht, wenn du von aktiv zu passiv wechselst.",
    sections: [
      {
        heading: "Lineares Einkommen",
        body: "Du tauschst 1 Stunde Arbeit gegen X Euro. Das ist ein Gehalt, Stundenlohn oder Honorar. Problem: Es gibt nur 24 Stunden am Tag. Dein Einkommen hat eine natuerliche Obergrenze.",
      },
      {
        heading: "Hebelwirkung auf Einkommen",
        body: "Du multiplizierst deine Arbeit durch Systeme: Ein Buch schreibst du einmal und verkaufst es tausendmal. Software entwickelst du einmal und lizenzierst sie an viele. Du entkoppelst Zeit von Einkommen.",
      },
      {
        heading: "Portfolio-Einkommen",
        body: "Dein Geld arbeitet fuer dich: Dividenden, Zinsen, Wertsteigerungen. Das ist der klassische Investoren-Weg. Er erfordert Kapital, aber keine zusaetzliche Arbeitszeit.",
      },
    ],
    keyTakeaway:
      "Der Uebergang von linearem zu gehebetlem und Portfolio-Einkommen ist der Schluessel zu finanzieller Freiheit.",
    exercise:
      "Wie viel deines aktuellen Einkommens ist linear (Zeit gegen Geld) und wie viel ist passiv? Welchen ersten Schritt koenntest du Richtung passiv machen?",
  },

  // ────────────────────────────────────────────────────────────────
  // Fortgeschrittenes Investieren
  // ────────────────────────────────────────────────────────────────
  "fortgeschrittenes-investing::1": {
    summary:
      "Die Moderne Portfoliotheorie zeigt: Diversifikation ist das einzige 'Free Lunch' beim Investieren.",
    sections: [
      {
        heading: "Harry Markowitz und die Erkenntnis",
        body: "1952 bewies Harry Markowitz mathematisch: Durch geschickte Kombination von Anlagen kann man bei gleichem Risiko mehr Rendite erzielen – oder bei gleicher Rendite weniger Risiko haben. Dafuer erhielt er den Nobelpreis.",
      },
      {
        heading: "Was das praktisch bedeutet",
        body: "Zwei Aktien mit je 10% Rendite und 20% Volatilitaet ergeben kombiniert immer noch 10% Rendite – aber weniger als 20% Volatilitaet, solange sie sich nicht perfekt gleich bewegen. Je weniger korreliert die Anlagen, desto besser der Effekt.",
      },
      {
        heading: "Die Grenzen",
        body: "In echten Krisen steigen die Korrelationen: Fast alles faellt gleichzeitig. Deshalb braucht ein robustes Portfolio auch unkorrelietre Anlageklassen wie Gold, inflationsgeschuetzte Anleihen oder Cash.",
      },
    ],
    keyTakeaway:
      "Diversifikation reduziert Risiko ohne Rendite zu kosten – das einzige Free Lunch der Finanzwelt.",
    exercise:
      "Pruefe dein Portfolio: Wie viele verschiedene Anlageklassen und Regionen sind enthalten? Wo koenntest du staerker diversifizieren?",
  },
  "fortgeschrittenes-investing::2": {
    summary:
      "Die Effizienzgrenze zeigt dir die optimale Kombination von Risiko und Rendite – und wo dein Portfolio steht.",
    sections: [
      {
        heading: "Was ist die Effizienzgrenze?",
        body: "Stelle dir ein Diagramm vor: X-Achse = Risiko, Y-Achse = Rendite. Fuer jede Risikostufe gibt es eine maximale Rendite – diese Punkte bilden die 'Effizienzgrenze'. Portfolios auf der Grenze sind optimal, Portfolios darunter verschwenden Potential.",
      },
      {
        heading: "Risiko richtig verstehen",
        body: "Risiko beim Investieren bedeutet nicht 'du verlierst alles'. Es bedeutet: Schwankungen auf dem Weg zum Ziel. Ein Portfolio mit 15% jaehrlicher Schwankung kann in einem Jahr +25% oder -5% bringen. Langfristig gleichen sich die Schwankungen aus.",
      },
      {
        heading: "Dein persoenliches Risikoprofil",
        body: "Die Frage ist nicht 'Wie viel Risiko ist optimal?' sondern 'Wie viel Schwankung halte ich aus, ohne nachts wach zu liegen?' Wenn du bei -20% panisch verkaufst, ist dein Risikoprofil zu hoch.",
      },
    ],
    keyTakeaway:
      "Optimiere nicht fuer maximale Rendite, sondern fuer die beste Rendite, bei der du ruhig schlafen kannst.",
    exercise:
      "Stell dir vor, dein Portfolio verliert 30% in einem Monat. Wie wuerdest du reagieren? Deine ehrliche Antwort bestimmt dein Risikoprofil.",
  },

  // ────────────────────────────────────────────────────────────────
  // Einkommen steigern
  // ────────────────────────────────────────────────────────────────
  "einkommen-steigern::1": {
    summary:
      "Sparen hat eine natuerliche Untergrenze – Einkommen steigern hat theoretisch keine Obergrenze.",
    sections: [
      {
        heading: "Die Sparfalle",
        body: "Du kannst maximal 100% deines Einkommens sparen (unrealistisch). In der Praxis liegt die Sparquote bei 10-30%. Aber dein Einkommen kann sich verdoppeln, verdreifachen oder verzehnfachen – ohne natuerliche Grenze.",
      },
      {
        heading: "Zwei Hebel gleichzeitig",
        body: "Der schnellste Weg zu Vermoegen: Einkommen steigern UND Sparquote beibehalten. Wer 3.000 Euro verdient und 20% spart, legt 600 Euro zurueck. Verdoppelt sich das Einkommen auf 6.000 bei gleicher Sparquote, spart er 1.200 Euro – das Doppelte.",
      },
      {
        heading: "Der Lifestyle-Creep-Fehler",
        body: "Die groesste Gefahr bei steigendem Einkommen: Die Ausgaben steigen mit. Mehr Gehalt = groessere Wohnung = teureres Auto = teurerer Urlaub. Ergebnis: Trotz mehr Einkommen kein Vermoegen. Die Loesung: Bei jeder Gehaltserhoehung mindestens 50% des Zugewinns sparen.",
      },
    ],
    keyTakeaway:
      "Sparen hat Grenzen – Einkommen steigern nicht. Nutze beide Hebel gleichzeitig.",
    exercise:
      "Was war deine letzte Gehaltserhoehung? Wie viel davon hast du gespart vs. fuer hoehere Ausgaben verwendet?",
  },
  "einkommen-steigern::2": {
    summary:
      "Dein Einkommen entspricht deinem wahrgenommenen Marktwert – und den kannst du gezielt steigern.",
    sections: [
      {
        heading: "Marktwert verstehen",
        body: "Dein Gehalt spiegelt wider, wie viel Wert du fuer deinen Arbeitgeber schaffst. Genauer: Wie viel Wert er GLAUBT, dass du schaffst. Die Luecke zwischen tatsaechlichem und wahrgenommenem Wert ist dein Verhandlungspotenzial.",
      },
      {
        heading: "Sichtbarkeit erhoehen",
        body: "Viele leisten hervorragende Arbeit, aber niemand weiss davon. Teile Ergebnisse aktiv, uebernimm sichtbare Projekte, praesentiere bei Meetings. Nicht Angeberei – sondern professionelle Sichtbarkeit.",
      },
      {
        heading: "In gefragte Faehigkeiten investieren",
        body: "Identifiziere die 2-3 Faehigkeiten, die in deiner Branche am wertvollsten sind, und werde darin besser als 90% deiner Kollegen. Das dauert keine 10.000 Stunden – oft reichen 6-12 Monate fokussiertes Lernen.",
      },
    ],
    keyTakeaway:
      "Steigere deinen Marktwert durch Sichtbarkeit und gefragte Faehigkeiten – dein Einkommen folgt.",
    exercise:
      "Welche 2-3 Faehigkeiten sind in deinem Berufsfeld am gefragtesten? Wie gut bist du darin auf einer Skala von 1-10?",
  },

  // ────────────────────────────────────────────────────────────────
  // Automatisch Vermoegen aufbauen
  // ────────────────────────────────────────────────────────────────
  "automatisch-vermoegen-aufbauen::1": {
    summary:
      "Automatisierung ist der Schluessel zu erfolgreichem Vermoegensaufbau – was automatisch passiert, wird nicht vergessen.",
    sections: [
      {
        heading: "Das Prinzip der Automatisierung",
        body: "Willenskraft ist begrenzt. Wer jeden Monat aktiv entscheiden muss, ob und wie viel er spart, wird frueher oder spaeter aufhoeren. Automatische Sparplaene und Dauerauftraege umgehen dieses Problem komplett.",
      },
      {
        heading: "Pay Yourself First",
        body: "Richte am Gehaltstag einen automatischen Transfer ein: Zuerst geht dein Sparbetrag weg, dann lebst du vom Rest. Die meisten merken nach 2-3 Monaten keinen Unterschied im Lebensstil.",
      },
      {
        heading: "Das Setup in 30 Minuten",
        body: "1. Tagesgeldkonto fuer den Notgroschen eroeffnen. 2. Depot mit ETF-Sparplan einrichten. 3. Dauerauftrag am 1. des Monats. Fertig – ab jetzt baut sich dein Vermoegen von alleine auf.",
      },
    ],
    keyTakeaway:
      "Automatisiere deinen Vermoegensaufbau – dann brauchst du keine Disziplin, sondern nur ein gutes Setup.",
    exercise:
      "Richte heute einen automatischen Sparplan ein – egal ob 25 Euro oder 500 Euro. Der erste Schritt zaehlt mehr als die Hoehe.",
  },
  "automatisch-vermoegen-aufbauen::2": {
    summary:
      "Die optimale Sparquote finden und das Vermoegen auf Autopilot wachsen lassen.",
    sections: [
      {
        heading: "Die richtige Sparquote finden",
        body: "Beginne mit 10-20% deines Nettoeinkommens. Jede Gehaltserhoehung: Haelfte davon zusaetzlich sparen. So steigt deine Sparquote automatisch, ohne dass du Verzicht spuerst.",
      },
      {
        heading: "Das 3-Toepfe-System",
        body: "Topf 1: Notgroschen (3-6 Monate, Tagesgeld). Topf 2: Mittelfristige Ziele (Auto, Urlaub, 1-5 Jahre, Festgeld). Topf 3: Langfristiger Vermoegensaufbau (ETF-Sparplan, 10+ Jahre).",
      },
      {
        heading: "Automatisch Rebalancen",
        body: "Viele Broker bieten automatisches Rebalancing an. Wenn nicht, reicht es, einmal pro Jahr zu pruefen, ob deine Aufteilung noch stimmt.",
      },
    ],
    keyTakeaway:
      "Teile dein Geld in drei Toepfe auf und lass jeden einzelnen automatisch wachsen.",
    exercise:
      "Berechne deine aktuelle Sparquote (Gespartes / Nettoeinkommen x 100). Wie hoch ist sie? Wo willst du hin?",
  },

  // ────────────────────────────────────────────────────────────────
  // Immobilien-Investment
  // ────────────────────────────────────────────────────────────────
  "immobilien-investment::1": {
    summary:
      "Immobilien koennen ein starker Baustein im Portfolio sein – wenn man die Zahlen versteht und emotionale Entscheidungen vermeidet.",
    sections: [
      {
        heading: "Kaufen vs. Mieten – die ehrliche Rechnung",
        body: "Die Faustregel: Wenn der Kaufpreis mehr als das 25-fache der Jahresmiete betraegt, ist Mieten oft guenstiger. In vielen deutschen Staedten liegt das Verhaeltnis bei 30-40x – das macht Kaufen als reines Investment oft unattraktiv.",
      },
      {
        heading: "Die versteckten Kosten",
        body: "Kaufnebenkosten (Grunderwerbsteuer, Notar, Makler) betragen 10-15% des Kaufpreises. Dazu kommen Instandhaltung (ca. 1-2% des Wertes/Jahr), Hausgeld, Versicherungen und moeglicherweise Leerstand.",
      },
      {
        heading: "Hebelwirkung verstehen",
        body: "Der Hebel bei Immobilien: Mit 20% Eigenkapital kontrollierst du 100% des Objekts. Bei 3% Wertsteigerung machst du 15% auf dein Eigenkapital. Aber Achtung: Der Hebel wirkt auch in die andere Richtung.",
      },
    ],
    keyTakeaway:
      "Immobilien sind eine Investition, keine emotionale Entscheidung. Rechne kalt durch: Rendite, Kosten, Risiken.",
    exercise:
      "Recherchiere den Kaufpreis-Miete-Faktor fuer deine Stadt. Ist Kaufen oder Mieten wirtschaftlich sinnvoller?",
  },
  "immobilien-investment::2": {
    summary:
      "Immobilien als Kapitalanlage: Wie du die richtige Immobilie findest und die Rendite berechnest.",
    sections: [
      {
        heading: "Bruttomietrendite berechnen",
        body: "Formel: (Jahreskaltmiete / Kaufpreis) x 100. Unter 4% brutto ist in der Regel unattraktiv. Gute Objekte liegen bei 5-8% brutto, was netto nach Kosten 3-5% bedeutet.",
      },
      {
        heading: "Lage, Lage, Lage – aber richtig",
        body: "Nicht nur die beste Lage zaehlt. B-Staedte mit Bevoelkerungswachstum, Universitaeten und wirtschaftlichem Potenzial bieten oft bessere Renditen als ueberteuerte A-Staedte.",
      },
      {
        heading: "REITs als Alternative",
        body: "Keine 200.000 Euro? REITs (Real Estate Investment Trusts) ermoeglichen Immobilieninvestments ab wenigen Euro. Diversifiziert, liquide und ohne die Arbeit eines Vermieters.",
      },
    ],
    keyTakeaway:
      "Du musst keine Immobilie kaufen, um von Immobilien zu profitieren. REITs bieten eine einfache Alternative.",
  },

  // ────────────────────────────────────────────────────────────────
  // Kredite & Schuldenmanagement
  // ────────────────────────────────────────────────────────────────
  "kredite-schuldenmanagement::1": {
    summary:
      "Nicht alle Schulden sind gleich – lerne den Unterschied zwischen guten und schlechten Schulden.",
    sections: [
      {
        heading: "Gute vs. schlechte Schulden",
        body: "Gute Schulden finanzieren Vermoegenswerte, die im Wert steigen oder Einkommen generieren (Immobilien, Bildung, Geschaeft). Schlechte Schulden finanzieren Konsum, der sofort an Wert verliert (Auto auf Kredit, Urlaub auf Pump).",
      },
      {
        heading: "Die wahren Kosten eines Kredits",
        body: "Ein Konsumkredit ueber 10.000 Euro mit 8% Zinsen und 5 Jahren Laufzeit kostet dich ueber 2.100 Euro an Zinsen. Das sind 21% mehr als der Kaufpreis. Immer den Gesamtbetrag anschauen, nicht nur die Monatsrate!",
      },
      {
        heading: "Der Dispo – die teuerste Falle",
        body: "Dispositionskredite kosten 10-15% Zinsen. Bei 3.000 Euro Dispo zahlst du 300-450 Euro Zinsen pro Jahr – fuer nichts. Erster Schritt: Dispo auf 0 bringen, z.B. durch einen guenstigeren Ratenkredit zur Umschuldung.",
      },
    ],
    keyTakeaway:
      "Tilge teure Schulden zuerst. Jeder Euro Zinsersparnis ist eine garantierte Rendite.",
    exercise:
      "Liste alle deine Schulden auf: Betrag, Zinssatz, Monatsrate. Sortiere nach Zinssatz – die teuerste Schuld zuerst angreifen.",
  },
  "kredite-schuldenmanagement::2": {
    summary:
      "Strategien zur Schuldenfreiheit: Avalanche vs. Schneeball und wann Umschuldung Sinn macht.",
    sections: [
      {
        heading: "Avalanche-Methode (mathematisch optimal)",
        body: "Zahle alle Schulden mit Mindestrate ab, stecke jeden uebrigen Euro in die Schuld mit dem hoechsten Zinssatz. Spart am meisten Geld, dauert aber bis zum ersten Erfolgserlebnis.",
      },
      {
        heading: "Schneeball-Methode (psychologisch effektiv)",
        body: "Zahle zuerst die kleinste Schuld komplett ab, dann die naechstgroessere. Jeder getilgte Kredit gibt Motivation. Studien zeigen: Menschen bleiben mit dieser Methode eher dran.",
      },
      {
        heading: "Umschuldung pruefen",
        body: "Wenn du mehrere teure Kredite hast, kann eine Umschuldung auf einen guenstigeren Gesamtkredit Hunderte Euro sparen. Voraussetzung: gute Bonitaet und keine neuen Schulden aufnehmen!",
      },
    ],
    keyTakeaway:
      "Die beste Schuldenstrategie ist die, die du durchhaeltst. Waehle Avalanche oder Schneeball – Hauptsache, du startest.",
  },

  // ────────────────────────────────────────────────────────────────
  // Altersvorsorge planen
  // ────────────────────────────────────────────────────────────────
  "altersvorsorge-planen::1": {
    summary:
      "Die gesetzliche Rente reicht fuer die meisten nicht – private Vorsorge ist keine Option, sondern Pflicht.",
    sections: [
      {
        heading: "Die Rentenluecke berechnen",
        body: "Faustregel: Die gesetzliche Rente ersetzt ca. 48% des letzten Bruttoeinkommens. Bei 3.500 Euro brutto sind das ca. 1.680 Euro Rente – davon gehen noch Steuern und Krankenversicherung ab. Die Luecke zu deinem gewuenschten Lebensstandard musst du selbst schliessen.",
      },
      {
        heading: "Die drei Saeulen der Altersvorsorge",
        body: "Saeule 1: Gesetzliche Rente (Basis, aber nicht genug). Saeule 2: Betriebliche Altersvorsorge (Arbeitgeberzuschuss mitnehmen!). Saeule 3: Private Vorsorge (ETFs, Riester, Ruerup, Immobilien).",
      },
      {
        heading: "Zeit ist der groesste Hebel",
        body: "Wer mit 25 anfaengt und 200 Euro/Monat bei 7% Rendite investiert, hat mit 65 ca. 480.000 Euro. Wer erst mit 35 anfaengt, kommt auf ca. 230.000 Euro. 10 Jahre spaeter starten kostet ueber 250.000 Euro.",
      },
    ],
    keyTakeaway:
      "Berechne deine Rentenluecke und starte jetzt – jedes Jahr Verzoegerung kostet dich Zehntausende Euro.",
    exercise:
      "Fordere deinen Rentenbescheid an (deutsche-rentenversicherung.de) und berechne: Wie gross ist deine Luecke zum gewuenschten Einkommen?",
  },
  "altersvorsorge-planen::2": {
    summary:
      "Private Vorsorge-Optionen im Vergleich: ETF-Sparplan, Riester, Ruerup und betriebliche Altersvorsorge.",
    sections: [
      {
        heading: "ETF-Sparplan (flexibelste Option)",
        body: "Vorteile: Niedrige Kosten, hohe Flexibilitaet, gute historische Rendite (7-8% p.a.). Nachteile: Keine staatliche Foerderung, Abgeltungssteuer auf Gewinne. Ideal fuer: Alle, die flexibel bleiben wollen.",
      },
      {
        heading: "Riester-Rente (fuer Familien)",
        body: "175 Euro Grundzulage + 300 Euro pro Kind pro Jahr. Lohnt sich besonders fuer Geringverdiener mit Kindern. Achtung: Oft hohe Kosten und eingeschraenkte Fondsauswahl. Vergleiche unbedingt die Angebote!",
      },
      {
        heading: "Betriebliche Altersvorsorge (bAV)",
        body: "Pflicht: Dein Arbeitgeber muss mindestens 15% Zuschuss zahlen. Vorteil: Beitraege sind steuer- und sozialabgabenfrei. Nachteil: Im Alter voll steuerpflichtig. Immer mitnehmen, wenn der Arbeitgeber gut bezuschusst!",
      },
    ],
    keyTakeaway:
      "Es gibt keine perfekte Loesung – die beste Vorsorge kombiniert mehrere Bausteine. Starte mit einem ETF-Sparplan und ergaenze nach Bedarf.",
  },

  // ────────────────────────────────────────────────────────────────
  // Vermoegen schuetzen
  // ────────────────────────────────────────────────────────────────
  "vermoegen-schuetzen::1": {
    summary:
      "Vermoegen aufbauen ist nur die halbe Miete – du musst es auch gegen Risiken und Fehler schuetzen.",
    sections: [
      {
        heading: "Die 4 groessten Vermoegensrisiken",
        body: "1. Inflation (schleichender Wertverlust). 2. Steuern (legale Optimierung nutzen). 3. Emotionale Fehler (Panikverkaeufe). 4. Konzentration (alles in einer Anlageklasse). Gegen jedes Risiko gibt es eine Strategie.",
      },
      {
        heading: "Diversifikation als Schutzschild",
        body: "Verteile dein Vermoegen auf verschiedene Anlageklassen (Aktien, Anleihen, Immobilien, Cash), Regionen (Europa, USA, Asien) und Sektoren. Korrelation beachten: Gold und Aktien bewegen sich oft gegenlaeufig.",
      },
      {
        heading: "Versicherungen als Grundschutz",
        body: "Haftpflicht, BU, Krankenversicherung – die drei Pflichtversicherungen. Alles andere ist optional und oft ueberteuert. Faustregel: Nur Risiken versichern, die dich finanziell ruinieren koennten.",
      },
    ],
    keyTakeaway:
      "Schuetze dein Vermoegen genauso aktiv wie du es aufbaust. Diversifikation + richtige Versicherungen = solides Fundament.",
    exercise:
      "Mache einen Vermoegenscheck: Wie ist dein Vermoegen aktuell verteilt? Wo bist du zu konzentriert?",
  },
  "vermoegen-schuetzen::2": {
    summary:
      "Steueroptimierung, Notfallplaene und langfristiger Vermoegenserhalt fuer Fortgeschrittene.",
    sections: [
      {
        heading: "Legale Steueroptimierung",
        body: "Sparerpauschbetrag ausschoepfen (1.000 Euro/Person). Verlustverrechnung nutzen. Haltedauer beachten (Kryptos nach 1 Jahr steuerfrei). Steuerberater lohnt sich oft ab 50.000 Euro Kapitalertraegen.",
      },
      {
        heading: "Der Notfallordner",
        body: "Was passiert mit deinem Vermoegen, wenn dir etwas passiert? Erstelle einen Ordner mit: Kontouebersicht, Depotdaten, Versicherungen, Vollmachten, Patientenverfuegung, Testament.",
      },
      {
        heading: "Generationenvermoegen denken",
        body: "Langfristiger Vermoegenserhalt bedeutet: Investiert bleiben, niedrige Kosten, steuereffizient, und die naechste Generation in Finanzbildung einbeziehen. Vermoegen ohne Wissen geht oft in 2-3 Generationen verloren.",
      },
    ],
    keyTakeaway:
      "Vermoegensschutz ist kein einmaliges Event, sondern ein laufender Prozess. Plane fuer alle Szenarien.",
  },

  // ────────────────────────────────────────────────────────────────
  // ETF-Grundlagen (etf-grundlagen Kurs)
  // ────────────────────────────────────────────────────────────────
  "etf-grundlagen::1": {
    summary:
      "ETFs haben das Investieren fuer alle demokratisiert – lerne die Grundlagen, bevor du dein Geld einsetzt.",
    sections: [
      {
        heading: "Was macht ETFs so besonders?",
        body: "ETFs kombinieren die Diversifikation eines Fonds mit der Handelbarkeit einer Aktie. Du kaufst mit einem einzigen Produkt Hunderte oder Tausende Unternehmen – zu Kosten von oft nur 0,1-0,3% pro Jahr.",
      },
      {
        heading: "Aktive Fonds vs. ETFs",
        body: "Ueber 90% der aktiv gemanagten Fonds schlagen ihren Vergleichsindex langfristig nicht. Trotzdem verlangen sie 1-2% Gebuehren pro Jahr. ETFs bilden den Index einfach nach – und gewinnen durch die niedrigeren Kosten.",
      },
      {
        heading: "Den richtigen ETF waehlen",
        body: "Kriterien: 1. Index (MSCI World, FTSE All-World). 2. TER unter 0,3%. 3. Fondsgroesse ueber 100 Mio. Euro. 4. Thesaurierend oder ausschuettend? 5. Physisch replizierend bevorzugen.",
      },
    ],
    keyTakeaway:
      "ETFs sind das einfachste und kostenguenstigste Werkzeug fuer den langfristigen Vermoegensaufbau.",
    exercise:
      "Vergleiche auf justETF.com drei MSCI-World-ETFs: TER, Fondsgroesse, Tracking Difference. Welcher gefaellt dir am besten?",
  },
};
