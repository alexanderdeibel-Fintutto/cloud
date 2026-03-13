import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { FlaskConical, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function SteuerlicheForschungPage() {
  const [personalkosten, setPersonalkosten] = useState(200000)
  const [sachkosten, setSachkosten] = useState(50000)
  const [auftragsforschung, setAuftragsforschung] = useState(30000)
  const [eigenleistung, setEigenleistung] = useState(0)
  const [istKMU, setIstKMU] = useState(true)

  const ergebnis = useMemo(() => {
    // Forschungszulage § 27 FZulG
    // Bemessungsgrundlage: max. 4 Mio EUR (ab 2024: KMU 12 Mio)
    const maxBemessung = istKMU ? 12000000 : 4000000

    // Personalkosten: förderfähig
    // Auftragsforschung: 60% der Kosten
    const foerderungAuftrag = Math.round(auftragsforschung * 0.6)

    // Eigenleistung Einzelunternehmer: 40 EUR/Stunde, max. 40h/Woche
    const eigenleistungBetrag = eigenleistung

    const bemessungsgrundlage = Math.min(
      personalkosten + sachkosten + foerderungAuftrag + eigenleistungBetrag,
      maxBemessung
    )

    // Zulage: 25% der Bemessungsgrundlage
    const zulageSatz = 0.25
    const zulage = Math.round(bemessungsgrundlage * zulageSatz)

    // KMU-Bonus: +10% seit 2024
    const kmuBonus = istKMU ? Math.round(bemessungsgrundlage * 0.10) : 0
    const gesamtZulage = zulage + kmuBonus

    // Maximale Zulage
    const maxZulage = istKMU ? Math.round(maxBemessung * 0.35) : Math.round(maxBemessung * 0.25)

    // Vergleich mit/ohne KMU-Bonus
    const chartData = [
      { name: 'Personalkosten', betrag: personalkosten },
      { name: 'Sachkosten', betrag: sachkosten },
      { name: 'Auftragsforschung (60%)', betrag: foerderungAuftrag },
      { name: 'Eigenleistung', betrag: eigenleistungBetrag },
    ]

    const vergleichData = [
      { name: 'Zulage (25%)', betrag: zulage },
      { name: 'KMU-Bonus (+10%)', betrag: kmuBonus },
      { name: 'Gesamt', betrag: gesamtZulage },
    ]

    return {
      bemessungsgrundlage, foerderungAuftrag,
      zulage, kmuBonus, gesamtZulage, maxZulage,
      chartData, vergleichData,
    }
  }, [personalkosten, sachkosten, auftragsforschung, eigenleistung, istKMU])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Forschungszulage
        </h1>
        <p className="text-muted-foreground mt-1">
          Steuerliche Forschungsförderung – FZulG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Forschungszulage:</strong> <strong>25%</strong> der förderfähigen Aufwendungen für Forschung und Entwicklung.</p>
              <p><strong>KMU-Bonus (ab 2024):</strong> Zusätzlich <strong>+10%</strong> für kleine und mittlere Unternehmen (35% gesamt).</p>
              <p><strong>Bemessungsgrundlage:</strong> Max. 4 Mio EUR (KMU: 12 Mio EUR ab 2024).</p>
              <p><strong>Verrechnung:</strong> Mit der festgesetzten Einkommensteuer/Körperschaftsteuer. Erstattung bei Überhang.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">F&E-Personalkosten: {personalkosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={2000000} step={10000} value={personalkosten} onChange={e => setPersonalkosten(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Sachkosten (eigenf. F&E): {sachkosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={500000} step={5000} value={sachkosten} onChange={e => setSachkosten(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Auftragsforschung: {auftragsforschung.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={500000} step={5000} value={auftragsforschung} onChange={e => setAuftragsforschung(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">60% der Kosten sind förderfähig</p>
            </div>
            <div>
              <label className="text-sm font-medium">Eigenleistung (Einzelunternehmer): {eigenleistung.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={100000} step={1000} value={eigenleistung} onChange={e => setEigenleistung(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">40 EUR/Stunde, max. 40h/Woche</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={istKMU} onChange={e => setIstKMU(e.target.checked)} className="accent-primary" />
              KMU (kleine und mittlere Unternehmen)
            </label>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center mb-6">
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtZulage.toLocaleString('de-DE')} EUR</p>
              <p className="text-sm text-muted-foreground mt-1">Forschungszulage</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Bemessungsgrundlage</span>
                <span className="font-medium">{ergebnis.bemessungsgrundlage.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Zulage (25%)</span>
                <span className="font-medium text-green-600">{ergebnis.zulage.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.kmuBonus > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">KMU-Bonus (+10%)</span>
                  <span className="font-medium text-green-600">{ergebnis.kmuBonus.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Gesamtzulage</span>
                <span className="font-medium text-primary">{ergebnis.gesamtZulage.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Max. Zulage ({istKMU ? 'KMU' : 'Standard'})</span>
                <span className="font-medium">{ergebnis.maxZulage.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Kostenaufstellung</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="betrag" name="Förderfähig" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Förderfähige Vorhaben</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Grundlagenforschung</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Experimentelle Forschung</li>
                <li>- Theoretische Arbeiten</li>
                <li>- Neue Erkenntnisse</li>
                <li>- Ohne unmittelbare Anwendung</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Industrielle Forschung</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Neue Produkte/Verfahren</li>
                <li>- Technologieentwicklung</li>
                <li>- Prototypen</li>
                <li>- Pilotlinien</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Experimentelle Entwicklung</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Vorhandenes Wissen nutzen</li>
                <li>- Neue Produkte/Prozesse</li>
                <li>- Wesentliche Verbesserung</li>
                <li>- Demonstrationsprojekte</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
