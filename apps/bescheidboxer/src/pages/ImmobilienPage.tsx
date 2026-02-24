import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Home,
  MapPin,
  DoorOpen,
  Euro,
  Calendar,
  FileText,
  ChevronRight,
  Plus,
  Search,
  Layers,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { useBescheidContext } from '../contexts/BescheidContext'
import { formatCurrency } from '../lib/utils'
import type { PropertyType } from '../types/database'
import { PROPERTY_TYPE_LABELS } from '../types/database'

// Demo properties linked to Bescheide (property_id FK in tax_notices)
interface Property {
  id: string
  name: string
  street: string
  houseNumber: string
  postalCode: string
  city: string
  propertyType: PropertyType
  yearBuilt: number | null
  livingSpace: number | null
  numberOfUnits: number
  purchasePrice: number | null
  linkedBescheidIds: string[]
}

const DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Musterhaus Berlin',
    street: 'Musterstrasse',
    houseNumber: '42',
    postalCode: '10115',
    city: 'Berlin',
    propertyType: 'apartment_building',
    yearBuilt: 1985,
    livingSpace: 480,
    numberOfUnits: 6,
    purchasePrice: 850000,
    linkedBescheidIds: [],
  },
  {
    id: 'prop-2',
    name: 'Eigentumswohnung Muenchen',
    street: 'Leopoldstrasse',
    houseNumber: '17a',
    postalCode: '80802',
    city: 'Muenchen',
    propertyType: 'single_family',
    yearBuilt: 2010,
    livingSpace: 95,
    numberOfUnits: 1,
    purchasePrice: 520000,
    linkedBescheidIds: [],
  },
  {
    id: 'prop-3',
    name: 'Gewerbeeinheit Hamburg',
    street: 'Hafenstrasse',
    houseNumber: '8',
    postalCode: '20459',
    city: 'Hamburg',
    propertyType: 'commercial',
    yearBuilt: 2001,
    livingSpace: 220,
    numberOfUnits: 2,
    purchasePrice: 380000,
    linkedBescheidIds: [],
  },
]

const TYPE_ICONS: Record<PropertyType, typeof Building2> = {
  apartment_building: Building2,
  single_family: Home,
  commercial: Layers,
  mixed: Building2,
}

const TYPE_COLORS: Record<PropertyType, string> = {
  apartment_building: 'text-fintutto-blue-500',
  single_family: 'text-green-500',
  commercial: 'text-purple-500',
  mixed: 'text-amber-500',
}

export default function ImmobilienPage() {
  const { bescheide } = useBescheidContext()
  const [searchQuery, setSearchQuery] = useState('')

  // Link Bescheide to properties (by Grundsteuer type, simulated)
  const propertiesWithBescheide = useMemo(() => {
    const grundsteuerBescheide = bescheide.filter(b => b.typ === 'grundsteuer')

    return DEMO_PROPERTIES.map((p, i) => ({
      ...p,
      linkedBescheidIds: grundsteuerBescheide.slice(i, i + 1).map(b => b.id),
    }))
  }, [bescheide])

  const filtered = useMemo(() => {
    if (searchQuery.length < 2) return propertiesWithBescheide
    const q = searchQuery.toLowerCase()
    return propertiesWithBescheide.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.street.toLowerCase().includes(q)
    )
  }, [propertiesWithBescheide, searchQuery])

  // Stats
  const totalValue = propertiesWithBescheide.reduce((s, p) => s + (p.purchasePrice || 0), 0)
  const totalUnits = propertiesWithBescheide.reduce((s, p) => s + p.numberOfUnits, 0)
  const linkedBescheideCount = propertiesWithBescheide.reduce((s, p) => s + p.linkedBescheidIds.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            Immobilien
          </h1>
          <p className="text-muted-foreground mt-1">
            Ihre Immobilien mit verknuepften Steuerbescheiden
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Immobilie hinzufuegen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2">
                <Building2 className="h-4 w-4 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{propertiesWithBescheide.length}</p>
                <p className="text-xs text-muted-foreground">Immobilien</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2">
                <DoorOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{totalUnits}</p>
                <p className="text-xs text-muted-foreground">Einheiten</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 p-2">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
                <p className="text-xs text-muted-foreground">Gesamtwert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
                <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{linkedBescheideCount}</p>
                <p className="text-xs text-muted-foreground">Verknuepfte Bescheide</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Immobilie suchen (Name, Stadt, Strasse)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Properties */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Keine Immobilien gefunden</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(property => {
            const Icon = TYPE_ICONS[property.propertyType]
            const color = TYPE_COLORS[property.propertyType]
            const linkedBescheide = bescheide.filter(b =>
              property.linkedBescheidIds.includes(b.id)
            )

            return (
              <Card key={property.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="rounded-xl bg-muted p-3 shrink-0">
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {PROPERTY_TYPE_LABELS[property.propertyType]}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5" />
                        {property.street} {property.houseNumber}, {property.postalCode} {property.city}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Einheiten</p>
                          <p className="font-medium flex items-center gap-1">
                            <DoorOpen className="h-3.5 w-3.5" />
                            {property.numberOfUnits}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Wohnflaeche</p>
                          <p className="font-medium">
                            {property.livingSpace ? `${property.livingSpace} m²` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Baujahr</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {property.yearBuilt || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Kaufpreis</p>
                          <p className="font-medium flex items-center gap-1">
                            <Euro className="h-3.5 w-3.5" />
                            {property.purchasePrice ? formatCurrency(property.purchasePrice) : '-'}
                          </p>
                        </div>
                      </div>

                      {/* Linked Bescheide */}
                      {linkedBescheide.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/60">
                          <p className="text-xs text-muted-foreground mb-2">Verknuepfte Steuerbescheide:</p>
                          <div className="flex flex-wrap gap-2">
                            {linkedBescheide.map(b => (
                              <Link
                                key={b.id}
                                to={`/bescheide/${b.id}`}
                                className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs hover:bg-accent transition-colors"
                              >
                                <FileText className="h-3 w-3" />
                                {b.titel} ({b.steuerjahr})
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Info Box */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Warum Immobilien verknuepfen?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-fintutto-blue-500 mt-0.5 shrink-0" />
              <p>Grundsteuer- und Grunderwerbsteuerbescheide werden automatisch Ihren Immobilien zugeordnet.</p>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <p>Verfolgen Sie die Steuerbelastung pro Immobilie im Zeitverlauf und erkennen Sie Einsparpotenziale.</p>
            </div>
            <div className="flex items-start gap-2">
              <Layers className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <p>Cross-App-Integration: Ihre Immobilien-Daten werden mit dem Fintutto-Oekosystem geteilt.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
