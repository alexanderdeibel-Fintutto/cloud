import { useState } from 'react'
import {
  Gift, Copy, Check, ExternalLink,
  Share2, Mail, Star,
  UserPlus, CreditCard, Coins
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FINTUTTO_APPS, type AppInfo } from '@/lib/apps'
import { REFERRAL_REWARDS, buildReferralLink } from '@/lib/referral'

// Demo data – in production this comes from Supabase
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
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          Kopiert!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label || 'Kopieren'}
        </>
      )}
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
        title: `${app.name} – ${app.tagline}`,
        text: `Teste ${app.name} kostenlos! ${app.tagline}`,
        url: referralLink,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      <div className={`bg-gradient-to-r ${app.color} p-4 flex items-center gap-3`}>
        <span className="text-3xl">{app.icon}</span>
        <div className="flex-1">
          <h3 className="text-white font-bold">{app.name}</h3>
          <p className="text-white/70 text-xs">{app.tagline}</p>
        </div>
        {app.badge && (
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{app.badge}</span>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-2 mb-3">
          <code className="text-xs flex-1 truncate text-muted-foreground">{referralLink}</code>
          <button
            onClick={handleCopy}
            className="shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Teilen
          </Button>
          <Button size="sm" className={`flex-1 bg-gradient-to-r ${app.color} text-white border-0`} asChild>
            <a href={app.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              App &ouml;ffnen
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReferralPage() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedApp, setSelectedApp] = useState<string>('portal')
  const [inviteSent, setInviteSent] = useState(false)

  const selectedAppInfo = FINTUTTO_APPS.find((a) => a.id === selectedApp)

  const handleSendInvite = () => {
    if (!inviteEmail || !selectedAppInfo) return
    // In production: POST to Supabase edge function
    setInviteSent(true)
    setTimeout(() => {
      setInviteSent(false)
      setInviteEmail('')
    }, 3000)
  }

  const statusConfig = {
    pending: { label: 'Eingeladen', color: 'bg-yellow-100 text-yellow-700', icon: Mail },
    signed_up: { label: 'Angemeldet', color: 'bg-blue-100 text-blue-700', icon: UserPlus },
    subscribed: { label: 'Abonniert', color: 'bg-green-100 text-green-700', icon: CreditCard },
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
              <Gift className="h-4 w-4 text-white" />
              <span className="text-white font-medium text-sm">Referral-Programm</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Empfehlen &amp; profitieren
            </h1>
            <p className="text-lg text-white/80 mb-2">
              Teile Fintutto-Apps mit Freunden und erhalte Bonus-Credits f&uuml;r jede Anmeldung.
            </p>
            <p className="text-white/60 text-sm">
              Dein Referral-Code: <strong className="text-white font-mono">{DEMO_CODE}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center p-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-100 mx-auto mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{DEMO_STATS.totalInvitesSent}</div>
              <div className="text-xs text-muted-foreground">Einladungen</div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-100 mx-auto mb-2">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{DEMO_STATS.totalSignups}</div>
              <div className="text-xs text-muted-foreground">Anmeldungen</div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-purple-100 mx-auto mb-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{DEMO_STATS.totalSubscribed}</div>
              <div className="text-xs text-muted-foreground">Abonnenten</div>
            </Card>
            <Card className="text-center p-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-yellow-100 mx-auto mb-2">
                <Coins className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{DEMO_STATS.totalSavingsEur.toFixed(2)}&euro;</div>
              <div className="text-xs text-muted-foreground">Gespart</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Referral Code & Send Invite */}
      <section className="py-12">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Your Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Dein Referral-Code
                </CardTitle>
                <CardDescription>Teile diesen Code mit Freunden</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 bg-muted rounded-xl p-4 mb-4">
                  <code className="text-2xl font-bold font-mono flex-1 text-primary">{DEMO_CODE}</code>
                  <CopyButton text={DEMO_CODE} />
                </div>

                <h4 className="font-semibold text-sm mb-3">So funktioniert&apos;s:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">1</div>
                    <p className="text-sm text-muted-foreground">Teile deinen Link oder Code mit Freunden</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">2</div>
                    <p className="text-sm text-muted-foreground">Dein Freund meldet sich kostenlos an &rarr; <strong>+5 Credits f&uuml;r euch beide</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">3</div>
                    <p className="text-sm text-muted-foreground">Dein Freund abonniert &rarr; <strong>+15 Credits + 1 Monat gratis f&uuml;r dich</strong></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Send Invite */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Einladung senden
                </CardTitle>
                <CardDescription>Lade Freunde direkt per E-Mail ein</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* App Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">F&uuml;r welche App?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {FINTUTTO_APPS.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setSelectedApp(app.id)}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            selectedApp === app.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <span className="text-lg">{app.icon}</span>
                          <div className="text-xs font-medium truncate">{app.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">E-Mail-Adresse</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="freund@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <Button onClick={handleSendInvite} disabled={!inviteEmail || inviteSent}>
                        {inviteSent ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Gesendet!
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-1" />
                            Senden
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Preview */}
                  {selectedAppInfo && (
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Vorschau der Einladung:</p>
                      <p>&quot;Teste {selectedAppInfo.name} kostenlos! {selectedAppInfo.tagline} – {selectedAppInfo.pricing.free}. Mit meinem Link bekommst du 5 Bonus-Credits zum Start!&quot;</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* App-specific Referral Links */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-2">Referral-Links f&uuml;r jede App</h2>
          <p className="text-center text-muted-foreground mb-8">
            Jede App hat ihren eigenen Link &ndash; dein Freund landet direkt in der richtigen App.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FINTUTTO_APPS.map((app) => (
              <AppReferralCard key={app.id} app={app} referralCode={DEMO_CODE} />
            ))}
          </div>
        </div>
      </section>

      {/* Tracking Table */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-2">Einladungsverfolgung</h2>
          <p className="text-center text-muted-foreground mb-8">
            Verfolge den Status jeder Einladung in Echtzeit.
          </p>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">E-Mail</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">App</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Datum</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Belohnung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_REFERRALS.map((ref) => {
                      const config = statusConfig[ref.status]
                      const StatusIcon = config.icon
                      return (
                        <tr key={ref.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-4 text-sm font-mono">{ref.email}</td>
                          <td className="p-4 text-sm">{ref.app}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{ref.date}</td>
                          <td className="p-4">
                            {ref.status === 'subscribed' && (
                              <span className="text-green-600 text-sm font-medium">+15 Credits</span>
                            )}
                            {ref.status === 'signed_up' && (
                              <span className="text-blue-600 text-sm font-medium">+5 Credits</span>
                            )}
                            {ref.status === 'pending' && (
                              <span className="text-muted-foreground text-sm">ausstehend</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rewards Summary */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">Belohnungen &Uuml;bersicht</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Referrer */}
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="h-5 w-5 text-primary" />
                  F&uuml;r dich (Empfehler)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <UserPlus className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Bei Anmeldung</p>
                      <p className="text-blue-700 font-semibold">{REFERRAL_REWARDS.referrer.onSignup.description}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Bei Abo-Abschluss</p>
                      <p className="text-green-700 font-semibold">{REFERRAL_REWARDS.referrer.onSubscribe.description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Referred */}
            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                  F&uuml;r deinen Freund
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <UserPlus className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Bei Anmeldung</p>
                      <p className="text-blue-700 font-semibold">{REFERRAL_REWARDS.referred.onSignup.description}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Bei Abo-Abschluss</p>
                      <p className="text-green-700 font-semibold">{REFERRAL_REWARDS.referred.onSubscribe.description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
