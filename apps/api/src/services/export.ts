import { prisma } from '@fintutto/database';
import { format } from 'date-fns';

interface DatevExportOptions {
  organization: any;
  bookings: any[];
  periodStart: Date;
  periodEnd: Date;
  format: string;
  beraterNr?: string;
  mandantenNr?: string;
  includeReceipts: boolean;
}

interface CsvExportOptions {
  organizationId: string;
  type: 'bookings' | 'invoices' | 'receipts' | 'contacts' | 'accounts';
  periodStart?: Date;
  periodEnd?: Date;
  delimiter: string;
  encoding: string;
}

interface GdpduExportOptions {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
}

// DATEV-Export generieren
export async function generateDatevExport(options: DatevExportOptions): Promise<{ url: string; receiptsCount: number }> {
  const {
    organization,
    bookings,
    periodStart,
    periodEnd,
    beraterNr = '12345',
    mandantenNr = '00001',
  } = options;

  // DATEV-Header (Buchungsstapel)
  const header = [
    'EXTF', // Format
    '700', // Version
    '21', // Kategorie (Buchungsstapel)
    'Buchungsstapel',
    '13', // Formatversion
    format(new Date(), 'yyyyMMddHHmmss') + '000', // Erstellungsdatum
    '', // Import
    'RE', // Herkunft
    '', // Exportiert von
    '', // Importiert von
    beraterNr, // Berater-Nr
    mandantenNr, // Mandanten-Nr
    format(periodStart, 'yyyyMMdd'), // Wirtschaftsjahr Beginn
    '4', // Sachkonten-Länge
    format(periodStart, 'yyyyMMdd'), // Datum von
    format(periodEnd, 'yyyyMMdd'), // Datum bis
    '', // Bezeichnung
    '', // Diktatkürzel
    '1', // Buchungstyp (1 = Fibu)
    '0', // Rechnungslegungszweck
    '', // Festschreibung
    organization.defaultCurrency || 'EUR',
  ].join(';');

  // Buchungssätze
  const lines: string[] = [header];

  // Spaltenüberschriften
  const columnHeaders = [
    'Umsatz (ohne Soll/Haben-Kz)',
    'Soll/Haben-Kennzeichen',
    'WKZ Umsatz',
    'Kurs',
    'Basis-Umsatz',
    'WKZ Basis-Umsatz',
    'Konto',
    'Gegenkonto (ohne BU-Schlüssel)',
    'BU-Schlüssel',
    'Belegdatum',
    'Belegfeld 1',
    'Belegfeld 2',
    'Skonto',
    'Buchungstext',
    'Postensperre',
    'Diverse Adressnummer',
    'Geschäftspartnerbank',
    'Sachverhalt',
    'Zinssperre',
    'Beleglink',
    'Beleginfo - Art 1',
    'Beleginfo - Inhalt 1',
    'Beleginfo - Art 2',
    'Beleginfo - Inhalt 2',
    'Beleginfo - Art 3',
    'Beleginfo - Inhalt 3',
    'Beleginfo - Art 4',
    'Beleginfo - Inhalt 4',
    'Beleginfo - Art 5',
    'Beleginfo - Inhalt 5',
    'Beleginfo - Art 6',
    'Beleginfo - Inhalt 6',
    'Beleginfo - Art 7',
    'Beleginfo - Inhalt 7',
    'Beleginfo - Art 8',
    'Beleginfo - Inhalt 8',
    'KOST1 - Kostenstelle',
    'KOST2 - Kostenstelle',
    'Kost-Menge',
    'EU-Land u. UStID',
    'EU-Steuersatz',
    'Abw. Versteuerungsart',
    'Sachverhalt L+L',
    'Funktionsergänzung L+L',
    'BU 49 Hauptfunktionstyp',
    'BU 49 Hauptfunktionsnummer',
    'BU 49 Funktionsergänzung',
    'Zusatzinformation - Art 1',
    'Zusatzinformation- Inhalt 1',
    'Zusatzinformation - Art 2',
    'Zusatzinformation- Inhalt 2',
    'Zusatzinformation - Art 3',
    'Zusatzinformation- Inhalt 3',
    'Zusatzinformation - Art 4',
    'Zusatzinformation- Inhalt 4',
    'Zusatzinformation - Art 5',
    'Zusatzinformation- Inhalt 5',
    'Zusatzinformation - Art 6',
    'Zusatzinformation- Inhalt 6',
    'Zusatzinformation - Art 7',
    'Zusatzinformation- Inhalt 7',
    'Zusatzinformation - Art 8',
    'Zusatzinformation- Inhalt 8',
    'Zusatzinformation - Art 9',
    'Zusatzinformation- Inhalt 9',
    'Zusatzinformation - Art 10',
    'Zusatzinformation- Inhalt 10',
    'Zusatzinformation - Art 11',
    'Zusatzinformation- Inhalt 11',
    'Zusatzinformation - Art 12',
    'Zusatzinformation- Inhalt 12',
    'Zusatzinformation - Art 13',
    'Zusatzinformation- Inhalt 13',
    'Zusatzinformation - Art 14',
    'Zusatzinformation- Inhalt 14',
    'Zusatzinformation - Art 15',
    'Zusatzinformation- Inhalt 15',
    'Zusatzinformation - Art 16',
    'Zusatzinformation- Inhalt 16',
    'Zusatzinformation - Art 17',
    'Zusatzinformation- Inhalt 17',
    'Zusatzinformation - Art 18',
    'Zusatzinformation- Inhalt 18',
    'Zusatzinformation - Art 19',
    'Zusatzinformation- Inhalt 19',
    'Zusatzinformation - Art 20',
    'Zusatzinformation- Inhalt 20',
    'Stück',
    'Gewicht',
    'Zahlweise',
    'Forderungsart',
    'Veranlagungsjahr',
    'Zugeordnete Fälligkeit',
    'Skontotyp',
    'Auftragsnummer',
    'Buchungstyp',
    'USt-Schlüssel (Anzahlungen)',
    'EU-Land (Anzahlungen)',
    'Sachverhalt L+L (Anzahlungen)',
    'EU-Steuersatz (Anzahlungen)',
    'Erlöskonto (Anzahlungen)',
    'Herkunft-Kz',
    'Buchungs GUID',
    'KOST-Datum',
    'SEPA-Mandatsreferenz',
    'Skontosperre',
    'Gesellschaftername',
    'Beteiligtennummer',
    'Identifikationsnummer',
    'Zeichnernummer',
    'Postensperre bis',
    'Bezeichnung SoBil-Sachverhalt',
    'Kennzeichen SoBil-Buchung',
    'Festschreibung',
    'Leistungsdatum',
    'Datum Zuord. Steuerperiode',
    'Fälligkeit',
    'Generalumkehr (GU)',
    'Steuersatz',
    'Land',
  ];

  lines.push(columnHeaders.join(';'));

  // Buchungen konvertieren
  let receiptsCount = 0;

  for (const booking of bookings) {
    for (const line of booking.lines) {
      const amount = Number(line.amount);
      const taxAmount = Number(line.taxAmount || 0);

      // Soll-Buchung
      const sollHaben = 'S'; // Soll
      const konto = line.debitAccount.accountNumber;
      const gegenkonto = line.creditAccount.accountNumber;

      const datevLine = [
        amount.toFixed(2).replace('.', ','), // Umsatz
        sollHaben, // Soll/Haben
        organization.defaultCurrency || 'EUR', // Währung
        '', // Kurs
        '', // Basis-Umsatz
        '', // WKZ Basis
        konto, // Konto
        gegenkonto, // Gegenkonto
        '', // BU-Schlüssel
        format(booking.bookingDate, 'ddMM'), // Belegdatum
        booking.bookingNumber, // Belegfeld 1
        '', // Belegfeld 2
        '', // Skonto
        booking.description?.substring(0, 60) || '', // Buchungstext
        '', // Postensperre
        '', // Diverse Adressnummer
        '', // Geschäftspartnerbank
        '', // Sachverhalt
        '', // Zinssperre
        '', // Beleglink
      ].join(';');

      lines.push(datevLine);
    }

    if (booking.receipts?.length > 0) {
      receiptsCount += booking.receipts.length;
    }
  }

  // Inhalt als CSV
  const csvContent = lines.join('\r\n');

  // TODO: Als ZIP mit Belegen erstellen und zu S3 hochladen
  // Für Demo: Base64 URL
  const base64 = Buffer.from(csvContent, 'utf-8').toString('base64');

  return {
    url: `data:text/csv;base64,${base64}`,
    receiptsCount,
  };
}

