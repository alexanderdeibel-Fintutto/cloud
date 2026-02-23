import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { CreditCard, TrendingUp, ArrowDownCircle, ArrowUpCircle, Filter, Calendar } from 'lucide-react'

interface Zahlung {
  id: string
  datum: string
  beschreibung: string
  kategorie: 'einkommensteuer' | 'grundsteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'solidaritaet' | 'kirchensteuer' | 'erstattung' | 'vorauszahlung'
  betrag: number
  typ: 'belastung' | 'erstattung'
  referenz?: string
  finanzamt?: string
}

const KATEGORIE_LABELS: Record<string, string> = {
  einkommensteuer: 'Einkommensteuer',
  grundsteuer: 'Grundsteuer',
  gewerbesteuer: 'Gewerbesteuer',
  umsatzsteuer: 'Umsatzsteuer',
  solidaritaet: 'Solidaritätszuschlag',
  kirchensteuer: 'Kirchensteuer',
  erstattung: 'Erstattung',
  vorauszahlung: 'Vorauszahlung',
}

const DEMO_ZAHLUNGEN: Zahlung[] = [
  { id: 'z-01', datum: '2026-02-15', beschreibung: 'ESt-Vorauszahlung Q1/2026', kategorie: 'vorauszahlung', betrag: 2400, typ: 'belastung', finanzamt: 'FA Köln-Mitte' },
  { id: 'z-02', datum: '2026-02-10', beschreibung: 'Grundsteuer Q1/2026', kategorie: 'grundsteuer', betrag: 185, typ: 'belastung', finanzamt: 'Stadt Köln' },
  { id: 'z-03', datum: '2026-01-28', beschreibung: 'USt-Erstattung Dezember 2025', kategorie: 'erstattung', betrag: 1840, typ: 'erstattung', referenz: 'RE-2025-12', finanzamt: 'FA Köln-Mitte' },
  { id: 'z-04', datum: '2026-01-15', beschreibung: 'GewSt-Vorauszahlung Q1/2026', kategorie: 'gewerbesteuer', betrag: 950, typ: 'belastung', finanzamt: 'Stadt Köln' },
  { id: 'z-05', datum: '2025-12-15', beschreibung: 'ESt-Nachzahlung 2024', kategorie: 'einkommensteuer', betrag: 3200, typ: 'belastung', referenz: 'ESt-2024', finanzamt: 'FA Köln-Mitte' },
  { id: 'z-06', datum: '2025-12-10', beschreibung: 'SolZ-Erstattung 2024', kategorie: 'erstattung', betrag: 320, typ: 'erstattung', finanzamt: 'FA Köln-Mitte' },
  { id: 'z-07', datum: '2025-11-15', beschreibung: 'ESt-Vorauszahlung Q4/2025', kategorie: 'vorauszahlung', betrag: 2400, typ: 'belastung', finanzamt: 'FA Köln-Mitte' },
  { id: 'z-08', datum: '2025-11-01', beschreibung: 'Grundsteuer Q4/2025', kategorie: 'grundsteuer', betrag: 185, typ: 'belastung', finanzamt: 'Stadt Köln' },
  { id: 'z-09', datum: '2025-10-10', beschreibung: 'USt-Erstattung Q3/2025', kategorie: 'erstattung', betrag: 2100, typ: 'erstattung', finanzamt: 'FA Köln-Mitte' },
  { id: 'z-10', datum: '2025-09-15', beschreibung: 'GewSt-Vorauszahlung Q3/2025', kategorie: 'gewerbesteuer', betrag: 950, typ: 'belastung', finanzamt: 'Stadt Köln' },
  { id: 'z-11', datum: '2025-08-15', beschreibung: 'ESt-Vorauszahlung Q3/2025', kategorie: 'vorauszahlung', betrag: 2400, typ: 'belastung', finanzamt: 'FA Köln-Mitte' },
  { id: 'z-12', datum: '2025-08-01', beschreibung: 'Grundsteuer Q3/2025', kategorie: 'grundsteuer', betrag: 185, typ: 'belastung', finanzamt: 'Stadt Köln' },
  { id: 'z-13', datum: '2025-07-20', beschreibung: 'Kirchensteuer-Erstattung 2024', kategorie: 'erstattung', betrag: 480, typ: 'erstattung', finanzamt: 'FA Köln-Mitte' },
  { id: 'z-14', datum: '2025-06-15', beschreibung: 'GewSt-Vorauszahlung Q2/2025', kategorie: 'gewerbesteuer', betrag: 950, typ: 'belastung', finanzamt: 'Stadt Köln' },
  { id: 'z-15', datum: '2025-05-15', beschreibung: 'ESt-Vorauszahlung Q2/2025', kategorie: 'vorauszahlung', betrag: 2400, typ: 'belastung', finanzamt: 'FA Köln-Mitte' },
]

