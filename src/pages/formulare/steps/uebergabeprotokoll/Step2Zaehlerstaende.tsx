import { Gauge, Plus, Trash2, Zap, Flame, Droplets, Thermometer, Info, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { UebergabeprotokollData, ZaehlerstandData, EMPTY_ZAEHLERSTAND } from '@/types/uebergabeprotokoll'

interface Step2Props {
  data: UebergabeprotokollData
  onChange: (updates: Partial<UebergabeprotokollData>) => void
}

const ZAEHLERARTEN = [
  { value: 'strom', label: 'Strom', icon: Zap, einheit: 'kWh', color: 'text-yellow-500' },
  { value: 'gas', label: 'Gas', icon: Flame, einheit: 'm3', color: 'text-orange-500' },
  { value: 'wasser', label: 'Wasser (kalt)', icon: Droplets, einheit: 'm3', color: 'text-blue-500' },
  { value: 'warmwasser', label: 'Warmwasser', icon: Droplets, einheit: 'm3', color: 'text-red-400' },
  { value: 'heizung', label: 'Heizung', icon: Thermometer, einheit: 'Einheiten', color: 'text-red-500' },
]

export function Step2Zaehlerstaende({ data, onChange }: Step2Props) {
  const handleZaehlerChange = (index: number, field: keyof ZaehlerstandData, value: any) => {
    const newZaehler = [...data.zaehlerstaende]
    newZaehler[index] = { ...newZaehler[index], [field]: value }

    // Einheit automatisch setzen
    if (field === 'zaehlerart') {
      const art = ZAEHLERARTEN.find(z => z.value === value)
      if (art) {
        newZaehler[index].einheit = art.einheit
      }
    }

    onChange({ zaehlerstaende: newZaehler })
  }

  const handleAddZaehler = () => {
    onChange({
      zaehlerstaende: [
        ...data.zaehlerstaende,
        { ...EMPTY_ZAEHLERSTAND, ablesedatum: data.uebergabedatum }
      ]
    })
  }

  const handleRemoveZaehler = (index: number) => {
    if (data.zaehlerstaende.length > 1) {
      onChange({
        zaehlerstaende: data.zaehlerstaende.filter((_, i) => i !== index)
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Wichtig: Zaehlerstaende dokumentieren</p>
              <ul className="list-disc list-inside text-blue-600 mt-1 space-y-1">
                <li>Fotografieren Sie jeden Zaehler mit dem Stand</li>
                <li>Notieren Sie die Zaehlernummer genau</li>
                <li>Bei Einzug: Fuer die erste Nebenkostenabrechnung</li>
                <li>Bei Auszug: Fuer die Endabrechnung</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.zaehlerstaende.map((zaehler, index) => {
        const zaehlerInfo = ZAEHLERARTEN.find(z => z.value === zaehler.zaehlerart)
        const Icon = zaehlerInfo?.icon || Gauge

        return (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${zaehlerInfo?.color || 'text-gray-500'}`} />
                  <CardTitle className="text-base">
                    {zaehlerInfo?.label || 'Zaehler'} {index + 1}
                  </CardTitle>
                </div>
                {data.zaehlerstaende.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveZaehler(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Zählerart */}
                <div>
                  <Label>Zaehlerart</Label>
                  <Select
                    value={zaehler.zaehlerart}
                    onValueChange={(v) => handleZaehlerChange(index, 'zaehlerart', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZAEHLERARTEN.map((art) => (
                        <SelectItem key={art.value} value={art.value}>
                          <div className="flex items-center gap-2">
                            <art.icon className={`h-4 w-4 ${art.color}`} />
                            {art.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Zählernummer */}
                <div>
                  <Label>Zaehlernummer</Label>
                  <Input
                    value={zaehler.zaehlernummer}
                    onChange={(e) => handleZaehlerChange(index, 'zaehlernummer', e.target.value)}
                    placeholder="z.B. 1234567890"
                    className="mt-1 font-mono"
                  />
                </div>

                {/* Zählerstand */}
                <div>
                  <Label>Zaehlerstand</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={zaehler.stand || ''}
                      onChange={(e) => handleZaehlerChange(index, 'stand', parseFloat(e.target.value) || null)}
                      placeholder="Stand"
                      className="font-mono"
                    />
                    <Badge variant="outline" className="shrink-0 px-3">
                      {zaehler.einheit}
                    </Badge>
                  </div>
                </div>

                {/* Ablesedatum */}
                <div>
                  <Label>Ablesedatum</Label>
                  <Input
                    type="date"
                    value={zaehler.ablesedatum}
                    onChange={(e) => handleZaehlerChange(index, 'ablesedatum', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Foto-Upload Hinweis */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                <Camera className="h-4 w-4" />
                <span>Tipp: Fotografieren Sie den Zaehlerstand als Nachweis</span>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <Button
        variant="outline"
        onClick={handleAddZaehler}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Weiteren Zaehler hinzufuegen
      </Button>
    </div>
  )
}