// CSV-Export generieren
export async function generateCsvExport(options: CsvExportOptions): Promise<{ url: string; rowCount: number }> {
  const { organizationId, type, periodStart, periodEnd, delimiter, encoding } = options;

  let data: any[] = [];
  let headers: string[] = [];

  switch (type) {
    case 'bookings':
      data = await prisma.booking.findMany({
        where: {
          organizationId,
          status: { in: ['POSTED', 'REVERSED'] },
          ...(periodStart && periodEnd && {
            bookingDate: { gte: periodStart, lte: periodEnd },
          }),
        },
        include: {
          lines: {
            include: {
              debitAccount: true,
              creditAccount: true,
            },
          },
          contact: true,
        },
        orderBy: { bookingDate: 'asc' },
      });
      headers = ['Buchungsnummer', 'Datum', 'Beschreibung', 'Betrag', 'Soll-Konto', 'Haben-Konto', 'Kontakt'];
      data = data.flatMap(b =>
        b.lines.map((l: any) => [
          b.bookingNumber,
          format(b.bookingDate, 'yyyy-MM-dd'),
          b.description,
          Number(l.amount).toFixed(2),
          `${l.debitAccount.accountNumber} ${l.debitAccount.name}`,
          `${l.creditAccount.accountNumber} ${l.creditAccount.name}`,
          b.contact?.companyName || b.contact?.lastName || '',
        ])
      );
      break;

    case 'invoices':
      const invoices = await prisma.invoice.findMany({
        where: {
          organizationId,
          ...(periodStart && periodEnd && {
            invoiceDate: { gte: periodStart, lte: periodEnd },
          }),
        },
        include: { contact: true },
        orderBy: { invoiceDate: 'asc' },
      });
      headers = ['Rechnungsnummer', 'Datum', 'Kunde', 'Netto', 'USt', 'Brutto', 'Status', 'Bezahlt'];
      data = invoices.map(i => [
        i.invoiceNumber,
        format(i.invoiceDate, 'yyyy-MM-dd'),
        i.contact.companyName || `${i.contact.firstName} ${i.contact.lastName}`,
        Number(i.netAmount).toFixed(2),
        Number(i.taxAmount).toFixed(2),
        Number(i.grossAmount).toFixed(2),
        i.status,
        Number(i.paidAmount).toFixed(2),
      ]);
      break;

    case 'receipts':
      const receipts = await prisma.receipt.findMany({
        where: {
          organizationId,
          ...(periodStart && periodEnd && {
            receiptDate: { gte: periodStart, lte: periodEnd },
          }),
        },
        include: { contact: true },
        orderBy: { receiptDate: 'asc' },
      });
      headers = ['Belegnummer', 'Datum', 'Lieferant', 'Netto', 'USt', 'Brutto', 'Typ', 'Status'];
      data = receipts.map(r => [
        r.receiptNumber || '',
        format(r.receiptDate, 'yyyy-MM-dd'),
        r.contact?.companyName || r.contact?.lastName || '',
        Number(r.netAmount).toFixed(2),
        Number(r.taxAmount).toFixed(2),
        Number(r.grossAmount).toFixed(2),
        r.type,
        r.status,
      ]);
      break;

    case 'contacts':
      const contacts = await prisma.contact.findMany({
        where: { organizationId, isActive: true },
        orderBy: { companyName: 'asc' },
      });
      headers = ['Typ', 'Firma', 'Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Straße', 'PLZ', 'Stadt', 'USt-IdNr', 'IBAN'];
      data = contacts.map(c => [
        c.type,
        c.companyName || '',
        c.firstName || '',
        c.lastName || '',
        c.email || '',
        c.phone || '',
        `${c.street || ''} ${c.streetNumber || ''}`.trim(),
        c.postalCode || '',
        c.city || '',
        c.vatId || '',
        c.iban || '',
      ]);
      break;

    case 'accounts':
      const accounts = await prisma.account.findMany({
        where: { organizationId, isActive: true },
        orderBy: { accountNumber: 'asc' },
      });
      headers = ['Kontonummer', 'Name', 'Typ', 'Kategorie', 'Steuersatz'];
      data = accounts.map(a => [
        a.accountNumber,
        a.name,
        a.type,
        a.category,
        a.taxRate?.toString() || '',
      ]);
      break;
  }

  // CSV erstellen
  const csvLines = [
    headers.join(delimiter),
    ...data.map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(delimiter)),
  ];

  const csvContent = csvLines.join('\r\n');

  // Encoding
  let buffer: Buffer;
  if (encoding === 'iso-8859-1') {
    // Vereinfachte Konvertierung
    buffer = Buffer.from(csvContent, 'latin1');
  } else {
    buffer = Buffer.from(csvContent, 'utf-8');
  }

  const base64 = buffer.toString('base64');

  return {
    url: `data:text/csv;base64,${base64}`,
    rowCount: data.length,
  };
}

