// Gemeinsame Typen für alle Formulare
import { PersonData } from '@/components/fields/PersonField'
import { AddressData } from '@/components/fields/AddressField'
import { SignatureData } from '@/components/fields/SignatureField'

// ============================================
// GEWERBEMIETVERTRAG (Commercial Lease)
// ============================================
export interface GewerbemietvertragData {
  // Vertragsparteien
  vermieter: PersonData
  vermieterAdresse: AddressData
  vermieterSteuerNr?: string
  vermieterUstId?: string

  mieter: PersonData
  mieterAdresse: AddressData
  mieterFirma?: string
  mieterHandelsregister?: string
  mieterSteuerNr?: string
  mieterUstId?: string

  // Mietobjekt
  objektAdresse: AddressData
  objektArt: 'buero' | 'laden' | 'lager' | 'werkstatt' | 'praxis' | 'gastro' | 'sonstige'
  objektArtSonstige?: string
  nutzflaeche: number | null
  nebenflaeche: number | null
  stellplaetze: number | null

  // Nutzungszweck
  nutzungszweck: string
  nutzungsaenderungErlaubt: boolean

  // Mietzeit
  mietbeginn: string
  mietende?: string
  befristet: boolean
  mindestlaufzeit?: number // in Monaten
  verlaengerungsoption?: string
  kuendigungsfrist: number // in Monaten

  // Miete
  nettokaltmiete: number | null
  nebenkostenvorauszahlung: number | null
  nebenkostenPauschal: boolean
  umsatzsteuerPflichtig: boolean
  umsatzsteuerSatz: number
  indexmiete: boolean
  staffelmiete: boolean

  // Kaution
  kautionHoehe: number | null
  kautionArt: 'barkaution' | 'buergschaft' | 'keine'

  // Betriebskosten
  betriebskostenUmfang: string[]

  // Instandhaltung
  instandhaltungMieter: string[]
  schoenheitsreparaturenMieter: boolean

  // Besondere Vereinbarungen
  konkurrenzschutz: boolean
  konkurrenzschutzDetails?: string
  werbungErlaubt: boolean
  untervermietungErlaubt: boolean

  // Unterschriften
  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData

  erstelltAm: string
}

// ============================================
// STAFFELMIETVERTRAG (Graduated Rent)
// ============================================
export interface StaffelmietvertragData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData[]
  mieterAdresse: AddressData

  objektAdresse: AddressData
  wohnflaeche: number | null
  zimmeranzahl: number | null

  mietbeginn: string
  mietende?: string
  befristet: boolean

  // Staffelmiete nach § 557a BGB
  anfangsmiete: number | null
  staffeln: {
    abDatum: string
    kaltmiete: number | null
  }[]

  nebenkostenvorauszahlung: number | null

  kaution: number | null

  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData

  erstelltAm: string
}

// ============================================
// INDEXMIETVERTRAG (Index-linked Rent)
// ============================================
export interface IndexmietvertragData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData[]
  mieterAdresse: AddressData

  objektAdresse: AddressData
  wohnflaeche: number | null
  zimmeranzahl: number | null

  mietbeginn: string
  mietende?: string
  befristet: boolean

  // Indexmiete nach § 557b BGB
  anfangsmiete: number | null
  basisindex: number | null // Verbraucherpreisindex Basisjahr
  basisindexJahr: string
  anpassungsschwelle: number // Prozent (mind. 1 Jahr)
  anpassungsintervall: number // Monate

  nebenkostenvorauszahlung: number | null

  kaution: number | null

  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData

  erstelltAm: string
}

// ============================================
// ZEITMIETVERTRAG (Fixed-term Lease)
// ============================================
export interface ZeitmietvertragData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData[]
  mieterAdresse: AddressData

  objektAdresse: AddressData
  wohnflaeche: number | null
  zimmeranzahl: number | null

  mietbeginn: string
  mietende: string // Pflichtfeld bei Zeitmietvertrag

  // Befristungsgrund nach § 575 BGB
  befristungsgrund: 'eigenbedarf' | 'abriss' | 'umbau' | 'werkwohnung'
  befristungsgrundDetails: string

  kaltmiete: number | null
  nebenkostenvorauszahlung: number | null

  kaution: number | null

  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData

  erstelltAm: string
}

// ============================================
// MÖBLIERTER MIETVERTRAG (Furnished Rental)
// ============================================
export interface MoeblierterMietvertragData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData

  objektAdresse: AddressData
  wohnflaeche: number | null
  zimmeranzahl: number | null

  mietbeginn: string
  mietende?: string
  befristet: boolean
  kuendigungsfrist: number // Wochen oder Monate

  // Möblierung
  moebelInventar: {
    raum: string
    gegenstand: string
    zustand: 'neu' | 'gut' | 'gebraucht'
    wert?: number
  }[]

  // Miete (inkl. Möblierungszuschlag)
  grundmiete: number | null
  moeblierungszuschlag: number | null
  nebenkostenvorauszahlung: number | null
  nebenkostenInklusive: boolean

  kaution: number | null

  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData

  erstelltAm: string
}

