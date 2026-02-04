'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
  BanknotesIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  CalculatorIcon,
  FolderIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Buchungen', href: '/bookings', icon: CalculatorIcon },
  { name: 'Rechnungen', href: '/invoices', icon: DocumentTextIcon },
  { name: 'Belege', href: '/receipts', icon: ReceiptPercentIcon },
  { name: 'Kontakte', href: '/contacts', icon: UserGroupIcon },
  { name: 'Bankkonten', href: '/bank-accounts', icon: BanknotesIcon },
  { name: 'Kontenplan', href: '/accounts', icon: FolderIcon },
  { name: 'Berichte', href: '/reports', icon: ChartBarIcon },
];

const secondaryNavigation = [
  { name: 'Einstellungen', href: '/settings', icon: CogIcon },
  { name: 'Hilfe', href: '/help', icon: QuestionMarkCircleIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div
          className="fixed inset-0 bg-gray-900/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl">
          <SidebarContent
            pathname={pathname}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent pathname={pathname} />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden -m-2.5 p-2.5 text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-end gap-4">
              {/* AI Assistant Button */}
              <button className="btn-ghost flex items-center gap-2 text-primary-600">
                <SparklesIcon className="w-5 h-5" />
                <span className="hidden sm:inline">KI-Assistent</span>
              </button>

              {/* Organization Selector */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  Demo GmbH
                </span>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">D</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Fintutto</span>
        </Link>
        {onClose && (
          <button
            type="button"
            className="lg:hidden -m-2 p-2 text-gray-500"
            onClick={onClose}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={onClose}
            >
              <item.icon
                className={clsx(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Verwaltung
          </p>
          <div className="mt-3 space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={clsx(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400" />
          Abmelden
        </button>
      </div>
    </>
  );
}
