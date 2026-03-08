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
];

export const CATEGORIES = [...new Set(COURSES.map((c) => c.category))];

export const LEVEL_LABELS: Record<string, string> = {
  anfaenger: "Anfaenger",
  fortgeschritten: "Fortgeschritten",
  experte: "Experte",
};
