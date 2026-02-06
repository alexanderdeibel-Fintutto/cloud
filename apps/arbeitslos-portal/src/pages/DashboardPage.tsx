import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  Users,
  Clock,
  ArrowRight,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PLANS } from '@/lib/credits'
import { useCreditsContext } from '@/contexts/CreditsContext'

// Demo data for dashboard
const recentChats = [
  { id: '1', question: 'Sanktion wegen verpasstem Termin', date: '2026-02-05', status: 'beantwortet' },
  { id: '2', question: 'KdU Kuerzung - was tun?', date: '2026-02-04', status: 'beantwortet' },
  { id: '3', question: 'Mehrbedarf Alleinerziehend', date: '2026-02-03', status: 'beantwortet' },
]

const recentLetters = [
  { id: '1', title: 'Widerspruch gegen Sanktion', date: '2026-02-05', status: 'erstellt' },
  { id: '2', title: 'Ueberpruefungsantrag § 44', date: '2026-02-03', status: 'versendet' },
]

const deadlines = [
  { title: 'Widerspruchsfrist Bescheid vom 15.01.', date: '2026-02-15', urgent: true },
  { title: 'Weiterbewilligungsantrag', date: '2026-03-01', urgent: false },
]

export default function DashboardPage() {
  const { credits } = useCreditsContext()
  const plan = credits ? PLANS[credits.plan] : PLANS.free

  const questionsUsed = credits?.chatQuestionsUsedToday || 0
  const questionsLimit = plan.chatQuestionsPerDay
  const questionsProgress = questionsLimit === -1 ? 0 : (questionsUsed / questionsLimit) * 100

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Mein Dashboard
          </h1>
          <p className="text-muted-foreground">Ueberblick ueber deine Aktivitaeten</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {plan.name}-Tarif
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{questionsUsed}</div>
                <div className="text-xs text-muted-foreground">
                  Fragen heute
                  {questionsLimit !== -1 && ` / ${questionsLimit}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{recentLetters.length}</div>
                <div className="text-xs text-muted-foreground">Schreiben erstellt</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs text-muted-foreground">Forum-Beitraege</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">2</div>
                <div className="text-xs text-muted-foreground">Offene Faelle</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Deadlines / Warnings */}
          {deadlines.some(d => d.urgent) && (
            <Card className="border-warning/40 bg-warning/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Achtung: Fristen beachten!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deadlines.map((deadline) => (
                  <div
                    key={deadline.title}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      deadline.urgent ? 'bg-warning/10' : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${deadline.urgent ? 'text-warning' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">{deadline.title}</span>
                    </div>
                    <Badge variant={deadline.urgent ? 'warning' : 'outline'}>
                      {new Date(deadline.date).toLocaleDateString('de-DE')}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Chats */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Letzte KI-Beratungen
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/chat">
                    Neue Frage
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentChats.map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{chat.question}</p>
                      <p className="text-xs text-muted-foreground">{new Date(chat.date).toLocaleDateString('de-DE')}</p>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {chat.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Letters */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Meine Schreiben
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/musterschreiben">
                    Alle anzeigen
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLetters.map((letter) => (
                  <div key={letter.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{letter.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(letter.date).toLocaleDateString('de-DE')}</p>
                    </div>
                    <Badge variant={letter.status === 'versendet' ? 'success' : 'outline'} className="text-[10px]">
                      {letter.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Plan Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Dein Tarif: {plan.name}
              </h3>
              {questionsLimit !== -1 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>KI-Fragen heute</span>
                    <span>{questionsUsed}/{questionsLimit}</span>
                  </div>
                  <Progress value={questionsProgress} />
                </div>
              )}
              {credits?.plan !== 'premium' && (
                <Button variant="amt" size="sm" className="w-full" asChild>
                  <Link to="/preise">Upgrade</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Schnellzugriff</h3>
              <div className="space-y-2">
                <Link to="/chat" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  KI-Berater fragen
                </Link>
                <Link to="/musterschreiben" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  Musterschreiben
                </Link>
                <Link to="/forum" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  Forum
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Ecosystem */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Fintutto Oekosystem</h3>
              <div className="space-y-2">
                <a
                  href="https://mieter.fintutto.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  Mieter-Checker
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
                <a
                  href="https://vermieter.fintutto.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  Vermieter-Portal
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
