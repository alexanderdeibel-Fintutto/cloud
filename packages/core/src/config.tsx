import { createContext, useContext, type ReactNode } from 'react'
import type { AppConfig } from './types'

const AppConfigContext = createContext<AppConfig | undefined>(undefined)

interface AppConfigProviderProps {
  config: AppConfig
  children: ReactNode
}

/**
 * Stellt die App-Konfiguration im gesamten Komponentenbaum bereit.
 * Wird in der App-Root einmal gewickelt:
 *
 * ```tsx
 * <AppConfigProvider config={appConfig}>
 *   <App />
 * </AppConfigProvider>
 * ```
 */
export function AppConfigProvider({ config, children }: AppConfigProviderProps) {
  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  )
}

/**
 * Hook um auf die App-Konfiguration zuzugreifen.
 */
export function useAppConfig(): AppConfig {
  const config = useContext(AppConfigContext)
  if (!config) {
    throw new Error('useAppConfig muss innerhalb eines <AppConfigProvider> verwendet werden.')
  }
  return config
}

/**
 * Prüft ob ein Feature in der aktuellen App aktiviert ist.
 */
export function useFeature(featureKey: string): boolean {
  const config = useAppConfig()
  return config.features[featureKey] ?? false
}
