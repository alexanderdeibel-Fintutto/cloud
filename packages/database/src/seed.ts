import { PrismaClient, ChartOfAccountsType, AccountType, AccountCategory, TaxType } from '@prisma/client';

const prisma = new PrismaClient();

// SKR03 Kontenrahmen - Standardkontenrahmen für Gewerbetreibende
const SKR03_ACCOUNTS = [
  // Klasse 0: Anlage- und Kapitalkonten
  { number: '0010', name: 'Aufwendungen für die Ingangsetzung des Geschäftsbetriebs', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0027', name: 'EDV-Software', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0030', name: 'Lizenzen', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0050', name: 'Geschäfts- oder Firmenwert', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0100', name: 'Grundstücke, grundstücksgleiche Rechte', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0200', name: 'Technische Anlagen und Maschinen', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0400', name: 'Betriebsausstattung', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0410', name: 'Geschäftsausstattung', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0420', name: 'Büroeinrichtung', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0480', name: 'GWG (geringwertige Wirtschaftsgüter)', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0520', name: 'Fuhrpark (Pkw)', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0540', name: 'Fuhrpark (Lkw)', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0650', name: 'Beteiligungen', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },
  { number: '0700', name: 'Ausleihungen', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSETS },

  // Klasse 1: Finanz- und Privatkonten
  { number: '1000', name: 'Kasse', type: AccountType.ASSET, category: AccountCategory.BANK },
  { number: '1100', name: 'Postbank', type: AccountType.ASSET, category: AccountCategory.BANK },
  { number: '1200', name: 'Bank', type: AccountType.ASSET, category: AccountCategory.BANK },
  { number: '1210', name: 'Bank 2', type: AccountType.ASSET, category: AccountCategory.BANK },
  { number: '1220', name: 'Bank 3', type: AccountType.ASSET, category: AccountCategory.BANK },
  { number: '1300', name: 'Wechsel', type: AccountType.ASSET, category: AccountCategory.RECEIVABLES },
  { number: '1400', name: 'Forderungen aus Lieferungen und Leistungen', type: AccountType.ASSET, category: AccountCategory.RECEIVABLES },
  { number: '1410', name: 'Forderungen aus L.u.L. ohne Kontokorrent', type: AccountType.ASSET, category: AccountCategory.RECEIVABLES },
  { number: '1450', name: 'Forderungen nach § 11 EStG', type: AccountType.ASSET, category: AccountCategory.RECEIVABLES },
  { number: '1460', name: 'Zweifelhafte Forderungen', type: AccountType.ASSET, category: AccountCategory.RECEIVABLES },
  { number: '1500', name: 'Sonstige Vermögensgegenstände', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1510', name: 'Geleistete Anzahlungen', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1520', name: 'Darlehen', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1530', name: 'Forderungen gegen Gesellschafter', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1540', name: 'Forderungen gegen verbundene Unternehmen', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1545', name: 'Forderungen gegen Unternehmen, mit denen ein Beteiligungsverhältnis besteht', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1548', name: 'Ansprüche aus Rückdeckungsversicherungen', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1550', name: 'Kautionen', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1560', name: 'Vorsteuer-Forderungen', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1570', name: 'Vorsteuer frühere Jahre', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1576', name: 'Vorsteuer 19%', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS, taxRate: 19, taxType: TaxType.INPUT_TAX_19 },
  { number: '1571', name: 'Vorsteuer 7%', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS, taxRate: 7, taxType: TaxType.INPUT_TAX_7 },
  { number: '1580', name: 'Umsatzsteuer-Forderungen', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1590', name: 'Durchlaufende Posten', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSETS },
  { number: '1600', name: 'Verbindlichkeiten aus Lieferungen und Leistungen', type: AccountType.LIABILITY, category: AccountCategory.PAYABLES },
  { number: '1700', name: 'Sonstige Verbindlichkeiten', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1710', name: 'Erhaltene Anzahlungen', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1720', name: 'Darlehen', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1730', name: 'Verbindlichkeiten gegen Gesellschafter', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1740', name: 'Verbindlichkeiten gegen verbundene Unternehmen', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1750', name: 'Verbindlichkeiten aus Steuern', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1755', name: 'Lohnsteuer', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1760', name: 'Umsatzsteuer-Verbindlichkeiten', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1766', name: 'Umsatzsteuer 19%', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES, taxRate: 19, taxType: TaxType.VAT_19 },
  { number: '1771', name: 'Umsatzsteuer 7%', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES, taxRate: 7, taxType: TaxType.VAT_7 },
  { number: '1776', name: 'Umsatzsteuer nicht fällig 19%', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1780', name: 'Umsatzsteuer-Vorauszahlungen', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1790', name: 'Umsatzsteuer Vorjahre', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },
  { number: '1800', name: 'Privatentnahmen allgemein', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '1810', name: 'Privatsteuern', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '1890', name: 'Privateinlagen', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '1900', name: 'Aktive Rechnungsabgrenzung', type: AccountType.ASSET, category: AccountCategory.PREPAID },
  { number: '1990', name: 'Passive Rechnungsabgrenzung', type: AccountType.LIABILITY, category: AccountCategory.DEFERRED },

  // Klasse 2: Eigenkapital und Rückstellungen
  { number: '2000', name: 'Gezeichnetes Kapital', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '2010', name: 'Ausstehende Einlagen (nicht eingefordert)', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '2020', name: 'Ausstehende Einlagen (eingefordert)', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '2100', name: 'Kapitalrücklage', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '2200', name: 'Gewinnrücklagen', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '2300', name: 'Gewinnvortrag', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '2310', name: 'Verlustvortrag', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '2400', name: 'Jahresüberschuss/Jahresfehlbetrag', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '2500', name: 'Rückstellungen für Pensionen', type: AccountType.LIABILITY, category: AccountCategory.PROVISIONS },
  { number: '2600', name: 'Steuerrückstellungen', type: AccountType.LIABILITY, category: AccountCategory.PROVISIONS },
  { number: '2700', name: 'Sonstige Rückstellungen', type: AccountType.LIABILITY, category: AccountCategory.PROVISIONS },
  { number: '2900', name: 'Darlehen (langfristig)', type: AccountType.LIABILITY, category: AccountCategory.LIABILITIES },

  // Klasse 3: Wareneingang
  { number: '3000', name: 'Wareneingang', type: AccountType.EXPENSE, category: AccountCategory.MATERIAL_COSTS },
  { number: '3100', name: 'Wareneingang 7% Vorsteuer', type: AccountType.EXPENSE, category: AccountCategory.MATERIAL_COSTS, taxRate: 7 },
  { number: '3200', name: 'Wareneingang 19% Vorsteuer', type: AccountType.EXPENSE, category: AccountCategory.MATERIAL_COSTS, taxRate: 19 },
  { number: '3300', name: 'Wareneingang innergemeinschaftlicher Erwerb', type: AccountType.EXPENSE, category: AccountCategory.MATERIAL_COSTS },
  { number: '3400', name: 'Wareneingang steuerfreie Einfuhr', type: AccountType.EXPENSE, category: AccountCategory.MATERIAL_COSTS },
  { number: '3500', name: 'Leistungen Dritter', type: AccountType.EXPENSE, category: AccountCategory.MATERIAL_COSTS },
  { number: '3600', name: 'Fremdleistungen', type: AccountType.EXPENSE, category: AccountCategory.MATERIAL_COSTS },
  { number: '3700', name: 'Rohstoffe', type: AccountType.ASSET, category: AccountCategory.INVENTORY },
  { number: '3800', name: 'Hilfsstoffe', type: AccountType.ASSET, category: AccountCategory.INVENTORY },
  { number: '3900', name: 'Betriebsstoffe', type: AccountType.ASSET, category: AccountCategory.INVENTORY },

  // Klasse 4: Personalkosten
  { number: '4000', name: 'Löhne', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4100', name: 'Gehälter', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4110', name: 'Geschäftsführergehälter', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4120', name: 'Ehegattengehalt', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4130', name: 'Gesetzliche soziale Aufwendungen', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4140', name: 'Freiwillige soziale Aufwendungen', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4150', name: 'Krankenversicherung', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4160', name: 'Rentenversicherung', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4170', name: 'Arbeitslosenversicherung', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4180', name: 'Pflegeversicherung', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4190', name: 'Berufsgenossenschaft', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4200', name: 'Vermögenswirksame Leistungen', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4300', name: 'Aushilfen', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4400', name: 'Sachbezüge', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4500', name: 'Pauschale Lohnsteuer', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },
  { number: '4600', name: 'Pensionsaufwendungen', type: AccountType.EXPENSE, category: AccountCategory.PERSONNEL_COSTS },

  // Klasse 4 (Fortsetzung): Betriebliche Aufwendungen
  { number: '4650', name: 'Miete', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4660', name: 'Nebenkosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4670', name: 'Abgaben', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4700', name: 'Kosten des Warenverkehrs', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4710', name: 'Verpackungsmaterial', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4730', name: 'Ausgangsfrachten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4750', name: 'Zölle und Einfuhrabgaben', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4780', name: 'Fremdarbeiten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4800', name: 'Reparaturen und Instandhaltung', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4805', name: 'Reparatur Gebäude', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4810', name: 'Reparatur betriebliche Anlagen', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4815', name: 'Reparatur Fuhrpark', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4830', name: 'Abfallbeseitigung', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4850', name: 'Werkzeuge und Kleingeräte', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4900', name: 'Sonstige betriebliche Aufwendungen', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4910', name: 'Porto', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4920', name: 'Telefon', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4930', name: 'Bürobedarf', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4940', name: 'Zeitschriften, Bücher', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4945', name: 'Fortbildungskosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4950', name: 'Rechts- und Beratungskosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4955', name: 'Buchführungskosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4957', name: 'Abschluss- und Prüfungskosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4960', name: 'Mieten für Einrichtungen', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4970', name: 'Nebenkosten des Geldverkehrs', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4980', name: 'Betriebsbedarf', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },

  // Fahrzeugkosten
  { number: '4500', name: 'Kfz-Kosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4510', name: 'Kfz-Steuer', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4520', name: 'Kfz-Versicherung', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4530', name: 'Kfz-Betriebskosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4540', name: 'Kfz-Reparaturen', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4550', name: 'Maut', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4580', name: 'Leasingkosten Fahrzeuge', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },

  // Werbung und Reisen
  { number: '4600', name: 'Werbekosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4610', name: 'Geschenke abzugsfähig', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4620', name: 'Geschenke nicht abzugsfähig', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4630', name: 'Repräsentationskosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4640', name: 'Bewirtungskosten', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4660', name: 'Reisekosten Arbeitnehmer', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4663', name: 'Reisekosten Übernachtung', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4664', name: 'Reisekosten Verpflegung', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4670', name: 'Reisekosten Unternehmer', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },

  // Versicherungen
  { number: '4700', name: 'Versicherungen', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },
  { number: '4710', name: 'Beiträge', type: AccountType.EXPENSE, category: AccountCategory.OTHER_EXPENSES },

  // Abschreibungen
  { number: '4820', name: 'Abschreibungen auf immaterielle Vermögensgegenstände', type: AccountType.EXPENSE, category: AccountCategory.DEPRECIATION },
  { number: '4830', name: 'Abschreibungen auf Sachanlagen', type: AccountType.EXPENSE, category: AccountCategory.DEPRECIATION },
  { number: '4840', name: 'Außerplanmäßige Abschreibungen', type: AccountType.EXPENSE, category: AccountCategory.DEPRECIATION },
  { number: '4850', name: 'Abschreibungen auf Finanzanlagen', type: AccountType.EXPENSE, category: AccountCategory.DEPRECIATION },
  { number: '4855', name: 'Sofortabschreibung GWG', type: AccountType.EXPENSE, category: AccountCategory.DEPRECIATION },

  // Klasse 7: Weitere Erträge und Aufwendungen
  { number: '7000', name: 'Bestandsveränderungen', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '7100', name: 'Erträge aus Beteiligungen', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '7200', name: 'Zinsen und ähnliche Erträge', type: AccountType.REVENUE, category: AccountCategory.INTEREST },
  { number: '7300', name: 'Erträge aus Zuschreibungen', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '7400', name: 'Sonstige betriebliche Erträge', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '7500', name: 'Periodenfremde Erträge', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '7600', name: 'Erträge aus Anlagenabgängen', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '7700', name: 'Erträge aus der Auflösung von Rückstellungen', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '7800', name: 'Erträge aus Währungsumrechnung', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },

  // Klasse 7: Zinsaufwendungen
  { number: '7300', name: 'Zinsen und ähnliche Aufwendungen', type: AccountType.EXPENSE, category: AccountCategory.INTEREST },
  { number: '7310', name: 'Zinsen für kurzfristige Verbindlichkeiten', type: AccountType.EXPENSE, category: AccountCategory.INTEREST },
  { number: '7320', name: 'Zinsen für langfristige Verbindlichkeiten', type: AccountType.EXPENSE, category: AccountCategory.INTEREST },
  { number: '7330', name: 'Zinsaufwand Gesellschafter', type: AccountType.EXPENSE, category: AccountCategory.INTEREST },

  // Steuern
  { number: '7600', name: 'Körperschaftsteuer', type: AccountType.EXPENSE, category: AccountCategory.TAXES },
  { number: '7610', name: 'Körperschaftsteuer-Nachzahlung', type: AccountType.EXPENSE, category: AccountCategory.TAXES },
  { number: '7620', name: 'Körperschaftsteuer-Erstattung', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '7630', name: 'Solidaritätszuschlag', type: AccountType.EXPENSE, category: AccountCategory.TAXES },
  { number: '7640', name: 'Gewerbesteuer', type: AccountType.EXPENSE, category: AccountCategory.TAXES },
  { number: '7650', name: 'Sonstige Steuern', type: AccountType.EXPENSE, category: AccountCategory.TAXES },
  { number: '7680', name: 'Grundsteuer', type: AccountType.EXPENSE, category: AccountCategory.TAXES },
  { number: '7685', name: 'Kfz-Steuer (nicht abzugsfähig)', type: AccountType.EXPENSE, category: AccountCategory.TAXES },

  // Klasse 8: Erlöse
  { number: '8000', name: 'Erlöse', type: AccountType.REVENUE, category: AccountCategory.SALES },
  { number: '8100', name: 'Erlöse 7% USt', type: AccountType.REVENUE, category: AccountCategory.SALES, taxRate: 7, taxType: TaxType.VAT_7 },
  { number: '8200', name: 'Erlöse 19% USt', type: AccountType.REVENUE, category: AccountCategory.SALES, taxRate: 19, taxType: TaxType.VAT_19 },
  { number: '8300', name: 'Erlöse steuerfrei §4 UStG', type: AccountType.REVENUE, category: AccountCategory.SALES, taxRate: 0, taxType: TaxType.VAT_0 },
  { number: '8310', name: 'Steuerfreie innergemeinschaftliche Lieferungen', type: AccountType.REVENUE, category: AccountCategory.SALES, taxType: TaxType.INTRA_COMMUNITY },
  { number: '8320', name: 'Steuerfreie Ausfuhrlieferungen', type: AccountType.REVENUE, category: AccountCategory.SALES, taxType: TaxType.VAT_0 },
  { number: '8400', name: 'Erlösschmälerungen', type: AccountType.REVENUE, category: AccountCategory.SALES },
  { number: '8500', name: 'Provisionserlöse', type: AccountType.REVENUE, category: AccountCategory.SALES },
  { number: '8600', name: 'Erträge aus der Vermietung', type: AccountType.REVENUE, category: AccountCategory.SALES },
  { number: '8700', name: 'Erlöse aus Leistungen', type: AccountType.REVENUE, category: AccountCategory.SALES },
  { number: '8710', name: 'Erlöse Dienstleistungen 19%', type: AccountType.REVENUE, category: AccountCategory.SALES, taxRate: 19, taxType: TaxType.VAT_19 },
  { number: '8720', name: 'Erlöse Dienstleistungen 7%', type: AccountType.REVENUE, category: AccountCategory.SALES, taxRate: 7, taxType: TaxType.VAT_7 },
  { number: '8800', name: 'Erlöse aus Anlagenverkäufen', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '8900', name: 'Sonstige Erträge', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '8910', name: 'Sonstige betriebliche Erträge 19%', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },
  { number: '8920', name: 'Erträge aus Zuschreibungen', type: AccountType.REVENUE, category: AccountCategory.OTHER_INCOME },

  // Klasse 9: Vortragskonten, statistische Konten
  { number: '9000', name: 'Saldenvorträge Sachkonten', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
  { number: '9008', name: 'Saldenvorträge Debitoren', type: AccountType.ASSET, category: AccountCategory.RECEIVABLES },
  { number: '9009', name: 'Saldenvorträge Kreditoren', type: AccountType.LIABILITY, category: AccountCategory.PAYABLES },
  { number: '9100', name: 'Statistische Konten', type: AccountType.EQUITY, category: AccountCategory.EQUITY_CAPITAL },
];

async function seedChartOfAccounts(organizationId: string, chartType: ChartOfAccountsType) {
  const accounts = chartType === ChartOfAccountsType.SKR03 ? SKR03_ACCOUNTS : SKR03_ACCOUNTS;

  for (const account of accounts) {
    await prisma.account.upsert({
      where: {
        organizationId_accountNumber: {
          organizationId,
          accountNumber: account.number,
        },
      },
      update: {
        name: account.name,
        type: account.type,
        category: account.category,
        taxRate: account.taxRate,
        taxType: account.taxType,
      },
      create: {
        organizationId,
        accountNumber: account.number,
        name: account.name,
        type: account.type,
        category: account.category,
        taxRate: account.taxRate,
        taxType: account.taxType,
        isSystem: true,
      },
    });
  }
}

async function seedDefaultTaxSettings(organizationId: string) {
  const taxSettings = [
    { name: 'Umsatzsteuer 19%', rate: 19, type: TaxType.VAT_19, outputTaxAccount: '1766', inputTaxAccount: '1576', isDefault: true },
    { name: 'Umsatzsteuer 7%', rate: 7, type: TaxType.VAT_7, outputTaxAccount: '1771', inputTaxAccount: '1571', isDefault: false },
    { name: 'Vorsteuer 19%', rate: 19, type: TaxType.INPUT_TAX_19, inputTaxAccount: '1576', isDefault: false },
    { name: 'Vorsteuer 7%', rate: 7, type: TaxType.INPUT_TAX_7, inputTaxAccount: '1571', isDefault: false },
    { name: 'Steuerfrei', rate: 0, type: TaxType.VAT_0, isDefault: false },
    { name: 'Innergemeinschaftlich', rate: 0, type: TaxType.INTRA_COMMUNITY, isDefault: false },
    { name: 'Reverse Charge', rate: 0, type: TaxType.REVERSE_CHARGE, isDefault: false },
  ];

  for (const tax of taxSettings) {
    await prisma.taxSetting.create({
      data: {
        organizationId,
        name: tax.name,
        rate: tax.rate,
        type: tax.type,
        outputTaxAccount: tax.outputTaxAccount,
        inputTaxAccount: tax.inputTaxAccount,
        isDefault: tax.isDefault,
      },
    });
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // Demo-Benutzer erstellen
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@fintutto.cloud' },
    update: {},
    create: {
      email: 'demo@fintutto.cloud',
      firstName: 'Demo',
      lastName: 'Benutzer',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Demo-Benutzer erstellt:', demoUser.email);

  // Demo-Organisation erstellen
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'demo-gmbh' },
    update: {},
    create: {
      name: 'Demo GmbH',
      slug: 'demo-gmbh',
      legalForm: 'GMBH',
      taxId: '12/345/67890',
      vatId: 'DE123456789',
      tradeRegisterNumber: 'HRB 12345',
      tradeRegisterCourt: 'Amtsgericht München',
      street: 'Musterstraße',
      streetNumber: '123',
      postalCode: '80331',
      city: 'München',
      country: 'DE',
      email: 'info@demo-gmbh.de',
      phone: '+49 89 12345678',
      chartOfAccounts: 'SKR03',
      defaultCurrency: 'EUR',
      vatPeriod: 'MONTHLY',
      onboardingCompleted: true,
    },
  });

  console.log('✅ Demo-Organisation erstellt:', demoOrg.name);

  // Benutzer zur Organisation hinzufügen
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: demoOrg.id,
        userId: demoUser.id,
      },
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      userId: demoUser.id,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  });

  console.log('✅ Benutzer zur Organisation hinzugefügt');

  // Kontenrahmen erstellen
  await seedChartOfAccounts(demoOrg.id, ChartOfAccountsType.SKR03);
  console.log('✅ SKR03 Kontenrahmen erstellt');

  // Steuereinstellungen erstellen
  await seedDefaultTaxSettings(demoOrg.id);
  console.log('✅ Steuereinstellungen erstellt');

  // Geschäftsjahr erstellen
  const currentYear = new Date().getFullYear();
  await prisma.fiscalYear.upsert({
    where: {
      organizationId_year: {
        organizationId: demoOrg.id,
        year: currentYear,
      },
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      year: currentYear,
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 11, 31),
      status: 'OPEN',
    },
  });

  console.log('✅ Geschäftsjahr erstellt');

  // Demo-Kontakte erstellen
  await prisma.contact.createMany({
    skipDuplicates: true,
    data: [
      {
        organizationId: demoOrg.id,
        type: 'CUSTOMER',
        companyName: 'Musterkunde AG',
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@musterkunde.de',
        phone: '+49 89 87654321',
        street: 'Kundenstraße',
        streetNumber: '1',
        postalCode: '80333',
        city: 'München',
        country: 'DE',
        vatId: 'DE987654321',
        customerNumber: 'K-10001',
        paymentTermDays: 14,
      },
      {
        organizationId: demoOrg.id,
        type: 'SUPPLIER',
        companyName: 'Lieferant GmbH',
        firstName: 'Sabine',
        lastName: 'Lieferant',
        email: 'einkauf@lieferant.de',
        phone: '+49 89 11223344',
        street: 'Lieferweg',
        streetNumber: '50',
        postalCode: '80335',
        city: 'München',
        country: 'DE',
        vatId: 'DE111222333',
        supplierNumber: 'L-20001',
        paymentTermDays: 30,
      },
    ],
  });

  console.log('✅ Demo-Kontakte erstellt');

  // Demo-Kostenstelllen erstellen
  await prisma.costCenter.createMany({
    skipDuplicates: true,
    data: [
      { organizationId: demoOrg.id, number: '100', name: 'Verwaltung' },
      { organizationId: demoOrg.id, number: '200', name: 'Vertrieb' },
      { organizationId: demoOrg.id, number: '300', name: 'Produktion' },
      { organizationId: demoOrg.id, number: '400', name: 'IT' },
    ],
  });

  console.log('✅ Demo-Kostenstellen erstellt');

  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('Demo-Zugangsdaten:');
  console.log('  Email: demo@fintutto.cloud');
  console.log('  Organisation: Demo GmbH (demo-gmbh)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedChartOfAccounts, seedDefaultTaxSettings, SKR03_ACCOUNTS };
