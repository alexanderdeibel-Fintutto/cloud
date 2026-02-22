// All Fintutto Ecosystem Apps - definitions, features, pricing, and URLs

const APP_URLS = {
  portal: import.meta.env.VITE_APP_URL_PORTAL || 'https://portal.fintutto.cloud',
  vermietify: import.meta.env.VITE_APP_URL_VERMIETIFY || 'https://vermietify.vercel.app',
  mieter: import.meta.env.VITE_APP_URL_MIETER || 'https://mieter-kw8d.vercel.app',
  hausmeister: import.meta.env.VITE_APP_URL_HAUSMEISTER || 'https://hausmeister-pro.vercel.app',
  ablesung: import.meta.env.VITE_APP_URL_ABLESUNG || 'https://ablesung.vercel.app',
  bescheidboxer: import.meta.env.VITE_APP_URL_BESCHEIDBOXER || 'https://bescheidboxer.vercel.app',
}

export interface AppInfo {
  id: string
  name: string
  tagline: string
  description: string
  icon: string // emoji
  color: string // tailwind gradient class
  url: string
  registerUrl: string
  features: string[]
  pricing: {
    free: string
    plans: { name: string; price: string; period: string; highlight?: boolean }[]
  }
  stats: { label: string; value: string }[]
  targetAudience: string
  badge?: string
}

