import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileSearch, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (error) {
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Bitte pruefen Sie Ihre Zugangsdaten.',
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
          <CardTitle className="text-2xl">Anmelden</CardTitle>
          <CardDescription>
            Melden Sie sich bei Ihrem Steuer-Bescheidprüfer-Konto an
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <Link
                  to="/passwort-vergessen"
                  className="text-xs text-primary hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Ihr Passwort"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Anmelden...
                </>
              ) : (
                'Anmelden'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Noch kein Konto?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Kostenlos registrieren
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
