import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Sparkles,
  CheckCircle2,
  FileText,
  Calendar,
  Building2,
  Receipt,
  Tag,
} from 'lucide-react';

// Demo-Beleg
const demoReceipt = {
  id: '1',
  filename: 'amazon_büromaterial.pdf',
  uploadedAt: '2026-02-04T10:30:00',
  vendor: 'Amazon',
  date: '2026-02-02',
  amount: 89.9,
  taxRate: 19,
  taxAmount: 14.35,
  netAmount: 75.55,
  category: 'Bürobedarf',
  status: 'processed',
  account: { number: '4930', name: 'Bürobedarf' },
  description: 'Büromaterial (Stifte, Papier, Ordner)',
  bookingNumber: 'B-2026-0040',
  ocrConfidence: 0.95,
};

export default function ReceiptDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/receipts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{demoReceipt.vendor}</h1>
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                Verarbeitet
              </span>
            </div>
            <p className="text-gray-500 mt-1">{demoReceipt.filename}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Belegvorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">PDF Vorschau</p>
                  <p className="text-sm text-gray-400 mt-1">{demoReceipt.filename}</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Download className="w-4 h-4 mr-2" />
                    Original herunterladen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Extracted Data */}
        <div className="space-y-6">
          {/* AI Confidence */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">KI-Erkennung</p>
                  <p className="text-sm text-green-700">
                    {Math.round(demoReceipt.ocrConfidence * 100)}% Konfidenz
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Erkannte Daten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Lieferant</p>
                  <p className="font-medium">{demoReceipt.vendor}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Belegdatum</p>
                  <p className="font-medium">{formatDate(demoReceipt.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Receipt className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Betrag</p>
                  <p className="font-medium text-lg">{formatCurrency(demoReceipt.amount)}</p>
                  <p className="text-xs text-gray-500">
                    Netto: {formatCurrency(demoReceipt.netAmount)} + {demoReceipt.taxRate}% USt
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Kategorie</p>
                  <p className="font-medium">{demoReceipt.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Buchung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Buchungsnummer</span>
                  <Link
                    to={`/bookings/${demoReceipt.bookingNumber}`}
                    className="font-mono text-sm text-primary-600 hover:text-primary-700"
                  >
                    {demoReceipt.bookingNumber}
                  </Link>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Konto</span>
                  <span className="font-mono text-sm">
                    {demoReceipt.account.number} {demoReceipt.account.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Gebucht
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/bookings/${demoReceipt.bookingNumber}`}>
                  Zur Buchung
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Hochgeladen am</span>
                <span>{new Date(demoReceipt.uploadedAt).toLocaleString('de-DE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dateiname</span>
                <span className="font-mono text-xs truncate max-w-[150px]">
                  {demoReceipt.filename}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Beschreibung</span>
                <span className="text-right max-w-[180px]">{demoReceipt.description}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
