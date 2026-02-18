// Blog-Konfiguration: Kategorien, Related Tools, SEO

export interface BlogCategory {
  id: string
  label: string
  description: string
  color: string
  bgColor: string
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 'mietrecht',
    label: 'Mietrecht',
    description: 'Rechtliche Grundlagen und aktuelle Urteile',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'nebenkosten',
    label: 'Nebenkosten',
    description: 'Tipps zur Nebenkostenabrechnung',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    id: 'vermieter-tipps',
    label: 'Vermieter-Tipps',
    description: 'Ratgeber für Vermieter und Eigentümer',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'kaution',
    label: 'Kaution',
    description: 'Alles rund um die Mietkaution',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'kuendigung',
    label: 'Kündigung',
    description: 'Kündigungsschutz und Fristen',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  {
    id: 'finanzierung',
    label: 'Finanzierung',
    description: 'Immobilienfinanzierung und Rendite',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
  },
]

export function getCategoryConfig(categoryId: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.id === categoryId)
}

// Mapping: Checker-Slug → Blog-Leseempfehlung
export const CHECKER_BLOG_MAPPING: Record<string, string[]> = {
  mietpreisbremse: ['mietpreisbremse-so-pruefen-sie-ihre-miete'],
  nebenkosten: ['nebenkostenabrechnung-pruefen-haeufige-fehler'],
  eigenbedarf: ['eigenbedarfskuendigung-rechte-als-mieter'],
  kaution: ['kaution-zurueckfordern-so-gehts'],
}
