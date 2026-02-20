import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Copy,
  ArrowRight,
  Shield,
  AlertTriangle,
  Euro,
  Calculator,
  Home,
  Briefcase,
  Heart,
  Landmark,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useBescheidContext } from '../../contexts/BescheidContext'
import { BESCHEID_TYP_LABELS } from '../../types/bescheid'
import { useToast } from '../../hooks/use-toast'

interface Vorlage {
  id: string
  titel: string
  beschreibung: string
  kategorie: 'werbungskosten' | 'sonderausgaben' | 'aussergewoehnliche_belastungen' | 'freibetraege' | 'einkuenfte' | 'allgemein'
  icon: React.ElementType
  schweregrad: 'info' | 'warnung' | 'kritisch'
  textVorlage: string
  tipp: string
  typischeAbweichung: string
}

const KATEGORIE_CONFIG = {
  werbungskosten: { label: 'Werbungskosten', color: 'text-fintutto-blue-600 dark:text-fintutto-blue-400', bg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40' },
  sonderausgaben: { label: 'Sonderausgaben', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  aussergewoehnliche_belastungen: { label: 'Aussergewoehnliche Belastungen', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  freibetraege: { label: 'Freibetraege', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/40' },
  einkuenfte: { label: 'Einkuenfte', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40' },
  allgemein: { label: 'Allgemein', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-900/40' },
}

const VORLAGEN: Vorlage[] = [
  {
    id: 'wk-homeoffice',
    titel: 'Homeoffice-Pauschale nicht beruecksichtigt',
    beschreibung: 'Die Homeoffice-Pauschale von bis zu 1.260 EUR wurde nicht oder nicht vollstaendig anerkannt.',
    kategorie: 'werbungskosten',
    icon: Home,
    schweregrad: 'warnung',
    typischeAbweichung: '600 - 1.260 EUR',
    tipp: 'Fuehren Sie ein Homeoffice-Tagebuch als Nachweis. Seit 2023 gilt die Pauschale von 6 EUR pro Tag (max. 210 Tage).',
    textVorlage: `hiermit lege ich Einspruch gegen den oben genannten Steuerbescheid ein.

Begruendung:
Die Homeoffice-Pauschale gemaess § 4 Abs. 5 Satz 1 Nr. 6c EStG wurde nicht oder nicht vollstaendig beruecksichtigt. Ich habe im betreffenden Veranlagungszeitraum an [ANZAHL] Tagen ueberwiegend im Homeoffice gearbeitet.

Die Homeoffice-Pauschale betraegt 6 EUR pro Tag, maximal 1.260 EUR im Jahr (210 Tage). Ich beantrage die Anerkennung von [BETRAG] EUR.

Als Nachweis fuege ich bei:
- Arbeitgeberbescheinigung ueber Homeoffice-Tage
- Homeoffice-Tagebuch

Ich bitte um Ueberpruefung und entsprechende Korrektur des Bescheids.`,
  },
  {
    id: 'wk-pendler',
    titel: 'Entfernungspauschale falsch berechnet',
    beschreibung: 'Die Pendlerpauschale wurde mit falscher Entfernung oder falschem Satz berechnet.',
    kategorie: 'werbungskosten',
    icon: Briefcase,
    schweregrad: 'warnung',
    typischeAbweichung: '200 - 2.000 EUR',
    tipp: 'Ab dem 21. Entfernungskilometer gilt ein erhoehter Satz von 0,38 EUR/km.',
    textVorlage: `hiermit lege ich Einspruch gegen den oben genannten Steuerbescheid ein.

Begruendung:
Die Entfernungspauschale gemaess § 9 Abs. 1 Satz 3 Nr. 4 EStG wurde nicht korrekt berechnet. Die einfache Entfernung zwischen Wohnung und erster Taetigkeitsstaette betraegt [ENTFERNUNG] km.

Bei [ARBEITSTAGE] Arbeitstagen ergibt sich:
- Erste 20 km: 20 km x [ARBEITSTAGE] Tage x 0,30 EUR = [BETRAG_1] EUR
- Ab 21. km: [RESTLICHE_KM] km x [ARBEITSTAGE] Tage x 0,38 EUR = [BETRAG_2] EUR
- Gesamt: [SUMME] EUR

Als Nachweis fuege ich bei:
- Routenberechnung (kuerzeste Strassenverbindung)
- Arbeitgeberbescheinigung

Ich bitte um Ueberpruefung und entsprechende Korrektur des Bescheids.`,
  },
  {
    id: 'wk-arbeitsmittel',
    titel: 'Arbeitsmittel nicht anerkannt',
    beschreibung: 'Beruflich veranlasste Ausgaben fuer Arbeitsmittel (PC, Software, Moebel) wurden nicht beruecksichtigt.',
    kategorie: 'werbungskosten',
    icon: Calculator,
    schweregrad: 'warnung',
    typischeAbweichung: '100 - 3.000 EUR',
    tipp: 'Gegenstaende bis 800 EUR netto koennen sofort abgesetzt werden. Teurere werden ueber die Nutzungsdauer abgeschrieben.',
    textVorlage: `hiermit lege ich Einspruch gegen den oben genannten Steuerbescheid ein.

Begruendung:
Die geltend gemachten Werbungskosten fuer Arbeitsmittel gemaess § 9 Abs. 1 Satz 3 Nr. 6 EStG wurden nicht oder nicht vollstaendig anerkannt.

Folgende Arbeitsmittel wurden beruflich genutzt:
- [ARBEITSMITTEL_1]: [BETRAG_1] EUR
- [ARBEITSMITTEL_2]: [BETRAG_2] EUR

Die berufliche Nutzung betraegt [PROZENT]%. Dies ergibt absetzbare Kosten von [SUMME] EUR.

Als Nachweis fuege ich bei:
- Rechnungen/Quittungen
- Nachweis der beruflichen Nutzung

Ich bitte um Ueberpruefung und entsprechende Korrektur des Bescheids.`,
  },
  {
    id: 'sa-versicherung',
    titel: 'Vorsorgeaufwendungen nicht beruecksichtigt',
    beschreibung: 'Beitraege zur Kranken-, Pflege- oder Rentenversicherung wurden nicht korrekt beruecksichtigt.',
    kategorie: 'sonderausgaben',
    icon: Shield,
    schweregrad: 'kritisch',
    typischeAbweichung: '500 - 5.000 EUR',
    tipp: 'Basisbeitraege zur Krankenversicherung sind unbegrenzt absetzbar. Beitraege zur Altersvorsorge bis zum Hoechstbetrag.',
    textVorlage: `hiermit lege ich Einspruch gegen den oben genannten Steuerbescheid ein.

Begruendung:
Die als Sonderausgaben geltend gemachten Vorsorgeaufwendungen gemaess § 10 EStG wurden nicht oder nicht vollstaendig beruecksichtigt.

Folgende Beitraege wurden gezahlt:
- Krankenversicherung (Basisbeitrag): [BETRAG_KV] EUR
- Pflegeversicherung: [BETRAG_PV] EUR
- Rentenversicherung: [BETRAG_RV] EUR

Die Beitraege sind durch die beigefuegten Bescheinigungen der Versicherungstraeger belegt.

Ich bitte um Ueberpruefung und entsprechende Korrektur des Bescheids.`,
  },
  {
    id: 'ab-krankheit',
    titel: 'Krankheitskosten nicht anerkannt',
    beschreibung: 'Aussergewoehnliche Belastungen durch Krankheitskosten wurden abgelehnt oder zu niedrig angesetzt.',
    kategorie: 'aussergewoehnliche_belastungen',
    icon: Heart,
    schweregrad: 'warnung',
    typischeAbweichung: '300 - 3.000 EUR',
    tipp: 'Krankheitskosten sind als aussergewoehnliche Belastungen absetzbar. Die zumutbare Belastung haengt vom Einkommen, Familienstand und Kinderzahl ab.',
    textVorlage: `hiermit lege ich Einspruch gegen den oben genannten Steuerbescheid ein.

Begruendung:
Die geltend gemachten aussergewoehnlichen Belastungen gemaess § 33 EStG (Krankheitskosten) wurden nicht oder nicht vollstaendig beruecksichtigt.

Folgende Krankheitskosten sind entstanden:
- [KOSTEN_1]: [BETRAG_1] EUR
- [KOSTEN_2]: [BETRAG_2] EUR
- Summe: [SUMME] EUR

Abzueglich zumutbarer Belastung: [ZUMUTBAR] EUR
Verbleibender Abzugsbetrag: [REST] EUR

Als Nachweis fuege ich bei:
- Aerztliche Bescheinigungen
- Rechnungen und Zahlungsbelege

Ich bitte um Ueberpruefung und entsprechende Korrektur des Bescheids.`,
  },
  {
    id: 'fb-grundfreibetrag',
    titel: 'Grundfreibetrag nicht beruecksichtigt',
    beschreibung: 'Der Grundfreibetrag wurde nicht korrekt angewendet, z.B. bei Zusammenveranlagung.',
    kategorie: 'freibetraege',
    icon: Landmark,
    schweregrad: 'kritisch',
    typischeAbweichung: '1.000 - 5.000 EUR',
    tipp: 'Der Grundfreibetrag betraegt 11.604 EUR (2024). Bei Zusammenveranlagung verdoppelt sich dieser.',
    textVorlage: `hiermit lege ich Einspruch gegen den oben genannten Steuerbescheid ein.

Begruendung:
Der Grundfreibetrag gemaess § 32a EStG wurde nicht oder nicht korrekt beruecksichtigt. Bei der Zusammenveranlagung betraegt der Grundfreibetrag 23.208 EUR (2024).

Die festgesetzte Einkommensteuer weicht daher um [BETRAG] EUR von der korrekten Berechnung ab.

Ich bitte um Ueberpruefung und entsprechende Korrektur des Bescheids.`,
  },
  {
    id: 'ek-falsch',
    titel: 'Einkuenfte falsch ermittelt',
    beschreibung: 'Die Einkuenfte wurden hoeher angesetzt als tatsaechlich erzielt.',
    kategorie: 'einkuenfte',
    icon: Euro,
    schweregrad: 'kritisch',
    typischeAbweichung: '500 - 10.000 EUR',
    tipp: 'Vergleichen Sie die Angaben im Bescheid mit Ihren Lohnsteuerbescheinigungen und Kontoauszuegen.',
    textVorlage: `hiermit lege ich Einspruch gegen den oben genannten Steuerbescheid ein.

Begruendung:
Die im Bescheid angesetzten Einkuenfte aus [EINKUNFTSART] weichen von den tatsaechlich erzielten Einkuenften ab.

Laut Bescheid: [BESCHEID_BETRAG] EUR
Tatsaechlich erzielt: [TATSAECHLICH_BETRAG] EUR
Differenz: [DIFFERENZ] EUR

Als Nachweis fuege ich bei:
- Lohnsteuerbescheinigung
- [WEITERE_NACHWEISE]

Ich bitte um Ueberpruefung und entsprechende Korrektur des Bescheids.`,
  },
  {
    id: 'allg-rechenfehler',
    titel: 'Rechenfehler im Bescheid',
    beschreibung: 'Der Bescheid enthaelt offensichtliche Rechenfehler bei der Steuerberechnung.',
    kategorie: 'allgemein',
    icon: AlertTriangle,
    schweregrad: 'kritisch',
    typischeAbweichung: 'Variabel',
    tipp: 'Rechenfehler koennen auch nach Ablauf der Einspruchsfrist als offenbare Unrichtigkeit (§ 129 AO) korrigiert werden.',
    textVorlage: `hiermit lege ich Einspruch gegen den oben genannten Steuerbescheid ein.

Begruendung:
Der Bescheid enthaelt offensichtliche Rechenfehler bei der Ermittlung der festzusetzenden Steuer.

Konkret:
[BESCHREIBUNG_RECHENFEHLER]

Die korrekte Berechnung ergibt eine Steuer von [KORREKTER_BETRAG] EUR statt der festgesetzten [FESTGESETZTER_BETRAG] EUR.

Ich bitte um Ueberpruefung und entsprechende Korrektur gemaess § 129 AO.`,
  },
]

export default function EinspruchVorlagenPage() {
  const navigate = useNavigate()
  const { bescheide } = useBescheidContext()
  const { toast } = useToast()
  const [selectedKategorie, setSelectedKategorie] = useState<string | null>(null)
  const [selectedVorlage, setSelectedVorlage] = useState<Vorlage | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredVorlagen = selectedKategorie
    ? VORLAGEN.filter(v => v.kategorie === selectedKategorie)
    : VORLAGEN

  // Bescheide that are eligible for Einspruch
  const einspruchBescheide = bescheide.filter(b =>
    b.status === 'geprueft' || b.status === 'neu' || b.status === 'in_pruefung'
  )

  const handleCopyText = (vorlage: Vorlage) => {
    navigator.clipboard.writeText(vorlage.textVorlage)
    setCopiedId(vorlage.id)
    toast({
      title: 'Kopiert',
      description: 'Vorlagetext in die Zwischenablage kopiert.',
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleUseVorlage = (vorlage: Vorlage, bescheidId: string) => {
    // Navigate to Einspruch creation with pre-filled template text
    navigate(`/einspruch/neu/${bescheidId}`, {
      state: { vorlageText: vorlage.textVorlage, vorlageTitel: vorlage.titel },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Einspruch-Vorlagen</h1>
        <p className="text-muted-foreground mt-1">
          Professionelle Vorlagen fuer haeufige Einspruchsgruende
        </p>
      </div>

      {/* Kategorie Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedKategorie === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedKategorie(null)}
        >
          Alle ({VORLAGEN.length})
        </Button>
        {Object.entries(KATEGORIE_CONFIG).map(([key, config]) => {
          const count = VORLAGEN.filter(v => v.kategorie === key).length
          if (count === 0) return null
          return (
            <Button
              key={key}
              variant={selectedKategorie === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedKategorie(selectedKategorie === key ? null : key)}
            >
              {config.label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Vorlagen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVorlagen.map(vorlage => {
          const katConfig = KATEGORIE_CONFIG[vorlage.kategorie]
          const Icon = vorlage.icon
          const isSelected = selectedVorlage?.id === vorlage.id

          return (
            <Card
              key={vorlage.id}
              className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => setSelectedVorlage(isSelected ? null : vorlage)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2.5 shrink-0 ${katConfig.bg}`}>
                    <Icon className={`h-5 w-5 ${katConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{vorlage.titel}</CardTitle>
                    </div>
                    <CardDescription>{vorlage.beschreibung}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{katConfig.label}</Badge>
                  <Badge
                    variant={vorlage.schweregrad === 'kritisch' ? 'destructive' : vorlage.schweregrad === 'warnung' ? 'warning' : 'secondary'}
                    className="text-[10px]"
                  >
                    {vorlage.schweregrad === 'kritisch' ? 'Hoch' : vorlage.schweregrad === 'warnung' ? 'Mittel' : 'Info'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Typisch: {vorlage.typischeAbweichung}
                  </span>
                </div>

                {/* Expanded Content */}
                {isSelected && (
                  <div className="mt-4 space-y-4" onClick={e => e.stopPropagation()}>
                    {/* Tipp */}
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">Tipp</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">{vorlage.tipp}</p>
                    </div>

                    {/* Text Preview */}
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs font-semibold mb-2">Vorschau des Einspruch-Textes:</p>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6">
                        {vorlage.textVorlage}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full"
                        onClick={() => handleCopyText(vorlage)}
                      >
                        {copiedId === vorlage.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedId === vorlage.id ? 'Kopiert!' : 'Text kopieren'}
                      </Button>

                      {einspruchBescheide.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Fuer Bescheid verwenden:</p>
                          {einspruchBescheide.slice(0, 3).map(b => (
                            <Button
                              key={b.id}
                              variant="outline"
                              size="sm"
                              className="gap-2 w-full justify-between"
                              onClick={() => handleUseVorlage(vorlage, b.id)}
                            >
                              <span className="truncate text-xs">{b.titel} ({BESCHEID_TYP_LABELS[b.typ]})</span>
                              <ArrowRight className="h-3 w-3 shrink-0" />
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Keine Bescheide fuer Einspruch verfuegbar
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Box */}
      <Card className="border-fintutto-blue-200 dark:border-fintutto-blue-800 bg-fintutto-blue-50/50 dark:bg-fintutto-blue-950/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-fintutto-blue-600 dark:text-fintutto-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-fintutto-blue-700 dark:text-fintutto-blue-300 mb-1">
                Hinweis zu den Vorlagen
              </h3>
              <p className="text-sm text-fintutto-blue-600 dark:text-fintutto-blue-400">
                Diese Vorlagen dienen als Ausgangspunkt und muessen individuell angepasst werden.
                Ersetzen Sie die Platzhalter [IN KLAMMERN] mit Ihren persoenlichen Angaben.
                Bei komplexen Faellen empfehlen wir die Beratung durch einen Steuerberater.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
