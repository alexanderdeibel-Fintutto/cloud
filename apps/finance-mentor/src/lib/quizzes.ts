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
};
