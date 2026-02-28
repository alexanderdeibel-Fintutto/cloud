import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Gift, Copy, Check, Users, TrendingUp, ExternalLink,
  Share2, Mail, ArrowRight, Sparkles, Star,
  UserPlus, CreditCard, Coins, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FINTUTTO_APPS, type AppInfo } from '@/lib/apps'
import { REFERRAL_REWARDS, buildReferralLink } from '@/lib/referral'
import { useDocumentTitle, useMetaTags } from '@fintutto/shared'

const DEMO_CODE = 'FT-A1B2C3D4'
const DEMO_STATS = {
  totalInvitesSent: 12,
  totalSignups: 7,
  totalSubscribed: 3,
  totalSavingsEur: 22.50,
}
const DEMO_REFERRALS = [
  { id: '1', email: 'anna@example.com', app: 'Vermietify', status: 'subscribed' as const, date: '2026-02-08' },
  { id: '2', email: 'max@example.com', app: 'Mieter-App', status: 'signed_up' as const, date: '2026-02-10' },
  { id: '3', email: 'lisa@example.com', app: 'Portal', status: 'signed_up' as const, date: '2026-02-11' },
  { id: '4', email: 'tom@example.com', app: 'HausmeisterPro', status: 'pending' as const, date: '2026-02-12' },
  { id: '5', email: 'sarah@example.com', app: 'BescheidBoxer', status: 'signed_up' as const, date: '2026-02-12' },
]

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 rounded-xl">
      {copied ? <><Check className="h-4 w-4 text-green-500" /> Kopiert!</> : <><Copy className="h-4 w-4" /> {label || 'Kopieren'}</>}
    </Button>
  )
}

