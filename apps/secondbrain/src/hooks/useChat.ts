import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Message } from '@/components/chat/ChatMessage'

export function useChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!user || isLoading) return

    const userMessage: Message = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Create session if needed
      let sid = sessionId
      if (!sid) {
        const { data, error } = await supabase
          .from('sb_chat_sessions')
          .insert({ user_id: user.id, title: content.slice(0, 100) })
          .select('id')
          .single()

        if (error) throw error
        sid = data.id
        setSessionId(sid)
      }

      // Save user message
      await supabase.from('sb_chat_messages').insert({
        session_id: sid,
        role: 'user',
        content,
      })

      // Call AI edge function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('secondbrain-chat', {
        body: {
          sessionId: sid,
          message: content,
          userId: user.id,
        },
      })

      if (aiError) throw aiError

      const assistantMessage: Message = {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: aiResponse?.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
        created_at: new Date().toISOString(),
        sources: aiResponse?.sources || [],
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save assistant message
      await supabase.from('sb_chat_messages').insert({
        session_id: sid,
        role: 'assistant',
        content: assistantMessage.content,
        metadata: { sources: assistantMessage.sources },
      })
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: Math.random().toString(36).slice(2),
        role: 'assistant',
        content: 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [user, isLoading, sessionId])

  const clearChat = useCallback(() => {
    setMessages([])
    setSessionId(null)
  }, [])

  return { messages, isLoading, sendMessage, clearChat, sessionId }
}
