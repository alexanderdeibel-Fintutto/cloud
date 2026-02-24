import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Receipt, Building2, Users, Calculator, Plus, Trash2,
  CheckCircle2, Info, Euro, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import CrossSellBanner from '@/components/shared/CrossSellBanner'

type Umlageschluessel = 'flaeche' | 'personen' | 'einheiten' | 'verbrauch' | 'direkt'

interface Kostenposition {
  id: string
  bezeichnung: string
  betrag: number
  umlageschluessel: Umlageschluessel
}

interface Einheit {
  id: string
  bezeichnung: string
  mieterName: string
  flaeche: number
  personen: number
  vorauszahlung: number
}

const UMLAGESCHLUESSEL_LABELS: Record<Umlageschluessel, string> = {
  flaeche: 'nach Fläche (m²)',
  personen: 'nach Personenzahl',
  einheiten: 'nach Wohneinheiten',
  verbrauch: 'nach Verbrauch',
  direkt: 'Direktzuordnung',
}

const DEFAULT_KOSTENPOSITIONEN: Kostenposition[] = [
  { id: '1', bezeichnung: 'Grundsteuer', betrag: 0, umlageschluessel: 'flaeche' },
  { id: '2', bezeichnung: 'Wasser/Abwasser', betrag: 0, umlageschluessel: 'verbrauch' },
  { id: '3', bezeichnung: 'Heizkosten', betrag: 0, umlageschluessel: 'verbrauch' },
  { id: '4', bezeichnung: 'Müllabfuhr', betrag: 0, umlageschluessel: 'personen' },
  { id: '5', bezeichnung: 'Gebäudeversicherung', betrag: 0, umlageschluessel: 'flaeche' },
  { id: '6', bezeichnung: 'Straßenreinigung', betrag: 0, umlageschluessel: 'flaeche' },
  { id: '7', bezeichnung: 'Gartenpflege', betrag: 0, umlageschluessel: 'flaeche' },
  { id: '8', bezeichnung: 'Allgemeinstrom', betrag: 0, umlageschluessel: 'einheiten' },
  { id: '9', bezeichnung: 'Hauswart/Reinigung', betrag: 0, umlageschluessel: 'flaeche' },
  { id: '10', bezeichnung: 'Aufzug', betrag: 0, umlageschluessel: 'einheiten' },
]

