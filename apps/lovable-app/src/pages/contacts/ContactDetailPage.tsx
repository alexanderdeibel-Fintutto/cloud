import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  TrendingUp,
  Plus,
  ExternalLink,
} from 'lucide-react';

// Demo-Kontakt
const demoContact = {
  id: '1',
  type: 'company',
  name: 'TechStart GmbH',
  email: 'accounting@techstart.de',
  phone: '+49 30 12345678',
  website: 'https://techstart.de',
  address: {
    street: 'Hauptstraße 1',
    zip: '10115',
    city: 'Berlin',
    country: 'Deutschland',
  },
  taxId: 'DE123456789',
  category: 'customer',
  notes: 'Wichtiger Kunde, bevorzugt E-Mail-Kommunikation.',
  createdAt: '2025-06-15T10:00:00',
  invoices: [
    { id: '1', number: 'R-2026-00012', date: '2026-02-03', amount: 4500, status: 'sent' },
    { id: '2', number: 'R-2025-00089', date: '2025-11-15', amount: 3200, status: 'paid' },
    { id: '3', number: 'R-2025-00067', date: '2025-09-20', amount: 5500, status: 'paid' },
    { id: '4', number: 'R-2025-00045', date: '2025-07-10', amount: 1800, status: 'paid' },
  ],
  stats: {
    totalRevenue: 15000,
    invoiceCount: 5,
    avgInvoiceValue: 3000,
    openAmount: 4500,
  },
};

const statusConfig = {
  sent: { label: 'Offen', color: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Bezahlt', color: 'bg-green-100 text-green-800' },
  overdue: { label: 'Überfällig', color: 'bg-red-100 text-red-800' },
};

export default function ContactDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/contacts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{demoContact.name}</h1>
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  Kunde
                </span>
              </div>
              <p className="text-gray-500 mt-1">{demoContact.taxId}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
          <Button variant="gradient" asChild>
            <Link to="/invoices/new">
              <Plus className="w-4 h-4 mr-2" />
              Neue Rechnung
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Gesamtumsatz</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(demoContact.stats.totalRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Rechnungen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {demoContact.stats.invoiceCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Ø Rechnungswert</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(demoContact.stats.avgInvoiceValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Offener Betrag</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(demoContact.stats.openAmount)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Rechnungen</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/invoices?customer=${demoContact.id}`}>
                  Alle anzeigen
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                      Nummer
                    </th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                      Datum
                    </th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                      Betrag
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {demoContact.invoices.map((invoice) => {
                    const status = statusConfig[invoice.status as keyof typeof statusConfig];
                    return (
                      <tr key={invoice.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="font-mono text-sm text-primary-600 hover:text-primary-700"
                          >
                            {invoice.number}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              status.color
                            )}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          {formatCurrency(invoice.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Notes */}
          {demoContact.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notizen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{demoContact.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a
                  href={`mailto:${demoContact.email}`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {demoContact.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <a
                  href={`tel:${demoContact.phone}`}
                  className="text-sm hover:text-primary-600"
                >
                  {demoContact.phone}
                </a>
              </div>
              {demoContact.website && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                  <a
                    href={demoContact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {demoContact.website.replace('https://', '')}
                  </a>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <p>{demoContact.address.street}</p>
                  <p>
                    {demoContact.address.zip} {demoContact.address.city}
                  </p>
                  <p>{demoContact.address.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Steuerdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">USt-IdNr.</span>
                <span className="font-mono">{demoContact.taxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Typ</span>
                <span>Unternehmen</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/invoices/new">
                  <FileText className="w-4 h-4 mr-2" />
                  Rechnung erstellen
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                E-Mail senden
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Kontakt löschen
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Erstellt am</span>
                <span>{formatDate(demoContact.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kunde seit</span>
                <span>
                  {Math.floor(
                    (Date.now() - new Date(demoContact.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24 * 30)
                  )}{' '}
                  Monate
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
