/**
 * App-spezifische Theme-Presets.
 * Jede App hat eigene Primärfarben, die über CSS-Variablen gesetzt werden.
 */

export interface ThemePreset {
  id: string
  name: string
  cssVariables: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

export const themePresets: Record<string, ThemePreset> = {
  fintutto: {
    id: 'fintutto',
    name: 'Fintutto',
    cssVariables: {
      light: {
        '--primary': '221.2 83.2% 53.3%',         // #2563eb Blue
        '--primary-foreground': '210 40% 98%',
        '--secondary': '210 40% 96.1%',
        '--secondary-foreground': '222.2 47.4% 11.2%',
        '--accent': '210 40% 96.1%',
        '--accent-foreground': '222.2 47.4% 11.2%',
      },
      dark: {
        '--primary': '217.2 91.2% 59.8%',
        '--primary-foreground': '222.2 47.4% 11.2%',
        '--secondary': '217.2 32.6% 17.5%',
        '--secondary-foreground': '210 40% 98%',
        '--accent': '217.2 32.6% 17.5%',
        '--accent-foreground': '210 40% 98%',
      },
    },
  },
  mieter: {
    id: 'mieter',
    name: 'Mieter',
    cssVariables: {
      light: {
        '--primary': '160 84% 39%',                // #10b981 Emerald
        '--primary-foreground': '0 0% 100%',
        '--secondary': '160 40% 96%',
        '--secondary-foreground': '160 84% 20%',
        '--accent': '160 40% 96%',
        '--accent-foreground': '160 84% 20%',
      },
      dark: {
        '--primary': '160 84% 45%',
        '--primary-foreground': '160 84% 10%',
        '--secondary': '160 30% 17%',
        '--secondary-foreground': '160 40% 90%',
        '--accent': '160 30% 17%',
        '--accent-foreground': '160 40% 90%',
      },
    },
  },
  hausmeisterPro: {
    id: 'hausmeisterPro',
    name: 'HausmeisterPro',
    cssVariables: {
      light: {
        '--primary': '25 95% 53%',                 // #f97316 Orange
        '--primary-foreground': '0 0% 100%',
        '--secondary': '25 40% 96%',
        '--secondary-foreground': '25 95% 25%',
        '--accent': '25 40% 96%',
        '--accent-foreground': '25 95% 25%',
      },
      dark: {
        '--primary': '25 95% 58%',
        '--primary-foreground': '25 95% 10%',
        '--secondary': '25 30% 17%',
        '--secondary-foreground': '25 40% 90%',
        '--accent': '25 30% 17%',
        '--accent-foreground': '25 40% 90%',
      },
    },
  },
  zaehler: {
    id: 'zaehler',
    name: 'Zaehler',
    cssVariables: {
      light: {
        '--primary': '262 83% 58%',                // #8b5cf6 Violet
        '--primary-foreground': '0 0% 100%',
        '--secondary': '262 40% 96%',
        '--secondary-foreground': '262 83% 25%',
        '--accent': '262 40% 96%',
        '--accent-foreground': '262 83% 25%',
      },
      dark: {
        '--primary': '262 83% 63%',
        '--primary-foreground': '262 83% 10%',
        '--secondary': '262 30% 17%',
        '--secondary-foreground': '262 40% 90%',
        '--accent': '262 30% 17%',
        '--accent-foreground': '262 40% 90%',
      },
    },
  },
  bescheidboxer: {
    id: 'bescheidboxer',
    name: 'BescheidBoxer',
    cssVariables: {
      light: {
        '--primary': '0 84% 60%',                  // #ef4444 Red
        '--primary-foreground': '0 0% 100%',
        '--secondary': '0 40% 96%',
        '--secondary-foreground': '0 84% 25%',
        '--accent': '0 40% 96%',
        '--accent-foreground': '0 84% 25%',
      },
      dark: {
        '--primary': '0 84% 65%',
        '--primary-foreground': '0 84% 10%',
        '--secondary': '0 30% 17%',
        '--secondary-foreground': '0 40% 90%',
        '--accent': '0 30% 17%',
        '--accent-foreground': '0 40% 90%',
      },
    },
  },
  vermietify: {
    id: 'vermietify',
    name: 'Vermietify',
    cssVariables: {
      light: {
        '--primary': '199 89% 48%',                // #0ea5e9 Sky
        '--primary-foreground': '0 0% 100%',
        '--secondary': '199 40% 96%',
        '--secondary-foreground': '199 89% 25%',
        '--accent': '199 40% 96%',
        '--accent-foreground': '199 89% 25%',
      },
      dark: {
        '--primary': '199 89% 55%',
        '--primary-foreground': '199 89% 10%',
        '--secondary': '199 30% 17%',
        '--secondary-foreground': '199 40% 90%',
        '--accent': '199 30% 17%',
        '--accent-foreground': '199 40% 90%',
      },
    },
  },
  hausmeisterGo: {
    id: 'hausmeisterGo',
    name: 'HausmeisterGo',
    cssVariables: {
      light: {
        '--primary': '142 76% 36%',                // #16a34a Green
        '--primary-foreground': '0 0% 100%',
        '--secondary': '142 40% 96%',
        '--secondary-foreground': '142 76% 20%',
        '--accent': '142 40% 96%',
        '--accent-foreground': '142 76% 20%',
      },
      dark: {
        '--primary': '142 76% 42%',
        '--primary-foreground': '142 76% 10%',
        '--secondary': '142 30% 17%',
        '--secondary-foreground': '142 40% 90%',
        '--accent': '142 30% 17%',
        '--accent-foreground': '142 40% 90%',
      },
    },
  },
}
