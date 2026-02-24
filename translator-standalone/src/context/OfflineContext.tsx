import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { getDB, type ModelMeta } from '@/lib/offline/db'
import { requestPersistentStorage, isPersisted, getStorageEstimate, formatBytes } from '@/lib/offline/storage-manager'
import type { NetworkMode } from '@/lib/offline/network-status'

interface OfflineContextValue {
  // Network
  networkMode: NetworkMode
  isOnline: boolean
  isOffline: boolean

  // Storage
  isPersistent: boolean
  storageUsed: string
  storagePercent: number

  // Downloaded models
  downloadedModels: ModelMeta[]
  isLanguagePairOffline: (src: string, tgt: string) => boolean
  refreshModels: () => Promise<void>

  // Actions
  requestPersistence: () => Promise<boolean>
}

const OfflineContext = createContext<OfflineContextValue | null>(null)

export function OfflineProvider({ children }: { children: ReactNode }) {
  const { mode, isOnline, isOffline } = useNetworkStatus()

  const [persistent, setPersistent] = useState(false)
  const [storageUsed, setStorageUsed] = useState('0 B')
  const [storagePercent, setStoragePercent] = useState(0)
  const [downloadedModels, setDownloadedModels] = useState<ModelMeta[]>([])

  // Check persistence and storage on mount
  useEffect(() => {
    isPersisted().then(setPersistent)
    updateStorageInfo()
    loadModels()
  }, [])

  const updateStorageInfo = useCallback(async () => {
    const estimate = await getStorageEstimate()
    setStorageUsed(formatBytes(estimate.usageBytes))
    setStoragePercent(estimate.percentUsed)
  }, [])

  const loadModels = useCallback(async () => {
    try {
      const db = await getDB()
      const models = await db.getAll('model-metadata')
      setDownloadedModels(models)
    } catch (err) {
      console.warn('[OfflineContext] Failed to load models:', err)
    }
  }, [])

  const isLanguagePairOffline = useCallback((src: string, tgt: string) => {
    // Direct pair
    const directId = `opus-mt-${src}-${tgt}`
    if (downloadedModels.some(m => m.id === directId)) return true

    // Pivot through English: src→en + en→tgt
    if (src !== 'en' && tgt !== 'en') {
      const srcToEn = downloadedModels.some(m => m.id === `opus-mt-${src}-en`)
      const enToTgt = downloadedModels.some(m => m.id === `opus-mt-en-${tgt}`)
      return srcToEn && enToTgt
    }

    return false
  }, [downloadedModels])

  const requestPersistence = useCallback(async () => {
    const granted = await requestPersistentStorage()
    setPersistent(granted)
    return granted
  }, [])

  const refreshModels = useCallback(async () => {
    await loadModels()
    await updateStorageInfo()
  }, [loadModels, updateStorageInfo])

  return (
    <OfflineContext.Provider value={{
      networkMode: mode,
      isOnline,
      isOffline,
      isPersistent: persistent,
      storageUsed,
      storagePercent,
      downloadedModels,
      isLanguagePairOffline,
      refreshModels,
      requestPersistence,
    }}>
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline(): OfflineContextValue {
  const ctx = useContext(OfflineContext)
  if (!ctx) {
    throw new Error('useOffline must be used within <OfflineProvider>')
  }
  return ctx
}
