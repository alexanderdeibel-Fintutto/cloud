// Storage manager: quota checking, persistent storage, Safari eviction detection

export interface StorageEstimate {
  usageBytes: number
  quotaBytes: number
  percentUsed: number
}

/**
 * Request persistent storage so the browser won't evict our IndexedDB/Cache data.
 * Critical for iOS Safari which aggressively evicts after 7 days without use.
 * Returns true if granted, false if denied or unsupported.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false

  try {
    const granted = await navigator.storage.persist()
    if (granted) {
      console.log('[Storage] Persistent storage granted')
    } else {
      console.warn('[Storage] Persistent storage denied — data may be evicted by browser')
    }
    return granted
  } catch (err) {
    console.warn('[Storage] persist() failed:', err)
    return false
  }
}

/**
 * Check if persistent storage is already granted.
 */
export async function isPersisted(): Promise<boolean> {
  if (!navigator.storage?.persisted) return false
  return navigator.storage.persisted()
}

/**
 * Get storage usage estimate.
 */
export async function getStorageEstimate(): Promise<StorageEstimate> {
  if (!navigator.storage?.estimate) {
    return { usageBytes: 0, quotaBytes: 0, percentUsed: 0 }
  }

  const estimate = await navigator.storage.estimate()
  const usage = estimate.usage || 0
  const quota = estimate.quota || 0

  return {
    usageBytes: usage,
    quotaBytes: quota,
    percentUsed: quota > 0 ? (usage / quota) * 100 : 0,
  }
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

/**
 * Detect iOS Safari standalone mode (added to homescreen).
 * When not in standalone, warn user about 7-day eviction.
 */
export function isIOSSafariStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // @ts-expect-error - navigator.standalone is iOS Safari only
  return window.navigator.standalone === true
}

/**
 * Detect if running on iOS Safari (not standalone).
 * These users should be prompted to add to homescreen for persistent storage.
 */
export function isIOSSafariNotStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)
  // @ts-expect-error - navigator.standalone is iOS Safari only
  const isStandalone = window.navigator.standalone === true
  return isIOS && isSafari && !isStandalone
}

/**
 * Check if the browser supports all required offline APIs.
 */
export function checkOfflineSupport(): {
  indexedDB: boolean
  cacheAPI: boolean
  serviceWorker: boolean
  webAssembly: boolean
  persistentStorage: boolean
} {
  return {
    indexedDB: typeof indexedDB !== 'undefined',
    cacheAPI: typeof caches !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator,
    webAssembly: typeof WebAssembly !== 'undefined',
    persistentStorage: !!navigator.storage?.persist,
  }
}
