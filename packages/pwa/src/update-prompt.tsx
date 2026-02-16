import { useState, useEffect } from 'react'
import { skipWaiting } from './register-sw'

/**
 * Hook für SW-Update-Erkennung.
 */
export function useUpdateAvailable() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true)
            setRegistration(reg)
          }
        })
      })
    })
  }, [])

  const applyUpdate = () => {
    if (registration) {
      skipWaiting(registration)
    }
  }

  return { updateAvailable, applyUpdate }
}

/**
 * Update-Banner Komponente.
 * Zeigt einen Banner wenn ein neues Update verfügbar ist.
 */
export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = useUpdateAvailable()

  if (!updateAvailable) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-primary px-4 py-2 text-primary-foreground">
      <span className="text-sm">Ein Update ist verfügbar.</span>
      <button
        onClick={applyUpdate}
        className="rounded-md bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30"
      >
        Jetzt aktualisieren
      </button>
    </div>
  )
}