// ============================================
// WG-MIETVERTRAG (Shared Flat)
// ============================================
export interface WGMietvertragData {
  vermieter: PersonData
  vermieterAdresse: AddressData

  // WG-Modell
  wgModell: 'hauptmieter' | 'alle_hauptmieter' | 'untermieter'

  // Hauptmieter (bei Hauptmieter-Modell)
  hauptmieter?: PersonData
  hauptmieterAdresse?: AddressData

  // Alle Mieter
  mieter: PersonData[]

  objektAdresse: AddressData
  wohnflaeche: number | null
  zimmeranzahl: number | null
  gemeinschaftsraeume: string[]

  // Zimmeraufteilung
  zimmeraufteilung: {
    mieterIndex: number
    zimmerNr: string
    zimmerGroesse: number | null
    anteilMiete: number | null
  }[]

  mietbeginn: string
  mietende?: string
  befristet: boolean

  gesamtmiete: number | null
  nebenkostenvorauszahlung: number | null

  // Nachmieterklausel
  nachmieterklausel: boolean

  kaution: number | null

  unterschriftVermieter: SignatureData
  unterschriftenMieter: SignatureData[]

  erstelltAm: string
}

// ============================================
// GARAGENMIETVERTRAG (Garage/Parking)
// ============================================
export interface GaragenmietvertragData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData

  // Objekt
  objektArt: 'garage' | 'stellplatz' | 'tiefgarage' | 'carport'
  objektAdresse: AddressData
  objektNummer?: string
  objektGroesse?: number

  // Optional: Verbindung zu Wohnung
  verbundenMitWohnung: boolean
  wohnungsMietvertragVom?: string

  mietbeginn: string
  mietende?: string
  befristet: boolean
  kuendigungsfrist: number // Monate

  monatlicheMiete: number | null
  umsatzsteuerPflichtig: boolean

  // Nutzung
  erlaubteNutzung: string[]
  kfzKennzeichen?: string

  // Schlüssel
  anzahlSchluessel: number

  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData

  erstelltAm: string
}

// ============================================
// FERIENWOHNUNGSMIETVERTRAG (Vacation Rental)
// ============================================
export interface FerienwohnungsmietvertragData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData

  objektAdresse: AddressData
  objektBezeichnung: string
  wohnflaeche: number | null
  maxPersonen: number

  // Mietzeit
  anreiseDatum: string
  anreiseUhrzeit: string
  abreiseDatum: string
  abreiseUhrzeit: string

  // Kosten
  mietpreisGesamt: number | null
  mietpreisProNacht: number | null
  endreinigung: number | null
  nebenkostenInklusive: boolean

  // Anzahlung
  anzahlung: number | null
  anzahlungFaellig: string
  restzahlungFaellig: string

  // Kaution
  kaution: number | null

  // Stornierung
  stornobedingungen: 'flexibel' | 'moderat' | 'streng'

  // Ausstattung
  ausstattung: string[]
  haustiere: boolean
  rauchen: boolean

  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData

  erstelltAm: string
}

// ============================================
// WOHNUNGSGEBERBESTÄTIGUNG (§ 19 BMG)
// ============================================
export interface WohnungsgeberbestaetigungData {
  // Wohnungsgeber (Vermieter)
  wohnungsgeber: PersonData
  wohnungsgeberAdresse: AddressData
  wohnungsgeberIstEigentuemer: boolean

  // Meldepflichtige Person
  meldepflichtiger: PersonData
  meldepflichtigerGeburtsdatum: string
  meldepflichtigerGeburtsort?: string
  meldepflichtigerStaatsangehoerigkeit?: string

  // Wohnung
  wohnungAdresse: AddressData
  einzugsdatum: string

  // Art der Meldung
  meldeart: 'einzug' | 'auszug'
  auszugsdatum?: string

  unterschriftWohnungsgeber: SignatureData
  ausstellungsdatum: string
  ausstellungsort: string
}

// ============================================
// MIETSCHULDENFREIHEITSBESCHEINIGUNG
// ============================================
export interface MietschuldenfreiheitsbescheinigungData {
  vermieter: PersonData
  vermieterAdresse: AddressData

  mieter: PersonData
  mieterAdresse: AddressData

  mietobjektAdresse: AddressData
  mietverhaeltnisVon: string
  mietverhaeltnisBis?: string
  mietverhaeltnisLaufend: boolean

  // Bestätigung
  keineMietrueckstaende: boolean
  keineNebenkostenrueckstaende: boolean
  keineSchaeden: boolean

  bemerkungen?: string

  unterschriftVermieter: SignatureData
  ausstellungsdatum: string
  ausstellungsort: string
}

// ============================================
// KAUTIONSRÜCKFORDERUNG
// ============================================
export interface KautionsrueckforderungData {
  mieter: PersonData
  mieterNeueAdresse: AddressData

