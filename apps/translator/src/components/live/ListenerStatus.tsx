import { Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getLanguageByCode } from '@/lib/languages'
import type { PresenceState } from '@/lib/session'

interface ListenerStatusProps {
  listeners: PresenceState[]
  listenersByLanguage: Record<string, number>
}

export default function ListenerStatus({ listeners, listenersByLanguage }: ListenerStatusProps) {
  const langEntries = Object.entries(listenersByLanguage)
    .filter(([lang]) => lang !== '_speaker')
    .sort((a, b) => b[1] - a[1])

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {listeners.length} {listeners.length === 1 ? 'Listener' : 'Listener'} verbunden
        </span>
        {listeners.length > 0 && (
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </div>

      {langEntries.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {langEntries.map(([lang, count]) => {
            const langData = getLanguageByCode(lang)
            return (
              <span
                key={lang}
                className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs"
              >
                {langData?.flag} {langData?.nativeName || lang}
                {count > 1 && (
                  <span className="bg-primary/10 text-primary px-1.5 rounded-full font-medium">
                    {count}
                  </span>
                )}
              </span>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Warte auf Listener... Teile den QR-Code oder Link.
        </p>
      )}
    </Card>
  )
}
