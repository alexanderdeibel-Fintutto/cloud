import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client'

export interface SavedDocument {
  id: string
  type: string
  title: string
  data: any
  createdAt: string
  updatedAt: string
  userId: string
}

// Database row type for user_documents
interface UserDocumentRow {
  id: string
  user_id: string
  app_id: string
  doc_type: string
  title: string
  data: any
  created_at: string
  updated_at: string
}

const STORAGE_KEY = 'mietrecht_documents'
const APP_ID = import.meta.env.VITE_APP_ID || 'ft-formulare'

// Get documents from Supabase or localStorage fallback
export async function getDocuments(userId: string): Promise<SavedDocument[]> {
  if (!isSupabaseConfigured()) {
    return getLocalDocuments(userId)
  }

  try {
    const { data, error } = await (supabase
      .from('user_documents') as any)
      .select('*')
      .eq('user_id', userId)
      .eq('app_id', APP_ID)
      .order('updated_at', { ascending: false }) as { data: UserDocumentRow[] | null; error: any }

    if (error) {
      console.error('Error loading documents from Supabase:', error)
      return getLocalDocuments(userId)
    }

    return (data || []).map(doc => ({
      id: doc.id,
      type: doc.doc_type,
      title: doc.title,
      data: doc.data,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      userId: doc.user_id
    }))
  } catch (err) {
    console.error('Error fetching documents:', err)
    return getLocalDocuments(userId)
  }
}

// Get single document
export async function getDocument(id: string, userId: string): Promise<SavedDocument | null> {
  if (!isSupabaseConfigured()) {
    return getLocalDocument(id, userId)
  }

  try {
    const { data, error } = await (supabase
      .from('user_documents') as any)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single() as { data: UserDocumentRow | null; error: any }

    if (error || !data) {
      return getLocalDocument(id, userId)
    }

    return {
      id: data.id,
      type: data.doc_type,
      title: data.title,
      data: data.data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id
    }
  } catch (err) {
    console.error('Error fetching document:', err)
    return getLocalDocument(id, userId)
  }
}

// Save document to Supabase or localStorage fallback
export async function saveDocument(
  userId: string,
  type: string,
  title: string,
  data: any,
  existingId?: string
): Promise<SavedDocument> {
  if (!isSupabaseConfigured()) {
    return saveLocalDocument(userId, type, title, data, existingId)
  }

  const now = new Date().toISOString()

  try {
    if (existingId) {
      // Update existing document
      const { data: updated, error } = await (supabase
        .from('user_documents') as any)
        .update({
          title,
          data,
          updated_at: now
        })
        .eq('id', existingId)
        .eq('user_id', userId)
        .select()
        .single() as { data: UserDocumentRow | null; error: any }

      if (error || !updated) {
        console.error('Error updating document:', error)
        return saveLocalDocument(userId, type, title, data, existingId)
      }

      return {
        id: updated.id,
        type: updated.doc_type,
        title: updated.title,
        data: updated.data,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
        userId: updated.user_id
      }
    }

    // Create new document
    const { data: created, error } = await (supabase
      .from('user_documents') as any)
      .insert({
        user_id: userId,
        app_id: APP_ID,
        doc_type: type,
        title,
        data
      })
      .select()
      .single() as { data: UserDocumentRow | null; error: any }

    if (error || !created) {
      console.error('Error creating document:', error)
      return saveLocalDocument(userId, type, title, data)
    }

    return {
      id: created.id,
      type: created.doc_type,
      title: created.title,
      data: created.data,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
      userId: created.user_id
    }
  } catch (err) {
    console.error('Error saving document:', err)
    return saveLocalDocument(userId, type, title, data, existingId)
  }
}

// Delete document
export async function deleteDocument(id: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return deleteLocalDocument(id, userId)
  }

  try {
    const { error } = await (supabase
      .from('user_documents') as any)
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting document:', error)
      return deleteLocalDocument(id, userId)
    }

    return true
  } catch (err) {
    console.error('Error deleting document:', err)
    return deleteLocalDocument(id, userId)
  }
}

// ============= LocalStorage Fallback Functions =============

function getLocalDocuments(userId: string): SavedDocument[] {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  return all.filter((doc: SavedDocument) => doc.userId === userId)
}

function getLocalDocument(id: string, userId: string): SavedDocument | null {
  const docs = getLocalDocuments(userId)
  return docs.find(doc => doc.id === id) || null
}

function saveLocalDocument(
  userId: string,
  type: string,
  title: string,
  data: any,
  existingId?: string
): SavedDocument {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const now = new Date().toISOString()

  if (existingId) {
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

function deleteLocalDocument(id: string, userId: string): boolean {
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
  abmahnung: 'Abmahnung',
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
  gartennutzungsvereinbarung: 'Gartennutzungsvereinbarung',
}
