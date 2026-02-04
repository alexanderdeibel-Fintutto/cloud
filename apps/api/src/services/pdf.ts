import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  deliveryDate?: Date | null;
  contact: {
    companyName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    street?: string | null;
    streetNumber?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country?: string | null;
    vatId?: string | null;
  };
  organization: {
    name: string;
    street?: string | null;
    streetNumber?: string | null;
    postalCode?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    taxId?: string | null;
    vatId?: string | null;
    tradeRegisterNumber?: string | null;
    tradeRegisterCourt?: string | null;
  };
  lineItems: Array<{
    position: number;
    description: string;
    quantity: any;
    unit?: string | null;
    unitPrice: any;
    taxRate: any;
    netAmount: any;
    grossAmount: any;
  }>;
  netAmount: any;
  taxAmount: any;
  grossAmount: any;
  headerText?: string | null;
  footerText?: string | null;
  paymentTermDays: number;
}

export async function generateInvoicePdf(invoice: InvoiceData): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Formatierungshilfen
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

  const formatDate = (date: Date) =>
    format(date, 'dd.MM.yyyy', { locale: de });

  // Absender (klein oben)
  const senderLine = `${invoice.organization.name} · ${invoice.organization.street} ${invoice.organization.streetNumber} · ${invoice.organization.postalCode} ${invoice.organization.city}`;
  page.drawText(senderLine, {
    x: margin,
    y: y,
    size: 7,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 30;

  // Empfänger
  const recipientName = invoice.contact.companyName ||
    `${invoice.contact.firstName || ''} ${invoice.contact.lastName || ''}`.trim();

  page.drawText(recipientName, { x: margin, y, size: 11, font: fontBold });
  y -= 14;

  if (invoice.contact.street) {
    page.drawText(`${invoice.contact.street} ${invoice.contact.streetNumber || ''}`, {
      x: margin, y, size: 10, font,
    });
    y -= 12;
  }

  if (invoice.contact.postalCode) {
    page.drawText(`${invoice.contact.postalCode} ${invoice.contact.city || ''}`, {
      x: margin, y, size: 10, font,
    });
    y -= 12;
  }

  if (invoice.contact.country && invoice.contact.country !== 'DE') {
    page.drawText(invoice.contact.country, { x: margin, y, size: 10, font });
    y -= 12;
  }

  // Firmenlogo/Adresse rechts
  const rightX = width - margin - 150;
  let rightY = height - margin;

  page.drawText(invoice.organization.name, {
    x: rightX, y: rightY, size: 12, font: fontBold,
  });
  rightY -= 14;

  if (invoice.organization.street) {
    page.drawText(`${invoice.organization.street} ${invoice.organization.streetNumber || ''}`, {
      x: rightX, y: rightY, size: 9, font,
    });
    rightY -= 11;
  }

  if (invoice.organization.postalCode) {
    page.drawText(`${invoice.organization.postalCode} ${invoice.organization.city || ''}`, {
      x: rightX, y: rightY, size: 9, font,
    });
    rightY -= 11;
  }

  rightY -= 10;

  if (invoice.organization.phone) {
    page.drawText(`Tel: ${invoice.organization.phone}`, {
      x: rightX, y: rightY, size: 8, font,
    });
    rightY -= 10;
  }

  if (invoice.organization.email) {
    page.drawText(`E-Mail: ${invoice.organization.email}`, {
      x: rightX, y: rightY, size: 8, font,
    });
    rightY -= 10;
  }

  // Rechnungstitel
  y -= 50;
  page.drawText('RECHNUNG', {
    x: margin, y, size: 20, font: fontBold,
  });
  y -= 30;

  // Rechnungsdaten
  const dataStartY = y;
  const labelX = margin;
  const valueX = margin + 120;

  page.drawText('Rechnungsnummer:', { x: labelX, y, size: 9, font });
  page.drawText(invoice.invoiceNumber, { x: valueX, y, size: 9, font: fontBold });
  y -= 14;

  page.drawText('Rechnungsdatum:', { x: labelX, y, size: 9, font });
  page.drawText(formatDate(invoice.invoiceDate), { x: valueX, y, size: 9, font });
  y -= 14;

  if (invoice.deliveryDate) {
    page.drawText('Lieferdatum:', { x: labelX, y, size: 9, font });
    page.drawText(formatDate(invoice.deliveryDate), { x: valueX, y, size: 9, font });
    y -= 14;
  }

  page.drawText('Fälligkeitsdatum:', { x: labelX, y, size: 9, font });
  page.drawText(formatDate(invoice.dueDate), { x: valueX, y, size: 9, font });
  y -= 14;

  if (invoice.contact.vatId) {
    page.drawText('USt-IdNr. Kunde:', { x: labelX, y, size: 9, font });
    page.drawText(invoice.contact.vatId, { x: valueX, y, size: 9, font });
    y -= 14;
  }

  // Einleitungstext
  if (invoice.headerText) {
    y -= 20;
    page.drawText(invoice.headerText, { x: margin, y, size: 10, font });
    y -= 20;
  }

  // Positionstabelle
  y -= 20;
  const tableStartY = y;

  // Tabellenheader
  const colPos = margin;
  const colDesc = margin + 30;
  const colQty = width - margin - 250;
  const colPrice = width - margin - 180;
  const colTax = width - margin - 110;
  const colTotal = width - margin - 50;

  page.drawText('Pos', { x: colPos, y, size: 8, font: fontBold });
  page.drawText('Beschreibung', { x: colDesc, y, size: 8, font: fontBold });
  page.drawText('Menge', { x: colQty, y, size: 8, font: fontBold });
  page.drawText('Einzelpreis', { x: colPrice, y, size: 8, font: fontBold });
  page.drawText('USt', { x: colTax, y, size: 8, font: fontBold });
  page.drawText('Gesamt', { x: colTotal, y, size: 8, font: fontBold });

  y -= 5;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;

  // Positionen
  for (const item of invoice.lineItems) {
    page.drawText(String(item.position), { x: colPos, y, size: 9, font });

    // Beschreibung (ggf. umbrechen)
    const desc = item.description.substring(0, 50);
    page.drawText(desc, { x: colDesc, y, size: 9, font });

    page.drawText(`${Number(item.quantity)} ${item.unit || ''}`, { x: colQty, y, size: 9, font });
    page.drawText(formatCurrency(Number(item.unitPrice)), { x: colPrice, y, size: 9, font });
    page.drawText(`${Number(item.taxRate)}%`, { x: colTax, y, size: 9, font });
    page.drawText(formatCurrency(Number(item.grossAmount)), { x: colTotal, y, size: 9, font });

    y -= 16;
  }

  // Summen
  y -= 10;
  page.drawLine({
    start: { x: colPrice, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;

  page.drawText('Nettobetrag:', { x: colPrice, y, size: 9, font });
  page.drawText(formatCurrency(Number(invoice.netAmount)), { x: colTotal, y, size: 9, font });
  y -= 14;

  page.drawText('USt:', { x: colPrice, y, size: 9, font });
  page.drawText(formatCurrency(Number(invoice.taxAmount)), { x: colTotal, y, size: 9, font });
  y -= 14;

  page.drawLine({
    start: { x: colPrice, y: y + 5 },
    end: { x: width - margin, y: y + 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawText('Gesamtbetrag:', { x: colPrice, y, size: 10, font: fontBold });
  page.drawText(formatCurrency(Number(invoice.grossAmount)), { x: colTotal, y, size: 10, font: fontBold });
  y -= 30;

  // Zahlungsbedingungen
  page.drawText(`Zahlbar innerhalb von ${invoice.paymentTermDays} Tagen ohne Abzug.`, {
    x: margin, y, size: 9, font,
  });
  y -= 14;

  // Fußtext
  if (invoice.footerText) {
    y -= 10;
    page.drawText(invoice.footerText, { x: margin, y, size: 9, font });
  }

  // Fußzeile
  const footerY = 40;
  const footerSize = 7;
  const footerColor = rgb(0.4, 0.4, 0.4);

  let footerText = invoice.organization.name;
  if (invoice.organization.taxId) footerText += ` · Steuernr.: ${invoice.organization.taxId}`;
  if (invoice.organization.vatId) footerText += ` · USt-IdNr.: ${invoice.organization.vatId}`;
  if (invoice.organization.tradeRegisterNumber) {
    footerText += ` · ${invoice.organization.tradeRegisterCourt} ${invoice.organization.tradeRegisterNumber}`;
  }

  page.drawText(footerText, {
    x: margin,
    y: footerY,
    size: footerSize,
    font,
    color: footerColor,
  });

  // PDF speichern
  const pdfBytes = await pdfDoc.save();

  // TODO: Zu S3 hochladen
  // const url = await uploadToS3(pdfBytes, `invoices/${invoice.id}.pdf`);

  // Für Demo: Base64 URL zurückgeben
  const base64 = Buffer.from(pdfBytes).toString('base64');
  return `data:application/pdf;base64,${base64}`;
}

export async function generateReportPdf(report: any): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Titel
  page.drawText(report.name, {
    x: margin,
    y,
    size: 18,
    font: fontBold,
  });
  y -= 25;

  // Zeitraum
  const periodText = `Zeitraum: ${format(report.periodStart, 'dd.MM.yyyy')} - ${format(report.periodEnd, 'dd.MM.yyyy')}`;
  page.drawText(periodText, {
    x: margin,
    y,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 30;

  // Daten als JSON (vereinfacht)
  const dataText = JSON.stringify(report.data, null, 2);
  const lines = dataText.split('\n').slice(0, 50);

  for (const line of lines) {
    if (y < 50) break;
    page.drawText(line.substring(0, 80), {
      x: margin,
      y,
      size: 8,
      font,
    });
    y -= 10;
  }

  const pdfBytes = await pdfDoc.save();
  const base64 = Buffer.from(pdfBytes).toString('base64');
  return `data:application/pdf;base64,${base64}`;
}
