import jsPDF from "jspdf";

export interface InvoicePdfData {
  // Rechnungsdaten
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  // Positionen
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  // Absender (eigene Firma)
  businessName: string;
  businessType?: string;
  businessAddress?: Record<string, string>;
  businessTaxId?: string;
  businessVatId?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessIban?: string;
  // Empfänger (Kunde)
  clientName: string;
  clientEmail?: string;
  clientAddress?: Record<string, string>;
  clientTaxId?: string;
}

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function generateInvoicePdf(data: InvoicePdfData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;

  // ── Farben & Fonts ──────────────────────────────────────────────────────────
  const colorPrimary: [number, number, number] = [99, 102, 241]; // Indigo-500
  const colorDark: [number, number, number] = [17, 24, 39];
  const colorGray: [number, number, number] = [107, 114, 128];
  const colorLight: [number, number, number] = [243, 244, 246];

  // ── Header-Balken ───────────────────────────────────────────────────────────
  doc.setFillColor(...colorPrimary);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.businessName, marginL, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (data.businessType) {
    doc.text(data.businessType.toUpperCase(), marginL, 18);
  }

  // Rechnungstitel rechts
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RECHNUNG", pageW - marginR, 12, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceNumber, pageW - marginR, 20, { align: "right" });

  // ── Absender-Adresse (klein, unter Header) ──────────────────────────────────
  let y = 36;
  doc.setTextColor(...colorGray);
  doc.setFontSize(7.5);
  const senderLine = [
    data.businessName,
    data.businessAddress?.street,
    data.businessAddress?.zip && data.businessAddress?.city
      ? `${data.businessAddress.zip} ${data.businessAddress.city}`
      : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
  if (senderLine) {
    doc.text(senderLine, marginL, y);
    y += 5;
  }

  // ── Empfänger-Block ─────────────────────────────────────────────────────────
  y += 2;
  doc.setTextColor(...colorDark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.clientName, marginL, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (data.clientAddress?.street) {
    doc.text(data.clientAddress.street, marginL, y);
    y += 4.5;
  }
  if (data.clientAddress?.zip || data.clientAddress?.city) {
    doc.text(
      `${data.clientAddress.zip ?? ""} ${data.clientAddress.city ?? ""}`.trim(),
      marginL,
      y
    );
    y += 4.5;
  }
  if (data.clientEmail) {
    doc.text(data.clientEmail, marginL, y);
    y += 4.5;
  }
  if (data.clientTaxId) {
    doc.text(`St.-Nr.: ${data.clientTaxId}`, marginL, y);
    y += 4.5;
  }

  // ── Rechnungsdetails (rechts) ───────────────────────────────────────────────
  const detailsX = pageW - marginR - 60;
  let detailY = 42;
  const addDetail = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colorGray);
    doc.text(label, detailsX, detailY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colorDark);
    doc.text(value, pageW - marginR, detailY, { align: "right" });
    detailY += 5;
  };
  addDetail("Rechnungsdatum:", formatDate(data.issueDate));
  addDetail("Fälligkeitsdatum:", formatDate(data.dueDate));
  if (data.businessTaxId) addDetail("Steuernummer:", data.businessTaxId);
  if (data.businessVatId) addDetail("USt-IdNr.:", data.businessVatId);

  // ── Trennlinie ──────────────────────────────────────────────────────────────
  y = Math.max(y, detailY) + 6;
  doc.setDrawColor(...colorLight);
  doc.setLineWidth(0.4);
  doc.line(marginL, y, pageW - marginR, y);
  y += 6;

  // ── Tabellen-Header ─────────────────────────────────────────────────────────
  doc.setFillColor(...colorLight);
  doc.rect(marginL, y - 3, contentW, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...colorGray);
  const colPos = marginL;
  const colQty = marginL + 90;
  const colPrice = marginL + 120;
  const colTotal = pageW - marginR;
  doc.text("Beschreibung", colPos, y + 2);
  doc.text("Menge", colQty, y + 2);
  doc.text("Einzelpreis", colPrice, y + 2);
  doc.text("Gesamt", colTotal, y + 2, { align: "right" });
  y += 10;

  // ── Positionen ──────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colorDark);

  data.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 252);
      doc.rect(marginL, y - 4, contentW, 7, "F");
    }
    // Beschreibung mit Zeilenumbruch
    const lines = doc.splitTextToSize(item.description, 80);
    doc.text(lines, colPos, y);
    doc.text(String(item.quantity), colQty, y);
    doc.text(formatEuro(item.unit_price), colPrice, y);
    doc.text(formatEuro(item.total), colTotal, y, { align: "right" });
    y += Math.max(lines.length * 5, 7);
  });

  // ── Summen-Block ─────────────────────────────────────────────────────────────
  y += 4;
  doc.setDrawColor(...colorLight);
  doc.line(marginL, y, pageW - marginR, y);
  y += 6;

  const sumLabelX = pageW - marginR - 60;
  const sumValueX = pageW - marginR;

  const addSum = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(bold ? colorDark[0] : colorGray[0], bold ? colorDark[1] : colorGray[1], bold ? colorDark[2] : colorGray[2]);
    doc.text(label, sumLabelX, y);
    doc.text(value, sumValueX, y, { align: "right" });
    y += bold ? 7 : 5.5;
  };

  addSum("Nettobetrag:", formatEuro(data.subtotal));
  addSum(`Umsatzsteuer (${data.taxRate}%):`, formatEuro(data.taxAmount));

  // Gesamt-Linie
  doc.setDrawColor(...colorPrimary);
  doc.setLineWidth(0.6);
  doc.line(sumLabelX - 5, y - 1, pageW - marginR, y - 1);
  y += 2;
  addSum("Gesamtbetrag:", formatEuro(data.total), true);

  // ── Zahlungshinweis ──────────────────────────────────────────────────────────
  y += 8;
  doc.setFillColor(...colorPrimary);
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.rect(marginL, y - 3, contentW, data.businessIban ? 18 : 12, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colorPrimary);
  doc.text("Zahlungshinweis", marginL + 4, y + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...colorDark);
  doc.text(
    `Bitte überweisen Sie den Betrag von ${formatEuro(data.total)} bis zum ${formatDate(data.dueDate)}.`,
    marginL + 4,
    y + 8
  );
  if (data.businessIban) {
    doc.text(`IBAN: ${data.businessIban}`, marginL + 4, y + 13);
  }
  y += data.businessIban ? 24 : 18;

  // ── Notizen ──────────────────────────────────────────────────────────────────
  if (data.notes) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...colorGray);
    doc.text("Anmerkungen:", marginL, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colorDark);
    const noteLines = doc.splitTextToSize(data.notes, contentW);
    doc.text(noteLines, marginL, y);
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const footerY = 285;
  doc.setDrawColor(...colorLight);
  doc.setLineWidth(0.3);
  doc.line(marginL, footerY - 4, pageW - marginR, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...colorGray);

  const footerParts: string[] = [];
  if (data.businessEmail) footerParts.push(data.businessEmail);
  if (data.businessPhone) footerParts.push(data.businessPhone);
  if (data.businessVatId) footerParts.push(`USt-IdNr.: ${data.businessVatId}`);
  if (data.businessTaxId) footerParts.push(`St.-Nr.: ${data.businessTaxId}`);

  doc.text(footerParts.join("  ·  "), pageW / 2, footerY, { align: "center" });
  doc.text(`Erstellt mit Fintutto Biz`, pageW / 2, footerY + 4, { align: "center" });

  return doc;
}

/** Rechnung als PDF herunterladen */
export function downloadInvoicePdf(data: InvoicePdfData): void {
  const doc = generateInvoicePdf(data);
  doc.save(`Rechnung_${data.invoiceNumber}.pdf`);
}

/** Rechnung als Blob-URL für Vorschau */
export function getInvoicePdfBlobUrl(data: InvoicePdfData): string {
  const doc = generateInvoicePdf(data);
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}
