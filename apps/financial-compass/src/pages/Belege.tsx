import { useState } from 'react'
import { Upload, Search, FileText, CheckCircle, Clock, Zap } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const DEMO = [
  { id: '1', name: 'Rechnung_Büromaterial.pdf', vendor: 'Staples GmbH', date: '2026-04-15', amount: 89.50, status: 'VERIFIED', category: 'Bürobedarf' },
  { id: '2', name: 'Miete_April_2026.pdf', vendor: 'Immobilien AG', date: '2026-04-01', amount: 1800.00, status: 'VERIFIED', category: 'Miete' },
  { id: '3', name: 'Telefonrechnung_Q1.pdf', vendor: 'Telekom', date: '2026-03-31', amount: 67.20, status: 'PENDING', category: 'Telekommunikation' },
  { id: '4', name: 'Tankquittung.jpg', vendor: 'Shell', date: '2026-04-10', amount: 120.00, status: 'PROCESSING', category: 'Fahrzeugkosten' },
]

export default function Belege() {
  const [search, setSearch] = useState('')
  const [dragging, setDragging] = useState(false)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Belege & OCR</h1>
          <p className="text-sm text-gray-500 mt-0.5">Belege hochladen · KI-Texterkennung · Automatische Buchung</p>
        </div>
      </div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false) }}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-700">Belege hier ablegen oder</p>
        <button className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Dateien auswählen</button>
        <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG bis 10 MB · KI-OCR erkennt Betrag, Datum, Lieferant automatisch</p>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche nach Lieferant, Betrag..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Datei</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Lieferant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategorie</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Betrag</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {DEMO.filter(b => b.vendor.toLowerCase().includes(search.toLowerCase())).map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-gray-400" /><span className="text-gray-700 truncate max-w-40">{b.name}</span></div></td>
                <td className="px-4 py-3 font-medium text-gray-900">{b.vendor}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(b.date)}</td>
                <td className="px-4 py-3 text-gray-600">{b.category}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(b.amount)}</td>
                <td className="px-4 py-3">
                  {b.status === 'VERIFIED' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700"><CheckCircle className="h-3 w-3" />Verifiziert</span>}
                  {b.status === 'PENDING' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3" />Ausstehend</span>}
                  {b.status === 'PROCESSING' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700"><Zap className="h-3 w-3" />OCR läuft</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
