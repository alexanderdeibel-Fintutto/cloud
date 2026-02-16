import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Hook für den PWA Install-Prompt.
 * Gibt Zustand und Aktionen zurück um den "App installieren"-Dialog zu steuern.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Prüfe ob bereits als PWA installiert
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Erkenne Installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setIsInstallable(false)

    return outcome === 'accepted'
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setIsInstallable(false)
    setDeferredPrompt(null)
    // Merke dass der User abgelehnt hat (24h cooldown)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }, [])

  // Prüfe ob kürzlich dismissed
  const recentlyDismissed = (() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (!dismissed) return false
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000
    return parseInt(dismissed) > dayAgo
  })()

  return {
    isInstallable: isInstallable && !recentlyDismissed,
    isInstalled,
    promptInstall,
    dismiss,
  }
}

/**
 * Installier-Banner Komponente.
 * Zeigt einen Banner am unteren Bildschirmrand wenn die App installierbar ist.
 */
export function InstallBanner({
  appName = 'App',
  message,
}: {
  appName?: string
  message?: string
}) {
  const { isInstallable, promptInstall, dismiss } = useInstallPrompt()

  if (!isInstallable) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg border bg-card p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm">
            {message ?? `${appName} installieren`}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Installiere die App auf deinem Gerät für schnelleren Zugriff.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={promptInstall}
          className="flex-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Installieren
        </button>
        <button
          onClick={dismiss}
          className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Später
        </button>
      </div>
    </div>
  )
}