export default function BetriebskostenModulPage() {
  const [step, setStep] = useState(1)
  const [gebaeudeFlaeche, setGebaeudeFlaeche] = useState('')
  const [abrechnungszeitraum, setAbrechnungszeitraum] = useState({ von: '2025-01-01', bis: '2025-12-31' })
  const [einheiten, setEinheiten] = useState<Einheit[]>([
    { id: '1', bezeichnung: 'Wohnung 1 (EG links)', mieterName: '', flaeche: 65, personen: 2, vorauszahlung: 200 },
    { id: '2', bezeichnung: 'Wohnung 2 (EG rechts)', mieterName: '', flaeche: 78, personen: 3, vorauszahlung: 240 },
  ])
  const [kostenpositionen, setKostenpositionen] = useState<Kostenposition[]>(DEFAULT_KOSTENPOSITIONEN)
  const [abrechnung, setAbrechnung] = useState<any>(null)

  const gesamtFlaeche = einheiten.reduce((sum, e) => sum + e.flaeche, 0)
  const gesamtPersonen = einheiten.reduce((sum, e) => sum + e.personen, 0)
  const gesamtKosten = kostenpositionen.reduce((sum, k) => sum + k.betrag, 0)

  const addEinheit = () => {
    setEinheiten([...einheiten, {
      id: `e-${Date.now()}`,
      bezeichnung: `Wohnung ${einheiten.length + 1}`,
      mieterName: '',
      flaeche: 0,
      personen: 1,
      vorauszahlung: 0,
    }])
  }

  const updateEinheit = (id: string, field: keyof Einheit, value: string | number) => {
    setEinheiten(einheiten.map((e) => e.id === id ? { ...e, [field]: value } : e))
  }

  const removeEinheit = (id: string) => {
    if (einheiten.length <= 1) return
    setEinheiten(einheiten.filter((e) => e.id !== id))
  }

  const updateKosten = (id: string, field: keyof Kostenposition, value: string | number) => {
    setKostenpositionen(kostenpositionen.map((k) => k.id === id ? { ...k, [field]: value } : k))
  }

  const berechneAbrechnung = () => {
    const ergebnisse = einheiten.map((einheit) => {
      let anteilGesamt = 0

      kostenpositionen.forEach((k) => {
        if (k.betrag === 0) return
        let anteil = 0
        switch (k.umlageschluessel) {
          case 'flaeche':
            anteil = gesamtFlaeche > 0 ? (einheit.flaeche / gesamtFlaeche) * k.betrag : 0
            break
          case 'personen':
            anteil = gesamtPersonen > 0 ? (einheit.personen / gesamtPersonen) * k.betrag : 0
            break
          case 'einheiten':
            anteil = k.betrag / einheiten.length
            break
          case 'verbrauch':
            anteil = gesamtFlaeche > 0 ? (einheit.flaeche / gesamtFlaeche) * k.betrag : 0
            break
          case 'direkt':
            anteil = k.betrag / einheiten.length
            break
        }
        anteilGesamt += anteil
      })

      const vorauszahlungenGesamt = einheit.vorauszahlung * 12
      const saldo = anteilGesamt - vorauszahlungenGesamt

      return {
        einheit,
        anteilGesamt: Math.round(anteilGesamt * 100) / 100,
        vorauszahlungenGesamt,
        saldo: Math.round(saldo * 100) / 100,
      }
    })

    setAbrechnung({ ergebnisse, gesamtKosten })
    setStep(4)
  }

  return (
    <div>
      <section className="gradient-portal py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Startseite
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Receipt className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Betriebskosten-Abrechnung</h1>
              <p className="text-white/80">Nebenkostenabrechnung erstellen - Schritt für Schritt</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container max-w-4xl">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: 'Gebäude' },
              { num: 2, label: 'Einheiten' },
              { num: 3, label: 'Kosten' },
              { num: 4, label: 'Ergebnis' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => s.num < step ? setStep(s.num) : undefined}
                  className={`flex items-center gap-2 ${
                    step >= s.num ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    step > s.num
                      ? 'bg-primary text-white'
                      : step === s.num
                      ? 'bg-primary/10 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{s.label}</span>
                </button>
                {i < 3 && <div className={`w-12 md:w-24 h-0.5 mx-2 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Gebäude */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Gebäudedaten
                </CardTitle>
                <CardDescription>Allgemeine Angaben zum Gebäude</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Abrechnungszeitraum von</label>
                    <input
                      type="date"
                      value={abrechnungszeitraum.von}
                      onChange={(e) => setAbrechnungszeitraum({ ...abrechnungszeitraum, von: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Abrechnungszeitraum bis</label>
                    <input
                      type="date"
                      value={abrechnungszeitraum.bis}
                      onChange={(e) => setAbrechnungszeitraum({ ...abrechnungszeitraum, bis: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Gesamtwohnfläche (m²)</label>
                  <input
                    type="number"
                    value={gebaeudeFlaeche}
                    onChange={(e) => setGebaeudeFlaeche(e.target.value)}
                    placeholder="z.B. 450"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  />
                </div>
                <Button onClick={() => setStep(2)} className="w-full">Weiter zu Einheiten</Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Einheiten */}
          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Wohneinheiten ({einheiten.length})
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={addEinheit}>
                      <Plus className="h-4 w-4 mr-1" />
                      Einheit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {einheiten.map((einheit, idx) => (
                    <div key={einheit.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Einheit {idx + 1}</h4>
                        {einheiten.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeEinheit(einheit.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Bezeichnung</label>
                          <input
                            type="text"
                            value={einheit.bezeichnung}
                            onChange={(e) => updateEinheit(einheit.id, 'bezeichnung', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Fläche (m²)</label>
                          <input
                            type="number"
                            value={einheit.flaeche || ''}
                            onChange={(e) => updateEinheit(einheit.id, 'flaeche', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Personen</label>
                          <input
                            type="number"
                            value={einheit.personen || ''}
                            onChange={(e) => updateEinheit(einheit.id, 'personen', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Vorauszahlung/Mon.</label>
                          <input
                            type="number"
                            value={einheit.vorauszahlung || ''}
                            onChange={(e) => updateEinheit(einheit.id, 'vorauszahlung', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Zurück</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Weiter zu Kosten</Button>
              </div>
            </div>
          )}

          {/* Step 3: Kostenpositionen */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Kostenpositionen
                  </CardTitle>
                  <CardDescription>Trage die tatsächlichen Kosten für den Abrechnungszeitraum ein</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {kostenpositionen.map((k) => (
                    <div key={k.id} className="grid grid-cols-[1fr_120px_160px] gap-3 items-end">
                      <div>
                        <label className="text-xs text-muted-foreground">{k.bezeichnung}</label>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={k.betrag || ''}
                          onChange={(e) => updateKosten(k.id, 'betrag', parseFloat(e.target.value) || 0)}
                          placeholder="0,00"
                          className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background text-right"
                        />
                      </div>
                      <div>
                        <select
                          value={k.umlageschluessel}
                          onChange={(e) => updateKosten(k.id, 'umlageschluessel', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded border border-input bg-background"
                        >
                          {Object.entries(UMLAGESCHLUESSEL_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Gesamtkosten</span>
                    <span>{formatCurrency(gesamtKosten)}</span>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Zurück</Button>
                <Button onClick={berechneAbrechnung} className="flex-1">
                  <Calculator className="h-4 w-4 mr-2" />
                  Abrechnung erstellen
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Ergebnis */}
          {step === 4 && abrechnung && (
            <div className="space-y-4">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Abrechnungsergebnis
                  </CardTitle>
                  <CardDescription>
                    Zeitraum: {abrechnungszeitraum.von} bis {abrechnungszeitraum.bis}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <p className="text-2xl font-bold">{formatCurrency(abrechnung.gesamtKosten)}</p>
                      <p className="text-xs text-muted-foreground">Gesamtkosten</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <p className="text-2xl font-bold">{einheiten.length}</p>
                      <p className="text-xs text-muted-foreground">Einheiten</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <p className="text-2xl font-bold">{gesamtFlaeche} m²</p>
                      <p className="text-xs text-muted-foreground">Gesamtfläche</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {abrechnung.ergebnisse.map((erg: any) => (
                <Card key={erg.einheit.id} className={erg.saldo > 0 ? 'border-red-200' : 'border-green-200'}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{erg.einheit.bezeichnung}</h3>
                      <span className="text-sm text-muted-foreground">{erg.einheit.flaeche} m²</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kostenanteil</span>
                        <span>{formatCurrency(erg.anteilGesamt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vorauszahlungen ({formatCurrency(erg.einheit.vorauszahlung)} × 12)</span>
                        <span>-{formatCurrency(erg.vorauszahlungenGesamt)}</span>
                      </div>
                      <div className={`border-t pt-2 flex justify-between font-bold ${
                        erg.saldo > 0 ? 'text-destructive' : 'text-green-600'
                      }`}>
                        <span>{erg.saldo > 0 ? 'Nachzahlung' : 'Guthaben'}</span>
                        <span>{formatCurrency(Math.abs(erg.saldo))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>Bearbeiten</Button>
                <Button className="flex-1 gradient-portal text-white">PDF exportieren</Button>
              </div>

              {/* Cross-Sell */}
              <div className="mt-6">
                <CrossSellBanner currentApp="Portal" context="rechner" maxItems={2} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
