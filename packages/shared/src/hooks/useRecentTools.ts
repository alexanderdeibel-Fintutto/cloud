import { useState, useCallback } from 'react'

interface RecentTool {
  path: string
  title: string
  timestamp: number
}

const STORAGE_KEY = 'fintutto_recent_tools'
const MAX_RECENT = 5

function getStored(appId: string): RecentTool[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${appId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStored(appId: string, tools: RecentTool[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${appId}`, JSON.stringify(tools))
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Track recently used tools per app.
 * Usage:
 *   const { recentTools, trackTool } = useRecentTools('portal')
 *   trackTool('/rechner/kaution', 'Kautions-Rechner')
 */
export function useRecentTools(appId: string) {
  const [recentTools, setRecentTools] = useState<RecentTool[]>(() => getStored(appId))

  const trackTool = useCallback(
    (path: string, title: string) => {
      setRecentTools((prev) => {
        const filtered = prev.filter((t) => t.path !== path)
        const updated = [{ path, title, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT)
        setStored(appId, updated)
        return updated
      })
    },
    [appId]
  )

  const clearRecent = useCallback(() => {
    setStored(appId, [])
    setRecentTools([])
  }, [appId])

  return { recentTools, trackTool, clearRecent }
}
