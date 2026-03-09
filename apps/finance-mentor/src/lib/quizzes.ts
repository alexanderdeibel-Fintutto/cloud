/**
 * Quiz data for courses. Key = courseId.
 * Each quiz has questions with 4 options and the correct answer index.
 */

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correct: number; // 0-3
  explanation: string;
}

export interface Quiz {
  courseId: string;
  title: string;
  questions: QuizQuestion[];
}

export const QUIZZES: Record<string, Quiz> = {
  "budgetierung-101": {
    courseId: "budgetierung-101",
    title: "Quiz: Budgetierung 101",
    questions: [
      {
        question: "Welche Budgetierungsmethode teilt das Einkommen in 50% Beduerfnisse, 30% Wuensche und 20% Sparen auf?",
        options: ["Envelope-Methode", "50-30-20-Regel", "Zero-Based Budgeting", "Pay-Yourself-First"],
        correct: 1,
        explanation: "Die 50-30-20-Regel teilt dein Netto-Einkommen in drei Kategorien: 50% fuer Grundbeduerfnisse, 30% fuer persoenliche Wuensche und 20% fuer Sparen und Investieren.",
      },
      {
        question: "Was ist das wichtigste Ziel eines Budgets?",
        options: ["Jeden Cent zu zaehlen", "Auf alles zu verzichten", "Bewusst ueber Geld zu entscheiden", "Moeglichst viel zu sparen"],
        correct: 2,
        explanation: "Ein Budget ist kein Verzichtsplan, sondern ein Werkzeug, um bewusste Entscheidungen ueber dein Geld zu treffen.",
      },
      {
        question: "Was sind 'unsichtbare Geld-Lecks'?",
        options: ["Bankgebuehren", "Kleine, unbewusste Ausgaben die sich summieren", "Inflation", "Steuern"],
        correct: 1,
        explanation: "Kleine, regelmaessige Ausgaben wie der taegliche Kaffee oder vergessene Abos summieren sich oft auf Hunderte Euro im Monat.",
      },
      {
        question: "Welche der folgenden Ausgaben gehoert NICHT zu den 50% 'Beduerfnisse'?",
        options: ["Miete", "Lebensmittel", "Netflix-Abo", "Krankenversicherung"],
        correct: 2,
        explanation: "Streaming-Abos gehoeren zu den 30% 'Wuensche'. Beduerfnisse sind unverzichtbare Ausgaben wie Miete, Essen und Versicherungen.",
      },
      {
        question: "Was solltest du als Erstes tun, wenn du mit Budgetierung anfaengst?",
        options: ["Alle Abos kuendigen", "Deine tatsaechlichen Ausgaben tracken", "Ein Sparkonto eroeffnen", "Aktien kaufen"],
        correct: 1,
        explanation: "Bevor du einen Plan machst, musst du wissen, wo dein Geld tatsaechlich hinfliesst. Tracke deine Ausgaben fuer mindestens einen Monat.",
      },
    ],
  },

  "notgroschen-aufbauen": {
    courseId: "notgroschen-aufbauen",
    title: "Quiz: Notgroschen aufbauen",
    questions: [
      {
        question: "Wie hoch sollte ein Notgroschen idealerweise sein?",
        options: ["1 Monatsgehalt", "3-6 Monatsausgaben", "10.000 Euro", "So viel wie moeglich"],
        correct: 1,
        explanation: "Die Faustregel: 3-6 Monatsausgaben (nicht Gehalt!) als Reserve. Bei einem unsicheren Job eher 6, bei sicherem eher 3.",
      },
      {
        question: "Wo solltest du deinen Notgroschen aufbewahren?",
        options: ["Im Aktiendepot", "Unter dem Kopfkissen", "Auf einem Tagesgeldkonto", "In Kryptowaehrung"],
        correct: 2,
        explanation: "Ein Tagesgeldkonto bietet sofortigen Zugriff, etwas Verzinsung und ist durch die Einlagensicherung geschuetzt.",
      },
      {
        question: "Was ist KEIN guter Grund, den Notgroschen anzubrechen?",
        options: ["Autoreparatur", "Jobverlust", "Urlaubsreise", "Zahnarztrechnung"],
        correct: 2,
        explanation: "Der Notgroschen ist fuer unvorhergesehene, dringende Ausgaben. Ein Urlaub ist planbar und sollte separat gespart werden.",
      },
      {
        question: "Was machst du, nachdem dein Notgroschen voll ist?",
        options: ["Aufhoeren zu sparen", "Den Notgroschen investieren", "Anfangen zu investieren", "Einen groesseren Notgroschen aufbauen"],
        correct: 2,
        explanation: "Sobald dein Notgroschen steht, kannst du anfangen, langfristig zu investieren – z.B. mit einem ETF-Sparplan.",
      },
    ],
  },

  "etf-grundlagen": {
    courseId: "etf-grundlagen",
    title: "Quiz: ETF-Grundlagen",
    questions: [
      {
        question: "Was ist ein ETF?",
        options: ["Eine einzelne Aktie", "Ein boersengehandelter Indexfonds", "Ein Sparkonto", "Eine Kryptowaehrung"],
        correct: 1,
        explanation: "ETF steht fuer Exchange Traded Fund – ein Fonds, der an der Boerse gehandelt wird und einen Index nachbildet.",
      },
      {
        question: "Was bedeutet eine TER von 0,2%?",
        options: ["Die Rendite betraegt 0,2%", "Die jaehrlichen Kosten betragen 0,2% des Anlagevolumens", "Die Steuer betraegt 0,2%", "Der ETF verliert 0,2% pro Tag"],
        correct: 1,
        explanation: "Die TER (Total Expense Ratio) gibt die jaehrlichen Gesamtkosten an. Bei 10.000 Euro sind 0,2% TER = 20 Euro pro Jahr.",
      },
      {
        question: "Was ist der Unterschied zwischen thesaurierend und ausschuettend?",
        options: ["Aktien vs. Anleihen", "Reinvestition vs. Auszahlung von Ertraegen", "Physisch vs. synthetisch", "Gross vs. klein"],
        correct: 1,
        explanation: "Thesaurierende ETFs reinvestieren Dividenden automatisch, ausschuettende zahlen sie auf dein Konto aus.",
      },
      {
        question: "Was bildet der MSCI World ab?",
        options: ["Nur US-Unternehmen", "Ca. 1.500 Unternehmen aus 23 Industrielaendern", "Alle Aktien weltweit", "Nur europaeische Unternehmen"],
        correct: 1,
        explanation: "Der MSCI World umfasst ca. 1.500 Unternehmen aus 23 Industrielaendern – aber keine Schwellenlaender.",
      },
      {
        question: "Was ist der groesste Vorteil eines ETF-Sparplans?",
        options: ["Garantierte Rendite", "Cost-Average-Effekt und Automatisierung", "Keine Steuern", "Immer positiv"],
        correct: 1,
        explanation: "Durch regelmaessiges Investieren profitierst du vom Cost-Average-Effekt und eliminierst emotionale Entscheidungen.",
      },
    ],
  },

  "finanz-mindset": {
    courseId: "finanz-mindset",
    title: "Quiz: Finanz-Mindset",
    questions: [
      {
        question: "Was ist der Ankereffekt?",
        options: ["Die Tendenz, Risiken zu meiden", "Die Orientierung an einer ersten Zahl als Referenz", "Der Wunsch, dazuzugehoeren", "Die Angst vor Verlusten"],
        correct: 1,
        explanation: "Der Ankereffekt beschreibt, wie eine erste Zahl (z.B. ein frueherer Aktienkurs) unsere Bewertung beeinflusst.",
      },
      {
        question: "Was beschreibt FOMO im Finanzkontext?",
        options: ["Angst vor Verlusten", "Angst, Gewinne zu verpassen", "Angst vor Inflation", "Angst vor Schulden"],
        correct: 1,
        explanation: "FOMO (Fear Of Missing Out) treibt Anleger dazu, bei stark steigenden Kursen einzusteigen – oft zum schlechtesten Zeitpunkt.",
      },
      {
        question: "Was ist die Sunk-Cost-Fallacy?",
        options: ["Zu frueh verkaufen", "An Verlusten festhalten, weil man schon viel investiert hat", "Zu viel diversifizieren", "Nicht genug sparen"],
        correct: 1,
        explanation: "Man haelt an einer schlechten Investition fest, nur weil man schon viel Geld hineingesteckt hat – rational waere es, den Verlust zu akzeptieren.",
      },
      {
        question: "Was ist die beste Strategie gegen Herdentrieb?",
        options: ["Immer das Gegenteil machen", "Einen festen Investmentplan haben und sich daran halten", "Nur Einzelaktien kaufen", "Gar nicht investieren"],
        correct: 1,
        explanation: "Ein vorher definierter Plan (z.B. monatlicher Sparplan) schuetzt vor emotionalen Entscheidungen.",
      },
    ],
  },

  "schulden-abbauen": {
    courseId: "schulden-abbauen",
    title: "Quiz: Schulden intelligent abbauen",
    questions: [
      {
        question: "Welche Schulden sollten zuerst abgebaut werden?",
        options: ["Die groessten Schulden", "Die mit dem hoechsten Zinssatz", "Die aeltesten Schulden", "Alle gleichzeitig"],
        correct: 1,
        explanation: "Die Avalanche-Methode: Zuerst die Schulden mit dem hoechsten Zinssatz tilgen spart am meisten Geld.",
      },
      {
        question: "Wie hoch ist typischerweise der Dispo-Zins?",
        options: ["2-3%", "5-7%", "10-15%", "20-25%"],
        correct: 2,
        explanation: "Dispositionskredite haben typisch 10-15% Zinsen – eine der teuersten Kreditformen ueberhaupt.",
      },
      {
        question: "Was ist die Schneeball-Methode?",
        options: ["Alle Schulden auf einmal bezahlen", "Zuerst die kleinsten Schulden tilgen fuer psychologische Erfolge", "Nur Minimalraten zahlen", "Umschulden auf einen Kredit"],
        correct: 1,
        explanation: "Die Schneeball-Methode motiviert durch schnelle Erfolgserlebnisse, auch wenn sie mathematisch nicht optimal ist.",
      },
      {
        question: "Solltest du investieren, waehrend du Schulden hast?",
        options: ["Ja, immer", "Nein, nie", "Nur wenn die erwartete Rendite hoeher als der Schuldzins ist", "Nur in Krypto"],
        correct: 2,
        explanation: "Grundregel: Wenn dein Schuldzins hoeher als die erwartete Rendite ist, tilge zuerst die Schulden.",
      },
    ],
  },

  "passives-einkommen": {
    courseId: "passives-einkommen",
    title: "Quiz: Passives Einkommen",
    questions: [
      {
        question: "Was ist passives Einkommen?",
        options: ["Einkommen ohne jede Arbeit", "Einkommen das nach initialem Aufwand regelmaessig fliesst", "Nur Mieteinnahmen", "Geld von der Bank"],
        correct: 1,
        explanation: "Passives Einkommen erfordert meist einen hohen initialen Aufwand, fliesst danach aber mit minimalem laufenden Einsatz.",
      },
      {
        question: "Ab welchem Betrag generiert ein MSCI-World-ETF ca. 500 Euro Dividende/Monat?",
        options: ["50.000 Euro", "150.000 Euro", "300.000 Euro", "500.000 Euro"],
        correct: 2,
        explanation: "Bei ca. 2% Dividendenrendite braucht man rund 300.000 Euro, um 6.000 Euro/Jahr (500 Euro/Monat) zu erhalten.",
      },
      {
        question: "Was ist die 4%-Regel?",
        options: ["4% Sparquote reichen", "Man kann jaehrlich 4% seines Portfolios entnehmen", "ETFs bringen immer 4%", "4% Inflation ist normal"],
        correct: 1,
        explanation: "Die 4%-Regel besagt, dass man jaehrlich ca. 4% seines Portfolios entnehmen kann, ohne dass es ueber 30 Jahre aufgebraucht wird.",
      },
    ],
  },

  "paar-finanzen": {
    courseId: "paar-finanzen",
    title: "Quiz: Finanzen als Paar",
    questions: [
      {
        question: "Was ist das Drei-Konten-Modell fuer Paare?",
        options: ["Drei Sparkonten", "Gemeinsames Konto + je ein persoenliches Konto", "Drei Anlagekonten", "Drei Kreditkarten"],
        correct: 1,
        explanation: "Das Drei-Konten-Modell: Ein gemeinsames Konto fuer Fixkosten und gemeinsame Ausgaben, plus je ein persoenliches Konto fuer individuelle Freiheit.",
      },
      {
        question: "Wann sollten Paare ueber Geld sprechen?",
        options: ["Nur bei Problemen", "Regelmaessig und proaktiv", "Nie – Geld ist Privatsache", "Erst nach der Hochzeit"],
        correct: 1,
        explanation: "Regelmaessige Finanzgespraeche (z.B. monatlich) verhindern Konflikte und stellen sicher, dass beide an gemeinsamen Zielen arbeiten.",
      },
      {
        question: "Welcher Fehler ist bei Paar-Finanzen am haeufigsten?",
        options: ["Zu viel sparen", "Keine gemeinsamen Finanzziele definieren", "Zu frueh investieren", "Getrennte Konten"],
        correct: 1,
        explanation: "Ohne gemeinsame Ziele zieht jeder in eine andere Richtung. Setzt euch zusammen und definiert, worauf ihr spart.",
      },
    ],
  },

  "krypto-grundlagen": {
    courseId: "krypto-grundlagen",
    title: "Quiz: Krypto-Grundlagen",
    questions: [
      {
        question: "Was ist eine Blockchain?",
        options: ["Ein Bankensystem", "Eine dezentrale, faelschungssichere Datenbank", "Eine Kryptowaehrung", "Ein Zahlungsdienst"],
        correct: 1,
        explanation: "Die Blockchain ist eine dezentrale Datenbank, in der Transaktionen in verketteten Bloecken gespeichert werden.",
      },
      {
        question: "Was bedeutet 'Not your keys, not your coins'?",
        options: ["Du brauchst einen physischen Schluessel", "Nur wer die privaten Schluessel besitzt, kontrolliert die Coins", "Krypto ist unsicher", "Man braucht immer eine Boerse"],
        correct: 1,
        explanation: "Wenn du deine Coins auf einer Boerse laesst, kontrolliert die Boerse sie. Nur in deiner eigenen Wallet hast du die volle Kontrolle.",
      },
      {
        question: "Was ist der maximale Vorrat an Bitcoin?",
        options: ["Unbegrenzt", "21 Millionen", "100 Millionen", "1 Milliarde"],
        correct: 1,
        explanation: "Bitcoin hat eine fest programmierte Obergrenze von 21 Millionen Stueck, was kuenstliche Knappheit erzeugt.",
      },
      {
        question: "Wie viel Prozent deines Portfolios solltest du maximal in Krypto investieren (konservative Empfehlung)?",
        options: ["1-5%", "20-30%", "50%", "100%"],
        correct: 0,
        explanation: "Aufgrund der hohen Volatilitaet empfehlen die meisten Experten maximal 1-5% des Gesamtportfolios in Krypto zu investieren.",
      },
    ],
  },

  "steuern-fuer-arbeitnehmer": {
    courseId: "steuern-fuer-arbeitnehmer",
    title: "Quiz: Steuern fuer Arbeitnehmer",
    questions: [
      {
        question: "Wie hoch ist die Abgeltungssteuer auf Kapitalertraege in Deutschland?",
        options: ["19%", "25%", "30%", "42%"],
        correct: 1,
        explanation: "Die Abgeltungssteuer betraegt pauschal 25% plus Solidaritaetszuschlag und ggf. Kirchensteuer.",
      },
      {
        question: "Wie hoch ist der Sparerpauschbetrag fuer Einzelpersonen (2024)?",
        options: ["500 Euro", "801 Euro", "1.000 Euro", "2.000 Euro"],
        correct: 2,
        explanation: "Seit 2023 betraegt der Sparerpauschbetrag 1.000 Euro fuer Einzelpersonen und 2.000 Euro fuer Ehepaare.",
      },
      {
        question: "Was kann man als Arbeitnehmer von der Steuer absetzen?",
        options: ["Nur die Fahrtkosten", "Werbungskosten wie Fahrtkosten, Arbeitszimmer, Fortbildungen", "Nichts", "Nur Versicherungen"],
        correct: 1,
        explanation: "Arbeitnehmer koennen diverse Werbungskosten absetzen: Pendlerpauschale, Arbeitszimmer, Fachliteratur, Fortbildungen, Arbeitsmittel u.v.m.",
      },
      {
        question: "Was ist die Pendlerpauschale pro Kilometer (erste 20 km)?",
        options: ["0,15 Euro", "0,30 Euro", "0,38 Euro", "0,50 Euro"],
        correct: 1,
        explanation: "Die Entfernungspauschale betraegt 0,30 Euro pro Kilometer fuer die ersten 20 km und 0,38 Euro ab dem 21. Kilometer.",
      },
    ],
  },

  "versicherungen-optimieren": {
    courseId: "versicherungen-optimieren",
    title: "Quiz: Versicherungen optimieren",
    questions: [
      {
        question: "Welche Versicherung ist fuer fast jeden ein absolutes Muss?",
        options: ["Handyversicherung", "Haftpflichtversicherung", "Glasversicherung", "Reisegepaeckversicherung"],
        correct: 1,
        explanation: "Die private Haftpflicht schuetzt dich vor Schadenersatzanspruechen Dritter – in Deutschland haftest du unbegrenzt mit deinem Vermoegen.",
      },
      {
        question: "Was versichert eine BU-Versicherung?",
        options: ["Dein Auto", "Dein Einkommen bei Berufsunfaehigkeit", "Dein Haus", "Deine Reisen"],
        correct: 1,
        explanation: "Die Berufsunfaehigkeitsversicherung sichert dein Einkommen, falls du deinen Beruf aus gesundheitlichen Gruenden nicht mehr ausueben kannst.",
      },
      {
        question: "Welche Versicherung ist in der Regel ueberfluessig?",
        options: ["Haftpflicht", "BU-Versicherung", "Handyversicherung", "Krankenversicherung"],
        correct: 2,
        explanation: "Handyversicherungen haben oft hohe Selbstbeteiligungen und viele Ausschluesse. Besser: Geld fuer einen Ersatz zuruecklegen.",
      },
    ],
  },

  "finanzielle-freiheit": {
    courseId: "finanzielle-freiheit",
    title: "Quiz: Finanzielle Freiheit",
    questions: [
      {
        question: "Was bedeutet 'finanzielle Freiheit'?",
        options: ["Reich sein", "Keine Schulden haben", "Passives Einkommen deckt die Lebenshaltungskosten", "Viel Geld verdienen"],
        correct: 2,
        explanation: "Finanzielle Freiheit = dein passives Einkommen (Dividenden, Mieteinnahmen etc.) reicht aus, um deine Ausgaben zu decken, ohne arbeiten zu muessen.",
      },
      {
        question: "Wie berechnet man sein 'FIRE Number' (Financial Independence)?",
        options: ["Jahresgehalt x 10", "Jaehrliche Ausgaben x 25", "Monatliche Sparrate x 100", "Vermoegen x 4"],
        correct: 1,
        explanation: "Die FIRE-Zahl: Jaehrliche Ausgaben x 25. Bei 30.000 Euro/Jahr Ausgaben brauchst du 750.000 Euro Vermoegen.",
      },
      {
        question: "Was ist der groesste Hebel auf dem Weg zur finanziellen Freiheit?",
        options: ["Die richtige Aktie finden", "Sparquote erhoehen", "Lotto spielen", "Krypto kaufen"],
        correct: 1,
        explanation: "Die Sparquote ist der groesste Hebel: Sie bestimmt, wie schnell du dein Ziel erreichst. 50% Sparquote = ca. 17 Jahre bis FIRE.",
      },
      {
        question: "Was bedeutet 'Lean FIRE'?",
        options: ["Sehr sportlich leben", "Finanzielle Freiheit mit minimalen Ausgaben", "Nur in Tech-Aktien investieren", "Wenig arbeiten"],
        correct: 1,
        explanation: "Lean FIRE bedeutet, finanzielle Freiheit mit einem bescheidenen Lebensstil zu erreichen – niedrigere Ausgaben = kleineres benoetigtes Portfolio.",
      },
    ],
  },

  "fortgeschrittenes-investing": {
    courseId: "fortgeschrittenes-investing",
    title: "Quiz: Fortgeschrittenes Investieren",
    questions: [
      {
        question: "Was ist ein Rebalancing?",
        options: ["Neues Geld investieren", "Die urspruengliche Portfolio-Gewichtung wiederherstellen", "Alle Aktien verkaufen", "Den Broker wechseln"],
        correct: 1,
        explanation: "Beim Rebalancing stellst du die Ziel-Allokation wieder her, z.B. von 80/20 Aktien/Anleihen zurueck auf die Ursprungsgewichtung.",
      },
      {
        question: "Was bedeutet ein KGV (Kurs-Gewinn-Verhaeltnis) von 20?",
        options: ["Die Aktie steigt um 20%", "Du zahlst das 20-fache des Jahresgewinns", "Die Dividende betraegt 20%", "Der Kurs ist 20 Euro"],
        correct: 1,
        explanation: "Ein KGV von 20 heisst: Der Aktienkurs ist 20-mal so hoch wie der Gewinn pro Aktie. Hoeheres KGV = teurere Bewertung.",
      },
      {
        question: "Was ist der Unterschied zwischen physischer und synthetischer ETF-Replikation?",
        options: ["Physisch kauft die Aktien, synthetisch nutzt Swap-Vertraege", "Kein Unterschied", "Physisch ist immer besser", "Synthetisch hat keine Kosten"],
        correct: 0,
        explanation: "Physische ETFs kaufen die enthaltenen Wertpapiere tatsaechlich, synthetische bilden die Rendite ueber Swap-Geschaefte mit einer Bank nach.",
      },
    ],
  },

  "automatisch-vermoegen-aufbauen": {
    courseId: "automatisch-vermoegen-aufbauen",
    title: "Quiz: Automatisch Vermoegen aufbauen",
    questions: [
      {
        question: "Was bedeutet 'Pay Yourself First'?",
        options: ["Luxusgueter zuerst kaufen", "Am Gehaltstag zuerst den Sparbetrag abzweigen", "Schulden zuerst tilgen", "Mehr Gehalt fordern"],
        correct: 1,
        explanation: "Bei 'Pay Yourself First' geht dein Sparbetrag automatisch am Gehaltstag weg – bevor du Geld fuer andere Dinge ausgibst.",
      },
      {
        question: "Was ist das 3-Toepfe-System?",
        options: ["Drei Bankkonten fuer drei Personen", "Notgroschen + mittelfristige Ziele + langfristiger Vermoegensaufbau", "Drei verschiedene ETFs", "Aktien, Anleihen, Krypto"],
        correct: 1,
        explanation: "Topf 1: Notgroschen (Tagesgeld). Topf 2: Mittelfristige Ziele (1-5 Jahre). Topf 3: Langfristiger Vermoegensaufbau (ETFs, 10+ Jahre).",
      },
      {
        question: "Wie solltest du mit Gehaltserhoehungen umgehen?",
        options: ["Alles ausgeben", "Die Haelfte zusaetzlich sparen", "Nichts aendern", "Sofort in Krypto investieren"],
        correct: 1,
        explanation: "Lifestyle-Inflation vermeiden: Bei jeder Gehaltserhoehung die Haelfte des Mehrbetrags zusaetzlich sparen. So steigt deine Sparquote automatisch.",
      },
    ],
  },

  "immobilien-investment": {
    courseId: "immobilien-investment",
    title: "Quiz: Immobilien-Investment",
    questions: [
      {
        question: "Ab welchem Kaufpreis-Miete-Faktor gilt Kaufen als teuer?",
        options: ["Ueber 15", "Ueber 20", "Ueber 25", "Ueber 10"],
        correct: 2,
        explanation: "Ab einem Faktor von 25 (Kaufpreis = 25x Jahresmiete) gilt eine Immobilie als teuer. In vielen deutschen Staedten liegt er bei 30-40x.",
      },
      {
        question: "Wie hoch sind die Kaufnebenkosten bei einer Immobilie?",
        options: ["1-3%", "5-7%", "10-15%", "20%"],
        correct: 2,
        explanation: "Grunderwerbsteuer (3,5-6,5%), Notarkosten (ca. 1,5%), Grundbuch (ca. 0,5%) und Makler (3-7%) ergeben zusammen 10-15%.",
      },
      {
        question: "Was sind REITs?",
        options: ["Mietvertraege", "Boersengehandelte Immobilienfonds", "Baukredite", "Immobilien-Versicherungen"],
        correct: 1,
        explanation: "REITs (Real Estate Investment Trusts) sind boersengehandelte Unternehmen, die in Immobilien investieren – eine liquide Alternative zum direkten Immobilienkauf.",
      },
    ],
  },

  "kredite-schuldenmanagement": {
    courseId: "kredite-schuldenmanagement",
    title: "Quiz: Kredite & Schuldenmanagement",
    questions: [
      {
        question: "Was sind 'gute Schulden'?",
        options: ["Schulden unter 1.000 Euro", "Schulden fuer wertsteigernde Investments", "Alle zinslosen Schulden", "Schulden bei Freunden"],
        correct: 1,
        explanation: "Gute Schulden finanzieren Vermoegenswerte (Immobilien, Bildung, Geschaeft), die im Wert steigen oder Einkommen generieren.",
      },
      {
        question: "Was ist eine Umschuldung?",
        options: ["Schulden ignorieren", "Mehrere teure Kredite in einen guenstigeren zusammenfassen", "Mehr Schulden aufnehmen", "Schulden an andere uebertragen"],
        correct: 1,
        explanation: "Bei einer Umschuldung ersetzt du teure Kredite durch einen guenstigeren Gesamtkredit – das kann Hunderte Euro Zinsen sparen.",
      },
      {
        question: "Wann ist die Avalanche-Methode besser als die Schneeball-Methode?",
        options: ["Immer", "Wenn man mathematisch optimal Zinsen sparen will", "Nie", "Bei kleinen Schulden"],
        correct: 1,
        explanation: "Die Avalanche-Methode (hoechster Zins zuerst) spart am meisten Geld, erfordert aber mehr Geduld bis zum ersten Erfolgserlebnis.",
      },
    ],
  },

  "altersvorsorge-planen": {
    courseId: "altersvorsorge-planen",
    title: "Quiz: Altersvorsorge planen",
    questions: [
      {
        question: "Wie viel Prozent des Bruttoeinkommens ersetzt die gesetzliche Rente ca.?",
        options: ["70-80%", "60%", "48%", "30%"],
        correct: 2,
        explanation: "Die gesetzliche Rente ersetzt durchschnittlich ca. 48% des letzten Bruttoeinkommens – der Rest ist die Rentenluecke.",
      },
      {
        question: "Wie viel muss der Arbeitgeber mindestens zur bAV zuschieaen?",
        options: ["5%", "10%", "15%", "25%"],
        correct: 2,
        explanation: "Der Arbeitgeber muss mindestens 15% Zuschuss zur betrieblichen Altersvorsorge zahlen, wenn der Arbeitnehmer per Entgeltumwandlung einzahlt.",
      },
      {
        question: "Was kostet 10 Jahre spaeter mit dem Investieren anzufangen (200 Euro/Monat, 7%)?",
        options: ["Ca. 50.000 Euro", "Ca. 100.000 Euro", "Ca. 250.000 Euro", "Kaum etwas"],
        correct: 2,
        explanation: "Wer mit 25 startet hat mit 65 ca. 480.000 Euro, wer mit 35 startet ca. 230.000 Euro – die Differenz von 250.000 Euro ist der Preis des Wartens.",
      },
    ],
  },

  "psychologie-des-geldes": {
    courseId: "psychologie-des-geldes",
    title: "Quiz: Psychologie des Geldes",
    questions: [
      {
        question: "Was ist der groesste Unterschied zwischen 'reich' und 'wohlhabend'?",
        options: ["Kein Unterschied", "Reich = hohes Einkommen, Wohlhabend = hohes Vermoegen", "Reich = viele Autos", "Wohlhabend = viele Haeuser"],
        correct: 1,
        explanation: "Reich sein ist sichtbar (teures Auto, Uhr). Wohlhabend sein ist das, was man NICHT sieht – Geld das investiert ist und Freiheit schafft.",
      },
      {
        question: "Was ist der 'Hedonic Treadmill'-Effekt?",
        options: ["Sport macht reich", "Wir gewoehnen uns schnell an mehr Besitz und wollen immer mehr", "Laufen spart Geld", "Fitness-Abos sind zu teuer"],
        correct: 1,
        explanation: "Wir gewoehnen uns schnell an einen hoeheren Lebensstandard. Das neue Auto fuehlt sich nach 3 Monaten normal an – dann will man das naechste.",
      },
      {
        question: "Was ist der wichtigste Faktor fuer finanziellen Erfolg laut Studien?",
        options: ["Hohes Einkommen", "Gute Bildung", "Verhalten und Gewohnheiten", "Glueck"],
        correct: 2,
        explanation: "Studien zeigen: Finanzverhalten (Sparquote, Disziplin, langfristiges Denken) ist wichtiger als Einkommen oder Bildungsgrad.",
      },
    ],
  },

  "denkfallen-geldentscheidungen": {
    courseId: "denkfallen-geldentscheidungen",
    title: "Quiz: Denkfallen bei Geldentscheidungen",
    questions: [
      {
        question: "Was ist die 'Dispositionseffekt'-Falle?",
        options: ["Zu viel Dispo nutzen", "Gewinner zu frueh verkaufen und Verlierer zu lange halten", "Zu viele Konten haben", "Nur an einem Tag handeln"],
        correct: 1,
        explanation: "Anleger verkaufen Gewinner-Aktien zu frueh (um den Gewinn zu sichern) und halten Verlierer zu lange (in der Hoffnung auf Erholung).",
      },
      {
        question: "Was ist der 'Dunning-Kruger-Effekt' beim Investieren?",
        options: ["Anfaenger ueberschaetzen ihr Wissen", "Experten sind immer besser", "Mehr Wissen = mehr Rendite", "Unwissen schuetzt vor Verlusten"],
        correct: 0,
        explanation: "Anfaenger ueberschaetzen oft ihre Faehigkeiten und unterschaetzen die Komplexitaet der Maerkte – was zu riskanten Entscheidungen fuehrt.",
      },
      {
        question: "Wie schuetzt man sich am besten vor Denkfallen?",
        options: ["Mehr Nachrichten lesen", "Einen festen Investmentplan haben und sich daran halten", "Auf sein Bauchgefuehl hoeren", "Nur Einzelaktien kaufen"],
        correct: 1,
        explanation: "Ein vorher definierter Plan (z.B. monatlicher Sparplan, feste Regeln) schuetzt vor emotionalen Fehlentscheidungen.",
      },
    ],
  },

  "boersenpsychologie": {
    courseId: "boersenpsychologie",
    title: "Quiz: Boersenpsychologie",
    questions: [
      {
        question: "Was passiert typischerweise am Ende einer Boerenblase?",
        options: ["Langsamer Rueckgang", "Die Euphorie ist am groessten und alle kaufen", "Alle verkaufen rechtzeitig", "Der Staat greift ein"],
        correct: 1,
        explanation: "Am Hoehepunkt einer Blase ist die Euphorie maximal. 'Diesmal ist alles anders' ist der teuerste Satz an der Boerse.",
      },
      {
        question: "Was ist Contrarian Investing?",
        options: ["Mit der Masse gehen", "Gegen den Trend investieren", "Nur in Anleihen investieren", "Daytrading"],
        correct: 1,
        explanation: "Contrarian Investing heisst: Kaufen wenn andere panisch verkaufen, verkaufen wenn andere euphorisch kaufen. Erfordert starke Nerven.",
      },
    ],
  },

  "krisensicheres-portfolio": {
    courseId: "krisensicheres-portfolio",
    title: "Quiz: Krisensicheres Portfolio",
    questions: [
      {
        question: "Was ist die wichtigste Regel fuer ein krisensicheres Portfolio?",
        options: ["Alles in Gold", "Breite Diversifikation ueber Anlageklassen", "Timing des Marktes", "Cash halten"],
        correct: 1,
        explanation: "Diversifikation ueber verschiedene Anlageklassen (Aktien, Anleihen, Gold, Cash) schuetzt am besten gegen Krisen.",
      },
      {
        question: "Wie sollte man sich in einem Crash verhalten?",
        options: ["Sofort alles verkaufen", "Nichts tun und den Sparplan weiterlaufen lassen", "Alles in Krypto umschichten", "Auf Tipps hoeren"],
        correct: 1,
        explanation: "Historisch erholen sich Maerkte immer. Wer im Crash den Sparplan weiterlaeen laesst, kauft guenstig ein und profitiert langfristig.",
      },
      {
        question: "Was ist ein 'All-Weather-Portfolio'?",
        options: ["Nur Aktien", "Ein Portfolio das in allen Marktphasen funktionieren soll", "Nur sichere Anlagen", "Daytrading-Strategie"],
        correct: 1,
        explanation: "Ein All-Weather-Portfolio kombiniert verschiedene Anlageklassen so, dass es in Boom, Rezession, Inflation und Deflation bestehen kann.",
      },
    ],
  },

  "vermoegen-schuetzen": {
    courseId: "vermoegen-schuetzen",
    title: "Quiz: Vermoegen schuetzen",
    questions: [
      {
        question: "Was gehoert in einen Notfallordner?",
        options: ["Nur Bankdaten", "Kontouebersicht, Depotdaten, Versicherungen, Vollmachten, Testament", "Nur das Testament", "Passwort-Liste"],
        correct: 1,
        explanation: "Ein vollstaendiger Notfallordner enthaelt alle wichtigen Finanzinformationen, Vollmachten und Vorsorgedokumente fuer den Ernstfall.",
      },
      {
        question: "Wann sind Krypto-Gewinne in Deutschland steuerfrei?",
        options: ["Immer", "Nach 1 Jahr Haltedauer", "Nach 5 Jahren", "Nie"],
        correct: 1,
        explanation: "Private Veraeusserungsgewinne aus Kryptowaehrungen sind nach einer Haltedauer von mindestens einem Jahr steuerfrei.",
      },
    ],
  },

  "einkommen-steigern": {
    courseId: "einkommen-steigern",
    title: "Quiz: Einkommen steigern",
    questions: [
      {
        question: "Was ist der effektivste Weg, sein Gehalt zu erhoehen?",
        options: ["Laenger arbeiten", "Regelmaessige Gehaltsverhandlungen mit dokumentierten Erfolgen", "Den Chef bitten", "Nur auf Befoerderungen warten"],
        correct: 1,
        explanation: "Wer seine Erfolge dokumentiert und regelmaessig (alle 12-18 Monate) verhandelt, verdient im Schnitt deutlich mehr als passive Arbeitnehmer.",
      },
      {
        question: "Warum ist Sichtbarkeit wichtiger als harte Arbeit allein?",
        options: ["Weil Chefs faul sind", "Weil Leistung nur zaehlt, wenn sie wahrgenommen wird", "Sichtbarkeit ist nicht wichtig", "Weil man sonst gekuendigt wird"],
        correct: 1,
        explanation: "Die beste Arbeit nuetzt nichts, wenn niemand davon weiss. Teile deine Ergebnisse proaktiv, prasentiere in Meetings, mache deine Erfolge sichtbar.",
      },
      {
        question: "Was ist die 'Skill-Stack'-Strategie?",
        options: ["Nur eine Faehigkeit perfektionieren", "Mehrere komplementaere Faehigkeiten kombinieren", "Alle Faehigkeiten gleichzeitig lernen", "Nur technische Skills zaehlen"],
        correct: 1,
        explanation: "Die Kombination von 2-3 gefragten Faehigkeiten macht dich wertvoller als in einer einzelnen Top-1% zu sein. Beispiel: Coding + Design + Marketing.",
      },
    ],
  },

  "steuern-fuer-freelancer": {
    courseId: "steuern-fuer-freelancer",
    title: "Quiz: Steuern fuer Freelancer",
    questions: [
      {
        question: "Was ist die Kleinunternehmerregelung?",
        options: ["Man zahlt keine Steuern", "Umsatz unter 22.000 Euro/Jahr: keine Umsatzsteuer erheben", "Man braucht keinen Steuerberater", "Gewerbesteuerbefreiung"],
        correct: 1,
        explanation: "Bei Umsatz unter 22.000 Euro (Vorjahr) und 50.000 Euro (laufendes Jahr) kannst du auf die Umsatzsteuer verzichten – vereinfacht die Buchhaltung.",
      },
      {
        question: "Was ist eine EUeR?",
        options: ["Eine Steuerart", "Einnahmen-Ueberschuss-Rechnung zur Gewinnermittlung", "Ein Formular", "Eine Versicherung"],
        correct: 1,
        explanation: "Die EUeR ist die einfachste Form der Gewinnermittlung: Einnahmen minus Ausgaben = Gewinn. Fuer die meisten Freelancer und Kleinunternehmer ausreichend.",
      },
      {
        question: "Welche Steuervorauszahlungen muss ein Freelancer leisten?",
        options: ["Keine", "Einkommensteuer-Vorauszahlungen vierteljährlich", "Nur am Jahresende", "Nur Umsatzsteuer"],
        correct: 1,
        explanation: "Das Finanzamt setzt quartalsweise Einkommensteuer-Vorauszahlungen fest, basierend auf dem voraussichtlichen Jahresgewinn.",
      },
    ],
  },
};
