import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Shield, Bell, CreditCard, LogOut, Loader2, Copy, Check, AlertTriangle, Sun, Moon, Monitor, Type } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../integrations/supabase/client'
import { useToast } from '../../hooks/use-toast'

const TIER_LABELS: Record<string, string> = {
  free: 'Kostenlos',
  basic: 'Basic',
  premium: 'Premium',
  professional: 'Professional',
}

const TIER_LIMITS: Record<string, { checks: number; einsprueche: number }> = {
  free: { checks: 3, einsprueche: 0 },
  basic: { checks: 20, einsprueche: 5 },
  premium: { checks: 100, einsprueche: 50 },
  professional: { checks: -1, einsprueche: -1 },
}

export default function EinstellungenPage() {
  const { profile, user, signOut } = useAuth()
  const { toast } = useToast()
  const { theme, setTheme, fontSize, setFontSize } = useTheme()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Notification preferences state
  const [notifFristen, setNotifFristen] = useState(true)
  const [notifAnalyse, setNotifAnalyse] = useState(true)
  const [notifReferral, setNotifReferral] = useState(true)
  const [notifNewsletter, setNotifNewsletter] = useState(false)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const tier = profile?.tier || 'free'
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: name || null })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Gespeichert',
        description: 'Ihre Profileinstellungen wurden aktualisiert.',
      })
    } catch {
      toast({
        title: 'Fehler',
        description: 'Profileinstellungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast({
        title: 'Fehler',
        description: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Fehler',
        description: 'Die Passwoerter stimmen nicht ueberein.',
        variant: 'destructive',
      })
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setNewPassword('')
      setConfirmPassword('')
      toast({
        title: 'Passwort geaendert',
        description: 'Ihr Passwort wurde erfolgreich aktualisiert.',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Passwort konnte nicht geaendert werden.',
        variant: 'destructive',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      navigate('/login')
    } catch {
      toast({
        title: 'Fehler',
        description: 'Abmeldung fehlgeschlagen.',
        variant: 'destructive',
      })
      setLoggingOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'LOESCHEN') return

    toast({
      title: 'Hinweis',
      description: 'Bitte kontaktieren Sie den Support, um Ihr Konto zu loeschen: support@fintutto.de',
    })
    setShowDeleteConfirm(false)
    setDeleteConfirmText('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihr Konto und Ihre Einstellungen
        </p>
      </div>

      <Tabs defaultValue="profil" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profil">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="abo">
            <CreditCard className="h-4 w-4 mr-2" />
            Abo & Limits
          </TabsTrigger>
          <TabsTrigger value="benachrichtigungen">
            <Bell className="h-4 w-4 mr-2" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="darstellung">
            <Sun className="h-4 w-4 mr-2" />
            Darstellung
          </TabsTrigger>
          <TabsTrigger value="sicherheit">
            <Shield className="h-4 w-4 mr-2" />
            Sicherheit
          </TabsTrigger>
        </TabsList>

        {/* Profil Tab */}
        <TabsContent value="profil">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Ihre persoenlichen Informationen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Name</Label>
                  <Input
                    id="settings-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ihr Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">E-Mail</Label>
                  <Input
                    id="settings-email"
                    value={user?.email || profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Die E-Mail-Adresse kann nicht geaendert werden.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Benutzer-ID</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={user?.id || ''}
                      disabled
                      className="bg-muted font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyId}
                      aria-label="Benutzer-ID kopieren"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    'Speichern'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Abo & Limits Tab */}
        <TabsContent value="abo">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Aktuelles Abo</CardTitle>
                    <CardDescription>Ihr aktueller Tarif und Verbrauch</CardDescription>
                  </div>
                  <Badge variant={tier === 'free' ? 'secondary' : 'default'} className="text-sm">
                    {TIER_LABELS[tier]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Bescheid-Pruefungen</p>
                    <p className="text-2xl font-bold mt-1">
                      {limits.checks === -1 ? 'Unbegrenzt' : `${limits.checks} / Monat`}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Einspruch-Generierungen</p>
                    <p className="text-2xl font-bold mt-1">
                      {limits.einsprueche === -1 ? 'Unbegrenzt' : `${limits.einsprueche} / Monat`}
                    </p>
                  </div>
                </div>

                {profile?.referralCredits != null && profile.referralCredits > 0 && (
                  <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-4">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Referral-Credits: {profile.referralCredits}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Zusaetzliche Pruefungen durch Empfehlungen verdient
                    </p>
                  </div>
                )}

                {tier !== 'professional' && (
                  <Link to="/upgrade">
                    <Button className="w-full sm:w-auto">
                      Auf Premium upgraden
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarif-Vergleich</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Feature</th>
                        <th className="text-center py-2 px-4">Kostenlos</th>
                        <th className="text-center py-2 px-4">Basic</th>
                        <th className="text-center py-2 px-4">Premium</th>
                        <th className="text-center py-2 px-4">Professional</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-4">Bescheid-Pruefungen</td>
                        <td className="text-center py-2 px-4">3/Monat</td>
                        <td className="text-center py-2 px-4">20/Monat</td>
                        <td className="text-center py-2 px-4">100/Monat</td>
                        <td className="text-center py-2 px-4">Unbegrenzt</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4">Einspruch-Generierung</td>
                        <td className="text-center py-2 px-4">-</td>
                        <td className="text-center py-2 px-4">5/Monat</td>
                        <td className="text-center py-2 px-4">50/Monat</td>
                        <td className="text-center py-2 px-4">Unbegrenzt</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4">Fristen-Erinnerungen</td>
                        <td className="text-center py-2 px-4">E-Mail</td>
                        <td className="text-center py-2 px-4">E-Mail</td>
                        <td className="text-center py-2 px-4">E-Mail + Push</td>
                        <td className="text-center py-2 px-4">E-Mail + Push</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">Support</td>
                        <td className="text-center py-2 px-4">Community</td>
                        <td className="text-center py-2 px-4">E-Mail</td>
                        <td className="text-center py-2 px-4">Prioritaet</td>
                        <td className="text-center py-2 px-4">Persoenlich</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Benachrichtigungen Tab */}
        <TabsContent value="benachrichtigungen">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungen</CardTitle>
              <CardDescription>
                Legen Sie fest, worueber Sie informiert werden moechten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationToggle
                label="Fristen-Erinnerungen"
                description="E-Mail bei ablaufenden Fristen (7 Tage / 3 Tage / 1 Tag vorher)"
                checked={notifFristen}
                onChange={setNotifFristen}
              />
              <Separator />
              <NotificationToggle
                label="Analyse-Ergebnisse"
                description="E-Mail wenn eine Bescheid-Analyse abgeschlossen ist"
                checked={notifAnalyse}
                onChange={setNotifAnalyse}
              />
              <Separator />
              <NotificationToggle
                label="Referral-Updates"
                description="E-Mail wenn ein geworbener Nutzer sich registriert"
                checked={notifReferral}
                onChange={setNotifReferral}
              />
              <Separator />
              <NotificationToggle
                label="Newsletter & Updates"
                description="Neuigkeiten und Tipps rund um Steuerbescheide"
                checked={notifNewsletter}
                onChange={setNotifNewsletter}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Darstellung Tab */}
        <TabsContent value="darstellung">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Farbschema</CardTitle>
                <CardDescription>
                  Waehlen Sie zwischen hellem und dunklem Erscheinungsbild
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      theme === 'light' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                    }`}
                    aria-label="Helles Design"
                  >
                    <Sun className="h-6 w-6" />
                    <span className="text-sm font-medium">Hell</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      theme === 'dark' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                    }`}
                    aria-label="Dunkles Design"
                  >
                    <Moon className="h-6 w-6" />
                    <span className="text-sm font-medium">Dunkel</span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      theme === 'system' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                    }`}
                    aria-label="Systemeinstellung verwenden"
                  >
                    <Monitor className="h-6 w-6" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schriftgroesse</CardTitle>
                <CardDescription>
                  Passen Sie die Schriftgroesse fuer bessere Lesbarkeit an
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      fontSize === 'normal' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                    }`}
                    aria-label="Normale Schriftgroesse"
                  >
                    <Type className="h-5 w-5" />
                    <span className="text-sm font-medium">Normal</span>
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      fontSize === 'large' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                    }`}
                    aria-label="Grosse Schrift"
                  >
                    <Type className="h-6 w-6" />
                    <span className="text-sm font-medium">Gross</span>
                  </button>
                  <button
                    onClick={() => setFontSize('xlarge')}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      fontSize === 'xlarge' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                    }`}
                    aria-label="Sehr grosse Schrift"
                  >
                    <Type className="h-7 w-7" />
                    <span className="text-sm font-medium">Sehr gross</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Die Schriftgroesse wird sofort angewendet und gespeichert.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sicherheit Tab */}
        <TabsContent value="sicherheit">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Passwort aendern</CardTitle>
                <CardDescription>
                  Aendern Sie Ihr Passwort regelmaessig fuer mehr Sicherheit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Neues Passwort</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Min. 6 Zeichen"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Neues Passwort wiederholen</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Passwort bestaetigen"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={changingPassword || !newPassword || !confirmPassword}>
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Aendern...
                      </>
                    ) : (
                      'Passwort aendern'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Konto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Abmelden</p>
                    <p className="text-xs text-muted-foreground">
                      Von diesem Geraet abmelden
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
                    {loggingOut ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-2" />
                    )}
                    Abmelden
                  </Button>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-destructive">Konto loeschen</p>
                      <p className="text-xs text-muted-foreground">
                        Alle Daten unwiderruflich loeschen
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    >
                      Konto loeschen
                    </Button>
                  </div>

                  {showDeleteConfirm && (
                    <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">
                            Sind Sie sicher? Diese Aktion kann nicht rueckgaengig gemacht werden.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Alle Ihre Bescheide, Analysen, Einsprueche und Credits werden dauerhaft geloescht.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirm" className="text-xs">
                          Geben Sie <strong>LOESCHEN</strong> ein, um zu bestaetigen
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="delete-confirm"
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            placeholder="LOESCHEN"
                            className="max-w-[200px]"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteConfirmText !== 'LOESCHEN'}
                            onClick={handleDeleteAccount}
                          >
                            Unwiderruflich loeschen
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={`${label} ${checked ? 'deaktivieren' : 'aktivieren'}`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-input'
        }`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
