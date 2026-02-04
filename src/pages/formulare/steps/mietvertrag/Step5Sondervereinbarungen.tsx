

import { FileText, PawPrint, Users, Paintbrush, Wrench, TreePine, Snowflake, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { AIFieldHelper } from '@/components/ai/AIFieldHelper'
import { MietvertragData } from '@/types/mietvertrag'

interface Step5Props {
  data: MietvertragData
  onChange: (updates: Partial<MietvertragData>) => void
}

export function Step5Sondervereinbarungen({ data, onChange }: Step5Props) {
  return (
    <div className="space-y-8">
      {/* Tierhaltung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PawPrint className="h-5 w-5" />
            Tierhaltung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={data.tierhaltung}
            onValueChange={(v) => onChange({ tierhaltung: v as any })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="erlaubt" id="tier-erlaubt" />
              <Label htmlFor="tier-erlaubt" className="cursor-pointer">
                Tierhaltung erlaubt
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="genehmigungspflichtig" id="tier-genehm" />
              <Label htmlFor="tier-genehm" className="cursor-pointer">
                Tierhaltung genehmigungspflichtig (empfohlen)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verboten" id="tier-verboten" />
              <Label htmlFor="tier-verboten" className="cursor-pointer">
                Tierhaltung verboten (außer Kleintiere)
              </Label>
            </div>
          </RadioGroup>

          {data.tierhaltung === 'genehmigungspflichtig' && (
            <div className="p-4 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground">
                Kleintiere (Fische, Hamster, etc.) sind generell erlaubt.
                Für Hunde und Katzen ist eine Genehmigung erforderlich,
                die nur aus wichtigem Grund verweigert werden kann.
              </p>
            </div>
          )}

          <div>
            <Label>Details zur Tierhaltung (optional)</Label>
            <Textarea
              value={data.tierhaltungDetails || ''}
              onChange={(e) => onChange({ tierhaltungDetails: e.target.value })}
              placeholder="z.B. 'Ein Hund (Labrador) vorhanden und genehmigt'"
              className="mt-1"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Untervermietung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Untervermietung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.untervermietung}
            onValueChange={(v) => onChange({ untervermietung: v as any })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="erlaubt" id="unter-erlaubt" />
              <Label htmlFor="unter-erlaubt" className="cursor-pointer">
                Untervermietung generell erlaubt
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="genehmigungspflichtig" id="unter-genehm" />
              <Label htmlFor="unter-genehm" className="cursor-pointer">
                Untervermietung genehmigungspflichtig (empfohlen)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verboten" id="unter-verboten" />
              <Label htmlFor="unter-verboten" className="cursor-pointer">
                Untervermietung nicht gestattet
              </Label>
            </div>
          </RadioGroup>

          <p className="text-sm text-muted-foreground mt-4">
            Bei berechtigtem Interesse des Mieters muss der Vermieter
            einer Untervermietung zustimmen (§ 553 BGB).
          </p>
        </CardContent>
      </Card>

      {/* Schönheitsreparaturen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Schönheitsreparaturen
          </CardTitle>
          <CardDescription>
            Wer ist für das Streichen und Tapezieren zuständig?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={data.schoenheitsreparaturen}
            onValueChange={(v) => onChange({ schoenheitsreparaturen: v as any })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="keine" id="schoen-keine" />
              <Label htmlFor="schoen-keine" className="cursor-pointer">
                Keine Übertragung auf den Mieter (gesetzlicher Zustand)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mieter" id="schoen-mieter" />
              <Label htmlFor="schoen-mieter" className="cursor-pointer">
                Auf Mieter übertragen (mit wirksamer Klausel)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vermieter" id="schoen-vermieter" />
              <Label htmlFor="schoen-vermieter" className="cursor-pointer">
                Verbleibt beim Vermieter
              </Label>
            </div>
          </RadioGroup>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium">Rechtlicher Hinweis</p>
                <p className="text-yellow-600">
                  Viele ältere Klauseln zu Schönheitsreparaturen sind unwirksam (BGH).
                  Starre Fristenpläne und Endrenovierungsklauseln sind nicht zulässig.
                  Bei unrenoviert übernommener Wohnung besteht keine Renovierungspflicht.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kleinreparaturen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Kleinreparaturklausel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Kleinreparaturen auf Mieter übertragen</Label>
              <p className="text-sm text-muted-foreground">
                Mieter trägt Kosten für kleine Reparaturen bis zu einem Höchstbetrag
              </p>
            </div>
            <Switch
              checked={data.kleinreparaturen.enabled}
              onCheckedChange={(enabled) =>
                onChange({ kleinreparaturen: { ...data.kleinreparaturen, enabled } })
              }
            />
          </div>

          {data.kleinreparaturen.enabled && (
            <div className="p-4 bg-muted rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  value={data.kleinreparaturen.einzelbetrag}
                  onChange={(einzelbetrag) =>
                    onChange({ kleinreparaturen: { ...data.kleinreparaturen, einzelbetrag } })
                  }
                  label="Höchstbetrag pro Reparatur"
                  helperText="Typisch: 75-120 €"
                  max={150}
                />
                <CurrencyField
                  value={data.kleinreparaturen.jahresbetrag}
                  onChange={(jahresbetrag) =>
                    onChange({ kleinreparaturen: { ...data.kleinreparaturen, jahresbetrag } })
                  }
                  label="Höchstbetrag pro Jahr"
                  helperText="Typisch: 6-8% der Jahresmiete"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Betrifft nur Gegenstände, die dem häufigen Zugriff des Mieters ausgesetzt sind
                (Wasserhähne, Türgriffe, etc.)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hausordnung & Pflichten */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Hausordnung & Pflichten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Hausordnung als Anlage</Label>
              <p className="text-sm text-muted-foreground">
                Die Hausordnung wird dem Vertrag beigefügt
              </p>
            </div>
            <Switch
              checked={data.hausordnung}
              onCheckedChange={(hausordnung) => onChange({ hausordnung })}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gartenpflege */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <TreePine className="h-4 w-4" />
                Gartenpflege
              </Label>
              <RadioGroup
                value={data.gartenpflege}
                onValueChange={(v) => onChange({ gartenpflege: v as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vermieter" id="garten-vermieter" />
                  <Label htmlFor="garten-vermieter" className="cursor-pointer text-sm">
                    Vermieter
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mieter" id="garten-mieter" />
                  <Label htmlFor="garten-mieter" className="cursor-pointer text-sm">
                    Mieter
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Winterdienst */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Snowflake className="h-4 w-4" />
                Winterdienst (Schneeräumen)
              </Label>
              <RadioGroup
                value={data.winterdienst}
                onValueChange={(v) => onChange({ winterdienst: v as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vermieter" id="winter-vermieter" />
                  <Label htmlFor="winter-vermieter" className="cursor-pointer text-sm">
                    Vermieter
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mieter" id="winter-mieter" />
                  <Label htmlFor="winter-mieter" className="cursor-pointer text-sm">
                    Mieter
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sonstige Vereinbarungen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sonstige Vereinbarungen</CardTitle>
            <AIFieldHelper
              fieldId="sonstigeVereinbarungen"
              fieldType="legal"
              context={{ formType: 'mietvertrag' }}
            />
          </div>
          <CardDescription>
            Zusätzliche individuelle Absprachen zwischen Vermieter und Mieter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.sonstigeVereinbarungen}
            onChange={(e) => onChange({ sonstigeVereinbarungen: e.target.value })}
            placeholder="z.B. Vereinbarungen über Renovierungsarbeiten, Einbauten, besondere Nutzungsrechte..."
            rows={5}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Hinweis: Unwirksame Klauseln werden automatisch durch die gesetzlichen
            Regelungen ersetzt. Im Zweifel empfehlen wir eine rechtliche Beratung.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
