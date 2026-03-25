import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from './components/ErrorBoundary';
import AppNavigation from './components/navigation/AppNavigation';
import OnboardingTour from './components/onboarding/OnboardingTour';
import GlobalSearch from './components/search/GlobalSearch';
import QuickHelp from './components/help/QuickHelp';
import AIBudgetWarning from './components/ai/AIBudgetWarning';
import GlobalAIChatButton from './components/ai/GlobalAIChatButton';
import { AuthProvider } from './components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadUser();
    setupKeyboardShortcuts();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const setupKeyboardShortcuts = () => {
    const handler = (e) => {
      // Cmd+K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      // ESC to close search
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  };

  return (
    <AuthProvider>
      <ErrorBoundary>
        <AIBudgetWarning />
        <div className="min-h-screen bg-gray-50">
          {currentUser && (
            <>
                      <AppNavigation 
                        currentUser={currentUser} 
                        currentPageName={currentPageName} 
                      />
                      <OnboardingTour />
                      <QuickHelp />
                    </>
                  )}
          
          {children}
          
          {showSearch && (
            <GlobalSearch onClose={() => setShowSearch(false)} />
          )}

          {/* Global AI Chat */}
          <GlobalAIChatButton user={currentUser} />

          <Toaster />
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}