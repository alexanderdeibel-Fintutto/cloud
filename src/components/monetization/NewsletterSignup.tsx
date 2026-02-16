import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NewsletterSignupProps {
  variant?: 'inline' | 'card'
  source?: string
}

export default function NewsletterSignup({ variant = 'inline', source = 'footer' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setErrorMsg('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), segment: 'general', source }),
      })

      if (response.ok) {
        setStatus('success')
      } else {
        // Fallback: localStorage wenn API nicht erreichbar
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]')
        if (!subscribers.includes(email)) {
          subscribers.push(email)
          localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers))
        }
        setStatus('success')
      }
    } catch {
      // Offline-Fallback
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]')
      if (!subscribers.includes(email)) {
        subscribers.push(email)
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers))
      }
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-2 ${variant === 'card' ? 'p-4 rounded-lg bg-green-50 border border-green-200' : ''}`}>
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <p className="text-sm text-green-700">
          Vielen Dank! Sie erhalten bald Tipps zu Ihren Mietrechten.
        </p>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Mietrecht-Newsletter</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Kostenlose Tipps zu Ihren Mieterrechten, neue Tools und exklusive Angebote.
          Kein Spam, jederzeit abbestellbar.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="ihre@email.de"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
            className="flex-1"
            required
          />
          <Button type="submit" variant="fintutto" disabled={status === 'loading'} className="whitespace-nowrap">
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kostenlos abonnieren'}
          </Button>
        </form>
        {status === 'error' && <p className="text-xs text-red-600 mt-2">{errorMsg}</p>}
        <p className="text-[10px] text-gray-400 mt-2">
          Mit der Anmeldung stimmen Sie unserer Datenschutzerklärung zu.
        </p>
      </div>
    )
  }

  // Inline-Variante (für Footer)
  return (
    <div>
      <h3 className="font-semibold mb-2">Newsletter</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Kostenlose Mietrecht-Tipps direkt in Ihr Postfach.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="ihre@email.de"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
          className="flex-1 h-9 text-sm"
          required
        />
        <Button type="submit" size="sm" variant="fintutto" disabled={status === 'loading'}>
          {status === 'loading' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
        </Button>
      </form>
      {status === 'error' && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
    </div>
  )
}
