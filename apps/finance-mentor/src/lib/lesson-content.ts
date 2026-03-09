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
};
