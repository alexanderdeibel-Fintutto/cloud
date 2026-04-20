import { useState } from 'react'
import { Plus, Search, Download, Eye, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

type Status = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'

interface Invoice {
  id: string
  number: string
  contact: string
  date: string
  dueDate: string
  amount: number
  status: Status
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: any }> = {
  DRAFT:     { label: 'Entwurf',    color: 'bg-gray-100 text-gray-600',    icon: Clock },
  SENT:      { label: 'Versendet',  color: 'bg-blue-100 text-blue-700',    icon: Send },
  PAID:      { label: 'Bezahlt',    color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  OVERDUE:   { label: 'Überfällig', color: 'bg-red-100 text-red-700',      icon: AlertTriangle },
  CANCELLED: { label: 'Storniert',  color: 'bg-gray-100 text-gray-400',    icon: AlertTriangle },
}

const DEMO: Invoice[] = [
  { id: '1', number: 'RE-2026-0042', contact: 'Müller GmbH', date: '2026-04-15', dueDate: '2026-04-29', amount: 4760.00, status: 'SENT' },
  { id: '2', number: 'RE-2026-0041', contact: 'Schmidt & Partner', date: '2026-04-10', dueDate: '2026-04-24', amount: 11900.00, status: 'PAID' },
  { id: '3', number: 'RE-2026-0040', contact: 'Weber AG', date: '2026-04-05', dueDate: '2026-04-19', amount: 2380.00, status: 'OVERDUE' },
  { id: '4', number: 'RE-2026-0039', contact: 'Fischer KG', date: '2026-03-28', dueDate: '2026-04-11', amount: 8925.00, status: 'PAID' },
  { id: '5', number: 'RE-2026-0038', contact: 'Bauer Consulting', date: '2026-03-20', dueDate: '2026-04-03', amount: 1547.50, status: 'DRAFT' },
]

export default function Rechnungen() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL')
  const invoices = DEMO.filter(i =>
    (filter === 'ALL' || i.status === filter) &&
    (i.contact.toLowerCase().includes(search.toLowerCase()) || i.number.includes(search))
  )
  const totalOpen = DEMO.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0)
  const totalPaid = DEMO.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ausgangsrechnungen verwalten & PDF-Export</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> Neue Rechnung
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Offen</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalOpen)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Bezahlt (YTD)</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Überfällig</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(DEMO.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0))}</p>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        {(['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${filter === s ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s === 'ALL' ? 'Alle' : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nummer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kontakt</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Fällig</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Betrag</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map(inv => {
              const cfg = STATUS_CONFIG[inv.status]
              const Icon = cfg.icon
              return (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{inv.number}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{inv.contact}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(inv.date)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(inv.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                      <Icon className="h-3 w-3" />{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 hover:bg-gray-100 rounded-md"><Eye className="h-4 w-4 text-gray-400" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-md ml-1"><Download className="h-4 w-4 text-gray-400" /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
