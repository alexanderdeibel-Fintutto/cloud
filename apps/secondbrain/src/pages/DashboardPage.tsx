import { Link } from 'react-router-dom'
import {
  FileText, Upload, MessageSquare, Search, Brain, HardDrive, Star, Zap,
  ArrowRight, Clock, FolderOpen, AlertTriangle, TrendingUp, Inbox,
  Building2, CalendarClock, Receipt, ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentStats, useDocuments } from '@/hooks/useDocuments'
import { useCollections } from '@/hooks/useCollections'
import { useCompanies } from '@/hooks/useCompanies'
import { useUpcomingDeadlines, daysUntil, deadlineUrgency } from '@/hooks/useDeadlines'
import { DOCUMENT_TYPES } from '@/hooks/useWorkflows'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'
import { FINTUTTO_APPS } from '@fintutto/shared'

const STORAGE_LIMIT = 500 * 1024 * 1024

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats } = useDocumentStats()
  const { data: recentDocs } = useDocuments()
  const { data: collections = [] } = useCollections()
  const { data: companies = [] } = useCompanies()
  const { data: upcomingDeadlines = [] } = useUpcomingDeadlines(14)

  if (!user) {
    return <LandingHero />
  }

  const storagePercent = stats ? Math.min((stats.totalSize / STORAGE_LIMIT) * 100, 100) : 0
  const inboxCount = recentDocs?.filter(d => !d.status || d.status === 'inbox').length || 0
  const actionCount = recentDocs?.filter(d => d.status === 'action_required' || d.priority === 'urgent').length || 0
  const hasPendingOcr = stats && stats.ocrPending > 0
  const hasFailedOcr = recentDocs?.some((d) => d.ocr_status === 'failed')
  const overdueDeadlines = upcomingDeadlines.filter(d => daysUntil(d.deadline_date) < 0)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Willkommen zurück</h1>
        <p className="text-muted-foreground mt-1">Dein Dokumenten-Kommandozentrale</p>
      </div>

      {/* CRITICAL ALERTS: Overdue deadlines + Action required */}
      {(overdueDeadlines.length > 0 || actionCount > 0) && (
        <div className="space-y-2">
          {overdueDeadlines.length > 0 && (
            <Link to="/fristen">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-destructive/50 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-destructive">
                    {overdueDeadlines.length} Frist{overdueDeadlines.length > 1 ? 'en' : ''} überfällig!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {overdueDeadlines.slice(0, 2).map(d => d.title).join(', ')}
                    {overdueDeadlines.length > 2 && ` und ${overdueDeadlines.length - 2} weitere`}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-destructive shrink-0" />
              </div>
            </Link>
          )}
          {actionCount > 0 && (
            <Link to="/eingang">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-orange-400/50 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100/50 dark:hover:bg-orange-950/30 transition-colors">
                <Inbox className="w-5 h-5 text-orange-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{actionCount} Dokument{actionCount > 1 ? 'e' : ''} benötig{actionCount > 1 ? 'en' : 't'} Aktion</p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-500 shrink-0" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Upcoming Deadlines (non-overdue) */}
      {upcomingDeadlines.filter(d => daysUntil(d.deadline_date) >= 0).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-muted-foreground" /> Anstehende Fristen
            </h2>
            <Link to="/fristen">
              <Button variant="ghost" size="sm" className="text-xs h-7">Alle</Button>
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {upcomingDeadlines.filter(d => daysUntil(d.deadline_date) >= 0).slice(0, 5).map(d => {
              const days = daysUntil(d.deadline_date)
              const urgency = deadlineUrgency(d.deadline_date)
              return (
                <Link key={d.id} to="/fristen" className="shrink-0">
                  <div className={`px-3 py-2 rounded-lg border transition-colors hover:shadow-sm ${
                    urgency === 'critical' ? 'border-destructive/50 bg-destructive/5' :
                    urgency === 'warning' ? 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/20' :
                    'border-border bg-card'
                  }`}>
                    <p className="text-xs font-medium truncate max-w-[150px]">{d.title}</p>
                    <p className={`text-[11px] ${
                      urgency === 'critical' ? 'text-destructive font-medium' :
                      urgency === 'warning' ? 'text-orange-600' : 'text-muted-foreground'
                    }`}>
                      {days === 0 ? 'Heute!' : days === 1 ? 'Morgen' : `${days} Tage`}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Actions - Updated */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { to: '/eingang', icon: Inbox, label: 'Eingang', desc: `${inboxCount} neue`, color: 'bg-blue-500/10 text-blue-500', badge: inboxCount },
          { to: '/upload', icon: Upload, label: 'Scannen', desc: 'Dokument erfassen', color: 'bg-green-500/10 text-green-500' },
          { to: '/chat', icon: MessageSquare, label: 'KI-Chat', desc: 'Frag dein Brain', color: 'bg-primary/10 text-primary' },
          { to: '/suche', icon: Search, label: 'Suche', desc: 'Volltextsuche', color: 'bg-orange-500/10 text-orange-500' },
          { to: '/firmen', icon: Building2, label: 'Firmen', desc: `${companies.length} Firmen`, color: 'bg-purple-500/10 text-purple-500' },
        ].map((action) => (
          <Link key={action.to} to={action.to}>
            <Card className="hover:border-primary/30 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-2`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm">{action.label}</p>
                  {action.badge && action.badge > 0 && (
                    <Badge variant="default" className="text-[9px] h-4 px-1">{action.badge}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Status insights */}
      {(hasPendingOcr || hasFailedOcr) && (
        <div className="space-y-2">
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
                <p className="text-sm">Einige Dokumente konnten nicht verarbeitet werden.</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
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
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Firmen</span>
            </div>
            <p className="text-2xl font-bold">{companies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Fristen</span>
            </div>
            <p className="text-2xl font-bold">{upcomingDeadlines.length}</p>
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

      {/* Companies + Collections row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Companies overview */}
        {companies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-muted-foreground" /> Firmen
              </h2>
              <Link to="/firmen">
                <Button variant="ghost" size="sm" className="text-xs h-7">Alle</Button>
              </Link>
            </div>
            <div className="space-y-1.5">
              {companies.slice(0, 4).map(c => (
                <Link key={c.id} to="/firmen">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-sm font-medium flex-1 truncate">{c.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{c.document_count || 0}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Collections overview */}
        {collections.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-muted-foreground" /> Sammlungen
              </h2>
              <Link to="/sammlungen">
                <Button variant="ghost" size="sm" className="text-xs h-7">Alle</Button>
              </Link>
            </div>
            <div className="space-y-1.5">
              {collections.slice(0, 4).map(col => (
                <Link key={col.id} to="/sammlungen">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-sm font-medium flex-1 truncate">{col.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{col.document_count}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ecosystem Quick Links */}
      <div>
        <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
          <Zap className="w-4 h-4 text-muted-foreground" /> Dokument weiterleiten an
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            FINTUTTO_APPS.portal,
            FINTUTTO_APPS.financialCompass,
            FINTUTTO_APPS.bescheidboxer,
            FINTUTTO_APPS.fintuttoBiz,
            FINTUTTO_APPS.vermietify,
            FINTUTTO_APPS.vermieterPortal,
          ].map((app) => (
            <a
              key={app.slug}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent/50 transition-all group"
            >
              <span className="text-2xl">{app.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">{app.name}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" /> Zuletzt hinzugefügt
          </h2>
          <Link to="/dokumente">
            <Button variant="ghost" size="sm" className="text-xs h-7">Alle</Button>
          </Link>
        </div>

        {recentDocs && recentDocs.length > 0 ? (
          <div className="space-y-1.5">
            {recentDocs.slice(0, 5).map((doc) => {
              const typeInfo = DOCUMENT_TYPES[doc.document_type || 'other'] || DOCUMENT_TYPES.other
              return (
                <Link key={doc.id} to="/dokumente">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      {doc.summary && (
                        <p className="text-xs text-muted-foreground truncate">{doc.summary}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {doc.document_type && doc.document_type !== 'other' && (
                        <Badge variant="outline" className="text-[9px] px-1" style={{ borderColor: typeInfo.color, color: typeInfo.color }}>
                          {typeInfo.label}
                        </Badge>
                      )}
                      {doc.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-[9px] px-1">!</Badge>
                      )}
                      {doc.tags.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] px-1">{doc.tags[0]}</Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(doc.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
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
        Das ultimative Dokumenten-KI-Tool. Jedes Papier nur einmal anfassen — scannen, kategorisieren, weiterleiten.
      </p>
      <p className="text-sm text-muted-foreground max-w-lg mb-8">
        Automatische Analyse, Firmenzuordnung, Fristen-Tracking, Cross-App Routing. Alles KI-gestützt.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/login">
          <Button size="xl" variant="glow">
            Jetzt starten
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mt-16">
        {[
          { icon: Upload, title: 'Scannen & OCR', desc: 'Dokument hochladen, KI analysiert automatisch' },
          { icon: Brain, title: 'Auto-Kategorisierung', desc: 'Typ, Firma, Fristen — alles automatisch erkannt' },
          { icon: CalendarClock, title: 'Fristen-Tracking', desc: 'Nie wieder eine Widerspruchsfrist verpassen' },
          { icon: ArrowRight, title: 'Cross-App Routing', desc: 'Rechnungen an FinTutto, Bescheide an BescheidBoxer' },
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
