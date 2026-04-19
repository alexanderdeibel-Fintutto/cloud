export type AccountCategory =
  | 'FIXED_ASSETS' | 'BANK' | 'RECEIVABLES' | 'CURRENT_ASSETS'
  | 'PAYABLES' | 'LIABILITIES' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'TAX'

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'

export interface Account {
  number: string
  name: string
  type: AccountType
  category: AccountCategory
  taxRate?: number
}

export const SKR03: Account[] = [
  // Klasse 0: Anlage- und Kapitalkonten
  { number: '0010', name: 'Aufwendungen für die Ingangsetzung des Geschäftsbetriebs', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0027', name: 'EDV-Software', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0030', name: 'Lizenzen', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0050', name: 'Geschäfts- oder Firmenwert', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0100', name: 'Grundstücke, grundstücksgleiche Rechte', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0200', name: 'Technische Anlagen und Maschinen', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0400', name: 'Betriebsausstattung', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0410', name: 'Geschäftsausstattung', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0420', name: 'Büroeinrichtung', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0480', name: 'GWG (geringwertige Wirtschaftsgüter)', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0520', name: 'Fuhrpark (Pkw)', type: 'ASSET', category: 'FIXED_ASSETS' },
  // Klasse 1: Finanz- und Privatkonten
  { number: '1000', name: 'Kasse', type: 'ASSET', category: 'BANK' },
  { number: '1200', name: 'Bank', type: 'ASSET', category: 'BANK' },
  { number: '1210', name: 'Bank 2', type: 'ASSET', category: 'BANK' },
  { number: '1400', name: 'Forderungen aus Lieferungen und Leistungen', type: 'ASSET', category: 'RECEIVABLES' },
  { number: '1460', name: 'Zweifelhafte Forderungen', type: 'ASSET', category: 'RECEIVABLES' },
  { number: '1500', name: 'Sonstige Vermögensgegenstände', type: 'ASSET', category: 'CURRENT_ASSETS' },
  { number: '1550', name: 'Kautionen', type: 'ASSET', category: 'CURRENT_ASSETS' },
  { number: '1576', name: 'Vorsteuer 19%', type: 'ASSET', category: 'TAX', taxRate: 19 },
  { number: '1571', name: 'Vorsteuer 7%', type: 'ASSET', category: 'TAX', taxRate: 7 },
  { number: '1600', name: 'Verbindlichkeiten aus Lieferungen und Leistungen', type: 'LIABILITY', category: 'PAYABLES' },
  { number: '1700', name: 'Sonstige Verbindlichkeiten', type: 'LIABILITY', category: 'LIABILITIES' },
  { number: '1710', name: 'Erhaltene Anzahlungen', type: 'LIABILITY', category: 'LIABILITIES' },
  { number: '1741', name: 'Umsatzsteuer 19%', type: 'LIABILITY', category: 'TAX', taxRate: 19 },
  { number: '1742', name: 'Umsatzsteuer 7%', type: 'LIABILITY', category: 'TAX', taxRate: 7 },
  { number: '1800', name: 'Privatentnahmen', type: 'EQUITY', category: 'EQUITY' },
  { number: '1890', name: 'Privateinlagen', type: 'EQUITY', category: 'EQUITY' },
  { number: '1900', name: 'Eigenkapital', type: 'EQUITY', category: 'EQUITY' },
  // Klasse 2: Abgrenzungskonten
  { number: '2000', name: 'Eröffnungsbilanzkonto', type: 'EQUITY', category: 'EQUITY' },
  // Klasse 4: Betriebliche Aufwendungen
  { number: '4000', name: 'Löhne und Gehälter', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4010', name: 'Gehälter', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4030', name: 'Aushilfslöhne', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4100', name: 'Gesetzliche soziale Aufwendungen', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4120', name: 'Beiträge zur Berufsgenossenschaft', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4130', name: 'Freiwillige soziale Aufwendungen', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4200', name: 'Abschreibungen auf Sachanlagen', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4210', name: 'Abschreibungen auf immaterielle Vermögensgegenstände', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4300', name: 'Miete, Pacht', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4320', name: 'Heizung, Beleuchtung, Energie', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4360', name: 'Reinigung', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4380', name: 'Reparatur und Instandhaltung', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4400', name: 'Fahrzeugkosten', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4500', name: 'Werbekosten', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4510', name: 'Reisekosten', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4600', name: 'Bürobedarf', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4610', name: 'Porto und Telefon', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4620', name: 'EDV-Kosten', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4630', name: 'Buchführungskosten', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4650', name: 'Rechts- und Beratungskosten', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4700', name: 'Versicherungen', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4730', name: 'Beiträge', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4800', name: 'Zinsaufwendungen', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '4900', name: 'Sonstige betriebliche Aufwendungen', type: 'EXPENSE', category: 'EXPENSE' },
  // Klasse 8: Erlöskonten
  { number: '8000', name: 'Erlöse 19% USt', type: 'REVENUE', category: 'REVENUE', taxRate: 19 },
  { number: '8100', name: 'Erlöse 7% USt', type: 'REVENUE', category: 'REVENUE', taxRate: 7 },
  { number: '8200', name: 'Steuerfreie Erlöse', type: 'REVENUE', category: 'REVENUE', taxRate: 0 },
  { number: '8400', name: 'Erlöse aus Lieferungen und Leistungen 19%', type: 'REVENUE', category: 'REVENUE', taxRate: 19 },
  { number: '8300', name: 'Erlöse aus Lieferungen und Leistungen 7%', type: 'REVENUE', category: 'REVENUE', taxRate: 7 },
  { number: '8600', name: 'Sonstige betriebliche Erträge', type: 'REVENUE', category: 'REVENUE' },
  { number: '8700', name: 'Zinserträge', type: 'REVENUE', category: 'REVENUE' },
]

