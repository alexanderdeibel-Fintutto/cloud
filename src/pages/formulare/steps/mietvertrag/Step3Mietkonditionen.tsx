

import { Euro, TrendingUp, CalendarDays, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { formatCurrency } from '@/lib/utils'
import { MietvertragData } from '@/types/mietvertrag'

interface Step3Props {
  data: MietvertragData
  onChange: (updates: Partial<MietvertragData>) => void
}

export function Step3Mietkonditionen({ data, onChange }: Step3Props) {
  const gesamtmiete = (data.kaltmiete || 0) +
    (data.nebenkostenVorauszahlung || 0) +
    (data.heizkostenVorauszahlung || 0)

  const qmPreis = data.wohnflaeche && data.kaltmiete
    ? (data.kaltmiete / data.wohnflaeche).toFixed(2)
    : null

  return (
    <div className="space-y-8">
      {/* Grundmiete */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Miete
          </CardTitle>
          <CardDescription>
            Monatliche Mietkosten aufgeschlüsselt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CurrencyField
              value={data.kaltmiete}
              onChange={(kaltmiete) => onChange({ kaltmiete })}
              label="Kaltmiete (Nettomiete)"
              required
              min={0}
              showAIHelper
              aiContext={{ wohnflaeche: data.wohnflaeche, plz: data.objektAdresse?.plz }}
              helperText={qmPreis ? `${qmPreis} €/m²` : undefined}
            />

            <CurrencyField
              value={data.nebenkostenVorauszahlung}
              onChange={(nebenkostenVorauszahlung) => onChange({ nebenkostenVorauszahlung })}
              label="Betriebskostenvorauszahlung"
              required
              min={0}
              showAIHelper
              aiContext={{ wohnflaeche: data.wohnflaeche }}
              helperText="Monatliche Vorauszahlung (Abrechnung jährlich)"
            />

            <CurrencyField
              value={data.heizkostenVorauszahlung}
              onChange={(heizkostenVorauszahlung) => onChange({ heizkostenVorauszahlung })}
              label="Heizkostenvorauszahlung"
              min={0}
              showAIHelper
              aiContext={{ wohnflaeche: data.wohnflaeche }}
              helperText="Inkl. Warmwasser (falls zentral)"
            />
          </div>

          <Separator />

          {/* Gesamtmiete */}
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtmiete (Warmmiete)</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(gesamtmiete)}
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                monatlich
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Kaltmiete:</span>
                <span className="ml-2 font-medium">{formatCurrency(data.kaltmiete || 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Nebenkosten:</span>
                <span className="ml-2 font-medium">{formatCurrency(data.nebenkostenVorauszahlung || 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Heizkosten:</span>
                <span className="ml-2 font-medium">{formatCurrency(data.heizkostenVorauszahlung || 0)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zahlungsmodalitäten */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Zahlungsmodalitäten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Zahlungsweise</Label>
              <Select
                value={data.zahlungsweise}
                onValueChange={(v) => onChange({ zahlungsweise: v as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monatlich">Monatlich</SelectItem>
                  <SelectItem value="vierteljaehrlich">Vierteljährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fälligkeit</Label>
              <Select
                value={data.zahlungsFaelligkeit.toString()}
                onValueChange={(v) => onChange({ zahlungsFaelligkeit: parseInt(v) })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Zum 1. des Monats</SelectItem>
                  <SelectItem value="3">Bis zum 3. Werktag</SelectItem>
                  <SelectItem value="15">Zur Monatsmitte (15.)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Im Voraus zu zahlen (§ 556b BGB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staffelmiete / Indexmiete */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mietanpassung
          </CardTitle>
          <CardDescription>
            Optionale Vereinbarungen zur automatischen Mietanpassung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Staffelmiete */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Staffelmiete</Label>
                <p className="text-sm text-muted-foreground">
                  Festgelegte Mieterhöhungen zu bestimmten Zeitpunkten
                </p>
              </div>
              <Switch
                checked={data.staffelmiete.enabled}
                onCheckedChange={(enabled) =>
                  onChange({
                    staffelmiete: { ...data.staffelmiete, enabled },
                    indexmiete: { ...data.indexmiete, enabled: enabled ? false : data.indexmiete.enabled }
                  })
                }
              />
            </div>

            {data.staffelmiete.enabled && (
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Staffelmiete schließt andere Mieterhöhungen aus (§ 557a BGB)</span>
                </div>
                {/* Hier könnten Staffel-Eingabefelder folgen */}
                <p className="text-sm">
                  Die Staffeln werden im finalen Dokument definiert.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Indexmiete */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Indexmiete</Label>
                <p className="text-sm text-muted-foreground">
                  Miete an den Verbraucherpreisindex gekoppelt
                </p>
              </div>
              <Switch
                checked={data.indexmiete.enabled}
                onCheckedChange={(enabled) =>
                  onChange({
                    indexmiete: { ...data.indexmiete, enabled },
                    staffelmiete: { ...data.staffelmiete, enabled: enabled ? false : data.staffelmiete.enabled }
                  })
                }
              />
            </div>

            {data.indexmiete.enabled && (
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Anpassung nach Verbraucherpreisindex des Statistischen Bundesamts</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Basisjahr</Label>
                    <Input
                      type="number"
                      value={data.indexmiete.basisjahr}
                      onChange={(e) => onChange({
                        indexmiete: { ...data.indexmiete, basisjahr: parseInt(e.target.value) }
                      })}
                      min={2015}
                      max={new Date().getFullYear()}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Anpassungsintervall</Label>
                    <Select
                      value={data.indexmiete.anpassungIntervall.toString()}
                      onValueChange={(v) => onChange({
                        indexmiete: { ...data.indexmiete, anpassungIntervall: parseInt(v) }
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">Jährlich</SelectItem>
                        <SelectItem value="24">Alle 2 Jahre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!data.staffelmiete.enabled && !data.indexmiete.enabled && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <Info className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-medium">Keine automatische Mietanpassung</p>
                  <p className="text-blue-600">
                    Der Vermieter kann die Miete nur durch ein formloses Mieterhöhungsverlangen
                    an die ortsübliche Vergleichsmiete anpassen (max. 15-20% in 3 Jahren).
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
