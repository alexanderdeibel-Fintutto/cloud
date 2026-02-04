import { Calendar, Clock, Home, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PersonField } from '@/components/fields/PersonField'
import { AddressField } from '@/components/fields/AddressField'
import { UebergabeprotokollData } from '@/types/uebergabeprotokoll'

interface Step1Props {
  data: UebergabeprotokollData
  onChange: (updates: Partial<UebergabeprotokollData>) => void
}

export function Step1Grunddaten({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-8">
      {/* Art des Protokolls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Art des Protokolls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={data.protokollart}
            onValueChange={(v) => onChange({ protokollart: v as 'einzug' | 'auszug' })}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="einzug" id="einzug" className="peer sr-only" />
              <Label
                htmlFor="einzug"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Home className="mb-3 h-6 w-6" />
                <span className="font-medium">Einzug</span>
                <span className="text-xs text-muted-foreground">Neue Mieter ziehen ein</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="auszug" id="auszug" className="peer sr-only" />
              <Label
                htmlFor="auszug"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Home className="mb-3 h-6 w-6" />
                <span className="font-medium">Auszug</span>
                <span className="text-xs text-muted-foreground">Bisherige Mieter ziehen aus</span>
              </Label>
            </div>
          </RadioGroup>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="uebergabedatum" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Uebergabedatum
              </Label>
              <Input
                id="uebergabedatum"
                type="date"
                value={data.uebergabedatum}
                onChange={(e) => onChange({ uebergabedatum: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="uebergabeuhrzeit" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Uhrzeit
              </Label>
              <Input
                id="uebergabeuhrzeit"
                type="time"
                value={data.uebergabeuhrzeit}
                onChange={(e) => onChange({ uebergabeuhrzeit: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mietobjekt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5" />
            Mietobjekt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AddressField
            value={data.objektAdresse}
            onChange={(objektAdresse) => onChange({ objektAdresse })}
            label="Adresse der Wohnung"
            required
          />

          <div className="max-w-xs">
            <Label htmlFor="wohnflaeche">Wohnflaeche (m2)</Label>
            <Input
              id="wohnflaeche"
              type="number"
              min="10"
              max="500"
              value={data.wohnflaeche || ''}
              onChange={(e) => onChange({ wohnflaeche: parseFloat(e.target.value) || null })}
              placeholder="z.B. 65"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vermieter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vermieter / Verwalter
          </CardTitle>
          <CardDescription>
            Person, die die Wohnung uebergibt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonField
            value={data.vermieter}
            onChange={(vermieter) => onChange({ vermieter })}
            required
            showBirthdate={false}
            showContact={true}
          />
        </CardContent>
      </Card>

      {/* Mieter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            {data.protokollart === 'einzug' ? 'Neuer Mieter' : 'Bisheriger Mieter'}
          </CardTitle>
          <CardDescription>
            {data.protokollart === 'einzug'
              ? 'Person, die in die Wohnung einzieht'
              : 'Person, die aus der Wohnung auszieht'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.protokollart === 'einzug' ? (
            <PersonField
              value={data.mieterNeu || { anrede: '', vorname: '', nachname: '' }}
              onChange={(mieterNeu) => onChange({ mieterNeu })}
              required
              showBirthdate={false}
              showContact={true}
            />
          ) : (
            <PersonField
              value={data.mieterAlt || { anrede: '', vorname: '', nachname: '' }}
              onChange={(mieterAlt) => onChange({ mieterAlt })}
              required
              showBirthdate={false}
              showContact={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Zeuge (optional) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Zeuge (optional)</CardTitle>
              <CardDescription>
                Ein Zeuge kann bei Streitigkeiten hilfreich sein
              </CardDescription>
            </div>
            <Badge variant="outline">Optional</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <PersonField
            value={data.zeuge || { anrede: '', vorname: '', nachname: '' }}
            onChange={(zeuge) => onChange({ zeuge })}
            showBirthdate={false}
            showContact={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