// GDPdU-Export für Betriebsprüfung
export async function generateGdpduExport(options: GdpduExportOptions): Promise<{ url: string }> {
  const { organizationId, periodStart, periodEnd } = options;

  // GDPdU-konforme Dateien erstellen
  // In der echten Implementierung würden hier mehrere CSV-Dateien
  // mit index.xml erstellt und als ZIP gepackt

  const files: Record<string, string> = {};

  // Kontenplan
  const accounts = await prisma.account.findMany({
    where: { organizationId },
    orderBy: { accountNumber: 'asc' },
  });

  files['Kontenplan.csv'] = [
    'Kontonummer;Kontobezeichnung;Kontotyp',
    ...accounts.map(a => `${a.accountNumber};${a.name};${a.type}`),
  ].join('\r\n');

  // Buchungsjournal
  const bookings = await prisma.booking.findMany({
    where: {
      organizationId,
      bookingDate: { gte: periodStart, lte: periodEnd },
    },
    include: {
      lines: {
        include: {
          debitAccount: true,
          creditAccount: true,
        },
      },
    },
    orderBy: { bookingDate: 'asc' },
  });

  files['Buchungsjournal.csv'] = [
    'Buchungsnummer;Buchungsdatum;Beschreibung;Betrag;Sollkonto;Habenkonto',
    ...bookings.flatMap(b =>
      b.lines.map(l =>
        `${b.bookingNumber};${format(b.bookingDate, 'yyyy-MM-dd')};${b.description};${Number(l.amount).toFixed(2)};${l.debitAccount.accountNumber};${l.creditAccount.accountNumber}`
      )
    ),
  ].join('\r\n');

  // index.xml (vereinfacht)
  files['index.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<DataSet xmlns="urn:gdpdu:1.0">
  <Version>1.0</Version>
  <DataSupplier>
    <Name>Fintutto</Name>
    <Location>${periodStart.toISOString()} - ${periodEnd.toISOString()}</Location>
  </DataSupplier>
  <Media>
    <Name>GDPdU-Export</Name>
    <Table>
      <Name>Kontenplan</Name>
      <URL>Kontenplan.csv</URL>
    </Table>
    <Table>
      <Name>Buchungsjournal</Name>
      <URL>Buchungsjournal.csv</URL>
    </Table>
  </Media>
</DataSet>`;

  // TODO: ZIP erstellen und zu S3 hochladen
  // Für Demo: Nur index.xml als Base64
  const base64 = Buffer.from(files['index.xml'], 'utf-8').toString('base64');

  return {
    url: `data:application/xml;base64,${base64}`,
  };
}
