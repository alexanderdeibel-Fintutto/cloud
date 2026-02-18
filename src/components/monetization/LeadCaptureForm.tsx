import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { Scale, Home, Wrench, TrendingUp, CheckCircle, Loader2, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const leadSchema = z.object({
  name: z.string().min(2, 'Bitte geben Sie Ihren Namen ein'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  phone: z.string().optional(),
  plz: z.string().regex(/^\d{5}$/, 'Bitte geben Sie eine gültige PLZ ein'),
})

type LeadFormData = z.infer<typeof leadSchema>

export type LeadType = 'anwalt' | 'makler' | 'handwerker' | 'finanzberater'

interface LeadCaptureFormProps {
  leadType: LeadType
  checkerType: string
  checkerResultId?: string
  context?: Record<string, unknown>
}

const LEAD_CONFIG: Record<LeadType, {
  title: string
  subtitle: string
  icon: typeof Scale
  color: string
  bgGradient: string
  benefits: string[]
}> = {
  anwalt: {
    title: 'Kostenlose Anwalts-Vermittlung',
    subtitle: 'Wir verbinden Sie mit spezialisierten Mietrecht-Anwälten in Ihrer Region.',
    icon: Scale,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 via-white to-indigo-50',
    benefits: [
      'Kostenlose Ersteinschätzung',
      'Spezialisiert auf Mietrecht',
      'Anwälte in Ihrer Nähe',
      'Innerhalb von 24h Rückmeldung',
    ],
  },
  makler: {
    title: 'Makler in Ihrer Nähe',
    subtitle: 'Finden Sie einen qualifizierten Immobilienmakler für Ihre Bedürfnisse.',
    icon: Home,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-50 via-white to-green-50',
    benefits: [
      'Geprüfte Makler',
      'Lokale Marktkenntnis',
      'Kostenlose Beratung',
      'Schnelle Vermittlung',
    ],
  },
  handwerker: {
    title: 'Handwerker-Vermittlung',
    subtitle: 'Qualifizierte Handwerker aus Ihrer Region für Reparaturen und Renovierungen.',
    icon: Wrench,
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 via-white to-amber-50',
    benefits: [
      'Geprüfte Handwerker',
      'Kostenlose Angebote',
      'Schnelle Verfügbarkeit',
      'Faire Preise',
    ],
  },
  finanzberater: {
    title: 'Finanzberatung für Immobilien',
    subtitle: 'Unabhängige Finanzberater für Ihre Immobilieninvestition.',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 via-white to-violet-50',
    benefits: [
      'Unabhängige Beratung',
      'Über 500 Bankpartner',
      'Persönlicher Ansprechpartner',
      'Kostenloser Finanzierungscheck',
    ],
  },
}

// Welcher Lead-Typ passt zu welchem Checker/Rechner
export const CHECKER_LEAD_MAPPING: Record<string, LeadType[]> = {
  // Checker (Mieter) → Anwalt
  mietpreisbremse: ['anwalt'],
  mieterhoehung: ['anwalt'],
  nebenkosten: ['anwalt'],
  betriebskosten: ['anwalt'],
  kuendigung: ['anwalt', 'makler'],
  kaution: ['anwalt'],
  mietminderung: ['anwalt', 'handwerker'],
  eigenbedarf: ['anwalt', 'makler'],
  modernisierung: ['anwalt', 'handwerker'],
  schoenheitsreparaturen: ['handwerker', 'anwalt'],
  // Rechner (Vermieter) → Makler, Finanzberater
  kaution_rechner: ['makler'],
  mieterhoehung_rechner: ['anwalt'],
  kaufnebenkosten: ['finanzberater', 'makler'],
  eigenkapital: ['finanzberater'],
  grundsteuer: ['finanzberater'],
  rendite: ['finanzberater', 'makler'],
  nebenkosten_rechner: ['handwerker'],
}

export default function LeadCaptureForm({
  leadType,
  checkerType,
  checkerResultId,
  context,
}: LeadCaptureFormProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const config = LEAD_CONFIG[leadType]
  const Icon = config.icon

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      email: user?.email || '',
    },
  })

  const onSubmit = async (data: LeadFormData) => {
    setStatus('loading')
    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          leadType,
          checkerType,
          checkerResultId,
          userId: user?.id,
          context,
        }),
      })

      if (response.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <AnimatePresence mode="wait">
      {status === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  Anfrage erfolgreich gesendet!
                </h3>
                <p className="text-green-700 max-w-md">
                  Wir haben Ihre Anfrage erhalten und vermitteln Sie schnellstmöglich
                  an einen passenden {leadType === 'anwalt' ? 'Anwalt' : leadType === 'makler' ? 'Makler' : leadType === 'handwerker' ? 'Handwerker' : 'Finanzberater'} in Ihrer Region.
                  Sie erhalten innerhalb von 24 Stunden eine Rückmeldung.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`border-2 bg-gradient-to-br ${config.bgGradient}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3 mb-1">
                <div className={`p-2 rounded-lg bg-white shadow-sm ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-0.5">{config.subtitle}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Benefits */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {config.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="lead-name" className="text-xs font-medium text-gray-700">
                      Name *
                    </Label>
                    <Input
                      id="lead-name"
                      placeholder="Ihr Name"
                      {...register('name')}
                      className="mt-1 bg-white"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lead-email" className="text-xs font-medium text-gray-700">
                      E-Mail *
                    </Label>
                    <Input
                      id="lead-email"
                      type="email"
                      placeholder="ihre@email.de"
                      {...register('email')}
                      className="mt-1 bg-white"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="lead-phone" className="text-xs font-medium text-gray-700">
                      Telefon <span className="text-gray-400">(optional)</span>
                    </Label>
                    <Input
                      id="lead-phone"
                      type="tel"
                      placeholder="+49 ..."
                      {...register('phone')}
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead-plz" className="text-xs font-medium text-gray-700">
                      PLZ *
                    </Label>
                    <Input
                      id="lead-plz"
                      placeholder="z.B. 10115"
                      maxLength={5}
                      {...register('plz')}
                      className="mt-1 bg-white"
                    />
                    {errors.plz && (
                      <p className="text-xs text-red-600 mt-1">{errors.plz.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="fintutto"
                  className="w-full"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  {status === 'loading' ? 'Wird gesendet...' : 'Kostenlos vermitteln lassen'}
                </Button>

                {status === 'error' && (
                  <p className="text-xs text-red-600 text-center">
                    Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.
                  </p>
                )}

                <p className="text-[10px] text-gray-400 text-center">
                  Kostenlos und unverbindlich. Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
