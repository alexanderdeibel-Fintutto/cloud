import { FileSignature, Check, AlertCircle, Download, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SignatureField } from '@/components/fields/SignatureField'
import { formatDate } from '@/lib/utils'
import { UebergabeprotokollData, ZUSTAND_LABELS } from '@/types/uebergabeprotokoll'
import { EMPTY_SIGNATURE } from '@/types/mietvertrag'

interface Step6Props {
  data: UebergabeprotokollData
  onChange: (updates: Partial<UebergabeprotokollData>) => void
  onEditStep: (step: number) => void
}

export function Step6Unterschriften({ data, onChange, onEditStep }: Step6Props) {
  // Zusammenfassung berechnen
  const zusammenfassung = {
    zaehlerAbgelesen: data.zaehlerstaende.filter(z => z.stand !== null).length,
    zaehlerGesamt: data.zaehlerstaende.length,
    schluesselUebergeben: data.schluessel.reduce((sum, s) => sum + s.anzahlUebergeben, 0),
    schluesselGesamt: data.schluessel.reduce((sum, s) => sum + s.anzahlVorhanden, 0),
    raeumeGeprueft: data.raeume.length,
    maengelGefunden: data.raeume.filter(r =>
      Object.values(r).includes('maengel') || r.sonstigesMaengel
    ).length
  }

  const allDataComplete =
    zusammenfassung.zaehlerAbgelesen === zusammenfassung.zaehlerGesamt &&
    zusammenfassung.schluesselUebergeben === zusammenfassung.schluesselGesamt

  return (
    <div className="space-y-8">
      {/* Zusammenfassung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Protokoll-Zusammenfassung</CardTitle>
          <CardDescription>
            {data.protokollart === 'einzug' ? 'Einzugsprotokoll' : 'Auszugsprotokoll'} vom {formatDate(data.uebergabedatum)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">
                {zusammenfassung.zaehlerAbgelesen}/{zusammenfassung.zaehlerGesamt}
              </p>
              <p className="text-sm text-muted-foreground">Zaehler abgelesen</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">
                {zusammenfassung.schluesselUebergeben}/{zusammenfassung.schluesselGesamt}
              </p>
              <p className="text-sm text-muted-foreground">Schluessel uebergeben</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{zusammenfassung.raeumeGeprueft}</p>
              <p className="text-sm text-muted-foreground">Raeume geprueft</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className={`text-2xl font-bold ${zusammenfassung.maengelGefunden > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {zusammenfassung.maengelGefunden}
              </p>
              <p className="text-sm text-muted-foreground">Raeume mit Maengeln</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Schnell-Uebersicht */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mietobjekt:</span>
              <span className="font-medium">
                {data.objektAdresse.strasse} {data.objektAdresse.hausnummer}, {data.objektAdresse.plz} {data.objektAdresse.ort}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Vermieter:</span>
              <span className="font-medium">
                {data.vermieter.vorname} {data.vermieter.nachname}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {data.protokollart === 'einzug' ? 'Neuer Mieter:' : 'Bisheriger Mieter:'}
              </span>
              <span className="font-medium">
                {data.protokollart === 'einzug'
                  ? `${data.mieterNeu?.vorname || ''} ${data.mieterNeu?.nachname || ''}`
                  : `${data.mieterAlt?.vorname || ''} ${data.mieterAlt?.nachname || ''}`
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Allgemeinzustand:</span>
              <Badge variant={data.allgemeinerZustand === 'maengel' ? 'warning' : 'success'}>
                {ZUSTAND_LABELS[data.allgemeinerZustand]}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Reinigungszustand:</span>
              <span className="font-medium">
                {data.reinigungszustand === 'gereinigt' ? 'Vollstaendig gereinigt' :
                 data.reinigungszustand === 'besenrein' ? 'Besenrein' : 'Nicht gereinigt'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {!allDataComplete && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Unvollstaendige Daten</p>
                <ul className="list-disc list-inside text-yellow-600 mt-1">
                  {zusammenfassung.zaehlerAbgelesen < zusammenfassung.zaehlerGesamt && (
                    <li>
                      {zusammenfassung.zaehlerGesamt - zusammenfassung.zaehlerAbgelesen} Zaehlerstand(e) fehlen
                      <Button variant="link" size="sm" className="h-auto p-0 ml-1" onClick={() => onEditStep(1)}>
                        - Ergaenzen
                      </Button>
                    </li>
                  )}
                  {zusammenfassung.schluesselUebergeben < zusammenfassung.schluesselGesamt && (
                    <li>
                      {zusammenfassung.schluesselGesamt - zusammenfassung.schluesselUebergeben} Schluessel nicht uebergeben
                      <Button variant="link" size="sm" className="h-auto p-0 ml-1" onClick={() => onEditStep(2)}>
                        - Pruefen
                      </Button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unterschriften */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Unterschriften
        </h3>

        <p className="text-sm text-muted-foreground">
          Mit der Unterschrift bestaetigen alle Parteien die Richtigkeit der Angaben in diesem Protokoll.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vermieter / Verwalter</CardTitle>
            </CardHeader>
            <CardContent>
              <SignatureField
                value={{
                  ...data.unterschriftVermieter,
                  signerName: data.unterschriftVermieter.signerName ||
                    `${data.vermieter.vorname} ${data.vermieter.nachname}`.trim()
                }}
                onChange={(unterschriftVermieter) => onChange({ unterschriftVermieter })}
                required
              />
            </CardContent>
          </Card>

          {/* Mieter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {data.protokollart === 'einzug' ? 'Neuer Mieter' : 'Bisheriger Mieter'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.protokollart === 'einzug' ? (
                <SignatureField
                  value={{
                    ...(data.unterschriftMieterNeu || EMPTY_SIGNATURE),
                    signerName: data.unterschriftMieterNeu?.signerName ||
                      `${data.mieterNeu?.vorname || ''} ${data.mieterNeu?.nachname || ''}`.trim()
                  }}
                  onChange={(unterschriftMieterNeu) => onChange({ unterschriftMieterNeu })}
                  required
                />
              ) : (
                <SignatureField
                  value={{
                    ...(data.unterschriftMieterAlt || EMPTY_SIGNATURE),
                    signerName: data.unterschriftMieterAlt?.signerName ||
                      `${data.mieterAlt?.vorname || ''} ${data.mieterAlt?.nachname || ''}`.trim()
                  }}
                  onChange={(unterschriftMieterAlt) => onChange({ unterschriftMieterAlt })}
                  required
                />
              )}
            </CardContent>
          </Card>

          {/* Zeuge (optional) */}
          {data.zeuge && (data.zeuge.vorname || data.zeuge.nachname) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Zeuge</CardTitle>
                  <Badge variant="outline">Optional</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <SignatureField
                  value={{
                    ...(data.unterschriftZeuge || EMPTY_SIGNATURE),
                    signerName: data.unterschriftZeuge?.signerName ||
                      `${data.zeuge.vorname} ${data.zeuge.nachname}`.trim()
                  }}
                  onChange={(unterschriftZeuge) => onChange({ unterschriftZeuge })}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Aktionen */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-5 w-5 text-primary" />
              <span>Nach dem Unterschreiben erhalten beide Parteien eine Kopie des Protokolls.</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Drucken
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                PDF herunterladen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
