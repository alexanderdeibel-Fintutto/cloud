import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initSupabase, AppConfigProvider, AuthProvider } from '@fintutto/core'
import { registerServiceWorker } from '@fintutto/pwa'
import App from './App'
import { appConfig } from './app-config'
import './index.css'

// Supabase initialisieren
initSupabase({
  url: import.meta.env.VITE_SUPABASE_URL || appConfig.supabase.url,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
})

// TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

// Service Worker registrieren (PWA)
registerServiceWorker('/sw.js', {
  onReady: () => console.log('[BescheidBoxer] Service Worker aktiv'),
  onUpdate: () => console.log('[BescheidBoxer] Update verfügbar'),
  onOffline: () => console.log('[BescheidBoxer] Offline-Modus'),
  onOnline: () => console.log('[BescheidBoxer] Wieder online'),
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppConfigProvider config={appConfig}>
        <AuthProvider defaultRole={appConfig.defaultRole}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </AppConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
