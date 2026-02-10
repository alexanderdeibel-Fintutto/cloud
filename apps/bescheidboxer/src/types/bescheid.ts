export type BescheidStatus = 'neu' | 'in_pruefung' | 'geprueft' | 'einspruch' | 'erledigt'
export type BescheidTyp = 'einkommensteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'koerperschaftsteuer' | 'grundsteuer' | 'sonstige'
export type EinspruchStatus = 'entwurf' | 'eingereicht' | 'in_bearbeitung' | 'entschieden' | 'zurueckgenommen'

export interface Bescheid {
  id: string
  titel: string
  typ: BescheidTyp
  steuerjahr: number
  eingangsdatum: string
  finanzamt: string
  aktenzeichen: string
  status: BescheidStatus
  festgesetzteSteuer: number
  erwarteteSteuer: number | null
  abweichung: number | null
  abweichungProzent: number | null
  einspruchsfrist: string
  dokumentUrl: string | null
  notizen: string | null
  pruefungsergebnis: Pruefungsergebnis | null
  createdAt: string
  updatedAt: string
}

export interface Pruefungsergebnis {
  abweichungen: Abweichung[]
  empfehlung: 'akzeptieren' | 'einspruch' | 'pruefen'
  zusammenfassung: string
  einsparpotenzial: number
}

export interface Abweichung {
  id: string
  position: string
  beschreibung: string
  erklaerterBetrag: number
  festgesetzterBetrag: number
  differenz: number
  kategorie: 'werbungskosten' | 'sonderausgaben' | 'aussergewoehnliche_belastungen' | 'vorsorgeaufwendungen' | 'einkuenfte' | 'freibetraege' | 'sonstige'
  schweregrad: 'info' | 'warnung' | 'kritisch'
}

export interface Einspruch {
  id: string
  bescheidId: string
  status: EinspruchStatus
  begruendung: string
  forderung: number
  eingereichtAm: string | null
  frist: string
  antwortErhalten: string | null
  ergebnis: string | null
  createdAt: string
}

export interface Frist {
  id: string
  bescheidId: string
  bescheidTitel: string
  typ: 'einspruch' | 'zahlung' | 'nachreichung'
  fristdatum: string
  erledigt: boolean
  notiz: string | null
}

export interface DashboardStats {
  bescheideGesamt: number
  offenePruefungen: number
  einsprueche: number
  einsparpotenzial: number
  ablaufendeFristen: number
  abweichungenGesamt: number
}

export const BESCHEID_TYP_LABELS: Record<BescheidTyp, string> = {
  einkommensteuer: 'Einkommensteuer',
  gewerbesteuer: 'Gewerbesteuer',
  umsatzsteuer: 'Umsatzsteuer',
  koerperschaftsteuer: 'Koerperschaftsteuer',
  grundsteuer: 'Grundsteuer',
  sonstige: 'Sonstige',
}

export const BESCHEID_STATUS_LABELS: Record<BescheidStatus, string> = {
  neu: 'Neu',
  in_pruefung: 'In Pruefung',
  geprueft: 'Geprueft',
  einspruch: 'Einspruch',
  erledigt: 'Erledigt',
}

export const EINSPRUCH_STATUS_LABELS: Record<EinspruchStatus, string> = {
  entwurf: 'Entwurf',
  eingereicht: 'Eingereicht',
  in_bearbeitung: 'In Bearbeitung',
  entschieden: 'Entschieden',
  zurueckgenommen: 'Zurueckgenommen',
}
