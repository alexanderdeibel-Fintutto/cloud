import { useState } from 'react'
import { Plus, Search, Building2, User, Mail, Phone } from 'lucide-react'

const DEMO = [
  { id: '1', name: 'Müller GmbH', type: 'CUSTOMER', email: 'info@mueller-gmbh.de', phone: '+49 89 123456', city: 'München', balance: 4760 },
  { id: '2', name: 'Schmidt & Partner', type: 'CUSTOMER', email: 'kontakt@schmidt-partner.de', phone: '+49 30 987654', city: 'Berlin', balance: 0 },
  { id: '3', name: 'Weber AG', type: 'CUSTOMER', email: 'buchhaltung@weber-ag.de', phone: '+49 40 555123', city: 'Hamburg', balance: 2380 },
  { id: '4', name: 'Staples GmbH', type: 'VENDOR', email: 'rechnung@staples.de', phone: '+49 69 111222', city: 'Frankfurt', balance: -89.50 },
  { id: '5', name: 'Telekom', type: 'VENDOR', email: 'business@telekom.de', phone: '0800 33 01000', city: 'Bonn', balance: -67.20 },
]

export default function Kontakte() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'CUSTOMER' | 'VENDOR'>('ALL')
  const contacts = DEMO.filter(c =>
    (filter === 'ALL' || c.type === filter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontakte</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kunden & Lieferanten verwalten</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> Neuer Kontakt
        </button>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        {(['ALL', 'CUSTOMER', 'VENDOR'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${filter === f ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f === 'ALL' ? 'Alle' : f === 'CUSTOMER' ? 'Kunden' : 'Lieferanten'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${c.type === 'CUSTOMER' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {c.type === 'CUSTOMER' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-500">{c.city} · {c.type === 'CUSTOMER' ? 'Kunde' : 'Lieferant'}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="h-3 w-3" />{c.email}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="h-3 w-3" />{c.phone}</div>
            </div>
            {c.balance !== 0 && (
              <div className={`mt-3 pt-3 border-t border-gray-100 text-sm font-semibold ${c.balance > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {c.balance > 0 ? `Forderung: ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(c.balance)}` : `Verbindlichkeit: ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Math.abs(c.balance))}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
