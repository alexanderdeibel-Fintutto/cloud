import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  FileText,
  ArrowRightLeft,
} from 'lucide-react';

// Demo-Buchung
const demoBooking = {
  id: '1',
  number: 'B-2026-0042',
  date: '2026-02-04',
  description: 'Miete Februar 2026',
  receiptNumber: 'M-2026-02',
  status: 'booked',
  createdAt: '2026-02-04T10:30:00',
  createdBy: 'Alexander Deibel',
  lines: [
    { account: { number: '4210', name: 'Miete' }, debit: 2500.0, credit: 0 },
    { account: { number: '1200', name: 'Bank' }, debit: 0, credit: 2500.0 },
  ],
  notes: 'Monatliche Mietzahlung für Büroräume',
};

export default function BookingDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/bookings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{demoBooking.number}</h1>
            <p className="text-gray-500 mt-1">{demoBooking.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Drucken
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Stornieren
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Lines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary-600" />
                Buchungszeilen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">
                      Konto
                    </th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">
                      Soll
                    </th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">
                      Haben
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {demoBooking.lines.map((line, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-3">
                        <span className="font-mono text-sm text-gray-600">
                          {line.account.number}
                        </span>
                        <span className="mx-2 text-gray-400">·</span>
                        <span className="text-sm">{line.account.name}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-sm">
                        {line.debit > 0 ? formatCurrency(line.debit) : '–'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-sm">
                        {line.credit > 0 ? formatCurrency(line.credit) : '–'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-2 px-3 text-sm">Summe</td>
                    <td className="py-2 px-3 text-right font-mono text-sm">
                      {formatCurrency(demoBooking.lines.reduce((s, l) => s + l.debit, 0))}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm">
                      {formatCurrency(demoBooking.lines.reduce((s, l) => s + l.credit, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {/* Notes */}
          {demoBooking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notizen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{demoBooking.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Buchungsnummer</span>
                <span className="font-mono font-medium">{demoBooking.number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Buchungsdatum</span>
                <span>{formatDate(demoBooking.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Belegnummer</span>
                <span className="font-mono">{demoBooking.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  Gebucht
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Linked Receipt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Verknüpfter Beleg
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm">{demoBooking.receiptNumber}</p>
                  <p className="text-xs text-gray-500">Mietvertrag</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/receipts/${demoBooking.receiptNumber}`}>
                    Ansehen
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Protokoll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Erstellt am</span>
                <span>{new Date(demoBooking.createdAt).toLocaleString('de-DE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Erstellt von</span>
                <span>{demoBooking.createdBy}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
