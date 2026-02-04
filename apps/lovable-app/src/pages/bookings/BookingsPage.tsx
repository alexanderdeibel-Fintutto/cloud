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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

// Demo-Daten für Buchungen
const demoBookings = [
  {
    id: '1',
    number: 'B-2026-0042',
    date: '2026-02-04',
    description: 'Miete Februar 2026',
    debitAccount: { number: '4210', name: 'Miete' },
    creditAccount: { number: '1200', name: 'Bank' },
    amount: 2500.0,
    taxRate: 0,
    receiptNumber: 'M-2026-02',
    status: 'booked',
  },
  {
    id: '2',
    number: 'B-2026-0041',
    date: '2026-02-03',
    description: 'Rechnung R-2026-00012 - Webdesign Projekt',
    debitAccount: { number: '1400', name: 'Forderungen' },
    creditAccount: { number: '8400', name: 'Erlöse 19%' },
    amount: 4500.0,
    taxRate: 19,
    receiptNumber: 'R-2026-00012',
    status: 'booked',
  },
  {
    id: '3',
    number: 'B-2026-0040',
    date: '2026-02-02',
    description: 'Büromaterial Amazon',
    debitAccount: { number: '4930', name: 'Bürobedarf' },
    creditAccount: { number: '1200', name: 'Bank' },
    amount: 89.9,
    taxRate: 19,
    receiptNumber: 'AMZ-123456',
    status: 'booked',
  },
  {
    id: '4',
    number: 'B-2026-0039',
    date: '2026-02-01',
    description: 'Telefonkosten Januar',
    debitAccount: { number: '4920', name: 'Telefon' },
    creditAccount: { number: '1200', name: 'Bank' },
    amount: 45.0,
    taxRate: 19,
    receiptNumber: 'TEL-2026-01',
    status: 'booked',
  },
  {
    id: '5',
    number: 'B-2026-0038',
    date: '2026-01-31',
    description: 'Serverkosten Hetzner',
    debitAccount: { number: '4964', name: 'IT-Kosten' },
    creditAccount: { number: '1200', name: 'Bank' },
    amount: 29.9,
    taxRate: 19,
    receiptNumber: 'HET-123456',
    status: 'booked',
  },
  {
    id: '6',
    number: 'B-2026-0037',
    date: '2026-01-30',
    description: 'Rechnung R-2026-00011 - Beratung',
    debitAccount: { number: '1400', name: 'Forderungen' },
    creditAccount: { number: '8400', name: 'Erlöse 19%' },
    amount: 1200.0,
    taxRate: 19,
    receiptNumber: 'R-2026-00011',
    status: 'booked',
  },
  {
    id: '7',
    number: 'B-2026-0036',
    date: '2026-01-28',
    description: 'Versicherungsbeitrag Betriebshaftpflicht',
    debitAccount: { number: '4360', name: 'Versicherungen' },
    creditAccount: { number: '1200', name: 'Bank' },
    amount: 350.0,
    taxRate: 0,
    receiptNumber: 'VERS-2026-01',
    status: 'booked',
  },
  {
    id: '8',
    number: 'B-2026-0035',
    date: '2026-01-25',
    description: 'Steuerberaterkosten Q4/2025',
    debitAccount: { number: '4950', name: 'Rechts- und Beratungskosten' },
    creditAccount: { number: '1200', name: 'Bank' },
    amount: 890.0,
    taxRate: 19,
    receiptNumber: 'STB-2025-Q4',
    status: 'booked',
  },
];

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBookings = demoBookings.filter(
    (booking) =>
      booking.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.debitAccount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.creditAccount.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summen berechnen
  const totalDebit = filteredBookings.reduce((sum, b) => sum + b.amount, 0);
  const totalCredit = filteredBookings.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buchungsjournal</h1>
          <p className="text-gray-500 mt-1">
            Alle Buchungen Ihres Unternehmens im Überblick
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportieren
          </Button>
          <Button variant="gradient" asChild>
            <Link to="/bookings/new">
              <Plus className="w-4 h-4 mr-2" />
              Neue Buchung
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Buchungen gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{filteredBookings.length}</p>
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
                <p className="text-sm text-gray-500">Summe Soll</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDebit)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <ArrowUpDown className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Summe Haben</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCredit)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <ArrowUpDown className="w-5 h-5 text-green-600" />
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
                placeholder="Suchen nach Beschreibung, Buchungsnr., Konto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                Zeitraum: Februar 2026
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-semibold">Buchungen</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Buchungsnr.
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Datum
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Beschreibung
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Soll
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Haben
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Betrag
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {}}
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="font-mono text-sm text-primary-600 hover:text-primary-700"
                      >
                        {booking.number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(booking.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Beleg: {booking.receiptNumber}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <span className="font-mono text-gray-600">
                          {booking.debitAccount.number}
                        </span>
                        <span className="text-gray-400 mx-1">·</span>
                        <span className="text-gray-900">{booking.debitAccount.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <span className="font-mono text-gray-600">
                          {booking.creditAccount.number}
                        </span>
                        <span className="text-gray-400 mx-1">·</span>
                        <span className="text-gray-900">{booking.creditAccount.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(booking.amount)}
                      {booking.taxRate > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({booking.taxRate}%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={5} className="py-3 px-4 text-sm text-gray-900">
                    Summe
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    {formatCurrency(totalDebit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Zeige {(currentPage - 1) * itemsPerPage + 1} bis{' '}
                {Math.min(currentPage * itemsPerPage, filteredBookings.length)} von{' '}
                {filteredBookings.length} Buchungen
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Seite {currentPage} von {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
