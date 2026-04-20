import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatDate } from './utils'

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit?: string
  unitPrice: number
  taxRate: number
  discount?: number
}

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  deliveryDate?: string
  headerText?: string
  footerText?: string
  company: {
    name: string
    address: string
    city: string
    taxId?: string
    vatId?: string
    iban?: string
    bic?: string
    bank?: string
  }
  contact: {
    name: string
    address?: string
    city?: string
  }
  lineItems: InvoiceLineItem[]
}

export function generateInvoicePdf(data: InvoiceData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header: Firmenname
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(data.company.name, 20, 25)

  // Firmenadresse (oben rechts)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  const companyLines = [
    data.company.address,
    data.company.city,
    data.company.taxId ? `St.-Nr.: ${data.company.taxId}` : '',
    data.company.vatId ? `USt-IdNr.: ${data.company.vatId}` : '',
  ].filter(Boolean)
  doc.text(companyLines, pageWidth - 20, 20, { align: 'right' })

  // Trennlinie
  doc.setDrawColor(200)
  doc.line(20, 35, pageWidth - 20, 35)

  // Empfängeradresse
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.text(data.contact.name, 20, 50)
  if (data.contact.address) doc.text(data.contact.address, 20, 56)
  if (data.contact.city) doc.text(data.contact.city, 20, 62)

  // Rechnungsdetails (rechts)
  doc.setFontSize(9)
  doc.setTextColor(80)
  const detailsX = pageWidth - 20
  doc.text(`Rechnungsnummer: ${data.invoiceNumber}`, detailsX, 50, { align: 'right' })
  doc.text(`Rechnungsdatum: ${formatDate(data.invoiceDate)}`, detailsX, 56, { align: 'right' })
  if (data.dueDate) doc.text(`Fällig am: ${formatDate(data.dueDate)}`, detailsX, 62, { align: 'right' })
  if (data.deliveryDate) doc.text(`Leistungsdatum: ${formatDate(data.deliveryDate)}`, detailsX, 68, { align: 'right' })

  // Titel
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text(`Rechnung ${data.invoiceNumber}`, 20, 82)

  // Headertext
  if (data.headerText) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(data.headerText, 20, 92, { maxWidth: pageWidth - 40 })
  }

  // Positionen
  const tableStartY = data.headerText ? 105 : 92
  const tableData = data.lineItems.map((item, i) => {
    const net = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
    const tax = net * (item.taxRate / 100)
    return [
      i + 1,
      item.description,
      `${item.quantity} ${item.unit || 'Stk.'}`,
      formatCurrency(item.unitPrice),
      `${item.taxRate}%`,
      formatCurrency(net + tax),
    ]
  })

  autoTable(doc, {
    startY: tableStartY,
    head: [['Pos.', 'Beschreibung', 'Menge', 'Einzelpreis', 'MwSt.', 'Gesamt']],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 12 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
  })

  // Summen
  const finalY = (doc as any).lastAutoTable.finalY + 10
  let netTotal = 0
  let taxTotal = 0
  data.lineItems.forEach(item => {
    const net = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
    netTotal += net
    taxTotal += net * (item.taxRate / 100)
  })
  const grossTotal = netTotal + taxTotal

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Nettobetrag:', pageWidth - 80, finalY)
  doc.text(formatCurrency(netTotal), pageWidth - 20, finalY, { align: 'right' })
  doc.text('MwSt.:', pageWidth - 80, finalY + 6)
  doc.text(formatCurrency(taxTotal), pageWidth - 20, finalY + 6, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.text('Gesamtbetrag:', pageWidth - 80, finalY + 14)
  doc.text(formatCurrency(grossTotal), pageWidth - 20, finalY + 14, { align: 'right' })

  // Bankverbindung
  if (data.company.iban) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80)
    const bankY = finalY + 30
    doc.text('Bankverbindung:', 20, bankY)
    doc.text(`IBAN: ${data.company.iban}`, 20, bankY + 6)
    if (data.company.bic) doc.text(`BIC: ${data.company.bic}`, 20, bankY + 12)
    if (data.company.bank) doc.text(`Bank: ${data.company.bank}`, 20, bankY + 18)
  }

  // Fußtext
  if (data.footerText) {
    doc.setFontSize(9)
    doc.setTextColor(100)
    doc.text(data.footerText, 20, doc.internal.pageSize.getHeight() - 20, { maxWidth: pageWidth - 40 })
  }

  return doc
}
