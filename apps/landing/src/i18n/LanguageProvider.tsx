import { createContext, useState, useCallback, type ReactNode } from 'react'
import { translations, type TranslationKey } from './translations'

const SUPPORTED_LANGS = ['de', 'en', 'fr', 'es', 'it', 'ja', 'zh', 'ar', 'pt', 'nl']

function detectLang(): string {
  const stored = localStorage.getItem('fintutto-cloud-lang')
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored
  const browser = navigator.language.slice(0, 2).toLowerCase()
  return SUPPORTED_LANGS.includes(browser) ? browser : 'de'
}

interface LanguageContextType {
  lang: string
  setLang: (lang: string) => void
  t: (key: TranslationKey) => string
  supportedLangs: string[]
}

export const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(detectLang)

  const setLang = useCallback((newLang: string) => {
    if (SUPPORTED_LANGS.includes(newLang)) {
      setLangState(newLang)
      localStorage.setItem('fintutto-cloud-lang', newLang)
      document.documentElement.lang = newLang
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang]?.[key] ?? translations['de'][key] ?? key
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, supportedLangs: SUPPORTED_LANGS }}>
      {children}
    </LanguageContext.Provider>
  )
}
