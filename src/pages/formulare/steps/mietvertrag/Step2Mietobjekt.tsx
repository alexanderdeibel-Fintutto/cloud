

import { Home, Maximize2, Layers, ParkingCircle, TreePine, ChefHat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { AddressField } from '@/components/fields/AddressField'
import { AIFieldHelper } from '@/components/ai/AIFieldHelper'
import { MietvertragData } from '@/types/mietvertrag'

interface Step2Props {
  data: MietvertragData
  onChange: (updates: Partial<MietvertragData>) => void
}

const ETAGE_OPTIONS = [
  { value: 'eg', label: 'Erdgeschoss' },
  { value: 'hg', label: 'Hochparterre' },
  { value: '1', label: '1. Obergeschoss' },
  { value: '2', label: '2. Obergeschoss' },
  { value: '3', label: '3. Obergeschoss' },
  { value: '4', label: '4. Obergeschoss' },
  { value: '5', label: '5. Obergeschoss' },
  { value: '6+', label: '6. OG oder höher' },
  { value: 'dg', label: 'Dachgeschoss' },
  { value: 'ug', label: 'Untergeschoss/Souterrain' },
]

const LAGE_OPTIONS = [
  { value: 'links', label: 'Links' },
  { value: 'rechts', label: 'Rechts' },
  { value: 'mitte', label: 'Mitte' },
  { value: 'vorne', label: 'Vorne' },
  { value: 'hinten', label: 'Hinten' },
]

export function Step2Mietobjekt({ data, onChange }: Step2Props) {
  const handleLageChange = (field: 'etage' | 'lage', value: string) => {
    onChange({
      objektLage: { ...data.objektLage, [field]: value }
    })
  }

  return (
    <div className="space-y-8">
      {/* Adresse des Mietobjekts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5" />
            Adresse der Wohnung
          </CardTitle>
          <CardDescription>
            Vollständige Adresse des zu vermietenden Objekts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AddressField
            value={data.objektAdresse}
            onChange={(objektAdresse) => onChange({ objektAdresse })}
            label="Mietobjekt-Adresse"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="etage">Etage / Stockwerk</Label>
              <Select
                value={data.objektLage.etage}
                onValueChange={(v) => handleLageChange('etage', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Bitte wählen" />
                </SelectTrigger>
                <SelectContent>
                  {ETAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lage">Lage im Gebäude</Label>
              <Select
                value={data.objektLage.lage}
                onValueChange={(v) => handleLageChange('lage', v as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Bitte wählen" />
                </SelectTrigger>
                <SelectContent>
                  {LAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wohnungsgröße */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Maximize2 className="h-5 w-5" />
            Wohnungsgröße
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wohnflaeche">Wohnfläche (m²)</Label>
                <AIFieldHelper
                  fieldId="wohnflaeche"
                  fieldType="text"
                  context={{ zimmer: data.zimmeranzahl }}
                />
              </div>
              <div className="relative mt-1">
                <Input
                  id="wohnflaeche"
                  type="number"
                  min="10"
                  max="500"
                  step="0.5"
                  value={data.wohnflaeche || ''}
                  onChange={(e) => onChange({ wohnflaeche: parseFloat(e.target.value) || null })}
                  placeholder="z.B. 65"
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  m²
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Wohnfläche nach Wohnflächenverordnung (WoFlV)
              </p>
            </div>

            <div>
              <Label htmlFor="zimmeranzahl">Anzahl Zimmer</Label>
              <Select
                value={data.zimmeranzahl?.toString() || ''}
                onValueChange={(v) => onChange({ zimmeranzahl: parseFloat(v) || null })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Bitte wählen" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Zimmer
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Ohne Küche, Bad, Flur (halbe Zimmer = Durchgangszimmer)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ausstattung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Ausstattung & Zubehörräume
          </CardTitle>
          <CardDescription>
            Was gehört zur Wohnung dazu?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Außenbereiche */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Außenbereiche</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="balkon"
                  checked={data.hatBalkon}
                  onCheckedChange={(checked) => onChange({ hatBalkon: !!checked })}
                />
                <Label htmlFor="balkon" className="cursor-pointer">Balkon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terrasse"
                  checked={data.hatTerrasse}
                  onCheckedChange={(checked) => onChange({ hatTerrasse: !!checked })}
                />
                <Label htmlFor="terrasse" className="cursor-pointer">Terrasse</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="garten"
                  checked={data.hatGarten}
                  onCheckedChange={(checked) => onChange({ hatGarten: !!checked })}
                />
                <Label htmlFor="garten" className="cursor-pointer flex items-center gap-1">
                  <TreePine className="h-4 w-4" />
                  Garten(-mitbenutzung)
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Nebenräume */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Nebenräume</Label>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  id="keller"
                  checked={data.hatKeller}
                  onCheckedChange={(checked) => onChange({ hatKeller: !!checked })}
                />
                <div className="flex-1">
                  <Label htmlFor="keller" className="cursor-pointer">Kellerraum</Label>
                  {data.hatKeller && (
                    <Input
                      value={data.kellerNummer || ''}
                      onChange={(e) => onChange({ kellerNummer: e.target.value })}
                      placeholder="Keller-Nr. (z.B. K12)"
                      className="mt-2 max-w-xs"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Checkbox
                  id="stellplatz"
                  checked={data.hatStellplatz}
                  onCheckedChange={(checked) => onChange({ hatStellplatz: !!checked })}
                />
                <div className="flex-1">
                  <Label htmlFor="stellplatz" className="cursor-pointer flex items-center gap-1">
                    <ParkingCircle className="h-4 w-4" />
                    PKW-Stellplatz
                  </Label>
                  {data.hatStellplatz && (
                    <Input
                      value={data.stellplatzNummer || ''}
                      onChange={(e) => onChange({ stellplatzNummer: e.target.value })}
                      placeholder="Stellplatz-Nr. (z.B. P5)"
                      className="mt-2 max-w-xs"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Checkbox
                  id="garage"
                  checked={data.hatGarage}
                  onCheckedChange={(checked) => onChange({ hatGarage: !!checked })}
                />
                <div className="flex-1">
                  <Label htmlFor="garage" className="cursor-pointer">Garage</Label>
                  {data.hatGarage && (
                    <Input
                      value={data.garagenNummer || ''}
                      onChange={(e) => onChange({ garagenNummer: e.target.value })}
                      placeholder="Garagen-Nr. (z.B. G3)"
                      className="mt-2 max-w-xs"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Einbauküche */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Ausstattung</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="einbaukueche"
                checked={data.hatEinbaukueche}
                onCheckedChange={(checked) => onChange({ hatEinbaukueche: !!checked })}
              />
              <Label htmlFor="einbaukueche" className="cursor-pointer flex items-center gap-1">
                <ChefHat className="h-4 w-4" />
                Einbauküche vorhanden
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Die Einbauküche wird mitvermietet und ist Bestandteil des Mietvertrags
            </p>
          </div>

          <Separator />

          {/* Sonstige Ausstattung */}
          <div>
            <Label htmlFor="ausstattungSonstige">Sonstige Ausstattung / Anmerkungen</Label>
            <Textarea
              id="ausstattungSonstige"
              value={data.ausstattungSonstige}
              onChange={(e) => onChange({ ausstattungSonstige: e.target.value })}
              placeholder="z.B. Gäste-WC, Abstellraum, Dachbodenabteil, Waschmaschinenanschluss..."
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
