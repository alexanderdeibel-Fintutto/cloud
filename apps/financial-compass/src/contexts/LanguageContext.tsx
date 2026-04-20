import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { de, en, type Translations, type Language, languages } from '@/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = { de, en };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('fintutto_language');
    if (saved === 'de' || saved === 'en') return saved;
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'de' ? 'de' : 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fintutto_language', lang);
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper hook for getting nested translation values
export function useTranslation() {
  const { t, language, setLanguage, languages } = useLanguage();

  // Helper function to get nested translation by path
  const translate = useCallback((path: string, fallback?: string): string => {
    const keys = path.split('.');
    let value: unknown = t;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return fallback || path;
      }
    }

    return typeof value === 'string' ? value : fallback || path;
  }, [t]);

  return { t, translate, language, setLanguage, languages };
}
