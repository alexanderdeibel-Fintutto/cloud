import { useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getChannelName } from '@/lib/session'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { TranslationChunk, SessionInfo, StatusMessage } from '@/lib/session'

type TranslationHandler = (chunk: TranslationChunk) => void
type SessionInfoHandler = (info: SessionInfo) => void
type StatusHandler = (status: StatusMessage) => void

export function useBroadcast() {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const subscribe = useCallback((
    code: string,
    onTranslation?: TranslationHandler,
    onSessionInfo?: SessionInfoHandler,
    onStatus?: StatusHandler,
  ) => {
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase.channel(getChannelName(code))

    if (onTranslation) {
      channel.on('broadcast', { event: 'translation' }, ({ payload }) => {
        onTranslation(payload as TranslationChunk)
      })
    }

    if (onSessionInfo) {
      channel.on('broadcast', { event: 'session_info' }, ({ payload }) => {
        onSessionInfo(payload as SessionInfo)
      })
    }

    if (onStatus) {
      channel.on('broadcast', { event: 'status' }, ({ payload }) => {
        onStatus(payload as StatusMessage)
      })
    }

    channel.subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED')
    })

    channelRef.current = channel
  }, [])

  const broadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: 'broadcast',
      event,
      payload,
    })
  }, [])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    setIsConnected(false)
  }, [])

  return {
    isConnected,
    subscribe,
    broadcast,
    unsubscribe,
  }
}
