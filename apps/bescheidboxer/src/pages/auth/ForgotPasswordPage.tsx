import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSearch, Loader2, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { supabase } from '../../integrations/supabase/client'
import { useToast } from '../../hooks/use-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      setSent(true)
    } catch (error) {
      toast({
        title: 'Fehler',
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
          <CardTitle className="text-2xl">Passwort vergessen</CardTitle>
          <CardDescription>
            {sent
              ? 'Eine E-Mail zum Zuruecksetzen wurde gesendet'
              : 'Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort zurueckzusetzen'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Falls ein Konto mit der Adresse <strong>{email}</strong> existiert,
                erhalten Sie in Kuerze eine E-Mail mit einem Link zum Zuruecksetzen Ihres Passworts.
              </p>
              <Link to="/login">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Zurueck zur Anmeldung
                </Button>
              </Link>
            </div>
          ) : (
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Senden...
                  </>
                ) : (
                  'Link zum Zuruecksetzen senden'
                )}
              </Button>
            </form>
          )}

          {!sent && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-medium hover:underline">
                Zurueck zur Anmeldung
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
