import type { AppPwaConfig } from '@fintutto/core'

/**
 * Generiert ein Web App Manifest aus der App-PWA-Konfiguration.
 * Kann dynamisch erstellt oder als JSON-Datei geschrieben werden.
 */
export interface ManifestIcon {
  src: string
  sizes: string
  type: string
  purpose?: 'any' | 'maskable' | 'monochrome'
}

export interface WebAppManifest {
  name: string
  short_name: string
  start_url: string
  display: string
  orientation: string
  background_color: string
  theme_color: string
  categories: string[]
  icons: ManifestIcon[]
  scope: string
  lang: string
  dir: string
}

export function generateManifest(
  config: AppPwaConfig,
  icons?: ManifestIcon[]
): WebAppManifest {
  const defaultIcons: ManifestIcon[] = [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ]

  return {
    name: config.name,
    short_name: config.shortName,
    start_url: config.startUrl,
    display: config.display,
    orientation: config.orientation,
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    categories: config.categories,
    icons: icons ?? defaultIcons,
    scope: '/',
    lang: 'de',
    dir: 'ltr',
  }
}