function AppReferralCard({ app, referralCode }: { app: AppInfo; referralCode: string }) {
  const [copied, setCopied] = useState(false)
  const referralLink = buildReferralLink(app.registerUrl, referralCode)

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${app.name} - ${app.tagline}`,
        text: `Teste ${app.name} kostenlos! ${app.tagline}`,
        url: referralLink,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <div className="tool-card">
      <div className={`bg-gradient-to-r ${app.color} p-4 flex items-center gap-3 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
        <span className="text-3xl relative drop-shadow-lg">{app.icon}</span>
        <div className="flex-1 relative">
          <h3 className="text-white font-bold text-sm">{app.name}</h3>
          <p className="text-white/50 text-[10px]">{app.tagline}</p>
        </div>
        {app.badge && (
          <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full relative">{app.badge}</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 bg-muted rounded-xl p-2.5 mb-3">
          <code className="text-[10px] flex-1 truncate text-muted-foreground font-mono">{referralLink}</code>
          <button onClick={handleCopy} className="shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs" onClick={handleShare}>
            <Share2 className="h-3 w-3 mr-1" /> Teilen
          </Button>
          <Button size="sm" className={`flex-1 bg-gradient-to-r ${app.color} text-white border-0 rounded-xl text-xs`} asChild>
            <a href={app.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" /> Oeffnen
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

const statusConfig = {
  pending: { label: 'Eingeladen', color: 'bg-yellow-100 text-yellow-700', icon: Mail },
  signed_up: { label: 'Angemeldet', color: 'bg-blue-100 text-blue-700', icon: UserPlus },
  subscribed: { label: 'Abonniert', color: 'bg-green-100 text-green-700', icon: CreditCard },
}

export default function ReferralPage() {
  useDocumentTitle('Referral-Programm', 'Fintutto Portal')
  useMetaTags({
    title: 'Referral-Programm - Fintutto Portal',
    description: 'Empfiehl Fintutto-Apps und erhalte Bonus-Credits fuer jede Anmeldung.',
    path: '/referral',
  })

  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedApp, setSelectedApp] = useState<string>('portal')
  const [inviteSent, setInviteSent] = useState(false)

  const selectedAppInfo = FINTUTTO_APPS.find((a) => a.id === selectedApp)

  const handleSendInvite = () => {
    if (!inviteEmail || !selectedAppInfo) return
    setInviteSent(true)
    setTimeout(() => { setInviteSent(false); setInviteEmail('') }, 3000)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(0,0,0,0.1),transparent_50%)]" />

        {/* Floating Elements */}
        <div className="absolute top-16 left-[10%] animate-float hidden lg:block">
          <div className="glass rounded-2xl p-3 shadow-2xl"><Gift className="h-5 w-5 text-white/70" /></div>
        </div>
        <div className="absolute bottom-16 right-[12%] animate-float-delayed hidden lg:block">
          <div className="glass rounded-2xl p-3 shadow-2xl"><Coins className="h-5 w-5 text-yellow-200/70" /></div>
        </div>

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8">
              <Gift className="h-4 w-4 text-yellow-200" />
              <span className="text-white/80 text-sm font-medium">Referral-Programm</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Empfehlen &
              <span className="block mt-2">profitieren</span>
            </h1>
            <p className="text-xl text-white/60 mb-3 max-w-2xl mx-auto">
              Teile Fintutto-Apps mit Freunden und erhalte Bonus-Credits fuer jede Anmeldung.
            </p>
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mt-4">
              <span className="text-white/50 text-sm">Dein Code:</span>
              <code className="text-white font-mono font-bold">{DEMO_CODE}</code>
              <CopyButton text={DEMO_CODE} label="Kopieren" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto stagger-children">
            {[
              { icon: Mail, value: DEMO_STATS.totalInvitesSent, label: 'Einladungen', gradient: 'from-blue-500 to-cyan-500' },
              { icon: UserPlus, value: DEMO_STATS.totalSignups, label: 'Anmeldungen', gradient: 'from-green-500 to-emerald-500' },
              { icon: CreditCard, value: DEMO_STATS.totalSubscribed, label: 'Abonnenten', gradient: 'from-purple-500 to-indigo-500' },
              { icon: Coins, value: `${DEMO_STATS.totalSavingsEur.toFixed(2)}\u20ac`, label: 'Gespart', gradient: 'from-amber-500 to-orange-500' },
            ].map((stat) => (
              <div key={stat.label} className="tool-card text-center p-5 group">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code & Send Invite */}
      <section className="py-14">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Your Code */}
            <div className="tool-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dein Referral-Code</h3>
                  <p className="text-xs text-muted-foreground">Teile diesen Code mit Freunden</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted rounded-xl p-4 mb-6">
                <code className="text-2xl font-black font-mono flex-1 text-primary">{DEMO_CODE}</code>
                <CopyButton text={DEMO_CODE} />
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">So funktioniert's</h4>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Teile deinen Link oder Code mit Freunden', gradient: 'from-blue-500 to-cyan-500' },
                  { step: '2', text: 'Dein Freund meldet sich kostenlos an \u2192 +5 Credits fuer euch beide', gradient: 'from-green-500 to-emerald-500' },
                  { step: '3', text: 'Dein Freund abonniert \u2192 +15 Credits + 1 Monat gratis', gradient: 'from-amber-500 to-orange-500' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} text-white text-xs font-bold shrink-0 shadow-md`}>
                      {item.step}
                    </div>
                    <p className="text-sm text-muted-foreground pt-0.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Send Invite */}
            <div className="tool-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Einladung senden</h3>
                  <p className="text-xs text-muted-foreground">Lade Freunde direkt per E-Mail ein</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Fuer welche App?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FINTUTTO_APPS.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          selectedApp === app.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="text-lg">{app.icon}</span>
                        <div className="text-[10px] font-semibold truncate mt-0.5">{app.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">E-Mail-Adresse</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="freund@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <Button onClick={handleSendInvite} disabled={!inviteEmail || inviteSent} className="rounded-xl px-6">
                      {inviteSent ? <><Check className="h-4 w-4 mr-1" /> Gesendet!</> : <><Mail className="h-4 w-4 mr-1" /> Senden</>}
                    </Button>
                  </div>
                </div>

                {selectedAppInfo && (
                  <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground border border-border/50">
                    <p className="font-semibold text-foreground mb-1.5">Vorschau:</p>
                    <p className="leading-relaxed italic">
                      "Teste {selectedAppInfo.name} kostenlos! {selectedAppInfo.tagline} - {selectedAppInfo.pricing.free}. Mit meinem Link bekommst du 5 Bonus-Credits zum Start!"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App-specific Referral Links */}
      <section className="py-14 bg-muted/20">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3 tracking-tight">Referral-Links fuer jede App</h2>
            <p className="text-muted-foreground">
              Jede App hat ihren eigenen Link - dein Freund landet direkt in der richtigen App.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto stagger-children">
            {FINTUTTO_APPS.map((app) => (
              <AppReferralCard key={app.id} app={app} referralCode={DEMO_CODE} />
            ))}
          </div>
        </div>
      </section>

      {/* Tracking Table */}
      <section className="py-14">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3 tracking-tight">Einladungsverfolgung</h2>
            <p className="text-muted-foreground">
              Verfolge den Status jeder Einladung in Echtzeit.
            </p>
          </div>

          <div className="tool-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">E-Mail</th>
                    <th className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">App</th>
                    <th className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Datum</th>
                    <th className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Belohnung</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_REFERRALS.map((ref) => {
                    const config = statusConfig[ref.status]
                    const StatusIcon = config.icon
                    return (
                      <tr key={ref.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm font-mono text-muted-foreground">{ref.email}</td>
                        <td className="p-4 text-sm font-medium">{ref.app}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${config.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">{ref.date}</td>
                        <td className="p-4">
                          {ref.status === 'subscribed' && <span className="text-green-600 text-sm font-bold">+15 Credits</span>}
                          {ref.status === 'signed_up' && <span className="text-blue-600 text-sm font-bold">+5 Credits</span>}
                          {ref.status === 'pending' && <span className="text-muted-foreground text-xs">ausstehend</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Summary */}
      <section className="py-14 bg-muted/20">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3 tracking-tight">Belohnungen</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* For Referrer */}
            <div className="tool-card p-6 border-primary/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Fuer dich (Empfehler)</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <UserPlus className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Bei Anmeldung</p>
                    <p className="text-blue-700 font-bold text-sm">{REFERRAL_REWARDS.referrer.onSignup.description}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                  <CreditCard className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Bei Abo-Abschluss</p>
                    <p className="text-green-700 font-bold text-sm">{REFERRAL_REWARDS.referrer.onSubscribe.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Referred */}
            <div className="tool-card p-6 border-green-200/50">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Fuer deinen Freund</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <UserPlus className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Bei Anmeldung</p>
                    <p className="text-blue-700 font-bold text-sm">{REFERRAL_REWARDS.referred.onSignup.description}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                  <CreditCard className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Bei Abo-Abschluss</p>
                    <p className="text-green-700 font-bold text-sm">{REFERRAL_REWARDS.referred.onSubscribe.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
