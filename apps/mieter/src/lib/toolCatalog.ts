/**
 * Fintutto Ecosystem Tool Catalog
 * All Checker, Formulare, and Rechner with Stripe product/price mappings
 */

export type ToolType = "checker" | "formular" | "rechner";
export type ToolCategory = "mieter" | "vermieter" | "both";

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  category: ToolCategory;
  creditsCost: number;
  icon: string; // lucide icon name
  color: string; // accent color
  portalPath: string; // path on portal.fintutto.cloud
  stripeProductId: string | null;
  stripePriceId: string | null;
  tags: string[];
  /** Context hints: where to promote this tool */
  contextHints: string[];
  freePreview?: boolean;
}

// ============ CHECKER (Mieter-Tools) ============
export const CHECKERS: Tool[] = [
  {
    id: "mietpreisbremse",
    name: "Mietpreisbremsen-Check",
    description: "Prüfen Sie, ob Ihre Miete zu hoch ist – basierend auf der Mietpreisbremse.",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "Shield",
    color: "primary",
    portalPath: "/checker/mietpreisbremse",
    stripeProductId: "prod_Ts5xJIW1emFUZI",
    stripePriceId: null, // included in abo
    tags: ["miete", "mietpreisbremse", "prüfung"],
    contextHints: ["dashboard", "finanzen", "wohnung"],
    freePreview: true,
  },
  {
    id: "mieterhoehung",
    name: "Mieterhöhungs-Check",
    description: "Ist Ihre Mieterhöhung rechtmäßig? §558 BGB Prüfung.",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "TrendingUp",
    color: "coral",
    portalPath: "/checker/mieterhoehung",
    stripeProductId: "prod_Ts5xpMee390YkL",
    stripePriceId: null,
    tags: ["mieterhöhung", "§558", "prüfung"],
    contextHints: ["finanzen", "dashboard"],
  },
  {
    id: "nebenkosten",
    name: "NK-Abrechnungs-Checker",
    description: "Nebenkostenabrechnung auf Fehler prüfen.",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "FileSearch",
    color: "sky",
    portalPath: "/checker/nebenkosten",
    stripeProductId: "prod_Ts5xn0KD52nCOq",
    stripePriceId: null,
    tags: ["nebenkosten", "abrechnung", "prüfung"],
    contextHints: ["finanzen", "dokumente"],
  },
  {
    id: "betriebskosten",
    name: "Betriebskosten-Check",
    description: "Betriebskostenarten auf Umlagefähigkeit prüfen.",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "Calculator",
    color: "mint",
    portalPath: "/checker/betriebskosten",
    stripeProductId: "prod_Ts5xI5mo5AWZN2",
    stripePriceId: null,
    tags: ["betriebskosten", "umlage", "prüfung"],
    contextHints: ["finanzen"],
  },
  {
    id: "kuendigung",
    name: "Kündigungsfrist-Check",
    description: "Kündigungsfrist für Mieter prüfen.",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "Clock",
    color: "amber",
    portalPath: "/checker/kuendigung",
    stripeProductId: "prod_Ts5xN3fjwDH0Du",
    stripePriceId: null,
    tags: ["kündigung", "frist", "prüfung"],
    contextHints: ["wohnung", "einstellungen"],
  },
  {
    id: "kaution",
    name: "Kautions-Check",
    description: "Kaution und Rückzahlung prüfen (§551 BGB).",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "Wallet",
    color: "primary",
    portalPath: "/checker/kaution",
    stripeProductId: "prod_Ts5x53vTuxwLzF",
    stripePriceId: null,
    tags: ["kaution", "rückzahlung", "§551"],
    contextHints: ["finanzen", "wohnung"],
  },
  {
    id: "mietminderung",
    name: "Mietminderungs-Check",
    description: "Recht auf Mietminderung prüfen bei Mängeln.",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "ArrowDownCircle",
    color: "coral",
    portalPath: "/checker/mietminderung",
    stripeProductId: "prod_Ts5xvsB0sIv07y",
    stripePriceId: null,
    tags: ["mietminderung", "mangel", "prüfung"],
    contextHints: ["mangel-melden", "meine-meldungen"],
  },
  {
    id: "eigenbedarf",
    name: "Eigenbedarf-Check",
    description: "Eigenbedarfskündigung auf Rechtmäßigkeit prüfen.",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "Home",
    color: "sky",
    portalPath: "/checker/eigenbedarf",
    stripeProductId: "prod_Ts5xTCHnCy59HB",
    stripePriceId: null,
    tags: ["eigenbedarf", "kündigung", "prüfung"],
    contextHints: ["wohnung"],
  },
  {
    id: "modernisierung",
    name: "Modernisierungsumlage-Check",
    description: "Modernisierungsumlage auf Rechtmäßigkeit prüfen.",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "Hammer",
    color: "mint",
    portalPath: "/checker/modernisierung",
    stripeProductId: "prod_Ts5xVjNPsYiR2Y",
    stripePriceId: null,
    tags: ["modernisierung", "umlage", "prüfung"],
    contextHints: ["finanzen"],
  },
  {
    id: "schoenheitsreparaturen",
    name: "Schönheitsreparaturen-Check",
    description: "Prüfen ob Klausel zu Schönheitsreparaturen wirksam ist.",
    type: "checker",
    category: "mieter",
    creditsCost: 1,
    icon: "PaintBucket",
    color: "amber",
    portalPath: "/checker/schoenheitsreparaturen",
    stripeProductId: "prod_Ts5xShOjoCL81Y",
    stripePriceId: null,
    tags: ["schönheitsreparaturen", "klausel", "prüfung"],
    contextHints: ["wohnung", "dokumente"],
  },
];

