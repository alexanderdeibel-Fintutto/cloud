import { useState } from 'react'
import { Plus, RefreshCw, ArrowUpRight, ArrowDownLeft, Landmark } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const ACCOUNTS = [
  { id: '1', name: 'Geschäftskonto', bank: 'Deutsche Bank', iban: 'DE89 3704 0044 0532 0130 00', balance: 24580.45, currency: 'EUR' },
  { id: '2', name: 'Tagesgeld', bank: 'DKB', iban: 'DE12 1203 0000 0020 2110 22', balance: 50000.00, currency: 'EUR' },
]
const TRANSACTIONS = [
  { id: '1', date: '2026-04-15', description: 'Zahlungseingang Müller GmbH RE-2026-0041', amount: 4760.00, type: 'CREDIT' },
  { id: '2', date: '2026-04-12', description: 'Miete April 2026', amount: -1800.00, type: 'DEBIT' },
  { id: '3', date: '2026-04-10', description: 'Zahlungseingang Schmidt & Partner', amount: 11900.00, type: 'CREDIT' },
  { id: '4', date: '2026-04-08', description: 'Telefonrechnung Telekom', amount: -67.20, type: 'DEBIT' },
  { id: '5', date: '2026-04-05', description: 'Büromaterial Staples', amount: -89.50, type: 'DEBIT' },
]

export default function Bankkonten() {
  const [selected, setSelected] = useState(ACCOUNTS[0].id)
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bankkonten</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kontoübersicht & Transaktionen</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="h-4 w-4" /> Synchronisieren</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"><Plus className="h-4 w-4" /> Konto hinzufügen</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACCOUNTS.map(acc => (
          <div key={acc.id} onClick={() => setSelected(acc.id)} className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-colors ${selected === acc.id ? 'border-emerald-500' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg"><Landmark className="h-5 w-5 text-slate-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900">{acc.name}</p>
                  <p className="text-xs text-gray-500">{acc.bank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{formatCurrency(acc.balance)}</p>
                <p className="text-xs text-gray-400 font-mono">{acc.iban.slice(-8)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Transaktionen</h2>
          <span className="text-xs text-gray-400">{ACCOUNTS.find(a => a.id === selected)?.name}</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Beschreibung</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Betrag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {TRANSACTIONS.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{formatDate(t.date)}</td>
                <td className="px-4 py-3 text-gray-900">
                  <div className="flex items-center gap-2">
                    {t.type === 'CREDIT' ? <ArrowDownLeft className="h-4 w-4 text-emerald-500 flex-shrink-0" /> : <ArrowUpRight className="h-4 w-4 text-red-500 flex-shrink-0" />}
                    {t.description}
                  </div>
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${t.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(Math.abs(t.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
