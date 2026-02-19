import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { FileText, Download, Copy, Eye, Search, Tag, CheckCircle2 } from 'lucide-react'

interface Vorlage {
  id: string
  titel: string
  kategorie: string
  beschreibung: string
  beliebt: boolean
  inhalt: string
}

const KATEGORIEN = ['Einspruch', 'Antrag', 'Korrespondenz', 'Vollmacht', 'Erklärung']

const DEMO_VORLAGEN: Vorlage[] = [
  {
    id: 'v-1', titel: 'Einspruch gegen Einkommensteuerbescheid', kategorie: 'Einspruch', beliebt: true,
    beschreibung: 'Standardvorlage für den Einspruch gegen einen ESt-Bescheid mit Begründungsblock.',
    inhalt: `An das Finanzamt [Finanzamt-Name]
[Straße, PLZ Ort]

[Ihr Name]
Steuernummer: [Steuernummer]

Datum: [Datum]

Einspruch gegen den Einkommensteuerbescheid [Jahr]

Sehr geehrte Damen und Herren,

hiermit lege ich fristgerecht Einspruch gegen den oben genannten Bescheid vom [Datum des Bescheids] ein.

Begründung:
[Hier Ihre Begründung einfügen - z.B. fehlerhafte Berücksichtigung von Werbungskosten, Sonderausgaben etc.]

Ich beantrage, den Bescheid entsprechend zu ändern und die zu viel gezahlte Steuer zu erstatten.

Gleichzeitig beantrage ich die Aussetzung der Vollziehung gemäß § 361 AO für den strittigen Betrag in Höhe von [Betrag] €.

Mit freundlichen Grüßen
[Unterschrift]`,
  },
  {
    id: 'v-2', titel: 'Einspruch gegen Grundsteuerwertbescheid', kategorie: 'Einspruch', beliebt: true,
    beschreibung: 'Vorlage speziell für Einsprüche gegen die neue Grundsteuer-Bewertung.',
    inhalt: `An das Finanzamt [Finanzamt-Name]
[Straße, PLZ Ort]

[Ihr Name]
Aktenzeichen: [Aktenzeichen]

Datum: [Datum]

Einspruch gegen den Grundsteuerwertbescheid auf den 01.01.2022

Sehr geehrte Damen und Herren,

hiermit lege ich fristgerecht Einspruch gegen den oben genannten Grundsteuerwertbescheid vom [Datum] ein.

Begründung:
Der festgestellte Grundsteuerwert in Höhe von [Betrag] € ist zu hoch angesetzt, da:
- [ ] Der angesetzte Bodenrichtwert von [Wert] €/m² nicht den tatsächlichen Verhältnissen entspricht
- [ ] Die angesetzte Grundstücksfläche von [Fläche] m² fehlerhaft ist
- [ ] Die Gebäudedaten (Wohnfläche/Baujahr) nicht korrekt übernommen wurden
- [ ] [Weitere Begründung]

Ich beantrage die Korrektur des Grundsteuerwerts und verweise ergänzend auf die anhängigen BFH-Verfahren.

Mit freundlichen Grüßen
[Unterschrift]`,
  },
  {
    id: 'v-3', titel: 'Antrag auf Fristverlängerung', kategorie: 'Antrag', beliebt: true,
    beschreibung: 'Antrag auf Verlängerung der Abgabefrist für die Steuererklärung.',
    inhalt: `An das Finanzamt [Finanzamt-Name]
[Straße, PLZ Ort]

[Ihr Name]
Steuernummer: [Steuernummer]

Datum: [Datum]

Antrag auf Fristverlängerung für die Steuererklärung [Jahr]

Sehr geehrte Damen und Herren,

hiermit beantrage ich die Verlängerung der Abgabefrist für meine Einkommensteuererklärung [Jahr] bis zum [Neues Datum].

Begründung:
[z.B. Noch fehlende Unterlagen, Krankheit, berufliche Belastung etc.]

Ich versichere, die Erklärung fristgerecht bis zum beantragten Termin einzureichen.

Mit freundlichen Grüßen
[Unterschrift]`,
  },
  {
    id: 'v-4', titel: 'Antrag auf Aussetzung der Vollziehung', kategorie: 'Antrag', beliebt: false,
    beschreibung: 'AdV-Antrag bei laufendem Einspruchsverfahren.',
    inhalt: `An das Finanzamt [Finanzamt-Name]
[Straße, PLZ Ort]

[Ihr Name]
Steuernummer: [Steuernummer]

Datum: [Datum]

Antrag auf Aussetzung der Vollziehung gemäß § 361 AO

Sehr geehrte Damen und Herren,

in der oben genannten Steuersache habe ich mit Schreiben vom [Datum] Einspruch eingelegt.

Ich beantrage die Aussetzung der Vollziehung für den strittigen Betrag in Höhe von [Betrag] €.

Es bestehen ernstliche Zweifel an der Rechtmäßigkeit des Bescheids, da [Begründung].

Mit freundlichen Grüßen
[Unterschrift]`,
  },
  {
    id: 'v-5', titel: 'Vollmacht für Steuerberater', kategorie: 'Vollmacht', beliebt: false,
    beschreibung: 'Vollmacht zur Vertretung in Steuerangelegenheiten.',
    inhalt: `Vollmacht

Hiermit bevollmächtige ich,

[Ihr Name]
[Ihre Adresse]
Steuernummer: [Steuernummer]

die Steuerberatungskanzlei

[Name der Kanzlei]
[Adresse der Kanzlei]

mich in allen steuerlichen Angelegenheiten gegenüber dem Finanzamt [Finanzamt-Name] zu vertreten.

Die Vollmacht umfasst insbesondere:
- Einreichung von Steuererklärungen
- Einlegung von Rechtsbehelfen
- Entgegennahme von Bescheiden
- Akteneinsicht

Die Vollmacht gilt bis auf Widerruf.

[Ort], den [Datum]

[Unterschrift]`,
  },
  {
    id: 'v-6', titel: 'Korrekturantrag nach § 173 AO', kategorie: 'Antrag', beliebt: false,
    beschreibung: 'Antrag auf Änderung eines bestandskräftigen Bescheids wegen neuer Tatsachen.',
    inhalt: `An das Finanzamt [Finanzamt-Name]
[Straße, PLZ Ort]

[Ihr Name]
Steuernummer: [Steuernummer]

Datum: [Datum]

Antrag auf Änderung des [Steuerart]-Bescheids [Jahr] gemäß § 173 Abs. 1 Nr. 2 AO

Sehr geehrte Damen und Herren,

hiermit beantrage ich die Änderung des oben genannten Bescheids.

Es sind neue Tatsachen bekannt geworden, die zu einer niedrigeren Steuer führen:
[Beschreibung der neuen Tatsachen]

Die Tatsachen waren mir zum Zeitpunkt der Veranlagung nicht bekannt. Mich trifft kein grobes Verschulden am nachträglichen Bekanntwerden.

Nachweise füge ich als Anlage bei.

Mit freundlichen Grüßen
[Unterschrift]`,
  },
  {
    id: 'v-7', titel: 'Begleitschreiben Steuererklärung', kategorie: 'Korrespondenz', beliebt: false,
    beschreibung: 'Anschreiben zur Einreichung der Steuererklärung mit Hinweisen.',
    inhalt: `An das Finanzamt [Finanzamt-Name]
[Straße, PLZ Ort]

[Ihr Name]
Steuernummer: [Steuernummer]

Datum: [Datum]

Einkommensteuererklärung [Jahr]

Sehr geehrte Damen und Herren,

anbei übersende ich Ihnen meine Einkommensteuererklärung für das Jahr [Jahr] mit folgenden Anlagen:

- Anlage N (Einkünfte aus nichtselbständiger Arbeit)
- Anlage Vorsorgeaufwand
- [Weitere Anlagen]

Folgende Besonderheiten möchte ich hervorheben:
- [z.B. Erstmaliger Ansatz eines Arbeitszimmers]
- [Weitere Hinweise]

Bei Rückfragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
[Unterschrift]`,
  },
  {
    id: 'v-8', titel: 'Erklärung zur Grundsteuerfeststellung', kategorie: 'Erklärung', beliebt: false,
    beschreibung: 'Begleitschreiben zur Feststellungserklärung für die Grundsteuer.',
    inhalt: `An das Finanzamt [Finanzamt-Name]
[Straße, PLZ Ort]

[Ihr Name]
Aktenzeichen: [Aktenzeichen]

Datum: [Datum]

Erklärung zur Feststellung des Grundsteuerwerts

Sehr geehrte Damen und Herren,

hiermit reiche ich die Erklärung zur Feststellung des Grundsteuerwerts für folgendes Grundstück ein:

Grundbuch: [Grundbuch von ...]
Flurstück: [Flurstück-Nr.]
Adresse: [Adresse des Grundstücks]

Die Angaben basieren auf den aktuellen Grundbuchdaten und dem Bodenrichtwert laut BORIS.

Bei Rückfragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
[Unterschrift]`,
  },
]

