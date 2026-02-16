/**
 * Service Worker Registration für Fintutto PWA-Apps.
 * Registriert den SW und handhabt Updates.
 */

export interface SWRegistrationCallbacks {
  onReady?: (registration: ServiceWorkerRegistration) => void
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onOffline?: () => void
  onOnline?: () => void
  onError?: (error: Error) => void
}

export async function registerServiceWorker(
  swPath: string = '/sw.js',
  callbacks?: SWRegistrationCallbacks
): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker nicht unterstützt.')
    return undefined
  }

  // Online/Offline Events
  window.addEventListener('online', () => callbacks?.onOnline?.())
  window.addEventListener('offline', () => callbacks?.onOffline?.())

  try {
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/',
    })

    // Warte auf aktiven Service Worker
    if (registration.active) {
      callbacks?.onReady?.(registration)
    }

    // Prüfe auf Updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Neuer SW wartet — User kann Update akzeptieren
          callbacks?.onUpdate?.(registration)
        }
      })
    })

    // Prüfe regelmäßig auf Updates (alle 60 Minuten)
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)

    return registration
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    callbacks?.onError?.(err)
    console.error('[PWA] Service Worker Registrierung fehlgeschlagen:', err)
    return undefined
  }
}

/**
 * Sendet "SKIP_WAITING" an den wartenden SW, damit er sofort aktiv wird.
 */
export function skipWaiting(registration: ServiceWorkerRegistration) {
  registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
  window.location.reload()
}
