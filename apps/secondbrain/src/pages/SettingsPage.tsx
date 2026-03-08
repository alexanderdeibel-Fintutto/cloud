import { useState } from 'react'
import { Settings, User, Bell, Shield, Database, LogOut, FileText, Image, File, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentStats } from '@/hooks/useDocuments'
import { useClearActivityLog } from '@/hooks/useActivityLog'
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

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Benachrichtigungseinstellungen werden bald verfügbar sein.
          </p>
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
