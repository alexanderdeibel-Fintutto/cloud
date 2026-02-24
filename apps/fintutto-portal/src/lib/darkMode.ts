// Dark Mode Management
// Persists preference in localStorage, respects system preference

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'fintutto_theme'

export function getStoredTheme(): Theme {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system'
  } catch {
    return 'system'
  }
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function initTheme(): void {
  const theme = getStoredTheme()
  applyTheme(theme)

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'system') {
      applyTheme('system')
    }
  })
}
