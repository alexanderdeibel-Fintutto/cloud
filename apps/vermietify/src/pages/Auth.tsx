import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { Building2 } from 'lucide-react'

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password)

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Vermietify</CardTitle>
          <CardDescription>
            {isLogin ? 'Melden Sie sich an' : 'Erstellen Sie ein Konto'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Lädt...' : isLogin ? 'Anmelden' : 'Registrieren'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isLogin ? (
              <p>
                Noch kein Konto?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setIsLogin(false)}
                >
                  Registrieren
                </button>
              </p>
            ) : (
              <p>
                Bereits ein Konto?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setIsLogin(true)}
                >
                  Anmelden
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
