import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField } from '@/components/fields/AddressField'
import { IBANField } from '@/components/fields/IBANField'
import { MietvertragData, EMPTY_PERSON } from '@/types/mietvertrag'

interface Step1Props {
  data: MietvertragData
  onChange: (updates: Partial<MietvertragData>) => void
}

export function Step1Vertragsparteien({ data, onChange }: Step1Props) {
  // Mieter hinzufügen
  const handleAddMieter = () => {
    if (data.mieter.length < 4) {
      onChange({ mieter: [...data.mieter, { ...EMPTY_PERSON }] })
    }
  }

  // Mieter entfernen
  const handleRemoveMieter = (index: number) => {
    if (data.mieter.length > 1) {
      onChange({ mieter: data.mieter.filter((_, i) => i !== index) })
    }
  }

  // Mieter aktualisieren
  const handleMieterChange = (index: number, mieter: PersonData) => {
    const newMieter = [...data.mieter]
    newMieter[index] = mieter
    onChange({ mieter: newMieter })
  }

  return (
    <div className="space-y-8">
      {/* Vermieter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vermieter</CardTitle>
          <CardDescription>
            Angaben zur Person oder Firma, die die Wohnung vermietet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PersonField
            value={data.vermieter}
            onChange={(vermieter) => onChange({ vermieter })}
            label="Vermieter"
            required
            showBirthdate={false}
            showContact={true}
            showTax={true}
          />

          <Separator />

          <AddressField
            value={data.vermieterAdresse}
            onChange={(vermieterAdresse) => onChange({ vermieterAdresse })}
            label="Adresse des Vermieters"
            required
          />

          <Separator />

          <IBANField
            value={data.vermieterIBAN || ''}
            onChange={(vermieterIBAN) => onChange({ vermieterIBAN })}
            label="Bankverbindung für Mietzahlungen"
            required
            showBIC={true}
          />
        </CardContent>
      </Card>

      {/* Mieter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mieter</CardTitle>
              <CardDescription>
                Angaben zu den Personen, die die Wohnung mieten
              </CardDescription>
            </div>
            {data.mieter.length < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMieter}
              >
                <Plus className="h-4 w-4 mr-1" />
                Weiteren Mieter hinzufügen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.mieter.map((mieter, index) => (
            <div key={index} className="space-y-6">
              {index > 0 && <Separator className="my-6" />}

              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {index === 0 ? 'Hauptmieter' : `Mieter ${index + 1}`}
                </h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMieter(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Entfernen
                  </Button>
                )}
              </div>

              <PersonField
                value={mieter}
                onChange={(p) => handleMieterChange(index, p)}
                required={index === 0}
                showBirthdate={true}
                showContact={index === 0}
                showAIHelper={index === 0}
              />
            </div>
          ))}

          <Separator />

          <AddressField
            value={data.mieterAdresse}
            onChange={(mieterAdresse) => onChange({ mieterAdresse })}
            label="Aktuelle Adresse des Mieters (vor Einzug)"
            required
          />

          <p className="text-sm text-muted-foreground">
            Bei mehreren Mietern haften alle als Gesamtschuldner für die Miete.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
