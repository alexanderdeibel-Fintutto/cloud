export interface SavedDocument {
  id: string
  type: string
  title: string
  data: any
  createdAt: string
  updatedAt: string
  userId: string
}

const STORAGE_KEY = 'mietrecht_documents'

export function getDocuments(userId: string): SavedDocument[] {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  return all.filter((doc: SavedDocument) => doc.userId === userId)
}

export function getDocument(id: string, userId: string): SavedDocument | null {
  const docs = getDocuments(userId)
  return docs.find(doc => doc.id === id) || null
}

export function saveDocument(
  userId: string,
  type: string,
  title: string,
  data: any,
  existingId?: string
): SavedDocument {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const now = new Date().toISOString()

  if (existingId) {
    // Update existing
    const index = all.findIndex((d: SavedDocument) => d.id === existingId && d.userId === userId)
    if (index >= 0) {
      all[index] = {
        ...all[index],
        data,
        title,
        updatedAt: now
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
      return all[index]
    }
  }

  // Create new
  const newDoc: SavedDocument = {
    id: crypto.randomUUID(),
    type,
    title,
    data,
    createdAt: now,
    updatedAt: now,
    userId
  }

  all.push(newDoc)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return newDoc
}

export function deleteDocument(id: string, userId: string): boolean {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const filtered = all.filter((d: SavedDocument) => !(d.id === id && d.userId === userId))

  if (filtered.length < all.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  }
  return false
}

// Document type labels
export const DOCUMENT_TYPES: Record<string, string> = {
  mietvertrag: 'Mietvertrag',
  untermietvertrag: 'Untermietvertrag',
  gewerbemietvertrag: 'Gewerbemietvertrag',
  staffelmietvertrag: 'Staffelmietvertrag',
  indexmietvertrag: 'Indexmietvertrag',
  zeitmietvertrag: 'Zeitmietvertrag',
  'wg-mietvertrag': 'WG-Mietvertrag',
  garagenmietvertrag: 'Garagenmietvertrag',
  ferienwohnungsmietvertrag: 'Ferienwohnungsmietvertrag',
  kuendigung: 'Kündigung',
  'ausserordentliche-kuendigung': 'Außerordentliche Kündigung',
  aufhebungsvertrag: 'Aufhebungsvertrag',
  eigenbedarfskuendigung: 'Eigenbedarfskündigung',
  raeumungsaufforderung: 'Räumungsaufforderung',
  mieterhoehung: 'Mieterhöhung',
  modernisierungsankuendigung: 'Modernisierungsankündigung',
  mietanpassung: 'Mietanpassung',
  mieterhoehungszustimmung: 'Mieterhöhungszustimmung',
  uebergabeprotokoll: 'Übergabeprotokoll',
  schluesseluebergabe: 'Schlüsselübergabe',
  einzugsbestaetigung: 'Einzugsbestätigung',
  auszugsbestaetigung: 'Auszugsbestätigung',
  besichtigungsprotokoll: 'Besichtigungsprotokoll',
  betriebskosten: 'Betriebskostenabrechnung',
  nebenkostenabrechnung: 'Nebenkostenabrechnung',
  'widerspruch-betriebskosten': 'Widerspruch Betriebskosten',
  betriebskostenvorauszahlung: 'Betriebskostenvorauszahlung',
  'erinnerung-nebenkosten': 'Erinnerung Nebenkosten',
  maengelanzeige: 'Mängelanzeige',
  mietminderung: 'Mietminderung',
  reparaturanforderung: 'Reparaturanforderung',
  renovierungsvereinbarung: 'Renovierungsvereinbarung',
  instandhaltungsvereinbarung: 'Instandhaltungsvereinbarung',
  schoenheitsreparaturen: 'Schönheitsreparaturen',
  selbstauskunft: 'Selbstauskunft',
  wohnungsgeberbestaetigung: 'Wohnungsgeberbestätigung',
  mietschuldenfreiheitsbescheinigung: 'Mietschuldenfreiheitsbescheinigung',
  hausordnung: 'Hausordnung',
  untervermietungserlaubnis: 'Untervermietungserlaubnis',
  mietbescheinigung: 'Mietbescheinigung',
  tierhaltungserlaubnis: 'Tierhaltungserlaubnis',
  'sepa-lastschriftmandat': 'SEPA-Lastschriftmandat',
  mahnung: 'Mahnung',
  zahlungserinnerung: 'Zahlungserinnerung',
  mietrueckstand: 'Mietrückstand',
  kautionsabrechnung: 'Kautionsabrechnung',
  kautionsquittung: 'Kautionsquittung',
  kautionsrueckforderung: 'Kautionsrückforderung',
  mietbuergschaft: 'Mietbürgschaft',
  nachtragsvereinbarung: 'Nachtragsvereinbarung',
  stellplatzvereinbarung: 'Stellplatzvereinbarung',
  vollmacht: 'Vollmacht',
  hausmeistervereinbarung: 'Hausmeistervereinbarung',
  mietvorvertrag: 'Mietvorvertrag',
  bewerbungsschreiben: 'Bewerbungsschreiben',
  verwaltervertrag: 'Verwaltervertrag',
  'bauliche-aenderung': 'Bauliche Änderungen',
  sondervereinbarung: 'Sondervereinbarung',
  abmahnung: 'Abmahnung',
  gartennutzungsvereinbarung: 'Gartennutzungsvereinbarung',
}
