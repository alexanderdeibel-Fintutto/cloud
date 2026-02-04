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
  RefreshCw,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Link2,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Clock,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';

// Demo-Daten für Bankkonten
const demoBankAccounts = [
  {
    id: '1',
    name: 'Geschäftskonto',
    bank: 'Deutsche Bank',
    iban: 'DE89 3704 0044 0532 0130 00',
    bic: 'COBADEFFXXX',
    balance: 45678.9,
    currency: 'EUR',
    lastSync: '2026-02-04T10:30:00',
    connected: true,
  },
  {
    id: '2',
    name: 'Tagesgeldkonto',
    bank: 'Commerzbank',
    iban: 'DE12 3456 7890 1234 5678 90',
    bic: 'DRESDEFF',
    balance: 25000.0,
    currency: 'EUR',
    lastSync: '2026-02-04T10:30:00',
    connected: true,
  },
  {
    id: '3',
    name: 'PayPal Geschäft',
    bank: 'PayPal',
    iban: null,
    bic: null,
    balance: 1234.56,
    currency: 'EUR',
    lastSync: '2026-02-03T18:00:00',
    connected: true,
  },
];

// Demo-Transaktionen
const demoTransactions = [
  {
    id: '1',
    date: '2026-02-04',
    description: 'Miete Februar 2026',
    amount: -2500.0,
    counterparty: 'Vermietung Schmidt GmbH',
    status: 'matched',
    bookingNumber: 'B-2026-0042',
  },
  {
    id: '2',
    date: '2026-02-03',
    description: 'Zahlung R-2026-00011',
    amount: 1200.0,
    counterparty: 'Digital Solutions AG',
    status: 'matched',
    bookingNumber: 'B-2026-0041',
  },
  {
    id: '3',
    date: '2026-02-02',
    description: 'Amazon Marketplace',
    amount: -89.9,
    counterparty: 'Amazon EU S.à r.l.',
    status: 'matched',
    bookingNumber: 'B-2026-0040',
  },
  {
    id: '4',
    date: '2026-02-01',
    description: 'Telekom Rechnung',
    amount: -45.0,
    counterparty: 'Telekom Deutschland GmbH',
    status: 'matched',
    bookingNumber: 'B-2026-0039',
  },
  {
    id: '5',
    date: '2026-02-01',
    description: 'SEPA Lastschrift Hetzner',
    amount: -29.9,
    counterparty: 'Hetzner Online GmbH',
    status: 'pending',
    bookingNumber: null,
  },
  {
    id: '6',
    date: '2026-01-31',
    description: 'Eingang Rechnung R-2026-00010',
    amount: 7500.0,
    counterparty: 'Müller & Partner',
    status: 'pending',
    bookingNumber: null,
  },
  {
    id: '7',
    date: '2026-01-30',
    description: 'EC-Karte Tankstelle',
    amount: -65.43,
    counterparty: 'Shell Station',
    status: 'pending',
    bookingNumber: null,
  },
  {
    id: '8',
    date: '2026-01-29',
    description: 'SEPA Überweisung',
    amount: -350.0,
    counterparty: 'Allianz Versicherung',
    status: 'pending',
    bookingNumber: null,
  },
];

const statusConfig = {
  pending: { label: 'Offen', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  matched: { label: 'Zugeordnet', color: 'bg-green-100 text-green-800', icon: Check },
  ignored: { label: 'Ignoriert', color: 'bg-gray-100 text-gray-500', icon: X },
};

export default function BankAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState(demoBankAccounts[0]);

  const filteredTransactions = demoTransactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.counterparty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistiken
  const totalBalance = demoBankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const pendingCount = demoTransactions.filter((t) => t.status === 'pending').length;
  const incomeThisMonth = demoTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseThisMonth = demoTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bankkonten</h1>
          <p className="text-gray-500 mt-1">
            Verwalten Sie Ihre Konten und gleichen Sie Transaktionen ab
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Synchronisieren
          </Button>
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            Konto verbinden
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gesamtguthaben</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary-100">
                <Landmark className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Zu verarbeiten</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Einnahmen (Monat)</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(incomeThisMonth)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ausgaben (Monat)</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(expenseThisMonth)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verbundene Konten</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            {demoBankAccounts.map((account) => (
              <div
                key={account.id}
                className={cn(
                  'p-4 cursor-pointer transition-colors',
                  selectedAccount.id === account.id
                    ? 'bg-primary-50'
                    : 'hover:bg-gray-50'
                )}
                onClick={() => setSelectedAccount(account)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Landmark className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-500">{account.bank}</p>
                    </div>
                  </div>
                  {account.connected && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Link2 className="w-3 h-3" />
                      Verbunden
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(account.balance)}
                </p>
                {account.iban && (
                  <p className="text-xs font-mono text-gray-400">{account.iban}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Letzter Abruf: {new Date(account.lastSync).toLocaleString('de-DE')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Transactions - Quick Actions */}
      {pendingCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              {pendingCount} Transaktionen warten auf Zuordnung
            </CardTitle>
            <Button variant="gradient" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              KI-Zuordnung starten
            </Button>
          </CardHeader>
        </Card>
      )}

      {/* Filter & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Suchen nach Beschreibung, Empfänger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Alle' },
                { value: 'pending', label: 'Offen' },
                { value: 'matched', label: 'Zugeordnet' },
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

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-0">
          <CardTitle className="text-base">
            Transaktionen: {selectedAccount.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Datum
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Beschreibung
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Gegenkonto
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
                {filteredTransactions.map((tx) => {
                  const status = statusConfig[tx.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={tx.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'p-1.5 rounded-full',
                              tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                            )}
                          >
                            {tx.amount > 0 ? (
                              <ArrowDownLeft className="w-3 h-3 text-green-600" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-red-600" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {tx.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {tx.counterparty}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                              status.color
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          {tx.bookingNumber && (
                            <Link
                              to={`/bookings/${tx.bookingNumber}`}
                              className="text-xs font-mono text-primary-600 hover:text-primary-700"
                            >
                              {tx.bookingNumber}
                            </Link>
                          )}
                        </div>
                      </td>
                      <td
                        className={cn(
                          'py-3 px-4 text-sm text-right font-semibold',
                          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {tx.status === 'pending' && (
                            <Button variant="outline" size="sm">
                              <Sparkles className="w-4 h-4 mr-1" />
                              Zuordnen
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

          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center">
              <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Keine Transaktionen gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
