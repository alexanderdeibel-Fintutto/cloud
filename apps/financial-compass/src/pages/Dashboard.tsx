import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Euro, FileText, Receipt, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

function KPICard({ title, value, icon: Icon, colorClass, trend }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`p-2 rounded-lg ${colorClass}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [monthlyData] = useState(() => {
    const now = new Date()
    return MONTHS.slice(0, now.getMonth() + 1).map(month => ({
      month,
      einnahmen: Math.random() * 15000 + 5000,
      ausgaben: Math.random() * 8000 + 2000,
    }))
  })

  const revenue = 48750, expenses = 21340, openInvoices = 12800
  const profit = revenue - expenses

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Finanzübersicht {new Date().getFullYear()}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Umsatz (YTD)" value={formatCurrency(revenue)} icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-600" trend="+12% ggü. Vorjahr" />
        <KPICard title="Ausgaben (YTD)" value={formatCurrency(expenses)} icon={TrendingDown} colorClass="bg-red-50 text-red-600" trend="+3% ggü. Vorjahr" />
        <KPICard title="Gewinn (YTD)" value={formatCurrency(profit)} icon={Euro} colorClass="bg-blue-50 text-blue-600" trend={`Marge: ${((profit/revenue)*100).toFixed(1)}%`} />
        <KPICard title="Offene Rechnungen" value={formatCurrency(openInvoices)} icon={FileText} colorClass="bg-purple-50 text-purple-600" trend="4 Rechnungen offen" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Einnahmen vs. Ausgaben</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="einnahmen" name="Einnahmen" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="ausgaben" name="Ausgaben" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Gewinnentwicklung</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData.map(d => ({ ...d, gewinn: d.einnahmen - d.ausgaben }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="gewinn" name="Gewinn" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Neue Rechnung', href: '/rechnungen/neu', icon: FileText, color: 'bg-blue-50 text-blue-700' },
            { label: 'Beleg erfassen', href: '/belege', icon: Receipt, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Buchung anlegen', href: '/buchungen', icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
            { label: 'BWA abrufen', href: '/berichte', icon: Euro, color: 'bg-orange-50 text-orange-700' },
          ].map(({ label, href, icon: Icon, color }) => (
            <a key={href} href={href} className={`flex flex-col items-center gap-2 p-4 rounded-lg ${color} hover:opacity-80 transition-opacity`}>
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium text-center">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
