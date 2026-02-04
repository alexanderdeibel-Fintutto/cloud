'use client';

import Link from 'next/link';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export default function DashboardPage() {
  // Demo-Daten
  const kpis = {
    openInvoices: { count: 5, amount: 12450.0 },
    overdueInvoices: { count: 2, amount: 3200.0 },
    pendingReceipts: 8,
    bankBalance: 45678.90,
    monthlyRevenue: 28500.0,
    monthlyExpenses: 18200.0,
  };

  const monthlyProfit = kpis.monthlyRevenue - kpis.monthlyExpenses;
  const profitMargin = (monthlyProfit / kpis.monthlyRevenue) * 100;

  const recentBookings = [
    { id: '1', number: 'B-000042', date: '2026-02-04', description: 'Miete Februar', amount: 2500.0, type: 'expense' },
    { id: '2', number: 'B-000041', date: '2026-02-03', description: 'Rechnung R-2026-00012', amount: 4500.0, type: 'income' },
    { id: '3', number: 'B-000040', date: '2026-02-02', description: 'Büromaterial', amount: 89.90, type: 'expense' },
    { id: '4', number: 'B-000039', date: '2026-02-01', description: 'Telefonkosten', amount: 45.0, type: 'expense' },
  ];

  const todos = [
    { type: 'receipts', priority: 'medium', title: '8 Belege zu verarbeiten', action: '/receipts?status=PENDING' },
    { type: 'invoices', priority: 'high', title: '2 überfällige Rechnungen', action: '/invoices?status=OVERDUE' },
    { type: 'bank', priority: 'low', title: '12 Bankumsätze zu verarbeiten', action: '/bank-accounts' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Willkommen zurück! Hier ist Ihr Finanz-Überblick.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/receipts/upload" className="btn-secondary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Beleg hochladen
          </Link>
          <Link href="/invoices/new" className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Neue Rechnung
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bank Balance */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-green-100">
              <BanknotesIcon className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              +12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Bankguthaben</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.bankBalance)}
            </p>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-blue-100">
              <ArrowUpIcon className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-blue-600 font-medium">Februar</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Einnahmen (Monat)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.monthlyRevenue)}
            </p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-red-100">
              <ArrowDownIcon className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-red-600 font-medium">Februar</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Ausgaben (Monat)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.monthlyExpenses)}
            </p>
          </div>
        </div>

        {/* Profit */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary-100">
              <ArrowTrendingUpIcon className="w-5 h-5 text-primary-600" />
            </div>
            <span className={clsx(
              'text-sm font-medium',
              monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {profitMargin.toFixed(1)}% Marge
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Gewinn (Monat)</p>
            <p className={clsx(
              'text-2xl font-bold mt-1',
              monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(monthlyProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Second Row: Open Items & Todos */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Open Invoices */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Offene Rechnungen</h2>
            <Link href="/invoices?status=open" className="text-sm text-primary-600 hover:text-primary-700">
              Alle anzeigen
            </Link>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <DocumentTextIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{kpis.openInvoices.count} offen</p>
                  <p className="text-sm text-gray-500">Forderungen</p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">
                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.openInvoices.amount)}
              </p>
            </div>

            {kpis.overdueInvoices.count > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-900">{kpis.overdueInvoices.count} überfällig</p>
                    <p className="text-sm text-red-600">Sofort mahnen</p>
                  </div>
                </div>
                <p className="font-semibold text-red-900">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kpis.overdueInvoices.amount)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Receipts */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Ausstehende Belege</h2>
            <Link href="/receipts?status=PENDING" className="text-sm text-primary-600 hover:text-primary-700">
              Alle anzeigen
            </Link>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <ReceiptPercentIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{kpis.pendingReceipts} Belege</p>
                  <p className="text-sm text-gray-500">Warten auf Verarbeitung</p>
                </div>
              </div>
              <Link
                href="/receipts/upload"
                className="btn-primary btn text-sm"
              >
                <SparklesIcon className="w-4 h-4 mr-1" />
                Verarbeiten
              </Link>
            </div>
          </div>
        </div>

        {/* Todos */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900">Aufgaben</h2>
          </div>
          <div className="p-6 space-y-3">
            {todos.map((todo, index) => (
              <Link
                key={index}
                href={todo.action}
                className={clsx(
                  'flex items-center justify-between p-3 rounded-lg transition-colors',
                  todo.priority === 'high' ? 'bg-red-50 hover:bg-red-100' :
                  todo.priority === 'medium' ? 'bg-yellow-50 hover:bg-yellow-100' :
                  'bg-gray-50 hover:bg-gray-100'
                )}
              >
                <span className={clsx(
                  'text-sm font-medium',
                  todo.priority === 'high' ? 'text-red-900' :
                  todo.priority === 'medium' ? 'text-yellow-900' :
                  'text-gray-900'
                )}>
                  {todo.title}
                </span>
                <span className={clsx(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  todo.priority === 'high' ? 'bg-red-200 text-red-800' :
                  todo.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-gray-200 text-gray-800'
                )}>
                  {todo.priority === 'high' ? 'Dringend' : todo.priority === 'medium' ? 'Wichtig' : 'Normal'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Letzte Buchungen</h2>
          <Link href="/bookings" className="text-sm text-primary-600 hover:text-primary-700">
            Alle anzeigen
          </Link>
        </div>
        <div className="table-container border-0 rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Buchungsnr.</th>
                <th>Datum</th>
                <th>Beschreibung</th>
                <th className="text-right">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="font-mono text-sm">{booking.number}</td>
                  <td>{new Date(booking.date).toLocaleDateString('de-DE')}</td>
                  <td>{booking.description}</td>
                  <td className={clsx(
                    'text-right font-medium',
                    booking.type === 'income' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {booking.type === 'income' ? '+' : '-'}
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