  vermieter: PersonData
  vermieterAdresse: AddressData

  mietobjektAdresse: AddressData
  mietverhaeltnisEnde: string
  wohnungsuebergabe: string

  kautionHoehe: number | null
  kautionArt: 'barkaution' | 'sparbuch' | 'buergschaft'
  kautionEingezahltAm?: string

  // Bankverbindung für Rückzahlung
  bankinhaber: string
  iban: string
  bic?: string

  fristBis: string

  unterschriftMieter: SignatureData
  erstelltAm: string
}

// ============================================
// MIETMINDERUNGSANZEIGE
// ============================================
export interface MietminderungsanzeigeData {
  mieter: PersonData
  mieterAdresse: AddressData

  vermieter: PersonData
  vermieterAdresse: AddressData

  mietobjektAdresse: AddressData

  // Mangel
  mangelBeschreibung: string
  mangelEntdecktAm: string
  mangelGemeldetAm?: string
  mangelKategorie: string

  // Minderung
  aktuelleKaltmiete: number | null
  minderungsquote: number // Prozent
  minderungsbetrag: number | null
  minderungAb: string

  // Begründung
  begruendung: string

  // Frist
  fristBeseitigung: string

  unterschriftMieter: SignatureData
  erstelltAm: string
}

// ============================================
// MAHNUNG (Zahlungserinnerung)
// ============================================
export interface MahnungData {
  // Absender (Vermieter)
  vermieter: PersonData
  vermieterAdresse: AddressData

  // Empfänger (Mieter)
  mieter: PersonData
  mieterAdresse: AddressData

  mietobjektAdresse: AddressData

  // Mahnungsstufe
  mahnungsstufe: 1 | 2 | 3

  // Forderung
  rueckstaende: {
    zeitraum: string
    art: 'miete' | 'nebenkosten' | 'sonstige'
    betrag: number | null
  }[]

  gesamtforderung: number | null
  mahngebuehr?: number
  verzugszinsen?: number

  // Fristen
  zahlungsfrist: string

  // Konsequenzen
  androhungKuendigung: boolean
  androhungInkasso: boolean

  // Bankverbindung
  bankinhaber: string
  iban: string
  verwendungszweck: string

  unterschriftVermieter: SignatureData
  erstelltAm: string
}

// ============================================
// SEPA-LASTSCHRIFTMANDAT
// ============================================
export interface SEPALastschriftmandatData {
  // Zahlungsempfänger (Vermieter)
  zahlungsempfaenger: PersonData
  zahlungsempfaengerAdresse: AddressData
  glaeubigerIdentifikationsnummer: string
  mandatsreferenz: string

  // Zahlungspflichtiger (Mieter)
  zahlungspflichtiger: PersonData
  zahlungspflichtigerAdresse: AddressData

  // Bankverbindung
  kontoinhaber: string
  iban: string
  bic?: string
  kreditinstitut: string

  // Mandat
  mandatArt: 'einmalig' | 'wiederkehrend'
  zahlungsart: 'miete' | 'nebenkosten' | 'miete_und_nebenkosten'
  betrag?: number

  mietobjektAdresse: AddressData

  unterschriftZahlungspflichtiger: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

// ============================================
// HAUSORDNUNG
// ============================================
export interface HausordnungData {
  // Objekt
  objektBezeichnung: string
  objektAdresse: AddressData

  vermieter: PersonData
  vermieterAdresse: AddressData

  // Ruhezeiten
  ruhezeiten: {
    wochentagsVon: string
    wochentagsBis: string
    wochenendeVon: string
    wochenendesBis: string
    mittagsruhe: boolean
    mittagsruheVon?: string
    mittagsruheBis?: string
  }

  // Regelungen
  regelungen: {
    kategorie: string
    regeln: string[]
  }[]

  // Gemeinschaftseinrichtungen
  gemeinschaftseinrichtungen: {
    name: string
    nutzungszeiten?: string
    besondereRegeln?: string
  }[]

  // Müllentsorgung
  muellentsorgung: {
    abholungstag: string
    trennungspflicht: boolean
    standort: string
  }

  // Treppenhausreinigung
  treppenhausreinigung: {
    art: 'vermieter' | 'mieter_wechselnd' | 'reinigungsfirma'
    turnus?: string
  }

  // Winterdienst
  winterdienst: {
    verantwortlich: 'vermieter' | 'mieter_wechselnd' | 'firma'
    zeiten?: string
  }

  gueltigAb: string

  unterschriftVermieter: SignatureData
}

// Export all empty defaults
export const EMPTY_PERSON: PersonData = {
  anrede: '',
  titel: '',
  vorname: '',
  nachname: '',
  telefon: '',
  email: ''
}

export const EMPTY_ADDRESS: AddressData = {
  strasse: '',
  hausnummer: '',
  plz: '',
  ort: '',
  land: 'Deutschland'
}

export const EMPTY_SIGNATURE: SignatureData = {
  imageData: null,
  signerName: '',
  signedAt: null,
  signedLocation: ''
}
