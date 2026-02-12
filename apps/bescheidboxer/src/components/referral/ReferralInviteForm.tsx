import { useState } from 'react'
import { Send, UserPlus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useToast } from '../../hooks/use-toast'

interface ReferralInviteFormProps {
  onInvite: (email: string) => void | Promise<unknown>
}

export default function ReferralInviteForm({ onInvite }: ReferralInviteFormProps) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: 'Ungueltige E-Mail',
        description: 'Bitte geben Sie eine gueltige E-Mail-Adresse ein.',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    try {
      await onInvite(email)
      toast({
        title: 'Einladung gesendet!',
        description: `Eine Einladung wurde an ${email} gesendet.`,
      })
      setEmail('')
    } catch {
      toast({
        title: 'Fehler',
        description: 'Einladung konnte nicht gesendet werden.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Direkt einladen
        </CardTitle>
        <CardDescription>
          Senden Sie eine Einladung per E-Mail an Freunde oder Kollegen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="invite-email" className="sr-only">E-Mail-Adresse</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="E-Mail-Adresse eingeben..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>
          <Button type="submit" disabled={sending || !email.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            Einladen
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
