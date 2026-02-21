import { useState, useCallback, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { getChannelName } from '@/lib/session'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { PresenceState } from '@/lib/session'

export function usePresence() {
  const [listeners, setListeners] = useState<PresenceState[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  const join = useCallback((code: string, presenceData: PresenceState) => {
    // Clean up existing
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase.channel(getChannelName(code) + '-presence')

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresenceState>()
      const allListeners: PresenceState[] = []
      for (const key of Object.keys(state)) {
        for (const presence of state[key]) {
          allListeners.push({
            deviceName: presence.deviceName,
            targetLanguage: presence.targetLanguage,
            joinedAt: presence.joinedAt,
          })
        }
      }
      setListeners(allListeners)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(presenceData)
      }
    })

    channelRef.current = channel
  }, [])

  const updatePresence = useCallback(async (data: Partial<PresenceState>) => {
    if (!channelRef.current) return
    const current = channelRef.current.presenceState()
    const myKey = Object.keys(current).find(k =>
      current[k].some((p: Record<string, unknown>) => p.deviceName === data.deviceName)
    )
    if (myKey) {
      const existing = current[myKey][0] as unknown as PresenceState
      await channelRef.current.track({ ...existing, ...data })
    } else {
      await channelRef.current.track(data as unknown as PresenceState)
    }
  }, [])

  const leave = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.untrack()
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    setListeners([])
  }, [])

  const listenerCount = listeners.length

  const listenersByLanguage = useMemo(() => {
    const map: Record<string, number> = {}
    for (const l of listeners) {
      map[l.targetLanguage] = (map[l.targetLanguage] || 0) + 1
    }
    return map
  }, [listeners])

  return {
    listeners,
    listenerCount,
    listenersByLanguage,
    join,
    updatePresence,
    leave,
  }
}
