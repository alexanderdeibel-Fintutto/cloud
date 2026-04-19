import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SKR03 } from '@/lib/skr03'

interface Buchung {
  id: string
  buchungsdatum: string
  belegnummer?: string
  beschreibung: string
  soll_konto: string
  haben_konto: string
  betrag: number
  steuer_betrag?: number
  created_at: string
}

export default function Buchungen() {
  const [buchungen, setBuchungen] = useState<Buchung[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { loadBuchungen() }, [])

  async function loadBuchungen() {
    try {
      const { data } = await (supabase as any).from('fc_buchungen').select('*').order('buchungsdatum', { ascending: false }).limit(100)
      if (data) setBuchungen(data)
    } catch {
      setBuchungen(DEMO_BUCHUNGEN)
    } finally { setLoading(false) }
  }

  const filtered = buchungen.filter(b =>
    b.beschreibung?.toLowerCase().includes(search.toLowerCase()) ||
    b.soll_konto?.includes(search) ||
    b.haben_konto?.includes(search)
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buchungen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Doppelte Buchführung · SKR03/SKR04</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> Neue Buchung
        </button>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche nach Beschreibung, Konto..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <Filter className="h-4 w-4" /> Filter
        </button>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <Download className="h-4 w-4" /> Export
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Beleg</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Beschreibung</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Soll</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Haben</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Betrag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Lade Buchungen...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Keine Buchungen gefunden</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{formatDate(b.buchungsdatum)}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{b.belegnummer || '–'}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{b.beschreibung}</td>
                <td className="px-4 py-3 text-gray-600 font-mono">{b.soll_konto}</td>
                <td className="px-4 py-3 text-gray-600 font-mono">{b.haben_konto}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(b.betrag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const DEMO_BUCHUNGEN: Buchung[] = [
  { id: '1', buchungsdatum: '2026-04-15', belegnummer: 'RE-2026-0042', beschreibung: 'Büromaterial', soll_konto: '4600', haben_konto: '1200', betrag: 89.50, created_at: '' },
  { id: '2', buchungsdatum: '2026-04-12', belegnummer: 'RE-2026-0041', beschreibung: 'Miete April', soll_konto: '4300', haben_konto: '1200', betrag: 1800.00, created_at: '' },
  { id: '3', buchungsdatum: '2026-04-10', belegnummer: 'AR-2026-0018', beschreibung: 'Zahlungseingang Kunde Müller', soll_konto: '1200', haben_konto: '1400', betrag: 4760.00, created_at: '' },
  { id: '4', buchungsdatum: '2026-04-08', belegnummer: 'RE-2026-0040', beschreibung: 'Telefonrechnung', soll_konto: '4610', haben_konto: '1600', betrag: 67.20, created_at: '' },
  { id: '5', buchungsdatum: '2026-04-05', belegnummer: 'AR-2026-0017', beschreibung: 'Zahlungseingang Kunde Schmidt GmbH', soll_konto: '1200', haben_konto: '1400', betrag: 11900.00, created_at: '' },
]
