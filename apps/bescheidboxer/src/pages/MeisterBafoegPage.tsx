import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { GraduationCap, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const FORTBILDUNGSSTUFEN = [
  { key: 'stufe1', label: 'Stufe 1 – Geprüfter Berufsspezialist', beispiel: 'z.B. IT-Spezialist', maxMassnahme: 15000 },
  { key: 'stufe2', label: 'Stufe 2 – Bachelor Professional', beispiel: 'z.B. Meister, Fachwirt, Techniker', maxMassnahme: 15000 },
  { key: 'stufe3', label: 'Stufe 3 – Master Professional', beispiel: 'z.B. Betriebswirt (HWK)', maxMassnahme: 15000 },
]

export default function MeisterBafoegPage() {
  const [stufe, setStufe] = useState('stufe2')
  const [massnahmeKosten, setMassnahmeKosten] = useState(8000)
  const [pruefungsKosten, setPruefungsKosten] = useState(500)
  const [materialKosten, setMaterialKosten] = useState(2000)
  const [vollzeit, setVollzeit] = useState(false)
  const [kinder, setKinder] = useState(0)
  const [alleinerziehend, setAlleinerziehend] = useState(false)
  const [monate, setMonate] = useState(24)

  const ergebnis = useMemo(() => {
    // Massnahmekosten (§ 12 AFBG)
    const maxMassnahme = 15000
    const gesamtMassnahme = Math.min(massnahmeKosten + pruefungsKosten, maxMassnahme)

    // Zuschuss: 50% der Massnahmekosten
    const zuschussMassnahme = Math.round(gesamtMassnahme * 0.50)
    // Rest: zinsloses Darlehen
    const darlehenMassnahme = gesamtMassnahme - zuschussMassnahme

    // Materialkosten Meisterpruefung (§ 12 Abs. 1 AFBG)
    const maxMaterial = 2000
    const materialFoerderung = Math.min(materialKosten, maxMaterial)
    const zuschussMaterial = Math.round(materialFoerderung * 0.50)

    // Erfolgsbonus: 50% Darlehenserlass bei Bestehen
    const darlehenErlass = Math.round(darlehenMassnahme * 0.50)

    // Unterhaltsbeitrag bei Vollzeit (einkommensabhaengig)
    let unterhaltsMonatlich = 0
    let kinderZuschlag = 0
    let alleinerziehendZuschlag = 0

    if (vollzeit) {
      unterhaltsMonatlich = 963 // Grundbedarf 2024/25
      kinderZuschlag = kinder * 235
      if (alleinerziehend && kinder > 0) alleinerziehendZuschlag = 150
    }

    const unterhaltGesamt = (unterhaltsMonatlich + kinderZuschlag + alleinerziehendZuschlag) * monate
    const zuschussUnterhalt = Math.round(unterhaltGesamt * 1.0) // 100% Zuschuss seit AFBG 2020

    // Gesamtfoerderung
    const gesamtZuschuss = zuschussMassnahme + zuschussMaterial + zuschussUnterhalt
    const gesamtDarlehen = darlehenMassnahme - darlehenErlass
    const gesamtFoerderung = gesamtZuschuss + darlehenMassnahme

    // Steuerlich: Fortbildungskosten = Werbungskosten (zusaetzlich absetzbar)
    // Auch gefoerderte Kosten, aber Zuschuss wird gegengerechnet
    const steuerlichAbsetzbar = massnahmeKosten + pruefungsKosten + materialKosten - gesamtZuschuss

    // Chart
    const chartData = [
      { name: 'Zuschuss\nMassnahme', zuschuss: zuschussMassnahme, darlehen: darlehenMassnahme - darlehenErlass, erlass: darlehenErlass },
      { name: 'Material', zuschuss: zuschussMaterial, darlehen: 0, erlass: 0 },
      ...(vollzeit ? [{ name: 'Unterhalt', zuschuss: zuschussUnterhalt, darlehen: 0, erlass: 0 }] : []),
    ]

    return {
      gesamtMassnahme,
      zuschussMassnahme,
      darlehenMassnahme,
      zuschussMaterial,
      darlehenErlass,
      unterhaltsMonatlich: unterhaltsMonatlich + kinderZuschlag + alleinerziehendZuschlag,
      zuschussUnterhalt,
      gesamtZuschuss,
      gesamtDarlehen,
      gesamtFoerderung,
      steuerlichAbsetzbar,
      chartData,
    }
  }, [stufe, massnahmeKosten, pruefungsKosten, materialKosten, vollzeit, kinder, alleinerziehend, monate])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Aufstiegs-BAföG (Meister-BAföG)
        </h1>
        <p className="text-muted-foreground mt-1">
          Foerderung beruflicher Aufstiegsfortbildung – AFBG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Massnahmekosten:</strong> Max. 15.000 EUR. <strong>50% Zuschuss</strong> + 50% zinsloses Darlehen.</p>
              <p><strong>Erfolgsbonus:</strong> Bei Bestehen der Pruefung: <strong>50% Darlehenserlass</strong>.</p>
              <p><strong>Unterhalt (Vollzeit):</strong> 963 EUR/Monat + 235 EUR/Kind. <strong>100% Zuschuss</strong> (kein Darlehen).</p>
              <p><strong>Steuerlich:</strong> Fortbildungskosten sind als Werbungskosten absetzbar (abzgl. Zuschuss).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eingaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Fortbildungsstufe</p>
              <div className="space-y-2">
                {FORTBILDUNGSSTUFEN.map(s => (
                  <button key={s.key} onClick={() => setStufe(s.key)} className={`w-full rounded-md px-3 py-2 text-sm text-left ${stufe === s.key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <span className="font-medium">{s.label}</span>
                    <span className="text-xs ml-2 opacity-75">{s.beispiel}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Lehrgangskosten: {massnahmeKosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={15000} step={500} value={massnahmeKosten} onChange={e => setMassnahmeKosten(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Pruefungsgebuehren: {pruefungsKosten} EUR</label>
              <input type="range" min={0} max={2000} step={50} value={pruefungsKosten} onChange={e => setPruefungsKosten(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Materialkosten (Meisterpruefung): {materialKosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={5000} step={100} value={materialKosten} onChange={e => setMaterialKosten(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Foerderung max 2.000 EUR (50% Zuschuss)</p>
            </div>

            <div className="border-t pt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={vollzeit} onChange={e => setVollzeit(e.target.checked)} className="accent-primary" />
                Vollzeit-Fortbildung (Unterhaltsbeitrag)
              </label>
              {vollzeit && (
                <>
                  <div>
                    <label className="text-sm font-medium">Kinder: {kinder}</label>
                    <input type="range" min={0} max={5} value={kinder} onChange={e => setKinder(+e.target.value)} className="w-full accent-primary" />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={alleinerziehend} onChange={e => setAlleinerziehend(e.target.checked)} className="accent-primary" />
                    Alleinerziehend
                  </label>
                  <div>
                    <label className="text-sm font-medium">Fortbildungsdauer: {monate} Monate</label>
                    <input type="range" min={1} max={48} value={monate} onChange={e => setMonate(+e.target.value)} className="w-full accent-primary" />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Foerderung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtZuschuss.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Zuschuss (geschenkt)</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.gesamtFoerderung.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Gesamtfoerderung</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Massnahme-Zuschuss (50%)</span>
                <span className="font-medium text-green-600">{ergebnis.zuschussMassnahme.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Darlehen (zinslos)</span>
                <span className="font-medium">{ergebnis.darlehenMassnahme.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Erfolgsbonus (50% Erlass)</span>
                <span className="font-medium text-green-600">-{ergebnis.darlehenErlass.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Material-Zuschuss</span>
                <span className="font-medium text-green-600">{ergebnis.zuschussMaterial.toLocaleString('de-DE')} EUR</span>
              </div>
              {vollzeit && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Unterhalt ({ergebnis.unterhaltsMonatlich} EUR x {monate} M)</span>
                  <span className="font-medium text-green-600">{ergebnis.zuschussUnterhalt.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Effektives Restdarlehen</span>
                <span className="font-medium">{ergebnis.gesamtDarlehen.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold">
                <span>Steuerlich absetzbar (WK)</span>
                <span className="text-primary">{Math.max(ergebnis.steuerlichAbsetzbar, 0).toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Foerderungsstruktur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="zuschuss" name="Zuschuss" fill="#22c55e" stackId="a" />
                <Bar dataKey="darlehen" name="Darlehen (nach Erlass)" fill="#7c3aed" stackId="a" />
                <Bar dataKey="erlass" name="Darlehenserlass" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
