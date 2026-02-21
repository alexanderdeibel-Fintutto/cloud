import { useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getChannelName } from '@/lib/session'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { TranslationChunk, SessionInfo, StatusMessage } from '@/lib/session'

type TranslationHandler = (chunk: TranslationChunk) => void
type SessionInfoHandler = (info: SessionInfo) => void
type StatusHandler = (status: StatusMessage) => void

const MAX_RETRIES = 5
const BASE_DELAY = 2000

export function useBroadcast() {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const retriesRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subscribeArgsRef = useRef<{
    code: string
    onTranslation?: TranslationHandler
    onSessionInfo?: SessionInfoHandler
    onStatus?: StatusHandler
  } | null>(null)

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }

  const doSubscribe = useCallback((
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
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        retriesRef.current = 0
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsConnected(false)
        // Auto-reconnect with exponential backoff
        if (retriesRef.current < MAX_RETRIES && subscribeArgsRef.current) {
          const delay = BASE_DELAY * Math.pow(2, retriesRef.current)
          retriesRef.current++
          console.warn(`[Broadcast] Connection lost, retrying in ${delay}ms (attempt ${retriesRef.current}/${MAX_RETRIES})`)
          clearRetryTimer()
          retryTimerRef.current = setTimeout(() => {
            const args = subscribeArgsRef.current
            if (args) {
              doSubscribe(args.code, args.onTranslation, args.onSessionInfo, args.onStatus)
            }
          }, delay)
        } else {
          console.error('[Broadcast] Max reconnection attempts reached')
        }
      } else if (status === 'CLOSED') {
        setIsConnected(false)
      }
    })

    channelRef.current = channel
  }, [])

  const subscribe = useCallback((
    code: string,
    onTranslation?: TranslationHandler,
    onSessionInfo?: SessionInfoHandler,
    onStatus?: StatusHandler,
  ) => {
    // Store args for reconnection
    subscribeArgsRef.current = { code, onTranslation, onSessionInfo, onStatus }
    retriesRef.current = 0
    clearRetryTimer()
    doSubscribe(code, onTranslation, onSessionInfo, onStatus)
  }, [doSubscribe])

  const broadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: 'broadcast',
      event,
      payload,
    })
  }, [])

  const unsubscribe = useCallback(() => {
    clearRetryTimer()
    subscribeArgsRef.current = null
    retriesRef.current = 0
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
