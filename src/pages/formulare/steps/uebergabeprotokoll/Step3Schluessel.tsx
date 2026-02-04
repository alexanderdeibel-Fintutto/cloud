import { Key, Plus, Trash2, AlertCircle, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UebergabeprotokollData, SchluesselData, EMPTY_SCHLUESSEL } from '@/types/uebergabeprotokoll'

interface Step3Props {
  data: UebergabeprotokollData
  onChange: (updates: Partial<UebergabeprotokollData>) => void
}

export function Step3Schluessel({ data, onChange }: Step3Props) {
  const handleSchluesselChange = (index: number, field: keyof SchluesselData, value: any) => {
    const newSchluessel = [...data.schluessel]
    newSchluessel[index] = { ...newSchluessel[index], [field]: value }
    onChange({ schluessel: newSchluessel })
  }

  const handleAddSchluessel = () => {
    onChange({
      schluessel: [...data.schluessel, { ...EMPTY_SCHLUESSEL }]
    })
  }

  const handleRemoveSchluessel = (index: number) => {
    if (data.schluessel.length > 1) {
      onChange({
        schluessel: data.schluessel.filter((_, i) => i !== index)
      })
    }
  }

  // Pruefen ob alle Schluessel uebergeben wurden
  const allSchluesselUebergeben = data.schluessel.every(
    s => s.anzahlUebergeben === s.anzahlVorhanden || s.anzahlVorhanden === 0
  )

  const fehlendeSchluessel = data.schluessel.filter(
    s => s.anzahlUebergeben < s.anzahlVorhanden && s.anzahlVorhanden > 0
  )

  return (
    <div className="space-y-6">
      {/* Status */}
      <Card className={allSchluesselUebergeben ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {allSchluesselUebergeben ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <div>
              <p className={`font-medium ${allSchluesselUebergeben ? 'text-green-800' : 'text-yellow-800'}`}>
                {allSchluesselUebergeben
                  ? 'Alle Schluessel vollstaendig'
                  : `${fehlendeSchluessel.length} Schluesselart(en) unvollstaendig`
                }
              </p>
              {!allSchluesselUebergeben && (
                <p className="text-sm text-yellow-600">
                  Fehlende Schluessel: {fehlendeSchluessel.map(s => s.art).join(', ')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schluessel-Liste */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            Schluesseluebergabe
          </CardTitle>
          <CardDescription>
            Dokumentieren Sie alle uebergebenen Schluessel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
              <div className="col-span-4">Schluesselart</div>
              <div className="col-span-2 text-center">Vorhanden</div>
              <div className="col-span-2 text-center">Uebergeben</div>
              <div className="col-span-3">Bemerkung</div>
              <div className="col-span-1"></div>
            </div>

            {/* Schluessel-Eintraege */}
            {data.schluessel.map((schluessel, index) => {
              const isComplete = schluessel.anzahlUebergeben === schluessel.anzahlVorhanden
              const isMissing = schluessel.anzahlUebergeben < schluessel.anzahlVorhanden && schluessel.anzahlVorhanden > 0

              return (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  {/* Art */}
                  <div className="col-span-4">
                    <Input
                      value={schluessel.art}
                      onChange={(e) => handleSchluesselChange(index, 'art', e.target.value)}
                      placeholder="z.B. Wohnungsschluessel"
                    />
                  </div>

                  {/* Vorhanden */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={schluessel.anzahlVorhanden}
                      onChange={(e) => handleSchluesselChange(index, 'anzahlVorhanden', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>

                  {/* Uebergeben */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      max={schluessel.anzahlVorhanden}
                      value={schluessel.anzahlUebergeben}
                      onChange={(e) => handleSchluesselChange(index, 'anzahlUebergeben', parseInt(e.target.value) || 0)}
                      className={`text-center ${isMissing ? 'border-yellow-500' : isComplete && schluessel.anzahlVorhanden > 0 ? 'border-green-500' : ''}`}
                    />
                  </div>

                  {/* Bemerkung */}
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      value={schluessel.bemerkung || ''}
                      onChange={(e) => handleSchluesselChange(index, 'bemerkung', e.target.value)}
                      placeholder="Optional"
                      className="text-sm"
                    />
                    {isComplete && schluessel.anzahlVorhanden > 0 && (
                      <Badge variant="success" className="shrink-0">
                        <Check className="h-3 w-3" />
                      </Badge>
                    )}
                    {isMissing && (
                      <Badge variant="warning" className="shrink-0">
                        -{schluessel.anzahlVorhanden - schluessel.anzahlUebergeben}
                      </Badge>
                    )}
                  </div>

                  {/* Loeschen */}
                  <div className="col-span-1 flex justify-end">
                    {data.schluessel.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSchluessel(index)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            variant="outline"
            onClick={handleAddSchluessel}
            className="w-full mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Weitere Schluesselart hinzufuegen
          </Button>
        </CardContent>
      </Card>

      {/* Zusammenfassung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.schluessel.filter(s => s.art && s.anzahlVorhanden > 0).map((schluessel, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">{schluessel.art}</p>
                <p className="text-lg font-bold">
                  {schluessel.anzahlUebergeben} / {schluessel.anzahlVorhanden}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
