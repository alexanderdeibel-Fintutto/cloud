import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { getStoredTheme, setTheme, type Theme } from '@/lib/darkMode'

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Hell' },
  { value: 'dark', icon: Moon, label: 'Dunkel' },
  { value: 'system', icon: Monitor, label: 'System' },
]

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getStoredTheme())

  useEffect(() => {
    setTheme(currentTheme)
  }, [currentTheme])

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setCurrentTheme(value)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            currentTheme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
