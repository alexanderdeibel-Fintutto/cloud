import { useEffect, useState } from 'react'
import { useAuth, getSupabase } from '@fintutto/core'
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Separator } from '@fintutto/ui'
import { Home, Building2, Calendar, Ruler, MapPin } from 'lucide-react'

interface ApartmentData {
  lease: {
    id: string
    start_date: string
    end_date: string | null
    rent_amount: number
    deposit_amount: number | null
    status: string
  }
  unit: {
    id: string
    unit_number: string
    floor: string | null
    area_sqm: number | null
    rooms: number | null
    type: string | null
  }
  building: {
    id: string
    name: string
    street: string
    zip: string
    city: string
    year_built: number | null
    total_units: number | null
  }
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

export default function ApartmentPage() {
  const { user } = useAuth()
  const [data, setData] = useState<ApartmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadApartment() {
      if (!user) return
      setIsLoading(true)

      try {
        const supabase = getSupabase()

        const { data: leases } = await supabase
          .from('leases')
          .select(`
            id,
            start_date,
            end_date,
            rent_amount,
            deposit_amount,
            status,
            unit_id,
            units (
              id,
              unit_number,
              floor,
              area_sqm,
              rooms,
              type,
              building_id,
              buildings (
                id,
                name,
                street,
                zip,
                city,
                year_built,
                total_units
              )
            )
          `)
          .eq('tenant_id', user.id)
          .eq('status', 'active')
          .limit(1)

        const lease = leases?.[0]
        if (!lease) {
          setData(null)
          return
        }

        const unit = lease.units as any
        const building = unit?.buildings as any

        setData({
          lease: {
            id: lease.id,
            start_date: lease.start_date,
            end_date: lease.end_date,
            rent_amount: lease.rent_amount,
            deposit_amount: lease.deposit_amount,
            status: lease.status,
          },
          unit: {
            id: unit.id,
            unit_number: unit.unit_number,
            floor: unit.floor,
            area_sqm: unit.area_sqm,
            rooms: unit.rooms,
            type: unit.type,
          },
          building: {
            id: building.id,
            name: building.name,
            street: building.street,
            zip: building.zip,
            city: building.city,
            year_built: building.year_built,
            total_units: building.total_units,
          },
        })
      } catch (err) {
        console.error('Apartment load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadApartment()
  }, [user])

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold">Meine Wohnung</h1>
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold">Meine Wohnung</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Kein aktiver Mietvertrag</p>
            <p className="text-sm text-muted-foreground mt-1">
              Es wurde kein aktiver Mietvertrag fuer Ihr Konto gefunden.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Meine Wohnung</h1>

      {/* Einheit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="h-4 w-4" />
            Wohnungsdetails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Einheit</span>
            <span className="text-sm font-medium">{data.unit.unit_number}</span>
          </div>
          <Separator />
          {data.unit.type && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Typ</span>
                <span className="text-sm font-medium">{data.unit.type}</span>
              </div>
              <Separator />
            </>
          )}
          {data.unit.floor && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Etage</span>
                <span className="text-sm font-medium">{data.unit.floor}</span>
              </div>
              <Separator />
            </>
          )}
          {data.unit.rooms && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Zimmer</span>
                <span className="text-sm font-medium">{data.unit.rooms}</span>
              </div>
              <Separator />
            </>
          )}
          {data.unit.area_sqm && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Wohnflaeche</span>
              <span className="text-sm font-medium">{data.unit.area_sqm} m2</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gebaeude */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Gebaeude
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{data.building.name}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Adresse</span>
            <span className="text-sm font-medium text-right">
              {data.building.street}<br />
              {data.building.zip} {data.building.city}
            </span>
          </div>
          <Separator />
          {data.building.year_built && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Baujahr</span>
                <span className="text-sm font-medium">{data.building.year_built}</span>
              </div>
              <Separator />
            </>
          )}
          {data.building.total_units && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Wohneinheiten</span>
              <span className="text-sm font-medium">{data.building.total_units}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mietvertrag */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Mietvertrag
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="success">Aktiv</Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Mietbeginn</span>
            <span className="text-sm font-medium">{formatDate(data.lease.start_date)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Mietende</span>
            <span className="text-sm font-medium">
              {data.lease.end_date ? formatDate(data.lease.end_date) : 'Unbefristet'}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Monatliche Miete</span>
            <span className="text-sm font-bold text-primary">
              {formatEuro(data.lease.rent_amount)}
            </span>
          </div>
          {data.lease.deposit_amount && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Kaution</span>
                <span className="text-sm font-medium">{formatEuro(data.lease.deposit_amount)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
