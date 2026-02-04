import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

// Demo-Daten für Rechnungen
const demoInvoices = [
  {
    id: '1',
    number: 'R-2026-00012',
    date: '2026-02-03',
    dueDate: '2026-02-17',
    customer: { name: 'TechStart GmbH', email: 'accounting@techstart.de' },
    description: 'Webdesign Projekt',
    netAmount: 3781.51,
    taxAmount: 718.49,
    grossAmount: 4500.0,
    status: 'sent',
    paidAmount: 0,
  },
  {
    id: '2',
    number: 'R-2026-00011',
    date: '2026-01-30',
    dueDate: '2026-02-13',
    customer: { name: 'Digital Solutions AG', email: 'finance@digitalsolutions.de' },
    description: 'Beratungsleistungen Januar',
    netAmount: 1008.4,
    taxAmount: 191.6,
    grossAmount: 1200.0,
    status: 'paid',
    paidAmount: 1200.0,
  },
  {
    id: '3',
    number: 'R-2026-00010',
    date: '2026-01-25',
    dueDate: '2026-02-08',
    customer: { name: 'Müller & Partner', email: 'buchhaltung@mueller-partner.de' },
    description: 'Software-Entwicklung Phase 1',
    netAmount: 6302.52,
    taxAmount: 1197.48,
    grossAmount: 7500.0,
    status: 'overdue',
    paidAmount: 0,
  },
  {
    id: '4',
    number: 'R-2026-00009',
    date: '2026-01-20',
    dueDate: '2026-02-03',
    customer: { name: 'Innovation Labs KG', email: 'office@innovationlabs.de' },
    description: 'Workshop IT-Sicherheit',
    netAmount: 1260.5,
    taxAmount: 239.5,
    grossAmount: 1500.0,
    status: 'paid',
    paidAmount: 1500.0,
  },
  {
    id: '5',
    number: 'R-2026-00008',
    date: '2026-01-15',
    dueDate: '2026-01-29',
    customer: { name: 'Green Energy GmbH', email: 'finanzen@greenenergy.de' },
    description: 'Datenanalyse Q4/2025',
    netAmount: 2100.84,
    taxAmount: 399.16,
    grossAmount: 2500.0,
    status: 'overdue',
    paidAmount: 0,
  },
  {
    id: '6',
    number: 'R-2026-00007',
    date: '2026-01-10',
    dueDate: '2026-01-24',
    customer: { name: 'Fashion Store OHG', email: 'info@fashionstore.de' },
    description: 'E-Commerce Integration',
    netAmount: 4201.68,
    taxAmount: 798.32,
    grossAmount: 5000.0,
    status: 'paid',
    paidAmount: 5000.0,
  },
  {
    id: '7',
    number: 'R-2026-00006',
    date: '2026-01-05',
    dueDate: '2026-01-19',
    customer: { name: 'Startup Hub Berlin', email: 'accounting@startuphub.de' },
    description: 'Pitch Deck Design',
    netAmount: 840.34,
    taxAmount: 159.66,
    grossAmount: 1000.0,
    status: 'paid',
    paidAmount: 1000.0,
  },
  {
    id: '8',
    number: 'R-2026-00005',
    date: '2025-12-20',
    dueDate: '2026-01-03',
    customer: { name: 'Media Agency Pro', email: 'bills@mediaagency.de' },
    description: 'Social Media Kampagne',
    netAmount: 2521.01,
    taxAmount: 478.99,
    grossAmount: 3000.0,
    status: 'cancelled',
    paidAmount: 0,
  },
];

const statusConfig = {
  draft: { label: 'Entwurf', color: 'bg-gray-100 text-gray-800', icon: FileText },
  sent: { label: 'Versendet', color: 'bg-blue-100 text-blue-800', icon: Send },
  paid: { label: 'Bezahlt', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  overdue: { label: 'Überfällig', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  cancelled: { label: 'Storniert', color: 'bg-gray-100 text-gray-500', icon: XCircle },
};

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = demoInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistiken berechnen
  const stats = {
    total: demoInvoices.length,
    open: demoInvoices.filter((i) => i.status === 'sent').length,
    overdue: demoInvoices.filter((i) => i.status === 'overdue').length,
    openAmount: demoInvoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.grossAmount - i.paidAmount, 0),
    overdueAmount: demoInvoices
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + i.grossAmount - i.paidAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
          <p className="text-gray-500 mt-1">
            Erstellen und verwalten Sie Ihre Ausgangsrechnungen
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportieren
          </Button>
          <Button variant="gradient" asChild>
            <Link to="/invoices/new">
              <Plus className="w-4 h-4 mr-2" />
              Neue Rechnung
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rechnungen gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary-100">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Offen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Überfällig</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Offene Forderungen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.openAmount)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Suchen nach Rechnungsnr., Kunde, Beschreibung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Alle' },
                { value: 'sent', label: 'Offen' },
                { value: 'overdue', label: 'Überfällig' },
                { value: 'paid', label: 'Bezahlt' },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={statusFilter === status.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Rechnung
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Kunde
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Datum
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Fällig
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Betrag
                  </th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="font-mono text-sm text-primary-600 hover:text-primary-700"
                        >
                          {invoice.number}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">{invoice.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.customer.name}
                        </p>
                        <p className="text-xs text-gray-500">{invoice.customer.email}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                            status.color
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(invoice.grossAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Netto: {formatCurrency(invoice.netAmount)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/invoices/${invoice.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          {invoice.status === 'sent' && (
                            <Button variant="ghost" size="sm" title="Mahnung senden">
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Keine Rechnungen gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
