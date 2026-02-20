import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const BASE_TITLE = 'Fintutto'

const TITLES: Record<string, string> = {
  '/': 'Fintutto – Mietrecht-Tools für Mieter & Vermieter',
  '/dashboard': 'Dashboard',
  '/preise': 'Preise & Credits',
  '/pricing': 'Preise & Credits',
  '/login': 'Anmelden',
  '/register': 'Kostenlos registrieren',
  '/checkout/success': 'Zahlung erfolgreich',
  '/checkout/cancel': 'Zahlung abgebrochen',
  '/rechner': 'Rechner – 7 Vermieter-Tools',
  '/checker': 'Checker – 10 Mieter-Tools',
  '/formulare': 'Formulare – 10 Vorlagen',
  '/apps': 'Fintutto Ökosystem – 6 Apps',
  '/referral': 'Freunde werben',
  '/impressum': 'Impressum',
  '/datenschutz': 'Datenschutzerklärung',
  '/agb': 'AGB',
  '/ueber-uns': 'Über uns',
  // Rechner
  '/rechner/kaution': 'Kautionsrechner',
  '/rechner/mieterhoehung': 'Mieterhöhungsrechner',
  '/rechner/kaufnebenkosten': 'Kaufnebenkostenrechner',
  '/rechner/eigenkapital': 'Eigenkapitalrechner',
  '/rechner/grundsteuer': 'Grundsteuerrechner',
  '/rechner/rendite': 'Renditerechner',
  '/rechner/nebenkosten': 'Nebenkostenrechner',
  // Checker
  '/checker/mietpreisbremse': 'Mietpreisbremse-Checker',
  '/checker/mieterhoehung': 'Mieterhöhung-Checker',
  '/checker/nebenkosten': 'Nebenkosten-Checker',
  '/checker/betriebskosten': 'Betriebskosten-Checker',
  '/checker/kuendigung': 'Kündigungs-Checker',
  '/checker/kaution': 'Kautions-Checker',
  '/checker/mietminderung': 'Mietminderungs-Checker',
  '/checker/eigenbedarf': 'Eigenbedarf-Checker',
  '/checker/modernisierung': 'Modernisierungs-Checker',
  '/checker/schoenheitsreparaturen': 'Schönheitsreparaturen-Checker',
  // Formulare
  '/formulare/mietvertrag': 'Mietvertrag erstellen',
  '/formulare/uebergabeprotokoll': 'Übergabeprotokoll erstellen',
  '/formulare/mieterhoehung': 'Mieterhöhung erstellen',
  '/formulare/selbstauskunft': 'Selbstauskunft erstellen',
  '/formulare/betriebskosten': 'Betriebskostenabrechnung erstellen',
  '/formulare/kuendigung': 'Kündigung erstellen',
  '/formulare/mahnung': 'Mahnung erstellen',
  '/formulare/mietbescheinigung': 'Mietbescheinigung erstellen',
  '/formulare/wohnungsgeberbestaetigung': 'Wohnungsgeberbestätigung erstellen',
  '/formulare/nebenkostenvorauszahlung': 'Nebenkostenvorauszahlung erstellen',
}

export function useDocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const title = TITLES[pathname]
    document.title = title
      ? title === TITLES['/'] ? title : `${title} | ${BASE_TITLE}`
      : `${BASE_TITLE}`
  }, [pathname])
}
