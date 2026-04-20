import { useState } from 'react'
import { Search } from 'lucide-react'
import { SKR03, SKR04, Account } from '@/lib/skr03'

const TYPE_LABELS: Record<string, string> = { ASSET: 'Aktiva', LIABILITY: 'Passiva', EQUITY: 'Eigenkapital', REVENUE: 'Ertrag', EXPENSE: 'Aufwand' }
const TYPE_COLORS: Record<string, string> = { ASSET: 'bg-blue-100 text-blue-700', LIABILITY: 'bg-red-100 text-red-700', EQUITY: 'bg-purple-100 text-purple-700', REVENUE: 'bg-emerald-100 text-emerald-700', EXPENSE: 'bg-orange-100 text-orange-700' }

export default function Kontenrahmen() {
  const [schema, setSchema] = useState<'SKR03' | 'SKR04'>('SKR03')
  const [search, setSearch] = useState('')
  const accounts: Account[] = schema === 'SKR03' ? SKR03 : SKR04
  const filtered = accounts.filter(a =>
    a.number.includes(search) || a.name.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kontenrahmen</h1>
        <p className="text-sm text-gray-500 mt-0.5">SKR03 & SKR04 – Standardkontenrahmen</p>
      </div>
      <div className="flex gap-3">
        {(['SKR03', 'SKR04'] as const).map(s => (
          <button key={s} onClick={() => setSchema(s)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${schema === s ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s} {s === 'SKR03' ? '(Gewerbetreibende)' : '(Kapitalgesellschaften)'}
          </button>
        ))}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kontonummer oder Name..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">Nummer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bezeichnung</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">MwSt.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(acc => (
              <tr key={acc.number} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-mono font-semibold text-gray-700">{acc.number}</td>
                <td className="px-4 py-2.5 text-gray-900">{acc.name}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[acc.type]}`}>{TYPE_LABELS[acc.type]}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-500">{acc.taxRate !== undefined ? `${acc.taxRate}%` : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">{filtered.length} von {accounts.length} Konten</div>
      </div>
    </div>
  )
}
