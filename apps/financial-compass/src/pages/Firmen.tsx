import { useState } from 'react'
import { Plus, Building2, CheckCircle } from 'lucide-react'

const DEMO = [
  { id: '1', name: 'Muster GmbH', rechtsform: 'GmbH', steuernummer: '123/456/78901', ustId: 'DE123456789', schema: 'SKR03', active: true },
  { id: '2', name: 'Muster Holding AG', rechtsform: 'AG', steuernummer: '234/567/89012', ustId: 'DE234567890', schema: 'SKR04', active: false },
]

export default function Firmen() {
  const [selected, setSelected] = useState(DEMO[0].id)
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Firmen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Multi-Mandanten-Verwaltung</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> Neue Firma
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO.map(firm => (
          <div key={firm.id} onClick={() => setSelected(firm.id)} className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-colors ${selected === firm.id ? 'border-emerald-500' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 rounded-xl"><Building2 className="h-6 w-6 text-slate-600" /></div>
                <div>
                  <p className="font-bold text-gray-900">{firm.name}</p>
                  <p className="text-sm text-gray-500">{firm.rechtsform} · {firm.schema}</p>
                </div>
              </div>
              {firm.active && <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle className="h-3.5 w-3.5" />Aktiv</span>}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Steuernummer</p><p className="font-medium text-gray-700">{firm.steuernummer}</p></div>
              <div><p className="text-xs text-gray-400">USt-IdNr.</p><p className="font-medium text-gray-700">{firm.ustId}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
