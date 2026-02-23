/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_FORMULARE_APP_URL?: string
  readonly VITE_CLAUDE_API_ENDPOINT?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_APP_URL_PORTAL?: string
  readonly VITE_APP_URL_VERMIETIFY?: string
  readonly VITE_APP_URL_MIETER?: string
  readonly VITE_APP_URL_HAUSMEISTER?: string
  readonly VITE_APP_URL_ABLESUNG?: string
  readonly VITE_APP_URL_BESCHEIDBOXER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