export const SKR04: Account[] = [
  // Klasse 0: Anlagevermögen
  { number: '0100', name: 'Entwicklungskosten', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0130', name: 'EDV-Software', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0140', name: 'Lizenzen', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0200', name: 'Grundstücke', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0400', name: 'Technische Anlagen und Maschinen', type: 'ASSET', category: 'FIXED_ASSETS' },
  { number: '0650', name: 'Betriebs- und Geschäftsausstattung', type: 'ASSET', category: 'FIXED_ASSETS' },
  // Klasse 1: Umlaufvermögen
  { number: '1000', name: 'Kasse', type: 'ASSET', category: 'BANK' },
  { number: '1200', name: 'Guthaben bei Kreditinstituten', type: 'ASSET', category: 'BANK' },
  { number: '1400', name: 'Forderungen aus Lieferungen und Leistungen', type: 'ASSET', category: 'RECEIVABLES' },
  { number: '1406', name: 'Vorsteuer 19%', type: 'ASSET', category: 'TAX', taxRate: 19 },
  { number: '1401', name: 'Vorsteuer 7%', type: 'ASSET', category: 'TAX', taxRate: 7 },
  // Klasse 2: Eigenkapital
  { number: '2000', name: 'Gezeichnetes Kapital', type: 'EQUITY', category: 'EQUITY' },
  { number: '2100', name: 'Kapitalrücklage', type: 'EQUITY', category: 'EQUITY' },
  { number: '2970', name: 'Gewinnvortrag', type: 'EQUITY', category: 'EQUITY' },
  // Klasse 3: Fremdkapital
  { number: '3200', name: 'Verbindlichkeiten aus Lieferungen und Leistungen', type: 'LIABILITY', category: 'PAYABLES' },
  { number: '3300', name: 'Sonstige Verbindlichkeiten', type: 'LIABILITY', category: 'LIABILITIES' },
  { number: '3806', name: 'Umsatzsteuer 19%', type: 'LIABILITY', category: 'TAX', taxRate: 19 },
  { number: '3801', name: 'Umsatzsteuer 7%', type: 'LIABILITY', category: 'TAX', taxRate: 7 },
  // Klasse 4: Erträge
  { number: '4000', name: 'Umsatzerlöse 19% USt', type: 'REVENUE', category: 'REVENUE', taxRate: 19 },
  { number: '4100', name: 'Umsatzerlöse 7% USt', type: 'REVENUE', category: 'REVENUE', taxRate: 7 },
  { number: '4200', name: 'Steuerfreie Umsatzerlöse', type: 'REVENUE', category: 'REVENUE', taxRate: 0 },
  { number: '4830', name: 'Sonstige betriebliche Erträge', type: 'REVENUE', category: 'REVENUE' },
  // Klasse 6: Aufwendungen
  { number: '6000', name: 'Löhne und Gehälter', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '6010', name: 'Gehälter', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '6200', name: 'Abschreibungen auf Sachanlagen', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '6300', name: 'Mieten und Pachten', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '6400', name: 'Werbekosten', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '6500', name: 'Reisekosten', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '6600', name: 'Bürobedarf', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '6700', name: 'Versicherungen', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '6800', name: 'Zinsaufwendungen', type: 'EXPENSE', category: 'EXPENSE' },
  { number: '6900', name: 'Sonstige betriebliche Aufwendungen', type: 'EXPENSE', category: 'EXPENSE' },
]

export function getAccountsByType(accounts: Account[], type: AccountType): Account[] {
  return accounts.filter(a => a.type === type)
}

export function getAccountByNumber(accounts: Account[], number: string): Account | undefined {
  return accounts.find(a => a.number === number)
}
