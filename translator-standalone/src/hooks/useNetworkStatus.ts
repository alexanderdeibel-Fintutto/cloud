import { useState, useEffect } from 'react'
import { getNetworkStatus, type NetworkMode } from '@/lib/offline/network-status'

export function useNetworkStatus() {
  const manager = getNetworkStatus()
  const [mode, setMode] = useState<NetworkMode>(manager.getMode())

  useEffect(() => {
    return manager.subscribe(setMode)
  }, [manager])

  return {
    mode,
    isOnline: mode === 'online',
    isOffline: mode === 'offline',
    isDegraded: mode === 'degraded',
  }
}
