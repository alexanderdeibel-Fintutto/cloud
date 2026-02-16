import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FileSearch, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../hooks/use-toast'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== passwordConfirm) {
      toast({
        title: 'Fehler',
        description: 'Die Passwoerter stimmen nicht ueberein.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Fehler',
        description: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, name || undefined, referralCode || undefined)
      toast({
        title: 'Registrierung erfolgreich',
        description: 'Bitte pruefen Sie Ihre E-Mail um das Konto zu bestaetigen.',
      })
      navigate('/')
    } catch (error) {
      toast({
        title: 'Registrierung fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fintutto-blue-700 to-fintutto-blue-500">
              <FileSearch className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Konto erstellen</CardTitle>
          <CardDescription>
            Starten Sie jetzt mit dem Bescheidboxer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ihr Name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.de"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 Zeichen"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-confirm">Passwort wiederholen *</Label>
              <Input
                id="password-confirm"
                type="password"
                placeholder="Passwort bestaetigen"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral">Einladungscode (optional)</Label>
              <Input
                id="referral"
                type="text"
                placeholder="z.B. BX4F7K2M"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                className="font-mono tracking-wider"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrieren...
                </>
              ) : (
                'Kostenlos registrieren'
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Mit der Registrierung akzeptieren Sie unsere{' '}
            <a href="https://portal.fintutto.cloud/agb" className="text-primary hover:underline">AGB</a>
            {' '}und{' '}
            <a href="https://portal.fintutto.cloud/datenschutz" className="text-primary hover:underline">Datenschutzerklaerung</a>.
          </p>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Bereits ein Konto?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Anmelden
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
