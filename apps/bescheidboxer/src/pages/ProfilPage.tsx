import { useState } from 'react'
import {
  User,
  Mail,
  Shield,
  Crown,
  Calendar,
  FileText,
  ShieldAlert,
  Clock,
  TrendingDown,
  Award,
  Copy,
  Check,
  Star,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { formatCurrency, formatDate } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useBescheidContext } from '../contexts/BescheidContext'
import { useToast } from '../hooks/use-toast'

const TIER_CONFIG = {
  free: { label: 'Free', color: 'text-muted-foreground', bg: 'bg-muted', icon: User, limit: 3 },
  basic: { label: 'Basic', color: 'text-fintutto-blue-600 dark:text-fintutto-blue-400', bg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40', icon: Star, limit: 10 },
  premium: { label: 'Premium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40', icon: Crown, limit: 50 },
  professional: { label: 'Professional', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40', icon: Award, limit: -1 },
}

export default function ProfilPage() {
  const { user, profile } = useAuth()
  const { bescheide, fristen, einsprueche, stats } = useBescheidContext()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const tier = profile?.tier || 'free'
  const tierConfig = TIER_CONFIG[tier]
  const TierIcon = tierConfig.icon

  const memberSince = user?.created_at ? formatDate(user.created_at) : 'Unbekannt'

  // Compute stats
  const totalEinsparpotenzial = bescheide.reduce((sum, b) => sum + (b.pruefungsergebnis?.einsparpotenzial ?? 0), 0)
  const erledigteFristen = fristen.filter(f => f.erledigt).length
  const eingereichte = einsprueche.filter(e => e.status === 'eingereicht' || e.status === 'entschieden').length
  const gepruefteBescheide = bescheide.filter(b => b.status === 'geprueft' || b.status === 'erledigt').length

  const copyReferralCode = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode)
      setCopied(true)
      toast({
        title: 'Kopiert',
        description: 'Referral-Code in die Zwischenablage kopiert.',
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Generate initials from name or email
  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (profile?.email?.substring(0, 2).toUpperCase() ?? 'U')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mein Profil</h1>
        <p className="text-muted-foreground mt-1">
          Ihr Konto und Ihre Nutzungsstatistiken
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-fintutto-blue-500 to-fintutto-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {initials}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 rounded-full p-1.5 ${tierConfig.bg} border-2 border-background`}>
                    <TierIcon className={`h-4 w-4 ${tierConfig.color}`} />
                  </div>
                </div>

                {/* Name & Email */}
                <h2 className="text-xl font-bold">{profile?.name || 'Benutzer'}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>

                {/* Tier Badge */}
                <Badge className={`mt-3 ${tierConfig.bg} ${tierConfig.color} border-0`}>
                  <TierIcon className="h-3 w-3 mr-1" />
                  {tierConfig.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Konto-Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-Mail</p>
                  <p className="text-sm font-medium">{profile?.email || user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mitglied seit</p>
                  <p className="text-sm font-medium">{memberSince}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tarif</p>
                  <p className="text-sm font-medium">{tierConfig.label}</p>
                </div>
              </div>

              {profile?.referralCode && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Referral-Code</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-medium">{profile.referralCode}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={copyReferralCode}
                      >
                        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Card */}
          {tier !== 'professional' && (
            <Card className="border-fintutto-blue-200 dark:border-fintutto-blue-800 bg-gradient-to-br from-fintutto-blue-50 to-fintutto-blue-100/50 dark:from-fintutto-blue-950/50 dark:to-fintutto-blue-900/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Crown className="h-8 w-8 text-fintutto-blue-600 dark:text-fintutto-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-fintutto-blue-700 dark:text-fintutto-blue-300">Upgrade verfuegbar</h3>
                  <p className="text-xs text-fintutto-blue-600 dark:text-fintutto-blue-400 mt-1 mb-3">
                    Mehr Analysen, mehr Features
                  </p>
                  <Button size="sm" className="w-full">
                    Jetzt upgraden
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Nutzungsstatistiken</CardTitle>
              <CardDescription>Ihre gesamte Aktivitaet auf einen Blick</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg border border-border p-4 text-center">
                  <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2 w-fit mx-auto mb-2">
                    <FileText className="h-5 w-5 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
                  </div>
                  <p className="text-2xl font-bold">{bescheide.length}</p>
                  <p className="text-xs text-muted-foreground">Bescheide</p>
                </div>

                <div className="rounded-lg border border-border p-4 text-center">
                  <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2 w-fit mx-auto mb-2">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold">{gepruefteBescheide}</p>
                  <p className="text-xs text-muted-foreground">Geprueft</p>
                </div>

                <div className="rounded-lg border border-border p-4 text-center">
                  <div className="rounded-lg bg-red-100 dark:bg-red-900/40 p-2 w-fit mx-auto mb-2">
                    <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-2xl font-bold">{einsprueche.length}</p>
                  <p className="text-xs text-muted-foreground">Einsprueche</p>
                </div>

                <div className="rounded-lg border border-border p-4 text-center">
                  <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2 w-fit mx-auto mb-2">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold">{fristen.length}</p>
                  <p className="text-xs text-muted-foreground">Fristen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Erfolge</CardTitle>
              <CardDescription>Ihre Meilensteine im Ueberblick</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Achievement
                  icon={FileText}
                  title="Erster Bescheid"
                  description="Laden Sie Ihren ersten Steuerbescheid hoch"
                  completed={bescheide.length > 0}
                />
                <Achievement
                  icon={Search}
                  title="Erste Pruefung"
                  description="Lassen Sie einen Bescheid analysieren"
                  completed={gepruefteBescheide > 0}
                />
                <Achievement
                  icon={ShieldAlert}
                  title="Einspruch eingereicht"
                  description="Reichen Sie Ihren ersten Einspruch ein"
                  completed={eingereichte > 0}
                />
                <Achievement
                  icon={Clock}
                  title="Fristen-Manager"
                  description="Erledigen Sie 5 Fristen"
                  completed={erledigteFristen >= 5}
                  progress={erledigteFristen}
                  target={5}
                />
                <Achievement
                  icon={TrendingDown}
                  title="Steuersparer"
                  description="Identifizieren Sie 1.000 EUR Einsparpotenzial"
                  completed={totalEinsparpotenzial >= 1000}
                  progress={Math.min(totalEinsparpotenzial, 1000)}
                  target={1000}
                  formatProgress={(v) => formatCurrency(v)}
                />
                <Achievement
                  icon={FileText}
                  title="Bescheid-Sammler"
                  description="Verwalten Sie 10 Bescheide"
                  completed={bescheide.length >= 10}
                  progress={bescheide.length}
                  target={10}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Summary */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-3">
                  <TrendingDown className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">Gesamtes Einsparpotenzial</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(totalEinsparpotenzial)}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{stats.abweichungenGesamt}</p>
                  <p className="text-xs text-muted-foreground">Abweichungen</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{erledigteFristen}</p>
                  <p className="text-xs text-muted-foreground">Fristen erledigt</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{profile?.referralCredits ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Referral-Credits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Achievement({
  icon: Icon,
  title,
  description,
  completed,
  progress,
  target,
  formatProgress,
}: {
  icon: React.ElementType
  title: string
  description: string
  completed: boolean
  progress?: number
  target?: number
  formatProgress?: (v: number) => string
}) {
  const fmt = formatProgress ?? ((v: number) => v.toString())

  return (
    <div className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
      completed
        ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30'
        : 'border-border'
    }`}>
      <div className={`rounded-lg p-2.5 ${
        completed
          ? 'bg-green-100 dark:bg-green-900/40'
          : 'bg-muted'
      }`}>
        <Icon className={`h-5 w-5 ${
          completed
            ? 'text-green-600 dark:text-green-400'
            : 'text-muted-foreground'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{title}</h4>
          {completed && <Check className="h-4 w-4 text-green-500" />}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {progress !== undefined && target !== undefined && !completed && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-1.5">
              <div
                className="bg-fintutto-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min((progress / target) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {fmt(progress)} / {fmt(target)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
