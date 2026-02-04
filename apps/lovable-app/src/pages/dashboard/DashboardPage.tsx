import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Banknote,
  ArrowUp,
  ArrowDown,
  FileText,
  AlertTriangle,
  Receipt,
  Sparkles,
  Plus,
} from 'lucide-react';

// Demo-Daten
const kpis = {
  bankBalance: 45678.90,
  monthlyRevenue: 28500.0,
  monthlyExpenses: 18200.0,
  openInvoices: { count: 5, amount: 12450.0 },
  overdueInvoices: { count: 2, amount: 3200.0 },
  pendingReceipts: 8,
};

const recentBookings = [
  { id: '1', number: 'B-2026-0042', date: '2026-02-04', description: 'Miete Februar', amount: 2500.0, type: 'expense' },
  { id: '2', number: 'B-2026-0041', date: '2026-02-03', description: 'Rechnung R-2026-00012', amount: 4500.0, type: 'income' },
  { id: '3', number: 'B-2026-0040', date: '2026-02-02', description: 'Büromaterial', amount: 89.90, type: 'expense' },
  { id: '4', number: 'B-2026-0039', date: '2026-02-01', description: 'Telefonkosten', amount: 45.0, type: 'expense' },
];

const todos = [
  { type: 'receipts', priority: 'medium', title: '8 Belege zu verarbeiten', action: '/receipts?status=pending' },
  { type: 'invoices', priority: 'high', title: '2 überfällige Rechnungen', action: '/invoices?status=overdue' },
  { type: 'bank', priority: 'low', title: '12 Bankumsätze zu verarbeiten', action: '/bank-accounts' },
];

export default function DashboardPage() {
  const monthlyProfit = kpis.monthlyRevenue - kpis.monthlyExpenses;
  const profitMargin = (monthlyProfit / kpis.monthlyRevenue) * 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Willkommen zurück! Hier ist Ihr Finanz-Überblick.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/receipts/upload">
              <Plus className="w-4 h-4 mr-2" />
              Beleg hochladen
            </Link>
          </Button>
          <Button variant="gradient" asChild>
            <Link to="/invoices/new">
              <Plus className="w-4 h-4 mr-2" />
              Neue Rechnung
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bank Balance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-100">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Bankguthaben</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(kpis.bankBalance)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-100">
                <ArrowUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">Februar</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Einnahmen (Monat)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(kpis.monthlyRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-red-100">
                <ArrowDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-red-600 font-medium">Februar</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Ausgaben (Monat)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(kpis.monthlyExpenses)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profit */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary-100">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <span className={cn(
                'text-sm font-medium',
                monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {profitMargin.toFixed(1)}% Marge
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Gewinn (Monat)</p>
              <p className={cn(
                'text-2xl font-bold mt-1',
                monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {formatCurrency(monthlyProfit)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Open Items & Todos */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Open Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Offene Rechnungen</CardTitle>
            <Link to="/invoices?status=open" className="text-sm text-primary-600 hover:text-primary-700">
              Alle anzeigen
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{kpis.openInvoices.count} offen</p>
                  <p className="text-sm text-gray-500">Forderungen</p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(kpis.openInvoices.amount)}
              </p>
            </div>

            {kpis.overdueInvoices.count > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-900">{kpis.overdueInvoices.count} überfällig</p>
                    <p className="text-sm text-red-600">Sofort mahnen</p>
                  </div>
                </div>
                <p className="font-semibold text-red-900">
                  {formatCurrency(kpis.overdueInvoices.amount)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Receipts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Ausstehende Belege</CardTitle>
            <Link to="/receipts?status=pending" className="text-sm text-primary-600 hover:text-primary-700">
              Alle anzeigen
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Receipt className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{kpis.pendingReceipts} Belege</p>
                  <p className="text-sm text-gray-500">Warten auf Verarbeitung</p>
                </div>
              </div>
              <Button variant="gradient" size="sm">
                <Sparkles className="w-4 h-4 mr-1" />
                Verarbeiten
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Todos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Aufgaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todos.map((todo, index) => (
              <Link
                key={index}
                to={todo.action}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg transition-colors',
                  todo.priority === 'high' ? 'bg-red-50 hover:bg-red-100' :
                  todo.priority === 'medium' ? 'bg-yellow-50 hover:bg-yellow-100' :
                  'bg-gray-50 hover:bg-gray-100'
                )}
              >
                <span className={cn(
                  'text-sm font-medium',
                  todo.priority === 'high' ? 'text-red-900' :
                  todo.priority === 'medium' ? 'text-yellow-900' :
                  'text-gray-900'
                )}>
                  {todo.title}
                </span>
                <span className={cn(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  todo.priority === 'high' ? 'bg-red-200 text-red-800' :
                  todo.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-gray-200 text-gray-800'
                )}>
                  {todo.priority === 'high' ? 'Dringend' : todo.priority === 'medium' ? 'Wichtig' : 'Normal'}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Letzte Buchungen</CardTitle>
          <Link to="/bookings" className="text-sm text-primary-600 hover:text-primary-700">
            Alle anzeigen
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Buchungsnr.</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Datum</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Beschreibung</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-mono text-sm">{booking.number}</td>
                    <td className="py-3 px-4 text-sm">{formatDate(booking.date)}</td>
                    <td className="py-3 px-4 text-sm">{booking.description}</td>
                    <td className={cn(
                      'py-3 px-4 text-sm text-right font-medium',
                      booking.type === 'income' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {booking.type === 'income' ? '+' : '-'}
                      {formatCurrency(booking.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