// ============ FORMULARE (Mieter-relevant) ============
export const FORMULARE: Tool[] = [
  {
    id: "maengelanzeige",
    name: "Mängelanzeige",
    description: "Formelle Mitteilung von Mängeln an den Vermieter.",
    type: "formular",
    category: "mieter",
    creditsCost: 1,
    icon: "AlertTriangle",
    color: "coral",
    portalPath: "/formulare/maengelanzeige",
    stripeProductId: "prod_TuGcjyI5VaSYOT",
    stripePriceId: "price_1SwS5B52lqSgjCzeeXMtxj9l",
    tags: ["mängel", "anzeige", "formular"],
    contextHints: ["mangel-melden", "meine-meldungen"],
  },
  {
    id: "widerspruch-mieterhoehung",
    name: "Widerspruch Mieterhöhung",
    description: "Einspruch gegen eine ungerechtfertigte Mieterhöhung.",
    type: "formular",
    category: "mieter",
    creditsCost: 1,
    icon: "FileX",
    color: "coral",
    portalPath: "/formulare/widerspruch-mieterhoehung",
    stripeProductId: "prod_TuGcTcLR6TpMnV",
    stripePriceId: "price_1SwS5F52lqSgjCzeMujSc7V1",
    tags: ["widerspruch", "mieterhöhung"],
    contextHints: ["finanzen"],
  },
  {
    id: "mietminderung",
    name: "Mietminderung",
    description: "Reduzierung der Miete bei Mängeln beantragen.",
    type: "formular",
    category: "mieter",
    creditsCost: 1,
    icon: "ArrowDownCircle",
    color: "primary",
    portalPath: "/formulare/mietminderung",
    stripeProductId: "prod_TuGdY5KyUPsHO7",
    stripePriceId: "price_1SwS5l52lqSgjCzeUCbeW3pH",
    tags: ["mietminderung", "mangel"],
    contextHints: ["mangel-melden", "meine-meldungen"],
  },
  {
    id: "widerspruch-nebenkosten",
    name: "Widerspruch Nebenkostenabrechnung",
    description: "Einspruch gegen fehlerhafte Nebenkostenabrechnung.",
    type: "formular",
    category: "mieter",
    creditsCost: 1,
    icon: "FileSearch",
    color: "sky",
    portalPath: "/formulare/widerspruch-nebenkosten",
    stripeProductId: "prod_TuGdkxehSroqMM",
    stripePriceId: "price_1SwS5n52lqSgjCze4GaAK4JH",
    tags: ["widerspruch", "nebenkosten"],
    contextHints: ["finanzen", "dokumente"],
  },
  {
    id: "sonderkuendigung",
    name: "Sonderkündigung",
    description: "Außerordentliche Kündigung durch den Mieter.",
    type: "formular",
    category: "mieter",
    creditsCost: 1,
    icon: "FileOutput",
    color: "amber",
    portalPath: "/formulare/sonderkuendigung",
    stripeProductId: "prod_TuGdpyYKkRVVvU",
    stripePriceId: "price_1SwS5o52lqSgjCze6c2d7RBd",
    tags: ["kündigung", "sonderkündigung"],
    contextHints: ["wohnung"],
  },
  {
    id: "mahnung",
    name: "Mahnung",
    description: "Formelles Mahnschreiben bei Zahlungsverzug.",
    type: "formular",
    category: "mieter",
    creditsCost: 1,
    icon: "AlertCircle",
    color: "coral",
    portalPath: "/formulare/mahnung",
    stripeProductId: "prod_TuGdkk9ERG63HW",
    stripePriceId: "price_1SwS5p52lqSgjCzeg9RZBrLm",
    tags: ["mahnung", "zahlungsverzug"],
    contextHints: ["finanzen"],
  },
];

