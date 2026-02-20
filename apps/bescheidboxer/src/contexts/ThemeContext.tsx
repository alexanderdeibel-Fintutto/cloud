import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'
type FontSize = 'normal' | 'large' | 'xlarge'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  normal: '',
  large: 'text-lg',
  xlarge: 'text-xl',
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bescheidboxer-theme') as Theme) || 'system'
    }
    return 'system'
  })

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bescheidboxer-font-size') as FontSize) || 'normal'
    }
    return 'normal'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Apply theme
  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark')
        setResolvedTheme('dark')
      } else {
        root.classList.remove('dark')
        setResolvedTheme('light')
      }
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(theme === 'dark')
    }
  }, [theme])

  // Apply font size
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('text-lg', 'text-xl')
    const cls = FONT_SIZE_CLASSES[fontSize]
    if (cls) root.classList.add(cls)
  }, [fontSize])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('bescheidboxer-theme', t)
  }

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s)
    localStorage.setItem('bescheidboxer-font-size', s)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
