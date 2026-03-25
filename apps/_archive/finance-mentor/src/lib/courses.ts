export interface Lesson {
  id: string;
  title: string;
  duration: string;
  free: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "anfaenger" | "fortgeschritten" | "experte";
  duration: string;
  lessons: Lesson[];
  icon: string;
  color: string;
  free: boolean;
  certificate: boolean;
}

export const COURSES: Course[] = [
  // ── Grundlagen ──────────────────────────────────────────────
  {
    id: "budgetierung-101",
    title: "Budgetierung 101",
    description: "Lerne die Grundlagen der Budgetplanung. Von der 50/30/20-Regel bis zum Zero-Based Budgeting.",
    category: "Grundlagen",
    level: "anfaenger",
    duration: "45 Min",
    icon: "from-green-500 to-emerald-600",
    color: "text-green-400",
    free: true,
    certificate: false,
    lessons: [
      { id: "1", title: "Warum Budgetierung wichtig ist", duration: "8 Min", free: true },
      { id: "2", title: "Die 50/30/20 Regel", duration: "12 Min", free: true },
      { id: "3", title: "Zero-Based Budgeting", duration: "10 Min", free: true },
      { id: "4", title: "Dein erstes Budget erstellen", duration: "15 Min", free: true },
    ],
  },
  {
    id: "finanz-mindset",
    title: "Dein Finanz-Mindset",
    description: "Warum deine Ueberzeugungen ueber Geld dein Konto bestimmen – und wie du sie gezielt veraenderst.",
    category: "Grundlagen",
    level: "anfaenger",
    duration: "50 Min",
    icon: "from-violet-500 to-fuchsia-600",
    color: "text-violet-400",
    free: true,
    certificate: false,
    lessons: [
      { id: "1", title: "Deine Beziehung zu Geld verstehen", duration: "8 Min", free: true },
      { id: "2", title: "Limitierende Glaubenssaetze erkennen", duration: "10 Min", free: true },
      { id: "3", title: "Vom Mangel- zum Fuelle-Denken", duration: "8 Min", free: true },
      { id: "4", title: "Selbstwert und Verdienst", duration: "8 Min", free: true },
      { id: "5", title: "Das Finanz-Tagebuch: Klarheit schaffen", duration: "8 Min", free: true },
      { id: "6", title: "Gewohnheiten die Wohlstand foerdern", duration: "8 Min", free: true },
    ],
  },
  {
    id: "schulden-abbauen",
    title: "Schulden strategisch abbauen",
    description: "Verschaffe dir Ueberblick, priorisiere richtig und werde systematisch schuldenfrei.",
    category: "Grundlagen",
    level: "anfaenger",
    duration: "40 Min",
    icon: "from-red-500 to-rose-600",
    color: "text-red-400",
    free: true,
    certificate: false,
    lessons: [
      { id: "1", title: "Schulden-Inventur: Alles auf den Tisch", duration: "8 Min", free: true },
      { id: "2", title: "Gute vs. schlechte Schulden", duration: "8 Min", free: true },
      { id: "3", title: "Die Schneeball-Methode", duration: "8 Min", free: true },
      { id: "4", title: "Die Lawinen-Methode", duration: "8 Min", free: true },
      { id: "5", title: "Dein persoenlicher Tilgungsplan", duration: "8 Min", free: true },
    ],
  },

  // ── Sparen ──────────────────────────────────────────────────
  {
    id: "notgroschen-aufbauen",
    title: "Notgroschen aufbauen",
    description: "Wie du in 6 Monaten einen Notgroschen aufbaust und finanzielle Sicherheit gewinnst.",
    category: "Sparen",
    level: "anfaenger",
    duration: "30 Min",
    icon: "from-blue-500 to-cyan-600",
    color: "text-blue-400",
    free: true,
    certificate: false,
    lessons: [
      { id: "1", title: "Was ist ein Notgroschen?", duration: "5 Min", free: true },
      { id: "2", title: "Wie viel brauchst du?", duration: "8 Min", free: true },
      { id: "3", title: "Sparstrategien die funktionieren", duration: "10 Min", free: true },
      { id: "4", title: "Wo parken? Tagesgeld vs. Girokonto", duration: "7 Min", free: true },
    ],
  },
  {
    id: "automatisch-vermoegen-aufbauen",
    title: "Automatisch Vermoegen aufbauen",
    description: "Richte ein System ein, das dein Vermoegen im Hintergrund wachsen laesst – ohne taeglichen Aufwand.",
    category: "Sparen",
    level: "anfaenger",
    duration: "1 Std",
    icon: "from-emerald-500 to-green-600",
    color: "text-emerald-400",
    free: false,
    certificate: true,
    lessons: [
      { id: "1", title: "Bezahle dich selbst zuerst", duration: "10 Min", free: true },
      { id: "2", title: "Das Mehrkonten-Modell einrichten", duration: "12 Min", free: true },
      { id: "3", title: "Dauerauftraege und Automatisierung", duration: "8 Min", free: false },
      { id: "4", title: "Die Kraft des Zinseszins", duration: "10 Min", free: false },
      { id: "5", title: "Dein Kapital schuetzen: Nie die Basis antasten", duration: "10 Min", free: false },
      { id: "6", title: "Gehaltserhoenung richtig verteilen", duration: "8 Min", free: false },
      { id: "7", title: "Quiz & Zertifikat", duration: "10 Min", free: false },
    ],
  },

  // ── Investieren ─────────────────────────────────────────────
  {
    id: "etf-investieren",
    title: "ETF-Investieren fuer Einsteiger",
    description: "Alles ueber ETFs: Was sie sind, wie du den richtigen waehlst und wie du einen Sparplan einrichtest.",
    category: "Investieren",
    level: "anfaenger",
    duration: "1,5 Std",
    icon: "from-purple-500 to-indigo-600",
    color: "text-purple-400",
    free: false,
    certificate: true,
    lessons: [
      { id: "1", title: "Was sind ETFs?", duration: "10 Min", free: true },
      { id: "2", title: "Aktien vs. Anleihen vs. ETFs", duration: "12 Min", free: true },
      { id: "3", title: "Den richtigen ETF waehlen", duration: "15 Min", free: false },
      { id: "4", title: "Depot eroeffnen Schritt fuer Schritt", duration: "12 Min", free: false },
      { id: "5", title: "Sparplan einrichten", duration: "10 Min", free: false },
      { id: "6", title: "Rebalancing & Langzeit-Strategie", duration: "15 Min", free: false },
      { id: "7", title: "Steuern auf ETF-Ertraege", duration: "12 Min", free: false },
      { id: "8", title: "Quiz & Zertifikat", duration: "10 Min", free: false },
    ],
  },
  {
    id: "passives-einkommen",
    title: "Passives Einkommen aufbauen",
    description: "Lerne die verschiedenen Wege zu Einkommensquellen, die auch ohne taegliche Arbeit fliessen.",
    category: "Investieren",
    level: "fortgeschritten",
    duration: "2 Std",
    icon: "from-yellow-500 to-amber-600",
    color: "text-yellow-400",
    free: false,
    certificate: true,
    lessons: [
      { id: "1", title: "Was ist passives Einkommen wirklich?", duration: "10 Min", free: true },
      { id: "2", title: "Aktives vs. passives Einkommen", duration: "10 Min", free: true },
      { id: "3", title: "Dividenden-Strategie aufbauen", duration: "15 Min", free: false },
      { id: "4", title: "Mieteinnahmen als Einkommensquelle", duration: "12 Min", free: false },
      { id: "5", title: "Digitale Produkte & Online-Einnahmen", duration: "15 Min", free: false },
      { id: "6", title: "Lizenzeinnahmen & Beteiligungen", duration: "12 Min", free: false },
      { id: "7", title: "Mehrere Einkommensquellen kombinieren", duration: "15 Min", free: false },
      { id: "8", title: "Dein persoenlicher Einkommens-Mix", duration: "12 Min", free: false },
      { id: "9", title: "Quiz & Zertifikat", duration: "10 Min", free: false },
    ],
  },
  {
    id: "immobilien-investment",
    title: "Immobilien als Kapitalanlage",
    description: "Von der Renditeberechnung bis zur Finanzierung: Immobilien-Investment Schritt fuer Schritt.",
    category: "Investieren",
    level: "experte",
    duration: "3 Std",
    icon: "from-teal-500 to-cyan-600",
    color: "text-teal-400",
    free: false,
    certificate: true,
    lessons: [
      { id: "1", title: "Immobilien als Anlageklasse", duration: "12 Min", free: true },
      { id: "2", title: "Bruttorendite vs. Nettorendite", duration: "15 Min", free: false },
      { id: "3", title: "Kaufnebenkosten berechnen", duration: "12 Min", free: false },
      { id: "4", title: "Finanzierung & Eigenkapital", duration: "18 Min", free: false },
      { id: "5", title: "Mieteinnahmen & Cashflow", duration: "15 Min", free: false },
      { id: "6", title: "Steuervorteile: AfA & Werbungskosten", duration: "18 Min", free: false },
      { id: "7", title: "Standortanalyse & Due Diligence", duration: "20 Min", free: false },
      { id: "8", title: "Verwaltung mit Fintutto Tools", duration: "12 Min", free: false },
      { id: "9", title: "Quiz & Zertifikat", duration: "10 Min", free: false },
    ],
  },

  // ── Steuern ─────────────────────────────────────────────────
  {
    id: "steuern-fuer-arbeitnehmer",
    title: "Steuern sparen als Arbeitnehmer",
    description: "Steuererklaerung verstehen, Absetzmoeglichkeiten nutzen und mehr Netto vom Brutto behalten.",
    category: "Steuern",
    level: "fortgeschritten",
    duration: "2 Std",
    icon: "from-amber-500 to-orange-600",
    color: "text-amber-400",
    free: false,
    certificate: true,
    lessons: [
      { id: "1", title: "Grundlagen der Einkommensteuer", duration: "12 Min", free: true },
      { id: "2", title: "Werbungskosten richtig absetzen", duration: "15 Min", free: false },
      { id: "3", title: "Homeoffice-Pauschale & Pendlerpauschale", duration: "12 Min", free: false },
      { id: "4", title: "Sonderausgaben & Vorsorge", duration: "15 Min", free: false },
      { id: "5", title: "Handwerkerkosten & haushaltsnahe DL", duration: "10 Min", free: false },
      { id: "6", title: "ELSTER Steuererklaerung Walkthrough", duration: "20 Min", free: false },
      { id: "7", title: "Haeufige Fehler vermeiden", duration: "12 Min", free: false },
      { id: "8", title: "Quiz & Zertifikat", duration: "10 Min", free: false },
    ],
  },

  // ── Vorsorge ────────────────────────────────────────────────
  {
    id: "altersvorsorge-planen",
    title: "Altersvorsorge richtig planen",
    description: "Rente, Riester, Ruerup, bAV und private Vorsorge: Welche Bausteine brauchst du wirklich?",
    category: "Vorsorge",
    level: "fortgeschritten",
    duration: "2,5 Std",
    icon: "from-rose-500 to-pink-600",
    color: "text-rose-400",
    free: false,
    certificate: true,
    lessons: [
      { id: "1", title: "Die Rentenluecke berechnen", duration: "15 Min", free: true },
      { id: "2", title: "Gesetzliche Rente verstehen", duration: "12 Min", free: true },
      { id: "3", title: "Riester-Rente: Lohnt sich das?", duration: "15 Min", free: false },
      { id: "4", title: "Ruerup / Basisrente", duration: "12 Min", free: false },
      { id: "5", title: "Betriebliche Altersvorsorge (bAV)", duration: "15 Min", free: false },
      { id: "6", title: "Private Rentenversicherung vs. ETF", duration: "18 Min", free: false },
      { id: "7", title: "Dein persoenlicher Vorsorge-Mix", duration: "15 Min", free: false },
      { id: "8", title: "Quiz & Zertifikat", duration: "10 Min", free: false },
    ],
  },

  // ── Finanzielle Freiheit ────────────────────────────────────
  {
    id: "finanzielle-freiheit",
    title: "Der Weg zur finanziellen Freiheit",
    description: "Von der Absicherung bis zur Unabhaengigkeit: Die vier Stufen, die dich finanziell frei machen.",
    category: "Finanzielle Freiheit",
    level: "anfaenger",
    duration: "1,5 Std",
    icon: "from-sky-500 to-blue-600",
    color: "text-sky-400",
    free: false,
    certificate: true,
    lessons: [
      { id: "1", title: "Was finanzielle Freiheit wirklich bedeutet", duration: "10 Min", free: true },
      { id: "2", title: "Stufe 1: Finanzielle Absicherung", duration: "12 Min", free: true },
      { id: "3", title: "Stufe 2: Finanzielle Sicherheit", duration: "12 Min", free: false },
      { id: "4", title: "Stufe 3: Finanzielle Unabhaengigkeit", duration: "12 Min", free: false },
      { id: "5", title: "Stufe 4: Finanzieller Ueberfluss", duration: "10 Min", free: false },
      { id: "6", title: "Deine persoenliche Freiheitszahl berechnen", duration: "15 Min", free: false },
      { id: "7", title: "Der 7-Jahres-Plan: Meilensteine setzen", duration: "12 Min", free: false },
      { id: "8", title: "Quiz & Zertifikat", duration: "10 Min", free: false },
    ],
  },
  {
    id: "einkommen-steigern",
    title: "Einkommen gezielt steigern",
    description: "Strategien um mehr zu verdienen: Gehaltsverhandlung, Nebeneinkuenfte und Wert-Positionierung.",
    category: "Finanzielle Freiheit",
    level: "fortgeschritten",
    duration: "1,5 Std",
    icon: "from-lime-500 to-green-600",
    color: "text-lime-400",
    free: false,
    certificate: true,
    lessons: [
      { id: "1", title: "Warum Sparen allein nicht reicht", duration: "8 Min", free: true },
      { id: "2", title: "Deinen Marktwert kennen und steigern", duration: "12 Min", free: true },
      { id: "3", title: "Gehaltsverhandlung vorbereiten", duration: "15 Min", free: false },
      { id: "4", title: "Nebeneinkuenfte finden und aufbauen", duration: "12 Min", free: false },
      { id: "5", title: "Faehigkeiten monetarisieren", duration: "12 Min", free: false },
      { id: "6", title: "Vom Angestellten zum Unternehmer denken", duration: "10 Min", free: false },
      { id: "7", title: "Die 72-Stunden-Regel: Ins Handeln kommen", duration: "8 Min", free: false },
      { id: "8", title: "Quiz & Zertifikat", duration: "10 Min", free: false },
    ],
  },
  {
    id: "vermoegen-schuetzen",
    title: "Vermoegen schuetzen und erhalten",
    description: "Wie du dein aufgebautes Vermoegen vor Inflation, Fehlentscheidungen und Risiken bewahrst.",
    category: "Finanzielle Freiheit",
    level: "experte",
    duration: "1,5 Std",
    icon: "from-orange-500 to-red-600",
    color: "text-orange-400",
    free: false,
    certificate: true,
    lessons: [
      { id: "1", title: "Warum Vermoegensschutz so wichtig ist", duration: "8 Min", free: true },
      { id: "2", title: "Inflation verstehen und gegensteuern", duration: "12 Min", free: true },
      { id: "3", title: "Diversifikation: Nicht alles auf eine Karte", duration: "12 Min", free: false },
      { id: "4", title: "Versicherungen die du wirklich brauchst", duration: "12 Min", free: false },
      { id: "5", title: "Emotionale Fallen bei Geldentscheidungen", duration: "10 Min", free: false },
      { id: "6", title: "Vermoegen weitergeben: Erben und Schenken", duration: "15 Min", free: false },
      { id: "7", title: "Dein persoenlicher Schutzplan", duration: "10 Min", free: false },
      { id: "8", title: "Quiz & Zertifikat", duration: "10 Min", free: false },
    ],
  },
];

export const CATEGORIES = [...new Set(COURSES.map((c) => c.category))];

export const LEVEL_LABELS: Record<string, string> = {
  anfaenger: "Anfaenger",
  fortgeschritten: "Fortgeschritten",
  experte: "Experte",
};
