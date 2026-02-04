

import { Calendar, Shield, AlertTriangle, Info, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DateRangeField } from '@/components/fields/DateRangeField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { formatCurrency, calculateMaxKaution } from '@/lib/utils'
import { MietvertragData } from '@/types/mietvertrag'

interface Step4Props {
  data: MietvertragData
  onChange: (updates: Partial<MietvertragData>) => void
}

const BEFRISTUNGSGRUENDE = [
  { value: 'eigenbedarf', label: 'Eigenbedarf geplant', description: 'Wohnung wird nach Ablauf für Vermieter/Familie benötigt' },
  { value: 'abriss', label: 'Abriss/Umbau', description: 'Gebäude soll abgerissen oder wesentlich umgebaut werden' },
  { value: 'werksmiete', label: 'Werkswohnung', description: 'Dienstwohnung für Arbeitnehmer' },
  { value: 'sonstige', label: 'Sonstiger Grund', description: 'Anderer berechtigter Grund' },
]

const KAUTIONSARTEN = [
  { value: 'barkaution', label: 'Barkaution', description: 'Überweisung auf Mietkautionskonto' },
  { value: 'sparbuch', label: 'Sparbuch', description: 'Verpfändetes Sparbuch' },
  { value: 'buergschaft', label: 'Bankbürgschaft', description: 'Bürgschaft durch eine Bank' },
  { value: 'kautionsversicherung', label: 'Kautionsversicherung', description: 'Mietkautionsversicherung' },
]

export function Step4MietdauerKaution({ data, onChange }: Step4Props) {
  const maxKaution = calculateMaxKaution(data.kaltmiete || 0)
  const isKautionTooHigh = data.kaution !== null && data.kaution > maxKaution

  return (
    <div className="space-y-8">
      {/* Mietdauer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Mietdauer
          </CardTitle>
          <CardDescription>
            Beginn des Mietverhältnisses und eventuelle Befristung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DateRangeField
            value={data.mietdauer}
            onChange={(mietdauer) => onChange({ mietdauer })}
            label="Mietvertragslaufzeit"
            startLabel="Mietbeginn"
            endLabel="Mietende"
            required
            showUnbefristet
            showDuration
          />

          {/* Befristungsgrund */}
          {!data.mietdauer.isUnbefristet && data.mietdauer.endDate && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Befristung erfordert einen Grund</p>
                    <p>
                      Bei Wohnraum ist eine Befristung nur wirksam, wenn der Vermieter
                      einen der gesetzlich zulässigen Gründe angibt (§ 575 BGB).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Befristungsgrund</Label>
                <Select
                  value={data.befristungsgrund || ''}
                  onValueChange={(v) => onChange({ befristungsgrund: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Grund auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BEFRISTUNGSGRUENDE.map((grund) => (
                      <SelectItem key={grund.value} value={grund.value}>
                        <div>
                          <div className="font-medium">{grund.label}</div>
                          <div className="text-xs text-muted-foreground">{grund.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {data.befristungsgrund === 'sonstige' && (
                <div>
                  <Label>Befristungsgrund (Beschreibung)</Label>
                  <Textarea
                    value={data.befristungsgrund}
                    onChange={(e) => onChange({ befristungsgrund: e.target.value })}
                    placeholder="Beschreiben Sie den Grund für die Befristung..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {data.mietdauer.isUnbefristet && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <Check className="h-5 w-5" />
                <div>
                  <p className="font-medium">Unbefristetes Mietverhältnis</p>
                  <p className="text-green-600">
                    Kann von beiden Seiten mit gesetzlicher Frist gekündigt werden
                    (Mieter: 3 Monate, Vermieter: 3-9 Monate je nach Wohndauer)
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kaution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Mietkaution
          </CardTitle>
          <CardDescription>
            Sicherheitsleistung des Mieters (§ 551 BGB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <CurrencyField
                value={data.kaution}
                onChange={(kaution) => onChange({ kaution })}
                label="Kautionshöhe"
                required
                min={0}
                max={maxKaution}
                helperText={`Maximal ${formatCurrency(maxKaution)} (3 Kaltmieten)`}
                error={isKautionTooHigh ? `Darf ${formatCurrency(maxKaution)} nicht überschreiten` : undefined}
                calculation={{
                  label: 'Maximum berechnen (3 Kaltmieten)',
                  formula: () => maxKaution
                }}
              />
            </div>

            <div>
              <Label>Kautionsart</Label>
              <Select
                value={data.kautionsart}
                onValueChange={(v) => onChange({ kautionsart: v as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Art der Kaution wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {KAUTIONSARTEN.map((art) => (
                    <SelectItem key={art.value} value={art.value}>
                      {art.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Muss getrennt vom Vermögen des Vermieters angelegt werden
              </p>
            </div>
          </div>

          <Separator />

          {/* Ratenzahlung */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Ratenzahlung der Kaution</Label>
              <p className="text-sm text-muted-foreground">
                Mieter darf in 3 Monatsraten zahlen (§ 551 Abs. 2 BGB)
              </p>
            </div>
            <Switch
              checked={data.ratenzahlungKaution}
              onCheckedChange={(ratenzahlungKaution) => onChange({ ratenzahlungKaution })}
            />
          </div>

          {data.ratenzahlungKaution && data.kaution && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Ratenzahlungsplan:</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">1. Rate (bei Einzug):</span>
                  <span className="block font-medium">{formatCurrency(data.kaution / 3)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">2. Rate (2. Monat):</span>
                  <span className="block font-medium">{formatCurrency(data.kaution / 3)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">3. Rate (3. Monat):</span>
                  <span className="block font-medium">{formatCurrency(data.kaution / 3)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Info-Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-blue-800">
              <Info className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium">Hinweise zur Mietkaution</p>
                <ul className="list-disc list-inside text-blue-600 mt-1 space-y-1">
                  <li>Kaution muss auf einem separaten Konto angelegt werden</li>
                  <li>Zinserträge stehen dem Mieter zu</li>
                  <li>Rückzahlung nach Auszug mit angemessener Prüffrist (ca. 3-6 Monate)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