export const FINTUTTO_APPS: AppInfo[] = [
  {
    id: 'portal',
    name: 'Fintutto Portal',
    tagline: 'Alle Mietrecht-Tools an einem Ort',
    description:
      '27 professionelle Tools: Rechner für Vermieter, Checker für Mieter und rechtssichere Formulare für alle. Basierend auf aktuellem deutschen Mietrecht.',
    icon: '✨',
    color: 'from-purple-600 to-indigo-600',
    url: APP_URLS.portal,
    registerUrl: `${APP_URLS.portal}/register`,
    features: [
      '7 Vermieter-Rechner (Kaution, Rendite, Kaufnebenkosten...)',
      '10 Mieter-Checker (Mietpreisbremse, Kündigung, Nebenkosten...)',
      '5 rechtssichere Formulare (Mietvertrag, Übergabeprotokoll...)',
      'KI-Assistent für Mietrecht-Fragen',
      'PDF-Export aller Berechnungen',
      'Credit-basiertes System – fair & flexibel',
    ],
    pricing: {
      free: '3 Credits/Monat kostenlos',
      plans: [
        { name: 'Mieter', price: '4,99', period: '/Monat' },
        { name: 'Vermieter', price: '7,99', period: '/Monat' },
        { name: 'Kombi Pro', price: '11,99', period: '/Monat', highlight: true },
        { name: 'Unlimited', price: '19,99', period: '/Monat' },
      ],
    },
    stats: [
      { label: 'Tools', value: '27' },
      { label: 'Bundesländer', value: '16' },
      { label: 'DSGVO', value: '100%' },
    ],
    targetAudience: 'Mieter & Vermieter',
    badge: 'Neu',
  },
  {
    id: 'vermietify',
    name: 'Vermietify',
    tagline: 'Die komplette Immobilienverwaltung',
    description:
      'Gebäude, Mieter, Verträge, Zahlungen, Dokumente – alles in einer App. Mit 69 Formularen, automatischer Nebenkostenabrechnung und KI-Assistent.',
    icon: '🏠',
    color: 'from-blue-600 to-cyan-500',
    url: APP_URLS.vermietify,
    registerUrl: `${APP_URLS.vermietify}/register`,
    features: [
      'Gebäude- & Einheitenverwaltung',
      'Mieterverwaltung mit Vertragsdaten',
      '69 Formulare & Vorlagen',
      'Automatische Nebenkostenabrechnung',
      'Zahlungsübersicht & Mahnwesen',
      'KI-Assistent für Vermieter-Fragen',
      'Dokumenten-Management (Upload & Archiv)',
    ],
    pricing: {
      free: '3 Credits/Monat kostenlos',
      plans: [
        { name: 'Starter', price: '2,99', period: '/Monat' },
        { name: 'Pro', price: '7,99', period: '/Monat', highlight: true },
        { name: 'Unlimited', price: '14,99', period: '/Monat' },
      ],
    },
    stats: [
      { label: 'Formulare', value: '69' },
      { label: 'Features', value: '50+' },
      { label: 'KI-Assistent', value: 'Ja' },
    ],
    targetAudience: 'Vermieter & Hausverwaltungen',
  },
  {
    id: 'mieter',
    name: 'Mieter-App',
    tagline: 'Dein digitaler Mieter-Assistent',
    description:
      'Mängel melden, Zähler ablesen, Dokumente anfordern und direkt mit der Hausverwaltung chatten. Mit 10 Rechts-Checkern für deine Mietrechte.',
    icon: '🔑',
    color: 'from-green-600 to-emerald-500',
    url: APP_URLS.mieter,
    registerUrl: `${APP_URLS.mieter}/register`,
    features: [
      'Mangel melden mit Foto-Upload',
      'Zählerstand digital ablesen',
      'Dokumente anfordern (Bescheinigungen etc.)',
      'Chat mit Hausverwaltung',
      'Hausordnung & Notfallkontakte',
      '10 Mietrecht-Checker (Mietpreisbremse, Kündigung...)',
      'KI-Assistent für Mieter-Fragen',
    ],
    pricing: {
      free: '1 Check/Monat kostenlos',
      plans: [
        { name: 'Basic', price: '0,99', period: '/Monat' },
        { name: 'Premium', price: '3,99', period: '/Monat', highlight: true },
      ],
    },
    stats: [
      { label: 'Checker', value: '10' },
      { label: 'Chat', value: 'Live' },
      { label: 'KI', value: 'Ja' },
    ],
    targetAudience: 'Mieter',
  },
  {
    id: 'hausmeister',
    name: 'HausmeisterPro',
    tagline: 'Facility Management leicht gemacht',
    description:
      'Aufgaben verwalten, Belege fotografieren, mit Eigentümern kommunizieren. Die digitale Zentrale für Hausmeister und Facility Manager.',
    icon: '🔧',
    color: 'from-orange-500 to-amber-500',
    url: APP_URLS.hausmeister,
    registerUrl: `${APP_URLS.hausmeister}/register`,
    features: [
      'Aufgabenverwaltung (erstellen, zuweisen, tracken)',
      'Belegerfassung mit Foto-Upload',
      'Chat mit Eigentümer / Hausverwaltung',
      'Status-Tracking für alle Aufträge',
      'Materialverwaltung & Bestellungen',
      'Anbindung an Mieter-App (Mängelmeldungen)',
    ],
    pricing: {
      free: 'Grundfunktionen kostenlos',
      plans: [
        { name: 'Pro', price: '4,99', period: '/Monat', highlight: true },
      ],
    },
    stats: [
      { label: 'Aufgaben', value: '∞' },
      { label: 'Chat', value: 'Live' },
      { label: 'Belege', value: 'Foto' },
    ],
    targetAudience: 'Hausmeister & Facility Manager',
  },
  {
    id: 'ablesung',
    name: 'Ablesung',
    tagline: 'Zählerstand-Erfassung digitalisiert',
    description:
      'Strom, Gas, Wasser, Heizung – alle Zählerstände digital erfassen, tracken und analysieren. Mit Verbrauchsanalyse und CSV-Import.',
    icon: '📊',
    color: 'from-teal-500 to-cyan-500',
    url: APP_URLS.ablesung,
    registerUrl: `${APP_URLS.ablesung}/register`,
    features: [
      'Digitale Zählerstand-Erfassung',
      'Gebäude- & Einheitenverwaltung',
      'Verbrauchsanalyse über Zeiträume',
      'CSV-Import für historische Daten',
      'OCR/Kamera-Erfassung (geplant)',
      'Anbindung an Vermietify (gemeinsame Daten)',
    ],
    pricing: {
      free: 'Grundfunktionen kostenlos',
      plans: [
        { name: 'Pro', price: '2,99', period: '/Monat', highlight: true },
      ],
    },
    stats: [
      { label: 'Zählertypen', value: '4+' },
      { label: 'Analyse', value: 'Ja' },
      { label: 'Import', value: 'CSV' },
    ],
    targetAudience: 'Vermieter & Hausverwaltungen',
  },
  {
    id: 'bescheidboxer',
    name: 'BescheidBoxer',
    tagline: 'Bescheide verstehen & anfechten',
    description:
      'Lade deinen Bescheid hoch und lass ihn analysieren. Grundsteuer, Nebenkosten, Betriebskostenabrechnungen – finde versteckte Fehler und spare Geld.',
    icon: '🥊',
    color: 'from-red-500 to-rose-500',
    url: APP_URLS.bescheidboxer,
    registerUrl: `${APP_URLS.bescheidboxer}/register`,
    features: [
      'Bescheid-Upload & KI-Analyse',
      'Grundsteuerbescheid prüfen',
      'Nebenkostenabrechnung prüfen',
      'Fehler automatisch erkennen',
      'Widerspruch-Vorlagen generieren',
      'Ersparnis-Rechner: So viel kannst du sparen',
    ],
    pricing: {
      free: '1 Analyse/Monat kostenlos',
      plans: [
        { name: 'Basic', price: '2,99', period: '/Monat' },
        { name: 'Pro', price: '7,99', period: '/Monat', highlight: true },
      ],
    },
    stats: [
      { label: 'Bescheid-Typen', value: '5+' },
      { label: 'KI-Analyse', value: 'Ja' },
      { label: 'Widerspruch', value: 'Auto' },
    ],
    targetAudience: 'Mieter & Eigentümer',
    badge: 'Neu',
  },
  {
    id: 'fittutto',
    name: 'FitTutto',
    tagline: 'Dein persoenlicher Fitness-Begleiter',
    description:
      'Trainingsplaene, Workout-Tracking, Ernaehrungstracking, Koerpermessungen und KI-Coaching. 250+ Uebungen, Set-by-Set Logging, Makro-Tracker und mehr.',
    icon: '💪',
    color: 'from-orange-500 to-red-500',
    url: '/fittutto',
    registerUrl: '/register',
    features: [
      'Individuelle Trainingsplaene erstellen & generieren',
      'Workout-Tracking mit 250+ Uebungen',
      'Ernaehrungstracking mit Makro-Zielen',
      'Koerper-Tracking (Gewicht, Umfaenge, KFA)',
      'KI-Fitness-Coach fuer personalisierte Tipps',
      'Persoenliche Rekorde & Streak-Tracking',
    ],
    pricing: {
      free: 'Grundfunktionen kostenlos',
      plans: [
        { name: 'Speichern', price: '2,99', period: '/Monat' },
        { name: 'Basic', price: '4,99', period: '/Monat', highlight: true },
        { name: 'Premium', price: '9,99', period: '/Monat' },
      ],
    },
    stats: [
      { label: 'Uebungen', value: '250+' },
      { label: 'KI-Coach', value: 'Ja' },
      { label: 'Tracking', value: '360°' },
    ],
    targetAudience: 'Fitness-Enthusiasten',
    badge: 'Neu',
  },
]

// Generate a referral URL for a specific app
export function getReferralUrl(app: AppInfo, referralCode: string): string {
  return `${app.registerUrl}?ref=${referralCode}`
}

// Get an app by ID
export function getAppById(id: string): AppInfo | undefined {
  return FINTUTTO_APPS.find((app) => app.id === id)
}
