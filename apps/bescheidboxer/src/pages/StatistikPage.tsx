import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Euro,
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { useBescheidContext } from '../contexts/BescheidContext'
import { formatCurrency } from '../lib/utils'
import { BESCHEID_TYP_LABELS, BESCHEID_STATUS_LABELS } from '../types/bescheid'
import type { BescheidTyp, BescheidStatus } from '../types/bescheid'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const STATUS_COLORS: Record<string, string> = {
  neu: '#6b7280',
  in_pruefung: '#f59e0b',
  geprueft: '#3b82f6',
  einspruch: '#ef4444',
  erledigt: '#10b981',
}

export default function StatistikPage() {
  const { bescheide, fristen, einsprueche } = useBescheidContext()
  const [zeitraum, setZeitraum] = useState<string>('alle')

  // Filter by year if selected
  const filteredBescheide = useMemo(() => {
    if (zeitraum === 'alle') return bescheide
    return bescheide.filter(b => b.steuerjahr === parseInt(zeitraum))
  }, [bescheide, zeitraum])

  const uniqueYears = useMemo(() => {
    return [...new Set(bescheide.map(b => b.steuerjahr))].sort((a, b) => b - a)
  }, [bescheide])

  // Chart Data: Bescheide nach Steuerart
  const nachTyp = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredBescheide.forEach(b => {
      counts[b.typ] = (counts[b.typ] || 0) + 1
    })
    return Object.entries(counts).map(([typ, count]) => ({
      name: BESCHEID_TYP_LABELS[typ as BescheidTyp] || typ,
      value: count,
    }))
  }, [filteredBescheide])

  // Chart Data: Bescheide nach Status
  const nachStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredBescheide.forEach(b => {
      counts[b.status] = (counts[b.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      name: BESCHEID_STATUS_LABELS[status as BescheidStatus] || status,
      value: count,
      fill: STATUS_COLORS[status] || '#6b7280',
    }))
  }, [filteredBescheide])

  // Chart Data: Steuer nach Jahr
  const steuerNachJahr = useMemo(() => {
    const jahresData: Record<number, { festgesetzt: number; erwartet: number; abweichung: number; count: number }> = {}
    bescheide.forEach(b => {
      if (!jahresData[b.steuerjahr]) {
        jahresData[b.steuerjahr] = { festgesetzt: 0, erwartet: 0, abweichung: 0, count: 0 }
      }
      jahresData[b.steuerjahr].festgesetzt += b.festgesetzteSteuer
      jahresData[b.steuerjahr].erwartet += b.erwarteteSteuer ?? 0
      jahresData[b.steuerjahr].abweichung += b.abweichung ?? 0
      jahresData[b.steuerjahr].count += 1
    })
    return Object.entries(jahresData)
      .map(([year, data]) => ({
        jahr: year,
        festgesetzt: data.festgesetzt,
        erwartet: data.erwartet,
        abweichung: data.abweichung,
        anzahl: data.count,
      }))
      .sort((a, b) => parseInt(a.jahr) - parseInt(b.jahr))
  }, [bescheide])

  // Chart Data: Einsprueche Ergebnis
  const einspruchStats = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    einsprueche.forEach(e => {
      statusCounts[e.status] = (statusCounts[e.status] || 0) + 1
    })
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      value: count,
    }))
  }, [einsprueche])

  // Chart Data: Einsparpotenzial nach Typ
  const einsparungNachTyp = useMemo(() => {
    const data: Record<string, number> = {}
    filteredBescheide.forEach(b => {
      if (b.pruefungsergebnis?.einsparpotenzial) {
        data[b.typ] = (data[b.typ] || 0) + b.pruefungsergebnis.einsparpotenzial
      }
    })
    return Object.entries(data).map(([typ, betrag]) => ({
      name: BESCHEID_TYP_LABELS[typ as BescheidTyp] || typ,
      betrag,
    }))
  }, [filteredBescheide])

  // KPIs
  const totalFestgesetzt = filteredBescheide.reduce((s, b) => s + b.festgesetzteSteuer, 0)
  const totalAbweichung = filteredBescheide.reduce((s, b) => s + (b.abweichung ?? 0), 0)
  const totalEinsparung = filteredBescheide.reduce((s, b) => s + (b.pruefungsergebnis?.einsparpotenzial ?? 0), 0)
  const einspruchQuote = filteredBescheide.length > 0
    ? (filteredBescheide.filter(b => b.status === 'einspruch').length / filteredBescheide.length) * 100
    : 0
  const pruefQuote = filteredBescheide.length > 0
    ? (filteredBescheide.filter(b => b.status !== 'neu').length / filteredBescheide.length) * 100
    : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value > 100
                ? formatCurrency(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Statistiken
          </h1>
          <p className="text-muted-foreground mt-1">
            Detaillierte Auswertung Ihrer Steuerdaten
          </p>
        </div>
        <Select value={zeitraum} onValueChange={setZeitraum}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Jahre</SelectItem>
            {uniqueYears.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-fintutto-blue-500" />
              <span className="text-xs text-muted-foreground">Bescheide</span>
            </div>
            <p className="text-2xl font-bold">{filteredBescheide.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Euro className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Festgesetzt</span>
            </div>
            <p className="text-lg font-bold">{formatCurrency(totalFestgesetzt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              {totalAbweichung >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-red-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-green-500" />
              )}
              <span className="text-xs text-muted-foreground">Abweichung</span>
            </div>
            <p className={`text-lg font-bold ${totalAbweichung > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {formatCurrency(totalAbweichung)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Einsparung</span>
            </div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalEinsparung)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Einspruch-Quote</span>
            </div>
            <p className="text-2xl font-bold">{einspruchQuote.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-fintutto-blue-500" />
              <span className="text-xs text-muted-foreground">Pruef-Quote</span>
            </div>
            <p className="text-2xl font-bold">{pruefQuote.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steuer nach Jahr */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Steuerlast im Jahresvergleich
            </CardTitle>
          </CardHeader>
          <CardContent>
            {steuerNachJahr.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={steuerNachJahr}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="jahr" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="festgesetzt" name="Festgesetzt" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="erwartet" name="Erwartet" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                Noch keine Daten vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        {/* Abweichung im Zeitverlauf */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Abweichungen im Jahresvergleich
            </CardTitle>
          </CardHeader>
          <CardContent>
            {steuerNachJahr.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={steuerNachJahr}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="jahr" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="abweichung"
                    name="Abweichung"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                Noch keine Daten vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bescheide nach Steuerart (Pie) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Nach Steuerart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nachTyp.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={nachTyp}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {nachTyp.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {nachTyp.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Keine Daten
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bescheide nach Status (Pie) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Nach Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nachStatus.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={nachStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {nachStatus.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {nachStatus.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Keine Daten
              </div>
            )}
          </CardContent>
        </Card>

        {/* Einsparpotenzial nach Typ (Bar) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              Einsparung nach Steuerart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {einsparungNachTyp.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={einsparungNachTyp} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" className="text-xs" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="betrag" name="Einsparung" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Keine Analyseergebnisse
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Einspruch-Statistik */}
      {einsprueche.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Einspruch-Statistik
            </CardTitle>
            <CardDescription>
              {einsprueche.length} Einsprueche insgesamt &middot;
              Gesamtforderung: {formatCurrency(einsprueche.reduce((s, e) => s + e.forderung, 0))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {einspruchStats.map((item, i) => (
                <div key={item.name} className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                    {item.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fristen-Uebersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fristen-Uebersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold">{fristen.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Gesamt</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {fristen.filter(f => f.erledigt).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Erledigt</p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {fristen.filter(f => !f.erledigt).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Offen</p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {fristen.filter(f => !f.erledigt && new Date(f.fristdatum) < new Date()).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Ueberfaellig</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
