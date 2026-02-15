import { useState } from 'react'
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FolderDown,
  Archive,
  Shield,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useBescheidContext } from '../contexts/BescheidContext'
import { exportBescheideAsCsv } from '../lib/csv-export'
import { formatDate } from '../lib/utils'

type ExportFormat = 'csv' | 'json' | 'pdf'
type ExportStatus = 'idle' | 'exporting' | 'done' | 'error'

interface ExportOption {
  format: ExportFormat
  label: string
  beschreibung: string
  icon: typeof FileText
  farbe: string
  bg: string
}

const EXPORT_OPTIONEN: ExportOption[] = [
  {
    format: 'csv',
    label: 'CSV / Excel',
    beschreibung: 'Tabellen-Format fuer Excel, Google Sheets und andere Programme.',
    icon: FileSpreadsheet,
    farbe: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/40',
  },
  {
    format: 'json',
    label: 'JSON',
    beschreibung: 'Strukturiertes Datenformat fuer Entwickler und APIs.',
    icon: FileJson,
    farbe: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  {
    format: 'pdf',
    label: 'PDF-Bericht',
    beschreibung: 'Druckfertiger Uebersichtsbericht mit allen Bescheid-Daten.',
    icon: FileText,
    farbe: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/40',
  },
]

export default function DatenExportPage() {
  const { bescheide, einsprueche, fristen } = useBescheidContext()
  const [exportStatus, setExportStatus] = useState<Record<ExportFormat, ExportStatus>>({
    csv: 'idle',
    json: 'idle',
    pdf: 'idle',
  })

  const handleExport = async (format: ExportFormat) => {
    setExportStatus(prev => ({ ...prev, [format]: 'exporting' }))

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate processing

      if (format === 'csv') {
        exportBescheideAsCsv(bescheide)
      } else if (format === 'json') {
        const data = {
          exportDatum: new Date().toISOString(),
          bescheide,
          einsprueche,
          fristen,
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bescheidboxer-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'pdf') {
        // Simulate PDF generation - in real app would use jsPDF
        const text = bescheide.map(b =>
          `${b.titel} | ${b.steuerjahr} | ${b.festgesetzteSteuer} EUR | Status: ${b.status}`
        ).join('\n')
        const blob = new Blob([`Bescheidboxer Export\n${'='.repeat(40)}\n\n${text}`], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bescheidboxer-bericht-${new Date().toISOString().split('T')[0]}.txt`
        a.click()
        URL.revokeObjectURL(url)
      }

      setExportStatus(prev => ({ ...prev, [format]: 'done' }))
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, [format]: 'idle' }))
      }, 3000)
    } catch {
      setExportStatus(prev => ({ ...prev, [format]: 'error' }))
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, [format]: 'idle' }))
      }, 3000)
    }
  }

  const exportHistory = [
    { datum: new Date().toISOString(), format: 'csv' as const, groesse: '45 KB', bescheide: bescheide.length },
    { datum: new Date(Date.now() - 7 * 86400000).toISOString(), format: 'json' as const, groesse: '128 KB', bescheide: bescheide.length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FolderDown className="h-8 w-8" />
          Daten-Export
        </h1>
        <p className="text-muted-foreground mt-1">
          Exportieren Sie Ihre Daten in verschiedenen Formaten
        </p>
      </div>

      {/* Daten-Uebersicht */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{bescheide.length}</p>
            <p className="text-xs text-muted-foreground">Bescheide</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{einsprueche.length}</p>
            <p className="text-xs text-muted-foreground">Einsprueche</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{fristen.length}</p>
            <p className="text-xs text-muted-foreground">Fristen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">
              {new Set(bescheide.map(b => b.steuerjahr)).size}
            </p>
            <p className="text-xs text-muted-foreground">Steuerjahre</p>
          </CardContent>
        </Card>
      </div>

      {/* Export-Optionen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {EXPORT_OPTIONEN.map(option => {
          const Icon = option.icon
          const status = exportStatus[option.format]
          return (
            <Card key={option.format} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-5">
                <div className="text-center mb-4">
                  <div className={`inline-flex rounded-xl ${option.bg} p-4 mb-3`}>
                    <Icon className={`h-8 w-8 ${option.farbe}`} />
                  </div>
                  <h3 className="font-semibold">{option.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.beschreibung}
                  </p>
                </div>
                <Button
                  onClick={() => handleExport(option.format)}
                  disabled={status === 'exporting' || bescheide.length === 0}
                  className="w-full gap-2"
                  variant={status === 'done' ? 'outline' : 'default'}
                >
                  {status === 'exporting' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exportiere...
                    </>
                  ) : status === 'done' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Heruntergeladen
                    </>
                  ) : status === 'error' ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Fehler
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Exportieren
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export-Verlauf */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Letzte Exporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exportHistory.map((item, i) => {
              const opt = EXPORT_OPTIONEN.find(o => o.format === item.format)
              const Icon = opt?.icon || FileText
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className={`rounded-lg ${opt?.bg || 'bg-muted'} p-2`}>
                    <Icon className={`h-4 w-4 ${opt?.farbe || ''}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{opt?.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.datum)} &middot; {item.groesse} &middot; {item.bescheide} Bescheide
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                    Erfolg
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Datenschutz-Hinweise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Datenschutz-Hinweis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p>Exportierte Daten enthalten Ihre Steuerbescheid-Informationen und persoenliche Daten.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p>Bewahren Sie exportierte Dateien sicher auf und geben Sie sie nicht an unbefugte Dritte weiter.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p>Sie koennen jederzeit die Loeschung Ihrer Daten auf unseren Servern beantragen.</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p>Exportierte Dateien unterliegen nicht mehr unserem Schutz - sichern Sie sie entsprechend.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
                Alle Daten loeschen anfragen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
