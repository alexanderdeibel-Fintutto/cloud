import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Car, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function FahrtenbuchVsEinProzentPage() {
  const [bruttolistenpreis, setBruttolistenpreis] = useState(45000)
  const [entfernung, setEntfernung] = useState(25)
  const [arbeitstage, setArbeitstage] = useState(220)
  const [gesamtKm, setGesamtKm] = useState(25000)
  const [privatKm, setPrivatKm] = useState(8000)
  const [gesamtKosten, setGesamtKosten] = useState(8000)
  const [grenzSteuersatz, setGrenzSteuersatz] = useState(42)

  const ergebnis = useMemo(() => {
    // --- 1%-Regelung ---
    // Monatlicher geldwerter Vorteil: 1% des BLP
    const einProzentMonat = Math.round(bruttolistenpreis * 0.01)
    const einProzentJahr = einProzentMonat * 12

    // Fahrten Wohnung-Arbeit: 0,03% × BLP × km einfache Entfernung × 12
    const fahrtWohnung = Math.round(bruttolistenpreis * 0.0003 * entfernung * 12)

    const geldwerterVorteilEinProzent = einProzentJahr + fahrtWohnung

    // --- Fahrtenbuch ---
    // Privater Nutzungsanteil
    const privatAnteil = gesamtKm > 0 ? privatKm / gesamtKm : 0
    const geldwerterVorteilFahrtenbuch = Math.round(gesamtKosten * privatAnteil)

    // Steuerliche Belastung
    const steuerEinProzent = Math.round(geldwerterVorteilEinProzent * grenzSteuersatz / 100)
    const steuerFahrtenbuch = Math.round(geldwerterVorteilFahrtenbuch * grenzSteuersatz / 100)
    const ersparnis = steuerEinProzent - steuerFahrtenbuch

    // Werbungskosten-Abzug Entfernungspauschale
    const entfPauschale = Math.round(entfernung * arbeitstage * 0.30)

    // Kostenvergleich bei verschiedenen Privatanteilen
    const chartData = [10, 20, 30, 40, 50, 60].map(pct => {
      const fb = Math.round(gesamtKosten * pct / 100)
      return {
        anteil: `${pct}%`,
        einProzent: geldwerterVorteilEinProzent,
        fahrtenbuch: fb,
      }
    })

    // Break-even Privatanteil
    const breakEvenProzent = gesamtKosten > 0
      ? Math.round(geldwerterVorteilEinProzent / gesamtKosten * 100 * 10) / 10
      : 0

    return {
      einProzentMonat, einProzentJahr, fahrtWohnung,
      geldwerterVorteilEinProzent, privatAnteil: Math.round(privatAnteil * 1000) / 10,
      geldwerterVorteilFahrtenbuch,
      steuerEinProzent, steuerFahrtenbuch, ersparnis,
      entfPauschale, breakEvenProzent, chartData,
    }
  }, [bruttolistenpreis, entfernung, arbeitstage, gesamtKm, privatKm, gesamtKosten, grenzSteuersatz])

  const besser = ergebnis.ersparnis > 0 ? 'Fahrtenbuch' : ergebnis.ersparnis < 0 ? '1%-Regelung' : 'Gleichstand'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          Fahrtenbuch vs. 1%-Regelung
        </h1>
        <p className="text-muted-foreground mt-1">
          Dienstwagen-Besteuerung – welche Methode lohnt sich?
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>1%-Regelung:</strong> 1% des BLP monatlich + 0,03% × BLP × km für Fahrten Wohnung-Arbeit.</p>
              <p><strong>Fahrtenbuch:</strong> Nur tatsächlicher Privatanteil der Gesamtkosten wird versteuert.</p>
              <p><strong>Faustregel:</strong> Fahrtenbuch lohnt bei geringem Privatanteil ({'<'}{ergebnis.breakEvenProzent}% Break-even).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Fahrzeug & Nutzung</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bruttolistenpreis: {bruttolistenpreis.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={10000} max={120000} step={1000} value={bruttolistenpreis} onChange={e => setBruttolistenpreis(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Entfernung Wohnung-Arbeit: {entfernung} km</label>
              <input type="range" min={1} max={80} step={1} value={entfernung} onChange={e => setEntfernung(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Arbeitstage: {arbeitstage}</label>
              <input type="range" min={100} max={250} step={5} value={arbeitstage} onChange={e => setArbeitstage(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Gesamt-km p.a.: {gesamtKm.toLocaleString('de-DE')}</label>
              <input type="range" min={5000} max={60000} step={1000} value={gesamtKm} onChange={e => setGesamtKm(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Privat-km p.a.: {privatKm.toLocaleString('de-DE')}</label>
              <input type="range" min={0} max={gesamtKm} step={500} value={Math.min(privatKm, gesamtKm)} onChange={e => setPrivatKm(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Gesamtkosten Fzg. p.a.: {gesamtKosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={2000} max={25000} step={500} value={gesamtKosten} onChange={e => setGesamtKosten(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzSteuersatz}%</label>
              <input type="range" min={14} max={45} step={1} value={grenzSteuersatz} onChange={e => setGrenzSteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Vergleich</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg bg-primary/10 p-4 text-center mb-4">
              <p className="text-lg font-bold text-primary">{besser} günstiger</p>
              <p className="text-xs text-muted-foreground mt-1">Ersparnis: {Math.abs(ergebnis.ersparnis).toLocaleString('de-DE')} EUR p.a.</p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wide">1%-Regelung</p>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">1% × BLP × 12</span>
                <span className="font-medium">{ergebnis.einProzentJahr.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Fahrten Wohnung-Arbeit</span>
                <span className="font-medium">{ergebnis.fahrtWohnung.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Geldwerter Vorteil</span>
                <span className="font-medium text-red-600">{ergebnis.geldwerterVorteilEinProzent.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerbelastung</span>
                <span className="font-medium text-red-600">{ergebnis.steuerEinProzent.toLocaleString('de-DE')} EUR</span>
              </div>

              <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wide mt-4">Fahrtenbuch</p>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Privatanteil</span>
                <span className="font-medium">{ergebnis.privatAnteil}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Geldwerter Vorteil</span>
                <span className="font-medium text-red-600">{ergebnis.geldwerterVorteilFahrtenbuch.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerbelastung</span>
                <span className="font-medium text-red-600">{ergebnis.steuerFahrtenbuch.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Entfernungspauschale</span>
                <span className="font-medium text-green-600">-{ergebnis.entfPauschale.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Break-even Privatanteil</span>
                <span className="font-medium text-primary">{ergebnis.breakEvenProzent}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Privatanteil-Vergleich</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="anteil" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="einProzent" name="1%-Regelung" fill="#ef4444" />
                <Bar dataKey="fahrtenbuch" name="Fahrtenbuch" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
