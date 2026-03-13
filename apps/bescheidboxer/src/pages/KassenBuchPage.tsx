import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { BookOpenCheck, Plus, ArrowUpRight, ArrowDownRight, Trash2, Filter } from 'lucide-react'

interface Buchung {
  id: number
  datum: string
  beschreibung: string
  betrag: number
  typ: 'einnahme' | 'ausgabe'
  kategorie: string
  beleg: string
}

const DEMO_BUCHUNGEN: Buchung[] = [
  { id: 1, datum: '2026-02-01', beschreibung: 'Honorar Webdesign Projekt', betrag: 3500, typ: 'einnahme', kategorie: 'Honorar', beleg: 'RE-2026-001' },
  { id: 2, datum: '2026-02-03', beschreibung: 'Adobe Creative Cloud', betrag: 65.49, typ: 'ausgabe', kategorie: 'Software', beleg: 'AB-2026-015' },
  { id: 3, datum: '2026-02-05', beschreibung: 'Büromaterial Schreibwaren', betrag: 42.80, typ: 'ausgabe', kategorie: 'Büromaterial', beleg: 'KA-2026-008' },
  { id: 4, datum: '2026-02-07', beschreibung: 'Coworking Space Miete', betrag: 450, typ: 'ausgabe', kategorie: 'Miete', beleg: 'MI-2026-002' },
  { id: 5, datum: '2026-02-10', beschreibung: 'Kundenprojekt Logo-Design', betrag: 1200, typ: 'einnahme', kategorie: 'Honorar', beleg: 'RE-2026-002' },
  { id: 6, datum: '2026-02-12', beschreibung: 'Bahnticket Berlin-München', betrag: 89.90, typ: 'ausgabe', kategorie: 'Reise', beleg: 'DB-2026-003' },
  { id: 7, datum: '2026-02-14', beschreibung: 'Telekom Rechnung Februar', betrag: 39.95, typ: 'ausgabe', kategorie: 'Telefon/Internet', beleg: 'TK-2026-002' },
  { id: 8, datum: '2026-02-15', beschreibung: 'Provision Affiliate-Programm', betrag: 280, typ: 'einnahme', kategorie: 'Provision', beleg: 'AF-2026-001' },
  { id: 9, datum: '2026-02-17', beschreibung: 'Geschäftsessen mit Kunde', betrag: 85.60, typ: 'ausgabe', kategorie: 'Bewirtung', beleg: 'BW-2026-001' },
  { id: 10, datum: '2026-02-18', beschreibung: 'Umsatzsteuer-Erstattung Q4/2025', betrag: 520, typ: 'einnahme', kategorie: 'Erstattung', beleg: 'FA-2026-001' },
  { id: 11, datum: '2026-02-19', beschreibung: 'Berufshaftpflicht Rate', betrag: 125, typ: 'ausgabe', kategorie: 'Versicherung', beleg: 'VS-2026-002' },
  { id: 12, datum: '2026-02-20', beschreibung: 'WordPress-Hosting', betrag: 9.99, typ: 'ausgabe', kategorie: 'Software', beleg: 'HO-2026-002' },
]

export default function KassenBuchPage() {
  const [buchungen, setBuchungen] = useState<Buchung[]>(DEMO_BUCHUNGEN)
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return buchungen
      .filter(b => filterTyp === 'alle' || b.typ === filterTyp)
      .filter(b => filterKategorie === 'alle' || b.kategorie === filterKategorie)
      .filter(b => search === '' || b.beschreibung.toLowerCase().includes(search.toLowerCase()) || b.beleg.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.datum.localeCompare(a.datum))
  }, [buchungen, filterTyp, filterKategorie, search])

  const stats = useMemo(() => {
    const einnahmen = buchungen.filter(b => b.typ === 'einnahme').reduce((s, b) => s + b.betrag, 0)
    const ausgaben = buchungen.filter(b => b.typ === 'ausgabe').reduce((s, b) => s + b.betrag, 0)
    return { einnahmen, ausgaben, saldo: einnahmen - ausgaben }
  }, [buchungen])

  const alleKategorien = useMemo(() => {
    return [...new Set(buchungen.map(b => b.kategorie))].sort()
  }, [buchungen])

  const handleDelete = (id: number) => {
    setBuchungen(prev => prev.filter(b => b.id !== id))
  }

  // Running balance
  const sortedForBalance = [...buchungen].sort((a, b) => a.datum.localeCompare(b.datum))
  const balanceMap = new Map<number, number>()
  let runningBalance = 0
  for (const b of sortedForBalance) {
    runningBalance += b.typ === 'einnahme' ? b.betrag : -b.betrag
    balanceMap.set(b.id, runningBalance)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-emerald-500" />
            Kassenbuch
          </h1>
          <p className="text-muted-foreground mt-1">
            Einnahmen-Überschuss-Rechnung für Freiberufler und Kleinunternehmer
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Buchung
        </button>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Einnahmen</p>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">+{stats.einnahmen.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Ausgaben</p>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">-{stats.ausgaben.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Saldo (EÜR)</p>
            <p className={`text-2xl font-bold mt-1 ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.saldo >= 0 ? '+' : ''}{stats.saldo.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
            </p>
          </CardContent>
        </Card>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Neue Buchung (Demo)</p>
            <p className="text-sm text-muted-foreground">
              In der Vollversion können Sie hier Einnahmen und Ausgaben erfassen,
              Belege hochladen und die EÜR automatisch erstellen.
            </p>
            <a
              href="https://portal.fintutto.cloud/kassenbuch"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Zum Portal →
            </a>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterTyp}
            onChange={e => setFilterTyp(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="alle">Alle Typen</option>
            <option value="einnahme">Einnahmen</option>
            <option value="ausgabe">Ausgaben</option>
          </select>
        </div>
        <select
          value={filterKategorie}
          onChange={e => setFilterKategorie(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        >
          <option value="alle">Alle Kategorien</option>
          {alleKategorien.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Suche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm flex-1 min-w-[200px]"
        />
      </div>

      {/* Buchungsliste */}
      <Card>
        <CardContent className="pt-4 pb-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Datum</th>
                  <th className="pb-2 font-medium text-muted-foreground">Beschreibung</th>
                  <th className="pb-2 font-medium text-muted-foreground">Kategorie</th>
                  <th className="pb-2 font-medium text-muted-foreground">Beleg-Nr.</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Betrag</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Saldo</th>
                  <th className="pb-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                      {new Date(b.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="py-2.5 font-medium">{b.beschreibung}</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{b.kategorie}</span>
                    </td>
                    <td className="py-2.5 text-muted-foreground font-mono text-xs">{b.beleg}</td>
                    <td className={`py-2.5 text-right font-medium whitespace-nowrap ${b.typ === 'einnahme' ? 'text-green-600' : 'text-red-600'}`}>
                      {b.typ === 'einnahme' ? '+' : '-'}{b.betrag.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {(balanceMap.get(b.id) ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Keine Buchungen gefunden.</p>
          )}
        </CardContent>
      </Card>

      {/* Footer info */}
      <div className="text-xs text-muted-foreground">
        {filtered.length} von {buchungen.length} Buchungen · Kassenbuch-Export als PDF/CSV im Portal verfügbar
      </div>
    </div>
  )
}
