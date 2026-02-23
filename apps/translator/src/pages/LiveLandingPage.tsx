import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageSelector from '@/components/translator/LanguageSelector'
import SessionCodeInput from '@/components/live/SessionCodeInput'

export default function LiveLandingPage() {
  const navigate = useNavigate()
  const [sourceLang, setSourceLang] = useState('de')

  const handleCreate = () => {
    navigate('/live/new', { state: { role: 'speaker', sourceLang } })
  }

  const handleJoin = (code: string) => {
    navigate(`/live/${code}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Live-Übersetzung</h1>
        <p className="text-muted-foreground">
          Ein Speaker spricht — alle Listener hören die Übersetzung in ihrer Sprache.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speaker */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Speaker</h2>
              <p className="text-sm text-muted-foreground">Session erstellen</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Du sprichst und deine Worte werden automatisch in alle Sprachen deiner Listener übersetzt.
          </p>

          <LanguageSelector value={sourceLang} onChange={setSourceLang} label="Ich spreche" />

          <Button onClick={handleCreate} className="w-full">
            Session starten
          </Button>
        </Card>

        {/* Listener */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Listener</h2>
              <p className="text-sm text-muted-foreground">Session beitreten</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Scanne den QR-Code des Speakers oder gib den Session-Code ein.
          </p>

          <SessionCodeInput onJoin={handleJoin} />
        </Card>
      </div>
    </div>
  )
}
