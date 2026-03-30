import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Languages, Clock, Users, Mic, ExternalLink, Download, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Typen ───────────────────────────────────────────────────────────────────
interface UsageStatus {
  tier_name: string
  sessions_used: number
  sessions_limit: number
  minutes_used: number
  minutes_limit: number
  listeners_used: number
  listeners_limit: number
  period_start: string
  period_end: string
  overage_eur: number
}

interface SessionEntry {
  session_id: string
  started_at: string
  ended_at: string | null
  duration_minutes: number
  unique_listeners: number
  language_count: number
  session_type: string
  tts_chars_used: number
  stt_minutes_used: number
  overage_cost_eur: number
}

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────
function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
}
function fmtEur(n: number): string {
  return `€ ${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Fortschrittsbalken ───────────────────────────────────────────────────────
function ProgressBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-indigo-500'
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{label}</span>
        <span>{used.toLocaleString('de-DE')} / {limit.toLocaleString('de-DE')}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Hauptkomponente ─────────────────────────────────────────────────────────
export default function TranslatorUsageWidget({ userId }: { userId: string }) {
  const [status, setStatus] = useState<UsageStatus | null>(null)
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      setLoading(true)
      try {
        // Paket-Verbrauch
        const { data: usageData } = await supabase.rpc('get_my_usage_status')
        if (usageData && usageData[0]) setStatus(usageData[0])

        // Session-Historie
        const { data: sessData } = await supabase.rpc('get_my_session_history', {
          p_limit: 50,
          p_offset: 0,
        })
        if (sessData) setSessions(sessData)
      } catch (err) {
        console.error('TranslatorUsageWidget load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  // CSV-Export
  const exportCSV = () => {
    const header = ['Datum','Typ','Dauer (min)','Listener','Sprachen','STT-Minuten','TTS-Zeichen','Overage €']
    const rows = sessions.map(s => [
      fmtDate(s.started_at), s.session_type, s.duration_minutes,
      s.unique_listeners, s.language_count, s.stt_minutes_used,
      s.tts_chars_used, s.overage_cost_eur
    ])
    const csv = [header, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `mein_translator_verbrauch.csv`; a.click()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          Lade Translator-Verbrauch…
        </CardContent>
      </Card>
    )
  }

  const displayedSessions = showAll ? sessions : sessions.slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Paket-Übersicht */}
      {status && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Translator-Paket</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {status.tier_name} · {new Date(status.period_start).toLocaleDateString('de-DE')} –{' '}
                  {new Date(status.period_end).toLocaleDateString('de-DE')}
                </CardDescription>
              </div>
              <a
                href="https://app.guidetranslator.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                Zur App <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProgressBar used={status.sessions_used} limit={status.sessions_limit} label="Sessions" />
            <ProgressBar used={status.minutes_used} limit={status.minutes_limit} label="Minuten" />
            <ProgressBar used={status.listeners_used} limit={status.listeners_limit} label="Listener" />
            {status.overage_eur > 0 && (
              <div className="flex items-center justify-between pt-1 border-t">
                <span className="text-xs text-muted-foreground">Overage-Kosten (aktuell)</span>
                <span className="text-sm font-semibold text-amber-600">{fmtEur(status.overage_eur)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session-Historie */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Meine Sessions</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {sessions.length} Sessions insgesamt
              </CardDescription>
            </div>
            {sessions.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCSV} className="h-7 text-xs">
                <Download className="w-3 h-3 mr-1" />
                CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Noch keine Sessions vorhanden.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {displayedSessions.map(s => (
                  <div key={s.session_id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize h-5">
                          {s.session_type || 'event'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{fmtDate(s.started_at)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {s.unique_listeners} Listener
                        </span>
                        <span className="flex items-center gap-1">
                          <Languages className="w-3 h-3" /> {s.language_count} Sprachen
                        </span>
                        {s.stt_minutes_used > 0 && (
                          <span className="flex items-center gap-1">
                            <Mic className="w-3 h-3" /> {s.stt_minutes_used.toFixed(1)} STT-min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {s.overage_cost_eur > 0 ? (
                        <span className="text-xs font-semibold text-amber-600">
                          {fmtEur(s.overage_cost_eur)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Im Paket</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {sessions.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-3 text-xs text-muted-foreground"
                >
                  {showAll ? (
                    <><ChevronUp className="w-3 h-3 mr-1" /> Weniger anzeigen</>
                  ) : (
                    <><ChevronDown className="w-3 h-3 mr-1" /> Alle {sessions.length} Sessions anzeigen</>
                  )}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
