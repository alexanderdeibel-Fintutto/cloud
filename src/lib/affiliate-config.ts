// Affiliate-Partner Konfiguration für kontextbezogene Empfehlungen
// Jeder Checker/Rechner bekommt passende Partner-Empfehlungen

export interface AffiliatePartner {
  id: string
  name: string
  description: string
  category: 'rechtsschutz' | 'kaution' | 'umzug' | 'finanzierung' | 'pruefung' | 'handwerker' | 'immobilien'
  url: string // Affiliate-Link (mit UTM-Parametern)
  cta: string // Call-to-Action Text
  badge?: string // z.B. "Empfohlen", "Beliebt"
}

export interface AffiliateMapping {
  title: string // Überschrift für die Empfehlungsbox
  subtitle: string // Erklärungstext
  partners: AffiliatePartner[]
}

// Partner-Datenbank
const PARTNERS: Record<string, AffiliatePartner> = {
  arag: {
    id: 'arag',
    name: 'ARAG Mietrechtsschutz',
    description: 'Ab 8,50 EUR/Monat. Schutz bei Mietstreitigkeiten, Nebenkostenproblemen und Kündigungen.',
    category: 'rechtsschutz',
    url: '#affiliate-arag', // Platzhalter – wird durch echten Affiliate-Link ersetzt
    cta: 'Jetzt Angebot sichern',
    badge: 'Empfohlen',
  },
  advocard: {
    id: 'advocard',
    name: 'Advocard Rechtsschutz',
    description: 'Mietrechtsschutz mit Sofortschutz ab dem ersten Tag. Keine Wartezeit.',
    category: 'rechtsschutz',
    url: '#affiliate-advocard',
    cta: 'Kostenlos vergleichen',
  },
  roland: {
    id: 'roland',
    name: 'ROLAND Rechtsschutz',
    description: 'Rechtsschutzversicherung mit speziellem Mietrecht-Baustein.',
    category: 'rechtsschutz',
    url: '#affiliate-roland',
    cta: 'Tarife ansehen',
  },
  kautionsfrei: {
    id: 'kautionsfrei',
    name: 'Kautionsfrei.de',
    description: 'Keine Barkaution nötig – ab 3,90 EUR/Monat statt tausende Euro hinterlegen.',
    category: 'kaution',
    url: '#affiliate-kautionsfrei',
    cta: 'Kaution ersetzen',
    badge: 'Beliebt',
  },
  deutsche_kautionskasse: {
    id: 'deutsche-kautionskasse',
    name: 'Deutsche Kautionskasse',
    description: 'Mietkautionsbürgschaft als Alternative zur Barkaution. Geld bleibt verfügbar.',
    category: 'kaution',
    url: '#affiliate-kautionskasse',
    cta: 'Bürgschaft beantragen',
  },
  umzugsauktion: {
    id: 'umzugsauktion',
    name: 'Umzugsauktion.de',
    description: 'Umzugsunternehmen vergleichen und bis zu 40% sparen.',
    category: 'umzug',
    url: '#affiliate-umzugsauktion',
    cta: 'Angebote vergleichen',
    badge: 'Bis -40%',
  },
  interhyp: {
    id: 'interhyp',
    name: 'Interhyp Baufinanzierung',
    description: 'Deutschlands größter Vermittler für Baufinanzierungen. Über 500 Bankpartner.',
    category: 'finanzierung',
    url: '#affiliate-interhyp',
    cta: 'Finanzierung berechnen',
    badge: 'Nr. 1',
  },
  drklein: {
    id: 'drklein',
    name: 'Dr. Klein Baufinanzierung',
    description: 'Unabhängige Beratung mit über 600 Finanzierungspartnern.',
    category: 'finanzierung',
    url: '#affiliate-drklein',
    cta: 'Kostenlos beraten lassen',
  },
  mineko: {
    id: 'mineko',
    name: 'Mineko NK-Prüfung',
    description: 'Nebenkostenabrechnung prüfen lassen – im Schnitt 317 EUR Rückerstattung.',
    category: 'pruefung',
    url: '#affiliate-mineko',
    cta: 'Abrechnung prüfen',
    badge: 'Ø 317 EUR zurück',
  },
  myhammer: {
    id: 'myhammer',
    name: 'MyHammer',
    description: 'Handwerker in Ihrer Nähe finden – kostenlose Angebote erhalten.',
    category: 'handwerker',
    url: '#affiliate-myhammer',
    cta: 'Handwerker finden',
  },
  immoscout: {
    id: 'immoscout',
    name: 'ImmoScout24',
    description: 'Deutschlands größtes Immobilienportal – Wohnung finden oder inserieren.',
    category: 'immobilien',
    url: '#affiliate-immoscout',
    cta: 'Immobilien entdecken',
  },
}

