import { Mic, MicOff, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SessionQRCode from './SessionQRCode'
import ListenerStatus from './ListenerStatus'
import LiveTranscript from './LiveTranscript'
import type { useLiveSession } from '@/hooks/useLiveSession'

type Session = ReturnType<typeof useLiveSession>

interface SpeakerViewProps {
  session: Session
}

export default function SpeakerView({ session }: SpeakerViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: QR + Controls */}
        <div className="space-y-4">
          <SessionQRCode code={session.sessionCode} />

          <div className="flex gap-2">
            {session.isRecording ? (
              <Button
                onClick={session.stopRecording}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <MicOff className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={session.startRecording}
                className="flex-1 gap-2"
              >
                <Mic className="h-4 w-4" />
                Aufnahme starten
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:text-destructive"
            onClick={session.endSession}
          >
            <StopCircle className="h-4 w-4" />
            Session beenden
          </Button>

          <ListenerStatus
            listeners={session.listeners}
            listenersByLanguage={session.listenersByLanguage}
          />
        </div>

        {/* Right: Transcript */}
        <div className="lg:col-span-2 flex flex-col">
          {session.isRecording && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Live-Aufnahme</span>
              {session.currentTranscript && (
                <span className="text-sm text-muted-foreground/60 truncate ml-2">
                  {session.currentTranscript}
                </span>
              )}
            </div>
          )}

          <LiveTranscript
            chunks={session.translationHistory}
            currentText={session.isRecording ? session.currentTranscript : undefined}
          />
        </div>
      </div>

      {session.error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          {session.error}
        </div>
      )}
    </div>
  )
}
