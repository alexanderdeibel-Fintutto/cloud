import { Volume2, VolumeX, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageChips from './LanguageChips'
import LiveTranscript from './LiveTranscript'
import { getLanguageByCode } from '@/lib/languages'
import type { useLiveSession } from '@/hooks/useLiveSession'

type Session = ReturnType<typeof useLiveSession>

interface ListenerViewProps {
  session: Session
}

export default function ListenerView({ session }: ListenerViewProps) {
  const langData = getLanguageByCode(session.selectedLanguage)

  if (session.sessionEnded) {
    return (
      <Card className="p-8 text-center space-y-4">
        <p className="text-xl font-semibold">Session beendet</p>
        <p className="text-muted-foreground">
          Der Speaker hat die Live-Übersetzung beendet.
        </p>
        <Button onClick={session.leaveSession}>Zurück</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Current translation - large display */}
      <Card className="p-6 min-h-[200px] flex items-center justify-center">
        {session.currentTranslation ? (
          <div className="text-center space-y-2">
            <p className="text-2xl md:text-3xl font-medium leading-relaxed">
              {session.currentTranslation}
            </p>
            {session.isSpeaking && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="h-4 w-4 animate-pulse" />
                Wird vorgelesen...
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground space-y-2">
            <p className="text-lg">Warte auf Übersetzung...</p>
            <p className="text-sm">
              Verbunden mit Session <span className="font-mono font-bold">{session.sessionCode}</span>
            </p>
            {session.isConnected && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Verbunden
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant={session.autoTTS ? 'default' : 'outline'}
          size="sm"
          onClick={() => session.setAutoTTS(!session.autoTTS)}
          className="gap-1.5"
        >
          {session.autoTTS ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          Auto-Vorlesen
        </Button>

        <div className="flex-1" />

        <span className="text-sm text-muted-foreground">
          {langData?.flag} {langData?.name}
        </span>

        <Button variant="ghost" size="sm" onClick={session.leaveSession} className="gap-1.5 text-destructive">
          <LogOut className="h-3.5 w-3.5" />
          Verlassen
        </Button>
      </div>

      {/* Language selection */}
      <Card className="p-4">
        <p className="text-sm font-medium mb-3">Zielsprache wählen</p>
        <LanguageChips
          selected={session.selectedLanguage}
          onSelect={session.selectLanguage}
          exclude={session.sourceLanguage}
        />
      </Card>

      {/* Transcript history */}
      {session.receivedChunks.length > 1 && (
        <LiveTranscript chunks={session.receivedChunks} isListener />
      )}
    </div>
  )
}