// ============ RECHNER (Mieter-relevant) ============
export const RECHNER: Tool[] = [
  {
    id: "miet-check",
    name: "Miet-Check",
    description: "Ist Ihre Miete angemessen? Vergleichen Sie mit dem Mietspiegel.",
    type: "rechner",
    category: "mieter",
    creditsCost: 1,
    icon: "BarChart3",
    color: "primary",
    portalPath: "/rechner/miet-check",
    stripeProductId: null,
    stripePriceId: null,
    tags: ["miete", "mietspiegel", "vergleich"],
    contextHints: ["finanzen", "wohnung", "dashboard"],
    freePreview: true,
  },
  {
    id: "kaution-rechner",
    name: "Kautionsrechner",
    description: "Kaution berechnen nach §551 BGB – alle 16 Bundesländer.",
    type: "rechner",
    category: "both",
    creditsCost: 1,
    icon: "Wallet",
    color: "mint",
    portalPath: "/rechner/kaution",
    stripeProductId: null,
    stripePriceId: null,
    tags: ["kaution", "berechnung", "§551"],
    contextHints: ["finanzen", "wohnung"],
    freePreview: true,
  },
  {
    id: "nebenkosten-rechner",
    name: "Nebenkostenrechner",
    description: "Betriebskosten für Ihre Wohnung berechnen.",
    type: "rechner",
    category: "both",
    creditsCost: 1,
    icon: "Calculator",
    color: "sky",
    portalPath: "/rechner/nebenkosten",
    stripeProductId: null,
    stripePriceId: null,
    tags: ["nebenkosten", "berechnung"],
    contextHints: ["finanzen"],
    freePreview: true,
  },
];

// ============ BUNDLES ============
export const BUNDLES = {
  mieterSchutzpaket: {
    id: "mieter-schutzpaket",
    name: "Mieter-Schutzpaket",
    description: "Alle 10 Checker für Mieter",
    stripeProductId: "prod_Ts5x7stFwsaLbm",
    tools: CHECKERS.map(c => c.id),
    credits: 10,
  },
  top5: {
    id: "top5-paket",
    name: "Top-5 Paket",
    description: "Die 5 wichtigsten Checks: NK, Mietpreisbremse, Mieterhöhung, Kaution, Mietminderung",
    stripeProductId: "prod_Ts5xLvyI4tDQkC",
    tools: ["nebenkosten", "mietpreisbremse", "mieterhoehung", "kaution", "mietminderung"],
    credits: 5,
  },
  mieterFormulare: {
    id: "mieter-schutz-paket-bundle",
    name: "Mieter Schutz-Paket",
    description: "Mängelanzeige, Mietminderung, Widerspruch und Kündigungen",
    stripeProductId: "prod_TuGdE3JltOGo58",
    tools: FORMULARE.map(f => f.id),
    credits: 6,
  },
};

// ============ MIETER-CHECKER ABO ============
export const CHECKER_ABOS = {
  basis: {
    name: "Mieter-Checker Basis",
    description: "3 Berechnungen pro Monat",
    stripeProductId: "prod_TvT0kdc97UeF7G",
    stripePriceMonthly: "price_1Sxc4652lqSgjCzeEKVlLxwP", // €0,99/mo
    stripePriceYearly: "price_1Sxc4652lqSgjCzeoHFU2Ykn", // €9,99/yr
    creditsPerMonth: 3,
  },
  premium: {
    name: "Mieter-Checker Premium",
    description: "Unbegrenzte Berechnungen",
    stripeProductId: "prod_TvT0Vg00vNWswg",
    stripePriceMonthly: "price_1Sxc4752lqSgjCzeRlMLZeP5", // €3,99/mo
    stripePriceYearly: "price_1Sxc4752lqSgjCzeC971KXL0", // €39,99/yr
    creditsPerMonth: 999, // unlimited
  },
};

// ============ HELPERS ============
export const ALL_TOOLS: Tool[] = [...CHECKERS, ...FORMULARE, ...RECHNER];

export function getToolById(id: string): Tool | undefined {
  return ALL_TOOLS.find(t => t.id === id);
}

export function getToolsByContext(context: string): Tool[] {
  return ALL_TOOLS.filter(t => t.contextHints.includes(context));
}

export function getToolsByType(type: ToolType): Tool[] {
  return ALL_TOOLS.filter(t => t.type === type);
}

export function getPortalUrl(tool: Tool): string {
  return `https://portal.fintutto.cloud${tool.portalPath}`;
}

export function getToolsForMieter(): Tool[] {
  return ALL_TOOLS.filter(t => t.category === "mieter" || t.category === "both");
}
