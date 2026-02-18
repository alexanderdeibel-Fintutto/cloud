import { useEffect, useState } from 'react'
import { useAuth, useAppConfig, getSupabase } from '@fintutto/core'
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@fintutto/ui'
import {
  Home,
  CreditCard,
  CalendarClock,
  AlertTriangle,
  ArrowRight,
  Gauge,
  FileText,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface TenantDashboardData {
  apartment: {
    unitNumber: string
    floor: string | null
    area: number | null
    buildingName: string
    street: string
    city: string
  } | null
  currentRent: number
  nextPaymentDate: string | null
  openDefects: number
  recentDefects: Array<{
    id: string
    title: string
    priority: string
    status: string
    created_at: string
  }>
}

function formatEuro(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const config = useAppConfig()
  const [data, setData] = useState<TenantDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return
      setIsLoading(true)

      try {
        const supabase = getSupabase()

        // Lade den Mietvertrag des aktuellen Mieters mit Unit und Building
        const { data: leases } = await supabase
          .from('leases')
          .select(`
            id,
            rent_amount,
            start_date,
            end_date,
            unit_id,
            units (
              id,
              unit_number,
              floor,
              area_sqm,
              building_id,
              buildings (
                id,
                name,
                street,
                city
              )
            )
          `)
          .eq('tenant_id', user.id)
          .eq('status', 'active')
          .limit(1)

        const lease = leases?.[0]
        const unit = lease?.units as any
        const building = unit?.buildings as any

        // Berechne naechstes Zahlungsdatum (1. des naechsten Monats)
        const now = new Date()
        const nextPayment = new Date(now.getFullYear(), now.getMonth() + 1, 1)

        // Lade offene Maengel/Aufgaben des Mieters
        const { data: defects, count: defectCount } = await supabase
          .from('tasks')
          .select('id, title, priority, status, created_at', { count: 'exact' })
          .eq('created_by', user.id)
          .eq('source', 'tenant')
          .in('status', ['open', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(5)

        setData({
          apartment: unit ? {
            unitNumber: unit.unit_number,
            floor: unit.floor,
            area: unit.area_sqm,
            buildingName: building?.name ?? '',
            street: building?.street ?? '',
            city: building?.city ?? '',
          } : null,
          currentRent: lease?.rent_amount ?? 0,
          nextPaymentDate: nextPayment.toISOString(),
          openDefects: defectCount ?? 0,
          recentDefects: defects ?? [],
        })
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [user])

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
          Willkommen im {config.displayName}
        </p>
      </div>

      {/* KPI-Karten */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Meine Wohnung */}
        <Link to="/apartment">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg p-2.5 bg-emerald-50 dark:bg-emerald-950">
                <Home className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Meine Wohnung</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : data?.apartment ? (
                  <>
                    <p className="text-lg font-bold">Whg. {data.apartment.unitNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {data.apartment.buildingName}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Kein Mietvertrag</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>

        {/* Aktuelle Miete */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg p-2.5 bg-blue-50 dark:bg-blue-950">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Aktuelle Miete</p>
              {isLoading ? (
                <Skeleton className="h-7 w-20 mt-1" />
              ) : (
                <p className="text-lg font-bold">
                  {data?.currentRent ? formatEuro(data.currentRent) : '-- EUR'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Naechste Zahlung */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg p-2.5 bg-amber-50 dark:bg-amber-950">
              <CalendarClock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Naechste Zahlung</p>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mt-1" />
              ) : (
                <p className="text-lg font-bold">
                  {data?.nextPaymentDate ? formatDate(data.nextPaymentDate) : '--'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offene Maengel */}
        <Link to="/defects">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg p-2.5 bg-red-50 dark:bg-red-950">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Offene Maengel</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{data?.openDefects ?? 0}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Detail-Karten */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Gemeldete Maengel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Gemeldete Maengel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : data?.recentDefects && data.recentDefects.length > 0 ? (
              <ul className="space-y-2">
                {data.recentDefects.map((defect) => (
                  <li key={defect.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{defect.title}</span>
                    <Badge
                      variant={
                        defect.priority === 'urgent' ? 'destructive' :
                        defect.priority === 'high' ? 'warning' : 'secondary'
                      }
                    >
                      {defect.priority === 'urgent' ? 'Dringend' :
                       defect.priority === 'high' ? 'Hoch' :
                       defect.priority === 'normal' ? 'Normal' : 'Niedrig'}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Keine offenen Maengel.</p>
            )}
            <Link to="/defects" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Alle Maengel <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Schnellzugriff */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Schnellzugriff
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/meters"
              className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
            >
              <Gauge className="h-4 w-4 text-primary" />
              <span>Zaehlerstaende ablesen</span>
              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
            </Link>
            <Link
              to="/documents"
              className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>Meine Dokumente</span>
              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
            </Link>
            <Link
              to="/defects"
              className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
            >
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span>Mangel melden</span>
              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Wohnungsinfo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Home className="h-4 w-4" />
              Wohnungsinfo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : data?.apartment ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Adresse</span>
                  <span className="font-medium text-right">{data.apartment.street}, {data.apartment.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Einheit</span>
                  <span className="font-medium">{data.apartment.unitNumber}</span>
                </div>
                {data.apartment.floor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Etage</span>
                    <span className="font-medium">{data.apartment.floor}</span>
                  </div>
                )}
                {data.apartment.area && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flaeche</span>
                    <span className="font-medium">{data.apartment.area} m2</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Wohnungsdaten vorhanden.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