export default function ZahlungsUebersichtPage() {
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [zeitraum, setZeitraum] = useState<string>('12m')

  const filtered = useMemo(() => {
    const now = new Date()
    const cutoff = new Date()
    if (zeitraum === '3m') cutoff.setMonth(now.getMonth() - 3)
    else if (zeitraum === '6m') cutoff.setMonth(now.getMonth() - 6)
    else if (zeitraum === '12m') cutoff.setFullYear(now.getFullYear() - 1)
    else cutoff.setFullYear(2000)

    return DEMO_ZAHLUNGEN
      .filter(z => {
        const d = new Date(z.datum)
        if (d < cutoff) return false
        if (filterKategorie !== 'alle' && z.kategorie !== filterKategorie) return false
        if (filterTyp !== 'alle' && z.typ !== filterTyp) return false
        return true
      })
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
  }, [filterKategorie, filterTyp, zeitraum])

  const stats = useMemo(() => {
    const belastungen = filtered.filter(z => z.typ === 'belastung').reduce((s, z) => s + z.betrag, 0)
    const erstattungen = filtered.filter(z => z.typ === 'erstattung').reduce((s, z) => s + z.betrag, 0)
    return {
      belastungen,
      erstattungen,
      saldo: erstattungen - belastungen,
      anzahl: filtered.length,
    }
  }, [filtered])

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, Zahlung[]> = {}
    filtered.forEach(z => {
      const d = new Date(z.datum)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!groups[key]) groups[key] = []
      groups[key].push(z)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  const formatMonth = (key: string) => {
    const [year, month] = key.split('-')
    const d = new Date(Number(year), Number(month) - 1)
    return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Zahlungsübersicht</h1>
        <p className="text-muted-foreground mt-1">
          Alle Steuerzahlungen und Erstattungen auf einen Blick
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Belastungen</p>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">
              {stats.belastungen.toLocaleString('de-DE')} €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Erstattungen</p>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {stats.erstattungen.toLocaleString('de-DE')} €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Saldo</p>
            </div>
            <p className={`text-2xl font-bold mt-1 ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.saldo > 0 ? '+' : ''}{stats.saldo.toLocaleString('de-DE')} €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Transaktionen</p>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.anzahl}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Zeitraum</label>
              <select
                value={zeitraum}
                onChange={e => setZeitraum(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="3m">Letzte 3 Monate</option>
                <option value="6m">Letzte 6 Monate</option>
                <option value="12m">Letzte 12 Monate</option>
                <option value="all">Alles</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Kategorie</label>
              <select
                value={filterKategorie}
                onChange={e => setFilterKategorie(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="alle">Alle Kategorien</option>
                {Object.entries(KATEGORIE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Typ</label>
              <select
                value={filterTyp}
                onChange={e => setFilterTyp(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="alle">Alle</option>
                <option value="belastung">Belastungen</option>
                <option value="erstattung">Erstattungen</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zahlungsliste */}
      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Keine Zahlungen im gewählten Zeitraum gefunden.
          </CardContent>
        </Card>
      ) : (
        grouped.map(([monthKey, zahlungen]) => {
          const monthBelastung = zahlungen.filter(z => z.typ === 'belastung').reduce((s, z) => s + z.betrag, 0)
          const monthErstattung = zahlungen.filter(z => z.typ === 'erstattung').reduce((s, z) => s + z.betrag, 0)

          return (
            <Card key={monthKey}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatMonth(monthKey)}
                  </CardTitle>
                  <CardDescription className="text-right">
                    <span className="text-red-600">-{monthBelastung.toLocaleString('de-DE')} €</span>
                    {monthErstattung > 0 && (
                      <span className="text-green-600 ml-3">+{monthErstattung.toLocaleString('de-DE')} €</span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {zahlungen.map(z => (
                    <div key={z.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className={`p-2 rounded-lg ${z.typ === 'erstattung' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        {z.typ === 'erstattung' ? (
                          <ArrowDownCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{z.beschreibung}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{new Date(z.datum).toLocaleDateString('de-DE')}</span>
                          <span>•</span>
                          <span>{KATEGORIE_LABELS[z.kategorie]}</span>
                          {z.finanzamt && (
                            <>
                              <span>•</span>
                              <span>{z.finanzamt}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm font-medium shrink-0 ${z.typ === 'erstattung' ? 'text-green-600' : 'text-red-600'}`}>
                        {z.typ === 'erstattung' ? '+' : '-'}{z.betrag.toLocaleString('de-DE')} €
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
