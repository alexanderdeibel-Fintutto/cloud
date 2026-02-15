import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Calculator, FileText, Settings, CreditCard, Home as HomeIcon, Users, Bot, Moon, Sun } from 'lucide-react';
import NotificationBell from './components/tenant-portal/NotificationBell';
import RealtimeChatIndicator from './components/tenant-portal/RealtimeChatIndicator';
import AIBudgetWarningBanner from './components/ai/AIBudgetWarningBanner';
import AIChatButton from './components/ai/AIChatButton';
import AIChatPanel from './components/ai/AIChatPanel';
import NavigationEnhanced from './components/navigation/NavigationEnhanced';
import BottomNav from './components/mobile/BottomNav';
import { ThemeProvider, useTheme } from './components/theme/ThemeProvider';

function LayoutInner({ children, currentPageName }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: Calculator, path: 'Dashboard' },
    { name: 'Home', icon: HomeIcon, path: 'Home' },
    { name: 'Abrechnungen', icon: FileText, path: 'OperatingCosts' },
    { name: 'Mieterportal', icon: Users, path: 'TenantPortalManagement' },
    { name: 'Vertragsanalyse', icon: FileText, path: 'ContractAnalysis' },
    { name: 'Dokument-KI', icon: Bot, path: 'DocumentAI' },
    { name: 'Vertrags-Tasks', icon: FileText, path: 'ContractTasksView' },
    { name: 'Preise', icon: CreditCard, path: 'Pricing' },
    { name: 'KI-Settings', icon: Bot, path: 'AISettings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-900 to-orange-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg dark:text-white">NK-Abrechnung</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">by FinTuttO</p>
              </div>
            </div>

            <NavigationEnhanced />

            <div className="flex items-center gap-6">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 font-semibold' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
                })}
                <DarkModeToggle />
                <NotificationBell />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)] pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <AIBudgetWarningBanner />
        </div>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Realtime Chat Indicator */}
      <RealtimeChatIndicator />

      {/* Global AI Chat */}
      <AIChatButton onToggleChat={() => setIsChatOpen(true)} />
      <AIChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPage={currentPageName}
      />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <LayoutInner children={children} currentPageName={currentPageName} />
    </ThemeProvider>
  );
}