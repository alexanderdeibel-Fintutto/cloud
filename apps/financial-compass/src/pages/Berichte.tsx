import { useState } from 'react'
import { Download, BarChart3, TrendingUp, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const BWA_DATA = [
  { label: 'Umsatzerlöse', value: 48750, category: 'revenue' },
  { label: 'Sonstige betriebliche Erträge', value: 1200, category: 'revenue' },
  { label: 'Gesamtleistung', value: 49950, category: 'total', bold: true },
  { label: '', value: 0, category: 'spacer' },
  { label: 'Materialaufwand', value: -3200, category: 'expense' },
  { label: 'Personalaufwand', value: -12000, category: 'expense' },
  { label: 'Abschreibungen', value: -1800, category: 'expense' },
  { label: 'Miete & Nebenkosten', value: -7200, category: 'expense' },
  { label: 'Werbekosten', value: -2100, category: 'expense' },
  { label: 'Bürokosten', value: -890, category: 'expense' },
  { label: 'Fahrzeugkosten', value: -1200, category: 'expense' },
  { label: 'Sonstige betriebliche Aufwendungen', value: -1560, category: 'expense' },
  { label: 'Gesamtaufwand', value: -29950, category: 'total', bold: true },
  { label: '', value: 0, category: 'spacer' },
  { label: 'Betriebsergebnis (EBIT)', value: 20000, category: 'result', bold: true },
  { label: 'Zinserträge', value: 450, category: 'revenue' },
  { label: 'Zinsaufwendungen', value: -800, category: 'expense' },
  { label: 'Ergebnis vor Steuern (EBT)', value: 19650, category: 'result', bold: true },
  { label: 'Steuern', value: -5895, category: 'expense' },
  { label: 'Jahresüberschuss', value: 13755, category: 'result', bold: true, highlight: true },
]

export default function Berichte() {
  const [report, setReport] = useState<'BWA' | 'GUV' | 'BILANZ'>('BWA')
  const [year, setYear] = useState(2026)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Berichte</h1>
          <p className="text-sm text-gray-500 mt-0.5">BWA · GuV · Bilanz · DATEV-Export</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
          <Download className="h-4 w-4" /> PDF exportieren
        </button>
      </div>
      <div className="flex gap-3 flex-wrap">
        {(['BWA', 'GUV', 'BILANZ'] as const).map(r => (
          <button key={r} onClick={() => setReport(r)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${report === r ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {r === 'BWA' && <BarChart3 className="h-4 w-4" />}
            {r === 'GUV' && <TrendingUp className="h-4 w-4" />}
            {r === 'BILANZ' && <FileText className="h-4 w-4" />}
            {r === 'BWA' ? 'Betriebswirtschaftliche Auswertung' : r === 'GUV' ? 'Gewinn- & Verlustrechnung' : 'Bilanz'}
          </button>
        ))}
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {report === 'BWA' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-slate-50">
            <h2 className="font-semibold text-gray-900">Betriebswirtschaftliche Auswertung {year}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Zeitraum: 01.01.{year} – 31.12.{year} · Alle Beträge in EUR</p>
          </div>
          <div className="divide-y divide-gray-50">
            {BWA_DATA.map((row, i) => {
              if (row.category === 'spacer') return <div key={i} className="h-2" />
              return (
                <div key={i} className={`flex items-center justify-between px-5 py-2.5 ${row.highlight ? 'bg-emerald-50' : row.bold ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                  <span className={`text-sm ${row.bold ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{row.label}</span>
                  <span className={`text-sm font-mono ${row.highlight ? 'font-bold text-emerald-700 text-base' : row.bold ? 'font-semibold text-gray-900' : row.value > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.value !== 0 ? formatCurrency(row.value) : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {report !== 'BWA' && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{report === 'GUV' ? 'Gewinn- & Verlustrechnung' : 'Bilanz'} wird generiert...</p>
          <p className="text-sm mt-1">Buchungen müssen vollständig erfasst sein</p>
        </div>
      )}
    </div>
  )
}
