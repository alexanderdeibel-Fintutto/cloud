import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Download,
  ChevronRight,
  ChevronDown,
  Landmark,
  TrendingUp,
  TrendingDown,
  Calculator,
} from 'lucide-react';

// Demo-Kontenrahmen SKR03
const demoAccountGroups = [
  {
    id: '0',
    name: 'Anlagevermögen',
    range: '0000-0999',
    accounts: [
      { number: '0027', name: 'EDV-Software', balance: 2500.0, type: 'debit' },
      { number: '0420', name: 'Büroausstattung', balance: 4590.0, type: 'debit' },
      { number: '0650', name: 'Büroeinrichtung', balance: 8500.0, type: 'debit' },
    ],
    totalDebit: 15590.0,
    totalCredit: 0,
  },
  {
    id: '1',
    name: 'Umlaufvermögen & Aktive Rechnungsabgrenzung',
    range: '1000-1999',
    accounts: [
      { number: '1200', name: 'Bank', balance: 45678.9, type: 'debit' },
      { number: '1400', name: 'Forderungen aus Lieferungen und Leistungen', balance: 12450.0, type: 'debit' },
      { number: '1571', name: 'Abziehbare Vorsteuer 19%', balance: 890.5, type: 'debit' },
      { number: '1576', name: 'Abziehbare Vorsteuer 7%', balance: 45.0, type: 'debit' },
      { number: '1600', name: 'Verbindlichkeiten aus Lieferungen und Leistungen', balance: 3200.0, type: 'credit' },
      { number: '1776', name: 'Umsatzsteuer 19%', balance: 1890.5, type: 'credit' },
    ],
    totalDebit: 59064.4,
    totalCredit: 5090.5,
  },
  {
    id: '2',
    name: 'Eigenkapital',
    range: '2000-2999',
    accounts: [
      { number: '2000', name: 'Gezeichnetes Kapital', balance: 25000.0, type: 'credit' },
      { number: '2970', name: 'Gewinnvortrag', balance: 12500.0, type: 'credit' },
    ],
    totalDebit: 0,
    totalCredit: 37500.0,
  },
  {
    id: '4',
    name: 'Betriebliche Aufwendungen',
    range: '4000-4999',
    accounts: [
      { number: '4100', name: 'Löhne', balance: 0, type: 'debit' },
      { number: '4120', name: 'Gehälter', balance: 0, type: 'debit' },
      { number: '4210', name: 'Miete', balance: 5000.0, type: 'debit' },
      { number: '4360', name: 'Versicherungen', balance: 350.0, type: 'debit' },
      { number: '4920', name: 'Telefon', balance: 90.0, type: 'debit' },
      { number: '4930', name: 'Bürobedarf', balance: 179.8, type: 'debit' },
      { number: '4950', name: 'Rechts- und Beratungskosten', balance: 890.0, type: 'debit' },
      { number: '4964', name: 'IT-Kosten', balance: 59.8, type: 'debit' },
    ],
    totalDebit: 6569.6,
    totalCredit: 0,
  },
  {
    id: '8',
    name: 'Erlöse',
    range: '8000-8999',
    accounts: [
      { number: '8120', name: 'Steuerfreie Umsätze', balance: 0, type: 'credit' },
      { number: '8300', name: 'Erlöse 7% USt', balance: 0, type: 'credit' },
      { number: '8400', name: 'Erlöse 19% USt', balance: 28500.0, type: 'credit' },
    ],
    totalDebit: 0,
    totalCredit: 28500.0,
  },
];

export default function AccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['1', '4', '8']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const filteredGroups = demoAccountGroups.map((group) => ({
    ...group,
    accounts: group.accounts.filter(
      (account) =>
        account.number.includes(searchTerm) ||
        account.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((group) => group.accounts.length > 0 || !searchTerm);

  // Bilanzsummen berechnen
  const totalAssets = demoAccountGroups
    .filter((g) => g.id === '0' || g.id === '1')
    .reduce((sum, g) => sum + g.totalDebit - g.totalCredit, 0);
  const totalLiabilities = demoAccountGroups
    .filter((g) => g.id === '2')
    .reduce((sum, g) => sum + g.totalCredit - g.totalDebit, 0);
  const totalExpenses = demoAccountGroups
    .filter((g) => g.id === '4')
    .reduce((sum, g) => sum + g.totalDebit, 0);
  const totalRevenue = demoAccountGroups
    .filter((g) => g.id === '8')
    .reduce((sum, g) => sum + g.totalCredit, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontenplan</h1>
          <p className="text-gray-500 mt-1">
            SKR03 Kontenrahmen mit aktuellen Salden
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportieren
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aktiva</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalAssets)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Landmark className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Passiva</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalLiabilities)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aufwendungen</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Erlöse</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Suchen nach Kontonummer oder Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Groups */}
      <div className="space-y-4">
        {filteredGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <CardTitle className="text-base">
                      {group.id}xxx – {group.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Konten {group.range} • {group.accounts.length} Konten
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right">
                    <p className="text-gray-500">Soll</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(group.totalDebit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Haben</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(group.totalCredit)}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            {expandedGroups.includes(group.id) && (
              <CardContent className="pt-0">
                <div className="border-t">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                          Konto
                        </th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                          Bezeichnung
                        </th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                          Soll
                        </th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                          Haben
                        </th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                          Saldo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.accounts.map((account) => (
                        <tr
                          key={account.number}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-4 font-mono text-sm">
                            {account.number}
                          </td>
                          <td className="py-2 px-4 text-sm">{account.name}</td>
                          <td className="py-2 px-4 text-sm text-right">
                            {account.type === 'debit' && account.balance > 0
                              ? formatCurrency(account.balance)
                              : '–'}
                          </td>
                          <td className="py-2 px-4 text-sm text-right">
                            {account.type === 'credit' && account.balance > 0
                              ? formatCurrency(account.balance)
                              : '–'}
                          </td>
                          <td
                            className={cn(
                              'py-2 px-4 text-sm text-right font-medium',
                              account.balance > 0
                                ? account.type === 'debit'
                                  ? 'text-blue-600'
                                  : 'text-green-600'
                                : 'text-gray-400'
                            )}
                          >
                            {account.balance > 0
                              ? `${account.type === 'debit' ? 'S ' : 'H '}${formatCurrency(account.balance)}`
                              : '–'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
