import { useState, useEffect } from 'react'
import { Settings, User, Bell, Shield, Database, LogOut, FileText, Image, File, AlertTriangle, ArrowRight, Zap, Keyboard, BellOff, CalendarClock, Inbox, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentStats } from '@/hooks/useDocuments'
import { useClearActivityLog } from '@/hooks/useActivityLog'
import { DOCUMENT_TYPES, TARGET_APPS, SMART_ROUTING } from '@/hooks/useWorkflows'
import { supabase } from '@/integrations/supabase'
import { formatFileSize } from '@/lib/utils'
import { toast } from 'sonner'

const STORAGE_LIMIT = 500 * 1024 * 1024 // 500 MB

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { data: stats } = useDocumentStats()
  const clearActivityLog = useClearActivityLog()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const storagePercent = stats ? Math.min((stats.totalSize / STORAGE_LIMIT) * 100, 100) : 0

  const handleDeleteAllData = async () => {
    if (!user) return
    setIsDeleting(true)
    try {
      // Delete all documents from storage
      const { data: docs } = await supabase
        .from('sb_documents')
        .select('storage_path')
        .eq('user_id', user.id)

      if (docs && docs.length > 0) {
        await supabase.storage
          .from('secondbrain-docs')
          .remove(docs.map((d) => d.storage_path))
      }

      // Delete all DB records (cascades handle related tables)
      await supabase.from('sb_documents').delete().eq('user_id', user.id)
      await supabase.from('sb_collections').delete().eq('user_id', user.id)
      await supabase.from('sb_chat_sessions').delete().eq('user_id', user.id)
      await supabase.from('sb_activity_log').delete().eq('user_id', user.id)

      toast.success('Alle Daten wurden gelöscht')
      setDeleteDialogOpen(false)
    } catch {
      toast.error('Fehler beim Löschen der Daten')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Einstellungen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verwalte dein SecondBrain-Konto
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">E-Mail</label>
            <p className="text-sm">{user?.email || 'Nicht angemeldet'}</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Konto</p>
              <p className="text-xs text-muted-foreground">Verwalte dein Konto und deine Daten</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4" />
            Speicher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{stats ? formatFileSize(stats.totalSize) : '...'} verwendet</span>
              <span className="text-muted-foreground">{formatFileSize(STORAGE_LIMIT)} Limit</span>
            </div>
            <Progress value={storagePercent} className="h-2" />
          </div>

          <Separator />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-red-500" />
              <div>
                <p className="font-medium">{stats?.byType.pdf || 0}</p>
                <p className="text-xs text-muted-foreground">PDFs</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Image className="w-4 h-4 text-blue-500" />
              <div>
                <p className="font-medium">{stats?.byType.image || 0}</p>
                <p className="text-xs text-muted-foreground">Bilder</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-green-500" />
              <div>
                <p className="font-medium">{stats?.byType.text || 0}</p>
                <p className="text-xs text-muted-foreground">Texte</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <File className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{stats?.byType.other || 0}</p>
                <p className="text-xs text-muted-foreground">Sonstige</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span>OCR-Verarbeitung</span>
            <span className="text-muted-foreground">
              {stats?.ocrCompleted || 0} abgeschlossen, {stats?.ocrPending || 0} ausstehend
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Routing Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Smart Auto-Routing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Dokumente werden automatisch der passenden Fintutto-App zugeordnet. Die KI schlägt basierend auf dem Dokumenttyp die beste App vor.
          </p>
          <Separator />
          <div className="space-y-2">
            {Object.entries(SMART_ROUTING).map(([docType, routing]) => {
              const typeInfo = DOCUMENT_TYPES[docType]
              const primaryApp = TARGET_APPS[routing.primary]
              const secondaryApp = routing.secondary ? TARGET_APPS[routing.secondary] : null
              if (!typeInfo || !primaryApp) return null
              return (
                <div key={docType} className="flex items-center gap-3 py-2 px-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <Badge variant="outline" className="text-[10px] shrink-0" style={{ borderColor: typeInfo.color, color: typeInfo.color }}>
                    {typeInfo.label}
                  </Badge>
                  <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-sm leading-none">{primaryApp.icon}</span>
                    <span className="text-sm font-medium truncate">{primaryApp.label}</span>
                  </div>
                  {secondaryApp && (
                    <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                      <span className="text-xs">oder</span>
                      <span className="text-sm leading-none">{secondaryApp.icon}</span>
                      <span className="text-xs">{secondaryApp.label}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Routing-Vorschläge erscheinen im Eingangskorb und Dokumenten-Viewer. Du entscheidest per Klick ob weitergeleitet wird.
          </p>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Tastenkürzel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            { keys: ['/', 'Ctrl+K'], label: 'Suche öffnen' },
            { keys: ['N'], label: 'Neues Dokument hochladen' },
            { keys: ['I'], label: 'Eingangskorb öffnen' },
            { keys: ['D'], label: 'Dokumente öffnen' },
            { keys: ['C'], label: 'KI-Chat öffnen' },
            { keys: ['Esc'], label: 'Dialog/Viewer schließen' },
            { keys: ['J / K'], label: 'Nächstes/Vorheriges Dokument' },
            { keys: ['E'], label: 'Dokument als erledigt markieren' },
            { keys: ['A'], label: 'Dokument archivieren' },
          ].map((shortcut) => (
            <div key={shortcut.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">{shortcut.label}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd key={key} className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded">
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notifications */}
      <NotificationPreferences />

      {/* Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Onboarding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tour erneut starten</p>
              <p className="text-xs text-muted-foreground">Die Willkommens-Tour noch einmal anzeigen</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('sb-onboarding-complete')
                toast.success('Onboarding wird beim nachsten Seitenaufruf angezeigt')
              }}
            >
              Tour starten
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Gefahrenzone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Verlauf löschen</p>
              <p className="text-xs text-muted-foreground">Alle Aktivitäten aus dem Verlauf entfernen</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await clearActivityLog.mutateAsync()
                  toast.success('Verlauf gelöscht')
                } catch {
                  toast.error('Fehler beim Löschen')
                }
              }}
              disabled={clearActivityLog.isPending}
            >
              Verlauf löschen
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alle Daten löschen</p>
              <p className="text-xs text-muted-foreground">
                Alle Dokumente, Sammlungen und Chats unwiderruflich löschen
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              Daten löschen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Alle Daten löschen?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Dokumente ({stats?.total || 0}),
              Sammlungen, Chat-Verläufe und Aktivitätslogs werden unwiderruflich gelöscht.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
              <Button variant="destructive" onClick={handleDeleteAllData} disabled={isDeleting}>
                {isDeleting ? 'Wird gelöscht...' : 'Endgültig löschen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const NOTIFICATION_PREFS_KEY = 'sb-notification-prefs'

interface NotifPrefs {
  deadlineReminders: boolean
  deadlineReminderDays: number
  inboxAlerts: boolean
  ocrComplete: boolean
  actionRequired: boolean
  weeklyDigest: boolean
  soundEnabled: boolean
}

const DEFAULT_PREFS: NotifPrefs = {
  deadlineReminders: true,
  deadlineReminderDays: 3,
  inboxAlerts: true,
  ocrComplete: true,
  actionRequired: true,
  weeklyDigest: false,
  soundEnabled: false,
}

function loadNotifPrefs(): NotifPrefs {
  try {
    const saved = localStorage.getItem(NOTIFICATION_PREFS_KEY)
    return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS
  } catch { return DEFAULT_PREFS }
}

function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotifPrefs>(loadNotifPrefs)

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs))
  }, [prefs])

  const toggle = (key: keyof NotifPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Benachrichtigungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deadline Reminders */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Fristen-Erinnerungen</p>
              <p className="text-xs text-muted-foreground">
                Erinnerung {prefs.deadlineReminderDays} Tage vor Fristablauf
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={prefs.deadlineReminderDays}
              onChange={e => setPrefs(p => ({ ...p, deadlineReminderDays: Number(e.target.value) }))}
              className="h-7 text-xs rounded border border-border bg-background px-1.5"
              disabled={!prefs.deadlineReminders}
            >
              {[1, 2, 3, 5, 7, 14].map(d => (
                <option key={d} value={d}>{d} Tage</option>
              ))}
            </select>
            <ToggleSwitch checked={prefs.deadlineReminders} onChange={() => toggle('deadlineReminders')} />
          </div>
        </div>

        <Separator />

        {/* Inbox Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Inbox className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Eingangs-Benachrichtigungen</p>
              <p className="text-xs text-muted-foreground">Neue Dokumente im Eingang anzeigen</p>
            </div>
          </div>
          <ToggleSwitch checked={prefs.inboxAlerts} onChange={() => toggle('inboxAlerts')} />
        </div>

        <Separator />

        {/* OCR Complete */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">OCR abgeschlossen</p>
              <p className="text-xs text-muted-foreground">Benachrichtigung wenn Texterkennung fertig ist</p>
            </div>
          </div>
          <ToggleSwitch checked={prefs.ocrComplete} onChange={() => toggle('ocrComplete')} />
        </div>

        <Separator />

        {/* Action Required */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium">Aktion erforderlich</p>
              <p className="text-xs text-muted-foreground">Dokumente die Bearbeitung benötigen</p>
            </div>
          </div>
          <ToggleSwitch checked={prefs.actionRequired} onChange={() => toggle('actionRequired')} />
        </div>

        <Separator />

        {/* Weekly Digest */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Wochenbericht</p>
              <p className="text-xs text-muted-foreground">Wöchentliche Zusammenfassung deiner Aktivitäten</p>
            </div>
          </div>
          <ToggleSwitch checked={prefs.weeklyDigest} onChange={() => toggle('weeklyDigest')} />
        </div>

        <Separator />

        {/* Sound */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <BellOff className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Töne</p>
              <p className="text-xs text-muted-foreground">Akustische Benachrichtigungen aktivieren</p>
            </div>
          </div>
          <ToggleSwitch checked={prefs.soundEnabled} onChange={() => toggle('soundEnabled')} />
        </div>
      </CardContent>
    </Card>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}
