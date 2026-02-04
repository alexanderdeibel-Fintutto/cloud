import * as React from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Home, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  UebergabeprotokollData,
  RaumZustandData,
  EMPTY_RAUM,
  ZustandBewertung,
  ZUSTAND_LABELS,
  ZUSTAND_COLORS
} from '@/types/uebergabeprotokoll'
import { cn } from '@/lib/utils'

interface Step4Props {
  data: UebergabeprotokollData
  onChange: (updates: Partial<UebergabeprotokollData>) => void
}

const RAUM_TYPEN = [
  { value: 'wohnzimmer', label: 'Wohnzimmer' },
  { value: 'schlafzimmer', label: 'Schlafzimmer' },
  { value: 'kinderzimmer', label: 'Kinderzimmer' },
  { value: 'kueche', label: 'Kueche' },
  { value: 'bad', label: 'Bad/Badezimmer' },
  { value: 'wc', label: 'WC/Gaeste-WC' },
  { value: 'flur', label: 'Flur/Diele' },
  { value: 'abstellraum', label: 'Abstellraum' },
  { value: 'keller', label: 'Keller' },
  { value: 'balkon', label: 'Balkon' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'sonstige', label: 'Sonstiger Raum' },
]

const ZUSTAND_OPTIONS: ZustandBewertung[] = ['sehr_gut', 'gut', 'normal', 'maengel', 'nicht_vorhanden']

const PRUEFPUNKTE = [
  { key: 'waende', label: 'Waende' },
  { key: 'decke', label: 'Decke' },
  { key: 'boden', label: 'Boden' },
  { key: 'fenster', label: 'Fenster' },
  { key: 'tueren', label: 'Tueren' },
  { key: 'heizkoerper', label: 'Heizkoerper' },
  { key: 'steckdosen', label: 'Steckdosen/Schalter' },
  { key: 'beleuchtung', label: 'Beleuchtung' },
]

function ZustandButton({
  zustand,
  selected,
  onClick
}: {
  zustand: ZustandBewertung
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2 py-1 text-xs rounded border transition-colors",
        selected ? ZUSTAND_COLORS[zustand] : "bg-white hover:bg-muted border-gray-200"
      )}
    >
      {ZUSTAND_LABELS[zustand]}
    </button>
  )
}

function RaumKarte({
  raum,
  onChange,
  onRemove,
  canRemove
}: {
  raum: RaumZustandData
  onChange: (field: keyof RaumZustandData, value: any) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(true)

  const maengelCount = PRUEFPUNKTE.filter(
    p => raum[p.key as keyof RaumZustandData] === 'maengel'
  ).length

  return (
    <Card className={maengelCount > 0 ? 'border-yellow-300' : ''}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={raum.raumname}
                  onChange={(e) => onChange('raumname', e.target.value)}
                  className="h-8 w-40 font-medium"
                  placeholder="Raumname"
                />
                <Select
                  value={raum.raumtyp}
                  onValueChange={(v) => onChange('raumtyp', v)}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RAUM_TYPEN.map((typ) => (
                      <SelectItem key={typ.value} value={typ.value}>
                        {typ.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {maengelCount > 0 && (
                <Badge variant="warning" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {maengelCount} Maengel
                </Badge>
              )}
              {canRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Pruefpunkte-Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">Pruefpunkt</th>
                      <th className="text-center py-2 px-1" colSpan={5}>Zustand</th>
                      <th className="text-left py-2 pl-4 font-medium">Bemerkung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRUEFPUNKTE.map((punkt) => (
                      <tr key={punkt.key} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{punkt.label}</td>
                        <td className="py-2" colSpan={5}>
                          <div className="flex gap-1 flex-wrap">
                            {ZUSTAND_OPTIONS.map((zustand) => (
                              <ZustandButton
                                key={zustand}
                                zustand={zustand}
                                selected={raum[punkt.key as keyof RaumZustandData] === zustand}
                                onClick={() => onChange(punkt.key as keyof RaumZustandData, zustand)}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="py-2 pl-4">
                          <Input
                            value={(raum[`${punkt.key}Bemerkung` as keyof RaumZustandData] as string) || ''}
                            onChange={(e) => onChange(`${punkt.key}Bemerkung` as keyof RaumZustandData, e.target.value)}
                            placeholder="Optional"
                            className="h-7 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sonstige Maengel */}
              <div>
                <Label className="text-sm">Sonstige Maengel / Anmerkungen</Label>
                <Textarea
                  value={raum.sonstigesMaengel || ''}
                  onChange={(e) => onChange('sonstigesMaengel', e.target.value)}
                  placeholder="z.B. Kratzer an der Tuer, fehlende Fussleiste..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export function Step4Raeume({ data, onChange }: Step4Props) {
  const handleRaumChange = (index: number, field: keyof RaumZustandData, value: any) => {
    const newRaeume = [...data.raeume]
    newRaeume[index] = { ...newRaeume[index], [field]: value }
    onChange({ raeume: newRaeume })
  }

  const handleAddRaum = () => {
    onChange({
      raeume: [...data.raeume, { ...EMPTY_RAUM, raumname: `Raum ${data.raeume.length + 1}` }]
    })
  }

  const handleRemoveRaum = (index: number) => {
    if (data.raeume.length > 1) {
      onChange({
        raeume: data.raeume.filter((_, i) => i !== index)
      })
    }
  }

  // Statistik
  const totalMaengel = data.raeume.reduce((sum, raum) => {
    return sum + PRUEFPUNKTE.filter(p => raum[p.key as keyof RaumZustandData] === 'maengel').length
  }, 0)

  return (
    <div className="space-y-6">
      {/* Uebersicht */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{data.raeume.length}</p>
          <p className="text-sm text-muted-foreground">Raeume</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{totalMaengel}</p>
          <p className="text-sm text-muted-foreground">Maengel gesamt</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {data.raeume.filter(r =>
              PRUEFPUNKTE.every(p => r[p.key as keyof RaumZustandData] !== 'maengel')
            ).length}
          </p>
          <p className="text-sm text-muted-foreground">Ohne Maengel</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {data.raeume.filter(r =>
              PRUEFPUNKTE.some(p => r[p.key as keyof RaumZustandData] === 'maengel')
            ).length}
          </p>
          <p className="text-sm text-muted-foreground">Mit Maengeln</p>
        </Card>
      </div>

      {/* Raeume */}
      <div className="space-y-4">
        {data.raeume.map((raum, index) => (
          <RaumKarte
            key={index}
            raum={raum}
            onChange={(field, value) => handleRaumChange(index, field, value)}
            onRemove={() => handleRemoveRaum(index)}
            canRemove={data.raeume.length > 1}
          />
        ))}
      </div>

      <Button
        variant="outline"
        onClick={handleAddRaum}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Raum hinzufuegen
      </Button>
    </div>
  )
}
