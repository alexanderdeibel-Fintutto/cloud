import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  Send,
  Mail,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Building2,
} from 'lucide-react';

// Demo-Rechnung
const demoInvoice = {
  id: '1',
  number: 'R-2026-00012',
  date: '2026-02-03',
  dueDate: '2026-02-17',
  status: 'sent',
  customer: {
    name: 'TechStart GmbH',
    email: 'accounting@techstart.de',
    address: 'Hauptstraße 1\n10115 Berlin',
    taxId: 'DE123456789',
  },
  lines: [
    { description: 'Webdesign Startseite', quantity: 1, unit: 'Stück', unitPrice: 1500.0, taxRate: 19 },
    { description: 'Unterseiten (5x)', quantity: 5, unit: 'Stück', unitPrice: 350.0, taxRate: 19 },
    { description: 'Responsive Optimierung', quantity: 8, unit: 'Stunden', unitPrice: 95.0, taxRate: 19 },
  ],
  netAmount: 3781.51,
  taxAmount: 718.49,
  grossAmount: 4500.0,
  paidAmount: 0,
  notes: 'Vielen Dank für Ihren Auftrag!',
  createdAt: '2026-02-03T14:30:00',
  sentAt: '2026-02-03T15:00:00',
};

export default function InvoiceDetailPage() {
  const { id } = useParams();

  const lineTotal = (line: typeof demoInvoice.lines[0]) =>
    line.quantity * line.unitPrice;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/invoices">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{demoInvoice.number}</h1>
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                Versendet
              </span>
            </div>
            <p className="text-gray-500 mt-1">{demoInvoice.customer.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Drucken
          </Button>
          <Button variant="outline">
            <Send className="w-4 h-4 mr-2" />
            Mahnung
          </Button>
          <Button variant="gradient">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Als bezahlt markieren
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Invoice Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              {/* Invoice Header */}
              <div className="flex justify-between mb-8">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-xl">F</span>
                  </div>
                  <p className="font-semibold">Meine Firma GmbH</p>
                  <p className="text-sm text-gray-500">Musterstraße 1</p>
                  <p className="text-sm text-gray-500">12345 Musterstadt</p>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">RECHNUNG</h2>
                  <p className="font-mono text-lg">{demoInvoice.number}</p>
                </div>
              </div>

              {/* Customer & Dates */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Rechnungsempfänger</p>
                  <p className="font-semibold">{demoInvoice.customer.name}</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {demoInvoice.customer.address}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{demoInvoice.customer.taxId}</p>
                </div>
                <div className="md:text-right">
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Rechnungsdatum</p>
                    <p className="font-medium">{formatDate(demoInvoice.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fälligkeitsdatum</p>
                    <p className="font-medium">{formatDate(demoInvoice.dueDate)}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Lines */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 text-sm font-semibold text-gray-600">
                      Beschreibung
                    </th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-600">
                      Menge
                    </th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-600">
                      Einzelpreis
                    </th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-600">
                      Gesamt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {demoInvoice.lines.map((line, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 text-sm">{line.description}</td>
                      <td className="py-3 text-sm text-right">
                        {line.quantity} {line.unit}
                      </td>
                      <td className="py-3 text-sm text-right">
                        {formatCurrency(line.unitPrice)}
                      </td>
                      <td className="py-3 text-sm text-right font-medium">
                        {formatCurrency(lineTotal(line))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Zwischensumme</span>
                    <span>{formatCurrency(demoInvoice.netAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">USt 19%</span>
                    <span>{formatCurrency(demoInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span>Gesamtbetrag</span>
                    <span>{formatCurrency(demoInvoice.grossAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {demoInvoice.notes && (
                <div className="mt-8 pt-8 border-t">
                  <p className="text-sm text-gray-500">{demoInvoice.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-8 border-t text-center text-xs text-gray-400">
                <p>Meine Firma GmbH • Musterstraße 1 • 12345 Musterstadt</p>
                <p>Geschäftsführer: Max Mustermann • HRB 12345 • Amtsgericht Musterstadt</p>
                <p>Steuer-Nr.: 123/456/78901 • USt-IdNr.: DE123456789</p>
                <p>Bank: Deutsche Bank • IBAN: DE89 3704 0044 0532 0130 00</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Warten auf Zahlung</p>
                  <p className="text-sm text-blue-700">
                    Fällig in {Math.ceil((new Date(demoInvoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Tagen
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Offener Betrag</span>
                  <span className="font-semibold">
                    {formatCurrency(demoInvoice.grossAmount - demoInvoice.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bereits bezahlt</span>
                  <span>{formatCurrency(demoInvoice.paidAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" />
                Kunde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-medium">{demoInvoice.customer.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  {demoInvoice.customer.email}
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/contacts/1">Zum Kontakt</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium">Versendet</p>
                    <p className="text-xs text-gray-500">
                      {new Date(demoInvoice.sentAt!).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium">Erstellt</p>
                    <p className="text-xs text-gray-500">
                      {new Date(demoInvoice.createdAt).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