export default function DokumentVorlagenPage() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = DEMO_VORLAGEN.filter(v => {
    if (filterKategorie !== 'alle' && v.kategorie !== filterKategorie) return false
    if (suchbegriff) {
      const q = suchbegriff.toLowerCase()
      return v.titel.toLowerCase().includes(q) || v.beschreibung.toLowerCase().includes(q) || v.kategorie.toLowerCase().includes(q)
    }
    return true
  })

  const copyToClipboard = (vorlage: Vorlage) => {
    navigator.clipboard.writeText(vorlage.inhalt).then(() => {
      setCopiedId(vorlage.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dokument-Vorlagen</h1>
        <p className="text-muted-foreground mt-1">
          Professionelle Vorlagen für Einsprüche, Anträge und Korrespondenz mit dem Finanzamt
        </p>
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Vorlage suchen..."
          value={suchbegriff}
          onChange={e => setSuchbegriff(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-background text-sm"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterKategorie('alle')} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filterKategorie === 'alle' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
          Alle ({DEMO_VORLAGEN.length})
        </button>
        {KATEGORIEN.map(k => {
          const count = DEMO_VORLAGEN.filter(v => v.kategorie === k).length
          return (
            <button key={k} onClick={() => setFilterKategorie(k)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filterKategorie === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
              {k} ({count})
            </button>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} Vorlagen</p>

      {/* Vorlagen-Liste */}
      <div className="space-y-4">
        {filtered.map(vorlage => {
          const isPreview = previewId === vorlage.id
          const isCopied = copiedId === vorlage.id

          return (
            <Card key={vorlage.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{vorlage.titel}</h3>
                      {vorlage.beliebt && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          Beliebt
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{vorlage.beschreibung}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{vorlage.kategorie}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setPreviewId(isPreview ? null : vorlage.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md hover:bg-muted transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {isPreview ? 'Schließen' : 'Vorschau'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(vorlage)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md hover:bg-muted transition-colors"
                      >
                        {isCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {isCopied ? 'Kopiert!' : 'Kopieren'}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md hover:bg-muted transition-colors">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                {isPreview && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                    <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">{vorlage.inhalt}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