// Mapping: Welcher Checker/Rechner bekommt welche Partner-Empfehlungen
export const AFFILIATE_MAPPINGS: Record<string, AffiliateMapping> = {
  // === CHECKER (Mieter-Tools) ===
  mietpreisbremse: {
    title: 'Schützen Sie Ihre Rechte',
    subtitle: 'Mietpreisbremse erkannt? So sichern Sie sich ab:',
    partners: [PARTNERS.arag, PARTNERS.advocard, PARTNERS.mineko],
  },
  mieterhoehung: {
    title: 'Mieterhöhung widersprechen',
    subtitle: 'Lassen Sie Ihre Rechte professionell prüfen:',
    partners: [PARTNERS.arag, PARTNERS.roland, PARTNERS.mineko],
  },
  nebenkosten: {
    title: 'Nebenkosten zu hoch?',
    subtitle: 'Im Schnitt sind 34% aller Nebenkostenabrechnungen fehlerhaft:',
    partners: [PARTNERS.mineko, PARTNERS.arag, PARTNERS.advocard],
  },
  betriebskosten: {
    title: 'Betriebskosten prüfen lassen',
    subtitle: 'Experten finden fehlerhafte Abrechnungen:',
    partners: [PARTNERS.mineko, PARTNERS.arag],
  },
  kuendigung: {
    title: 'Kündigung erhalten?',
    subtitle: 'Jetzt richtig handeln – und den Umzug vorbereiten:',
    partners: [PARTNERS.arag, PARTNERS.umzugsauktion, PARTNERS.immoscout],
  },
  kaution: {
    title: 'Kaution clever lösen',
    subtitle: 'Alternativen zur Barkaution – Geld bleibt verfügbar:',
    partners: [PARTNERS.kautionsfrei, PARTNERS.deutsche_kautionskasse, PARTNERS.arag],
  },
  mietminderung: {
    title: 'Mängel beseitigen lassen',
    subtitle: 'Rechtsschutz und Handwerker für Ihre Situation:',
    partners: [PARTNERS.arag, PARTNERS.myhammer, PARTNERS.advocard],
  },
  eigenbedarf: {
    title: 'Eigenbedarfskündigung erhalten?',
    subtitle: 'Rechtlich absichern und Alternativen finden:',
    partners: [PARTNERS.arag, PARTNERS.immoscout, PARTNERS.umzugsauktion],
  },
  modernisierung: {
    title: 'Modernisierung angekündigt?',
    subtitle: 'Kennen Sie Ihre Rechte – und sichern Sie sich ab:',
    partners: [PARTNERS.arag, PARTNERS.advocard],
  },
  schoenheitsreparaturen: {
    title: 'Renovierung bei Auszug?',
    subtitle: 'Prüfen Sie Ihre Pflichten und finden Sie Handwerker:',
    partners: [PARTNERS.myhammer, PARTNERS.arag, PARTNERS.umzugsauktion],
  },

  // === RECHNER (Vermieter-Tools) ===
  kaution_rechner: {
    title: 'Kaution verwalten',
    subtitle: 'Professionelle Lösungen für Vermieter:',
    partners: [PARTNERS.kautionsfrei, PARTNERS.deutsche_kautionskasse],
  },
  mieterhoehung_rechner: {
    title: 'Mieterhöhung rechtssicher',
    subtitle: 'Absicherung für Ihre Mieterhöhung:',
    partners: [PARTNERS.arag, PARTNERS.immoscout],
  },
  kaufnebenkosten: {
    title: 'Immobilie finanzieren',
    subtitle: 'Finden Sie die beste Finanzierung für Ihre Immobilie:',
    partners: [PARTNERS.interhyp, PARTNERS.drklein],
  },
  eigenkapital: {
    title: 'Eigenkapital aufbauen',
    subtitle: 'Optimale Finanzierung für Ihre Investition:',
    partners: [PARTNERS.interhyp, PARTNERS.drklein],
  },
  grundsteuer: {
    title: 'Immobilien-Experten',
    subtitle: 'Professionelle Unterstützung für Eigentümer:',
    partners: [PARTNERS.immoscout, PARTNERS.interhyp],
  },
  rendite: {
    title: 'Rendite maximieren',
    subtitle: 'Die richtige Finanzierung steigert Ihre Rendite:',
    partners: [PARTNERS.interhyp, PARTNERS.drklein, PARTNERS.immoscout],
  },
  nebenkosten_rechner: {
    title: 'Nebenkosten optimieren',
    subtitle: 'Transparente Abrechnung und Handwerker-Service:',
    partners: [PARTNERS.myhammer, PARTNERS.mineko],
  },
}

// Hilfsfunktion: Affiliate-URL mit Tracking-Parametern versehen
export function buildAffiliateUrl(partner: AffiliatePartner, source: string): string {
  const url = new URL(partner.url, 'https://portal.fintutto.cloud')
  url.searchParams.set('utm_source', 'fintutto-portal')
  url.searchParams.set('utm_medium', 'affiliate')
  url.searchParams.set('utm_campaign', source)
  url.searchParams.set('utm_content', partner.id)
  return url.toString()
}

// Kategorie-Icons (für die AffiliateCard)
export const CATEGORY_ICONS: Record<AffiliatePartner['category'], string> = {
  rechtsschutz: 'Shield',
  kaution: 'Banknote',
  umzug: 'Truck',
  finanzierung: 'Building2',
  pruefung: 'Search',
  handwerker: 'Wrench',
  immobilien: 'Home',
}
