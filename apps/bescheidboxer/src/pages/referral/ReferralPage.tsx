import {
  Users,
  UserPlus,
  Star,
  Gift,
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import ReferralShareCard from '../../components/referral/ReferralShareCard'
import ReferralInviteForm from '../../components/referral/ReferralInviteForm'
import ReferralStatusList from '../../components/referral/ReferralStatusList'
import { useReferral } from '../../hooks/use-referral'
import { REFERRAL_REWARDS } from '../../types/referral'

export default function ReferralPage() {
  const { referralUser, referrals, stats, inviteByEmail, getReferralLink } = useReferral()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Freunde werben</h1>
        <p className="text-muted-foreground mt-1">
          Laden Sie Freunde und Kollegen ein und erhalten Sie Credits fuer jeden neuen Nutzer
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card stat-card-blue">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2">
              <Users className="h-5 w-5 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalInvites}</p>
              <p className="text-xs text-muted-foreground">Einladungen</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2">
              <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.registered}</p>
              <p className="text-xs text-muted-foreground">Registriert</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
              <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.converted}</p>
              <p className="text-xs text-muted-foreground">Aktive Nutzer</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-2">
              <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.creditsEarned}</p>
              <p className="text-xs text-muted-foreground">Credits verdient</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">So funktioniert's</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-sm">Code teilen</p>
                <p className="text-xs text-muted-foreground">
                  Senden Sie Ihren persoenlichen Einladungscode oder Link an Freunde
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-sm">Freund registriert sich</p>
                <p className="text-xs text-muted-foreground">
                  Ihr Freund erstellt ein kostenloses Konto ueber Ihren Link
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-sm">Credits erhalten</p>
                <p className="text-xs text-muted-foreground">
                  {REFERRAL_REWARDS.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Card */}
        <div className="space-y-6">
          <ReferralShareCard
            referralCode={referralUser.referralCode}
            referralLink={getReferralLink()}
          />
          <ReferralInviteForm onInvite={inviteByEmail} />
        </div>

        {/* Status List */}
        <ReferralStatusList referrals={referrals} />
      </div>

      {/* Rewards Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg bg-gradient-to-r from-fintutto-blue-100/50 to-emerald-100/50 dark:from-fintutto-blue-900/30 dark:to-emerald-900/30 border border-fintutto-blue-200/50 dark:border-fintutto-blue-800/50 p-4">
            <h4 className="font-semibold mb-2">Belohnungen</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-fintutto-blue-600" />
                <span><strong>+{REFERRAL_REWARDS.perSignup} Credit</strong> pro Registrierung</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span><strong>+{REFERRAL_REWARDS.perConversion} Credits</strong> bei Abo-Abschluss</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Credits koennen fuer zusaetzliche Bescheid-Analysen und Einspruch-Generierungen eingesetzt werden.
              Es gibt kein Limit fuer die Anzahl der Einladungen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
