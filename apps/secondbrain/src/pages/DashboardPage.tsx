import { Link } from 'react-router-dom'
import {
  FileText,
  Upload,
  MessageSquare,
  Search,
  Brain,
  HardDrive,
  Star,
  Zap,
  ArrowRight,
  Clock,
  FolderOpen,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentStats, useDocuments } from '@/hooks/useDocuments'
import { useCollections } from '@/hooks/useCollections'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'

const STORAGE_LIMIT = 500 * 1024 * 1024

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats } = useDocumentStats()
  const { data: recentDocs } = useDocuments()
  const { data: collections = [] } = useCollections()

  if (!user) {
    return <LandingHero />
  }

  const storagePercent = stats ? Math.min((stats.totalSize / STORAGE_LIMIT) * 100, 100) : 0
  const hasUntagged = recentDocs?.some((d) => d.tags.length === 0)
  const hasPendingOcr = stats && stats.ocrPending > 0
  const hasFailedOcr = recentDocs?.some((d) => d.ocr_status === 'failed')

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Willkommen zurück</h1>
        <p className="text-muted-foreground mt-1">Hier ist dein Wissens-Dashboard</p>
      </div>

      {/* Actionable Insights */}
      {(hasUntagged || hasPendingOcr || hasFailedOcr || (stats && stats.total === 0)) && (
        <div className="space-y-2">
          {stats && stats.total === 0 && (
            <Link to="/upload">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
                <Upload className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Los geht's!</p>
                  <p className="text-xs text-muted-foreground">Lade dein erstes Dokument hoch, um dein SecondBrain zu füllen.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </Link>
          )}
          {hasPendingOcr && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm"><span className="font-medium">{stats!.ocrPending} Dokumente</span> werden gerade per KI analysiert...</p>
            </div>
          )}
          {hasFailedOcr && (
            <Link to="/dokumente">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <p className="text-sm">Einige Dokumente konnten nicht verarbeitet werden. Klicke um sie zu überprüfen.</p>
              </div>
            </Link>
          )}
          {hasUntagged && stats && stats.total > 0 && (
            <Link to="/dokumente">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm">Einige Dokumente haben noch keine Tags. <span className="text-primary font-medium">Jetzt organisieren</span></p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/upload', icon: Upload, label: 'Hochladen', desc: 'Dokumente hinzufügen', color: 'bg-blue-500/10 text-blue-500' },
          { to: '/chat', icon: MessageSquare, label: 'KI-Chat', desc: 'Frag dein Brain', color: 'bg-primary/10 text-primary' },
          { to: '/suche', icon: Search, label: 'Suche', desc: 'Volltextsuche', color: 'bg-green-500/10 text-green-500' },
          { to: '/dokumente', icon: FileText, label: 'Dokumente', desc: 'Alle ansehen', color: 'bg-orange-500/10 text-orange-500' },
        ].map((action) => (
          <Link key={action.to} to={action.to}>
            <Card className="hover:border-primary/30 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats + Storage */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Dokumente</span>
            </div>
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Favoriten</span>
            </div>
            <p className="text-2xl font-bold">{stats?.favorites || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sammlungen</span>
            </div>
            <p className="text-2xl font-bold">{collections.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">OCR erkannt</span>
            </div>
            <p className="text-2xl font-bold">{stats?.ocrCompleted || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Speicher</span>
            </div>
            <p className="text-lg font-bold">{stats ? formatFileSize(stats.totalSize) : '0 B'}</p>
            <Progress value={storagePercent} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* Collections overview */}
      {collections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
              Sammlungen
            </h2>
            <Link to="/sammlungen">
              <Button variant="ghost" size="sm">
                Alle <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {collections.slice(0, 5).map((col) => (
              <Link key={col.id} to="/sammlungen" className="shrink-0">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-sm font-medium whitespace-nowrap">{col.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{col.document_count}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Zuletzt hinzugefügt
          </h2>
          <Link to="/dokumente">
            <Button variant="ghost" size="sm">
              Alle anzeigen <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {recentDocs && recentDocs.length > 0 ? (
          <div className="space-y-2">
            {recentDocs.slice(0, 5).map((doc) => (
              <Link key={doc.id} to="/dokumente">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    {doc.summary && (
                      <p className="text-xs text-muted-foreground truncate">{doc.summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.tags.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{doc.tags[0]}</Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelativeTime(doc.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Noch keine Dokumente. Lade dein erstes Dokument hoch!
              </p>
              <Link to="/upload">
                <Button size="sm">Jetzt hochladen</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Landing page for non-authenticated users
function LandingHero() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-3xl gradient-brain flex items-center justify-center animate-pulse-brain">
          <Brain className="w-14 h-14 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/20 animate-float" />
        <div className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-primary/15 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
        Dein <span className="gradient-brain-text">SecondBrain</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mb-2">
        Intelligentes Wissensmanagement mit KI. Dokumente hochladen, automatisch scannen lassen,
        und mit natürlicher Sprache durchsuchen.
      </p>
      <p className="text-sm text-muted-foreground max-w-lg mb-8">
        PDF, Bilder, Texte — alles wird analysiert, zusammengefasst und durchsuchbar gemacht.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/login">
          <Button size="xl" variant="glow">
            Jetzt starten
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mt-16">
        {[
          { icon: Upload, title: 'Upload & OCR', desc: 'Dokumente hochladen und automatisch per KI scannen lassen' },
          { icon: Brain, title: 'KI-Chat', desc: 'Stelle Fragen zu deinen Dokumenten in natürlicher Sprache' },
          { icon: Search, title: 'Volltextsuche', desc: 'Finde alles sofort — auch in gescannten Dokumenten' },
        ].map((feature) => (
          <Card key={feature.title} className="text-left">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
