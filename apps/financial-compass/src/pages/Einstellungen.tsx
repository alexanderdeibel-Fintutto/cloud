import { Settings, Bell, Shield, Database, Palette } from 'lucide-react'

const SECTIONS = [
  { icon: Settings, title: 'Allgemein', desc: 'Sprache, Währung, Geschäftsjahr', items: ['Sprache: Deutsch', 'Währung: EUR', 'Geschäftsjahr: 01.01. – 31.12.', 'Kontenrahmen: SKR03'] },
  { icon: Bell, title: 'Benachrichtigungen', desc: 'E-Mail & Push-Benachrichtigungen', items: ['Überfällige Rechnungen', 'Neue Belege', 'Monatlicher BWA-Bericht'] },
  { icon: Shield, title: 'Sicherheit', desc: 'Passwort & Zwei-Faktor-Authentifizierung', items: ['Passwort ändern', 'Zwei-Faktor-Authentifizierung', 'Aktive Sitzungen'] },
  { icon: Database, title: 'Daten & Export', desc: 'DATEV, CSV, API-Zugang', items: ['DATEV-Export', 'CSV-Export', 'API-Schlüssel verwalten'] },
]

export default function Einstellungen() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-sm text-gray-500 mt-0.5">App-Konfiguration & Präferenzen</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(({ icon: Icon, title, desc, items }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg"><Icon className="h-5 w-5 text-slate-600" /></div>
              <div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{item}</span>
                  <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Bearbeiten</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
