import { useAuth, useAppConfig, useFeature } from '@fintutto/core'
import { Card, CardHeader, CardTitle, CardContent } from '@fintutto/ui'
import {
  Building2,
  Users,
  Gauge,
  CreditCard,
  Calculator,
  CheckCircle,
  ClipboardList,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface QuickStatProps {
  icon: React.ReactNode
  label: string
  value: string | number
  to: string
  color: string
}

function QuickStat({ icon, label, value, to, color }: QuickStatProps) {
  return (
    <Link to={to}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className={`rounded-lg p-2.5 ${color}`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const config = useAppConfig()
  const hasProperties = useFeature('properties')
  const hasTenants = useFeature('tenants')
  const hasMeters = useFeature('meters')
  const hasPayments = useFeature('payments')
  const hasCalculators = useFeature('calculators')
  const hasCheckers = useFeature('checkers')
  const hasTasks = useFeature('tasks')

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Guten Morgen'
    if (hour < 18) return 'Guten Tag'
    return 'Guten Abend'
  })()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Willkommen bei {config.displayName}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {hasProperties && (
          <QuickStat
            icon={<Building2 className="h-5 w-5 text-blue-600" />}
            label="Immobilien"
            value={0}
            to="/properties"
            color="bg-blue-50 dark:bg-blue-950"
          />
        )}
        {hasTenants && (
          <QuickStat
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            label="Mieter"
            value={0}
            to="/tenants"
            color="bg-emerald-50 dark:bg-emerald-950"
          />
        )}
        {hasMeters && (
          <QuickStat
            icon={<Gauge className="h-5 w-5 text-violet-600" />}
            label="Zähler"
            value={0}
            to="/meters"
            color="bg-violet-50 dark:bg-violet-950"
          />
        )}
        {hasPayments && (
          <QuickStat
            icon={<CreditCard className="h-5 w-5 text-amber-600" />}
            label="Offene Zahlungen"
            value={0}
            to="/payments"
            color="bg-amber-50 dark:bg-amber-950"
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hasTasks && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                Offene Aufgaben
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Keine offenen Aufgaben.</p>
            </CardContent>
          </Card>
        )}
        {hasCalculators && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                Rechner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">7 Rechner verfügbar</p>
              <Link to="/calculators" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                Alle Rechner <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}
        {hasCheckers && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-4 w-4" />
                Checker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">10 Checker verfügbar</p>
              <Link to="/checkers" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                Alle Checker <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
