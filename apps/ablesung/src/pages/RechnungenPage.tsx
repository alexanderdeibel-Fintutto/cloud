import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, ScanLine, FileText, Zap, Flame, Droplets,
  ThermometerSun, Search, Filter, Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BILL_TYPE_LABELS, type BillType } from '@/lib/ocr'

const BILL_TYPE_ICONS: Record<BillType, typeof Zap> = {
  strom: Zap,
  gas: Flame,
  wasser: Droplets,
  fernwaerme: ThermometerSun,
  heizoel: Flame,
}

const BILL_TYPE_COLORS: Record<BillType, string> = {
  strom: 'bg-yellow-100 text-yellow-700',
  gas: 'bg-orange-100 text-orange-700',
  wasser: 'bg-blue-100 text-blue-700',
  fernwaerme: 'bg-red-100 text-red-700',
  heizoel: 'bg-amber-100 text-amber-700',
}

// Demo data for display
interface RechnungEntry {
  id: string
  provider: string
  billType: BillType
  billNumber: string
  billDate: string
  consumption: number
  unit: string
  totalGross: number
  balance: number
  confidence: number
}

const demoRechnungen: RechnungEntry[] = [
  {
    id: '1', provider: 'Vattenfall', billType: 'strom', billNumber: 'R-2025-4521',
    billDate: '2025-12-15', consumption: 3200, unit: 'kWh', totalGross: 1152.00, balance: 72.00, confidence: 92,
  },
  {
    id: '2', provider: 'GASAG', billType: 'gas', billNumber: 'R-2025-8834',
    billDate: '2025-11-30', consumption: 15600, unit: 'kWh', totalGross: 2106.00, balance: -48.50, confidence: 88,
  },
  {
    id: '3', provider: 'BWB', billType: 'wasser', billNumber: 'R-2025-3312',
    billDate: '2025-10-01', consumption: 112, unit: 'm³', totalGross: 548.80, balance: 15.20, confidence: 85,
  },
]

const filterOptions: { value: BillType | 'alle'; label: string }[] = [
  { value: 'alle', label: 'Alle Typen' },
  { value: 'strom', label: 'Strom' },
  { value: 'gas', label: 'Gas' },
  { value: 'wasser', label: 'Wasser' },
  { value: 'fernwaerme', label: 'Fernwärme' },
  { value: 'heizoel', label: 'Heizöl' },
]

export default function RechnungenPage() {
  const [filterType, setFilterType] = useState<BillType | 'alle'>('alle')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = demoRechnungen.filter((r) => {
    if (filterType !== 'alle' && r.billType !== filterType) return false
    if (searchQuery && !r.provider.toLowerCase().includes(searchQuery.toLowerCase()) && !r.billNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div>
      {/* Hero */}
      <section className="gradient-energy py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Rechnungen</h1>
                <p className="text-white/80">Alle gescannten Versorger-Rechnungen</p>
              </div>
            </div>
            <Button asChild className="bg-white text-primary hover:bg-white/90 hidden md:flex">
              <Link to="/ocr">
                <Plus className="h-4 w-4 mr-2" />
                Neue Rechnung
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Versorger oder Rechnungsnummer suchen..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterType === opt.value
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{demoRechnungen.length}</p>
                <p className="text-xs text-muted-foreground">Rechnungen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">
                  {formatCurrency(demoRechnungen.reduce((sum, r) => sum + r.totalGross, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Gesamtkosten</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className={`text-2xl font-bold ${
                  demoRechnungen.reduce((sum, r) => sum + r.balance, 0) > 0
                    ? 'text-destructive' : 'text-green-600'
                }`}>
                  {formatCurrency(Math.abs(demoRechnungen.reduce((sum, r) => sum + r.balance, 0)))}
                </p>
                <p className="text-xs text-muted-foreground">Saldo</p>
              </CardContent>
            </Card>
          </div>

          {/* Rechnungen List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="py-12 text-center">
                  <ScanLine className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterType !== 'alle'
                      ? 'Keine Rechnungen gefunden'
                      : 'Noch keine Rechnungen gescannt'}
                  </p>
                  <Button asChild>
                    <Link to="/ocr">Erste Rechnung scannen</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filtered.map((rechnung) => {
                const Icon = BILL_TYPE_ICONS[rechnung.billType]
                return (
                  <Card key={rechnung.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${BILL_TYPE_COLORS[rechnung.billType]}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{rechnung.provider}</h3>
                            <span className="text-xs px-2 py-0.5 bg-muted rounded">
                              {BILL_TYPE_LABELS[rechnung.billType]}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {rechnung.billNumber} &middot; {formatDate(rechnung.billDate)}
                          </p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-sm text-muted-foreground">
                            {rechnung.consumption.toLocaleString('de-DE')} {rechnung.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(rechnung.totalGross)}</p>
                          <p className={`text-sm ${rechnung.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {rechnung.balance > 0 ? '+' : ''}{formatCurrency(rechnung.balance)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
