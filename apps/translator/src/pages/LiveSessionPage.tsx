import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useLiveSession } from '@/hooks/useLiveSession'
import SpeakerView from '@/components/live/SpeakerView'
import ListenerView from '@/components/live/ListenerView'
import LanguageChips from '@/components/live/LanguageChips'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function LiveSessionPage() {
  const { code } = useParams<{ code: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const session = useLiveSession()
  const [listenerLang, setListenerLang] = useState('en')

  const state = location.state as { role?: string; sourceLang?: string } | null

  // Speaker: create session
  useEffect(() => {
    if (code === 'new' && state?.role === 'speaker' && !session.role) {
      const newCode = session.createSession(state.sourceLang || 'de')
      // Replace URL with actual code
      navigate(`/live/${newCode}`, { replace: true, state: { role: 'speaker' } })
    }
  }, [code, state, session, navigate])

  // Already in a session — show the right view
  if (session.role === 'speaker') {
    return <SpeakerView session={session} />
  }

  if (session.role === 'listener') {
    return <ListenerView session={session} />
  }

  // Not yet joined — show language selection for listener
  if (code && code !== 'new') {
    const handleJoin = () => {
      session.joinSession(code, listenerLang)
    }

    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Session beitreten</p>
          <p className="text-2xl font-mono font-bold tracking-widest">{code}</p>
        </div>

        <Card className="p-6 space-y-4">
          <p className="font-medium">In welcher Sprache möchtest du hören?</p>
          <LanguageChips selected={listenerLang} onSelect={setListenerLang} />
          <Button onClick={handleJoin} className="w-full" size="lg">
            Beitreten
          </Button>
        </Card>
      </div>
    )
  }

  // Fallback
  return null
}
