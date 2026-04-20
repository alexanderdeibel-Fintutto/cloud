import { useState } from 'react'
import { Check, Brain, Zap, Search, FileText, Shield, Lock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useOcrUsage } from '@/hooks/useOcrUsage'
import { toast } from 'sonner'

const STRIPE_PRICE_IDS = {
  monthly: 'price_1TNxLf52lqSgjCzehAeGSNuZ',
  yearly: 'price_1TNxLf52lqSgjCzeGQsJE1tm',
}

const freeFeatures = [
  { text: 'Unbegrenzte Dokumente speichern', included: true },
  { text: 'Manuelle Tags & Kategorien', included: true },
  { text: 'Basis-Suche (Dateiname)', included: true },
  { text: 'KI-Texterkennung (OCR)', included: false },
  { text: 'Volltextsuche', included: false },
  { text: 'KI-Zusammenfassungen', included: false },
  { text: 'Mehrseiten-PDF-Verarbeitung', included: false },
]

const proFeatures = [
  { text: 'Alles aus Free', included: true },
  { text: '100 OCR-Seiten/Monat inklusive', included: true, highlight: true },
  { text: 'KI-Texterkennung via Claude Vision', included: true, highlight: true },
  { text: 'Volltextsuche in allen Dokumenten', included: true },
  { text: 'Automatische KI-Zusammenfassungen', included: true },
  { text: 'Mehrseiten-PDFs (bis 50 MB)', included: true },
  { text: 'DSGVO: kein KI-Training mit Ihren Daten', included: true },
]

export default function PricingPage() {
  const { user } = useAuth()
  const { tierSupportsOcr, tierName } = useOcrUsage()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState(false)

  const isCurrentPro = tierSupportsOcr && tierName === 'secondbrain_pro'

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Bitte melden Sie sich an, um fortzufahren.')
      window.location.href = '/login?redirect=/pricing'
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: STRIPE_PRICE_IDS[billingCycle],
          successUrl: `${window.location.origin}/einstellungen?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing`,
          tierId: 'secondbrain_pro',
        },
      })

      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('Keine Checkout-URL erhalten')
      }
    } catch (err) {
      toast.error('Fehler beim Weiterleiten zu Stripe. Bitte versuchen Sie es erneut.')
      console.error('Checkout error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal', {
        body: { returnUrl: `${window.location.origin}/pricing` },
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch {
      toast.error('Fehler beim Öffnen des Kundenportals.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Brain className="w-3.5 h-3.5" />
          SecondBrain Pakete
        </div>
        <h1 className="text-3xl font-bold">Wählen Sie Ihr Paket</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Starten Sie kostenlos und upgraden Sie, wenn Sie KI-Texterkennung und Volltextsuche benötigen.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            billingCycle === 'monthly'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Monatlich
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
            billingCycle === 'yearly'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Jährlich
          <span className="absolute -top-2 -right-2 text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">
            −17%
          </span>
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold">Free</h2>
            </div>
            <p className="text-sm text-muted-foreground">Dokumente speichern & organisieren</p>
          </div>

          <div>
            <span className="text-4xl font-bold">€0</span>
            <span className="text-muted-foreground text-sm ml-1">/Monat</span>
          </div>

          <ul className="space-y-3">
            {freeFeatures.map((f) => (
              <li key={f.text} className="flex items-start gap-2.5">
                {f.included ? (
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                )}
                <span className={cn(
                  'text-sm',
                  f.included ? 'text-foreground' : 'text-muted-foreground/60'
                )}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" disabled={!tierSupportsOcr && !!user}>
            {!user ? 'Kostenlos starten' : !tierSupportsOcr ? 'Aktuelles Paket' : 'Downgrade'}
          </Button>
        </div>

        {/* Pro */}
        <div className="rounded-2xl border-2 border-primary bg-card p-6 space-y-6 relative">
          {/* Popular Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              Empfohlen
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">SecondBrain Pro</h2>
            </div>
            <p className="text-sm text-muted-foreground">KI-gestütztes Dokumentenmanagement</p>
          </div>

          <div>
            <span className="text-4xl font-bold">
              {billingCycle === 'monthly' ? '€9.99' : '€8.25'}
            </span>
            <span className="text-muted-foreground text-sm ml-1">/Monat</span>
            {billingCycle === 'yearly' && (
              <p className="text-xs text-green-500 mt-1">€99.00/Jahr — 2 Monate gratis</p>
            )}
          </div>

          <ul className="space-y-3">
            {proFeatures.map((f) => (
              <li key={f.text} className="flex items-start gap-2.5">
                <Check className={cn(
                  'w-4 h-4 mt-0.5 shrink-0',
                  f.highlight ? 'text-primary' : 'text-green-500'
                )} />
                <span className={cn(
                  'text-sm',
                  f.highlight ? 'text-foreground font-medium' : 'text-foreground'
                )}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          {isCurrentPro ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleManageSubscription}
              disabled={isLoading}
            >
              Abonnement verwalten
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="glow"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Weiterleitung…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Jetzt upgraden
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
        <h3 className="text-sm font-semibold">Häufige Fragen</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              q: 'Was passiert wenn mein OCR-Kontingent erschöpft ist?',
              a: 'Neue Dokumente können weiterhin hochgeladen werden — nur die OCR-Texterkennung wird bis zum 1. des Folgemonats pausiert.',
            },
            {
              q: 'Wie genau ist die KI-Texterkennung?',
              a: 'Wir nutzen Claude Vision von Anthropic. Die Erkennungsrate liegt bei >95% für klare Dokumente.',
            },
            {
              q: 'Kann ich jederzeit kündigen?',
              a: 'Ja, Sie können jederzeit über das Kundenportal kündigen. Das Abonnement läuft bis zum Ende der bezahlten Periode.',
            },
            {
              q: 'Werden meine Dokumente für KI-Training genutzt?',
              a: 'Nein. Ihre Dokumente werden ausschließlich für die OCR-Verarbeitung genutzt und nicht für KI-Training verwendet.',
            },
          ].map((item) => (
            <div key={item.q} className="space-y-1">
              <p className="text-sm font-medium flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                {item.q}
              </p>
              <p className="text-xs text-muted-foreground pl-5">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
