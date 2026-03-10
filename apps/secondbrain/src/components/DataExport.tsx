import { useState } from 'react'
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDocuments } from '@/hooks/useDocuments'
import { useCollections } from '@/hooks/useCollections'
import { useCompanies } from '@/hooks/useCompanies'
import { useDeadlines } from '@/hooks/useDeadlines'
import { useActivityLog } from '@/hooks/useActivityLog'
import { DOCUMENT_TYPES } from '@/hooks/useWorkflows'
import { formatFileSize } from '@/lib/utils'
import { toast } from 'sonner'

export default function DataExport() {
  const { data: documents = [] } = useDocuments()
  const { data: collections = [] } = useCollections()
  const { data: companies = [] } = useCompanies()
  const { data: deadlines = [] } = useDeadlines()
  const { data: activities = [] } = useActivityLog(500)
  const [exporting, setExporting] = useState<string | null>(null)

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    setExporting('json')
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        documents: documents.map(d => ({
          id: d.id,
          title: d.title,
          document_type: d.document_type,
          status: d.status,
          sender: d.sender,
          amount: d.amount,
          currency: d.currency,
          tags: d.tags,
          summary: d.summary,
          ocr_text: d.ocr_text,
          notes: d.notes,
          reference_number: d.reference_number,
          document_date: d.document_date,
          deadline_date: d.deadline_date,
          priority: d.priority,
          is_favorite: d.is_favorite,
          file_type: d.file_type,
          file_size: d.file_size,
          company_id: d.company_id,
          created_at: d.created_at,
        })),
        collections: collections.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          color: c.color,
          document_count: c.document_count,
        })),
        companies: companies.map(c => ({
          id: c.id,
          name: c.name,
          tax_id: c.tax_id,
          color: c.color,
          category: c.category,
          document_count: c.document_count,
        })),
        deadlines: deadlines.map(d => ({
          id: d.id,
          title: d.title,
          description: d.description,
          deadline_date: d.deadline_date,
          reminder_days: d.reminder_days,
          status: d.status,
        })),
      }
      const json = JSON.stringify(data, null, 2)
      const date = new Date().toISOString().split('T')[0]
      downloadFile(json, `secondbrain-backup-${date}.json`, 'application/json')
      toast.success('JSON-Backup heruntergeladen')
    } catch {
      toast.error('Export fehlgeschlagen')
    } finally {
      setExporting(null)
    }
  }

  const handleExportCSV = () => {
    setExporting('csv')
    try {
      const bom = '\uFEFF'
      const headers = [
        'Titel', 'Dokumenttyp', 'Status', 'Absender', 'Betrag', 'Währung',
        'Tags', 'Priorität', 'Favorit', 'Referenznummer', 'Dokumentdatum',
        'Fristdatum', 'Dateityp', 'Dateigröße', 'Zusammenfassung', 'Notizen', 'Erstellt',
      ]
      const rows = documents.map(d => [
        d.title,
        DOCUMENT_TYPES[d.document_type || 'other']?.label || d.document_type || '',
        d.status || '',
        d.sender || '',
        d.amount ? String(d.amount) : '',
        d.currency || 'EUR',
        d.tags.join('; '),
        d.priority || '',
        d.is_favorite ? 'Ja' : 'Nein',
        d.reference_number || '',
        d.document_date || '',
        d.deadline_date || '',
        d.file_type,
        formatFileSize(d.file_size),
        (d.summary || '').replace(/"/g, '""'),
        (d.notes || '').replace(/"/g, '""'),
        new Date(d.created_at).toLocaleDateString('de-DE'),
      ])
      const csv = bom + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
      const date = new Date().toISOString().split('T')[0]
      downloadFile(csv, `secondbrain-dokumente-${date}.csv`, 'text/csv;charset=utf-8')
      toast.success('CSV-Export heruntergeladen')
    } catch {
      toast.error('Export fehlgeschlagen')
    } finally {
      setExporting(null)
    }
  }

  const handleExportMarkdown = () => {
    setExporting('md')
    try {
      const lines: string[] = [
        `# SecondBrain Backup`,
        `Exportiert am ${new Date().toLocaleDateString('de-DE', { dateStyle: 'full' })}`,
        '',
        `## Dokumente (${documents.length})`,
        '',
      ]

      for (const doc of documents) {
        const typeInfo = DOCUMENT_TYPES[doc.document_type || 'other']
        lines.push(`### ${doc.title}`)
        lines.push(`- **Typ:** ${typeInfo?.label || doc.document_type || 'Sonstige'}`)
        lines.push(`- **Status:** ${doc.status || 'Eingang'}`)
        if (doc.sender) lines.push(`- **Absender:** ${doc.sender}`)
        if (doc.amount) lines.push(`- **Betrag:** ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: doc.currency || 'EUR' }).format(doc.amount)}`)
        if (doc.tags.length > 0) lines.push(`- **Tags:** ${doc.tags.join(', ')}`)
        if (doc.summary) lines.push(`\n> ${doc.summary}`)
        if (doc.notes) lines.push(`\n**Notizen:** ${doc.notes}`)
        lines.push('')
      }

      if (companies.length > 0) {
        lines.push(`## Firmen (${companies.length})`, '')
        for (const c of companies) {
          lines.push(`- **${c.name}** — ${c.document_count || 0} Dokumente${c.tax_id ? ` (UID: ${c.tax_id})` : ''}`)
        }
        lines.push('')
      }

      if (collections.length > 0) {
        lines.push(`## Sammlungen (${collections.length})`, '')
        for (const c of collections) {
          lines.push(`- **${c.name}** — ${c.document_count} Dokumente${c.description ? `: ${c.description}` : ''}`)
        }
        lines.push('')
      }

      const md = lines.join('\n')
      const date = new Date().toISOString().split('T')[0]
      downloadFile(md, `secondbrain-backup-${date}.md`, 'text/markdown')
      toast.success('Markdown-Backup heruntergeladen')
    } catch {
      toast.error('Export fehlgeschlagen')
    } finally {
      setExporting(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="w-4 h-4" />
          Daten exportieren
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Exportiere alle deine SecondBrain-Daten als Backup oder zur Weiterverarbeitung.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-[11px]">{documents.length} Dokumente</Badge>
          <Badge variant="secondary" className="text-[11px]">{companies.length} Firmen</Badge>
          <Badge variant="secondary" className="text-[11px]">{collections.length} Sammlungen</Badge>
          <Badge variant="secondary" className="text-[11px]">{deadlines.length} Fristen</Badge>
        </div>

        {/* Export options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportJSON}
            disabled={!!exporting}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-accent/50 transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              {exporting === 'json' ? <Loader2 className="w-5 h-5 text-orange-500 animate-spin" /> : <FileJson className="w-5 h-5 text-orange-500" />}
            </div>
            <span className="text-sm font-medium">JSON Backup</span>
            <span className="text-[10px] text-muted-foreground text-center">Vollständiges Backup aller Daten</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!!exporting}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-accent/50 transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              {exporting === 'csv' ? <Loader2 className="w-5 h-5 text-green-500 animate-spin" /> : <FileSpreadsheet className="w-5 h-5 text-green-500" />}
            </div>
            <span className="text-sm font-medium">CSV Export</span>
            <span className="text-[10px] text-muted-foreground text-center">Für Excel / Google Sheets</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            disabled={!!exporting}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-accent/50 transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              {exporting === 'md' ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <FileText className="w-5 h-5 text-blue-500" />}
            </div>
            <span className="text-sm font-medium">Markdown</span>
            <span className="text-[10px] text-muted-foreground text-center">Lesbares Textformat</span>
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Hinweis: Der Export enthält keine Dateien (PDFs, Bilder), nur Metadaten und erkannten Text.
        </p>
      </CardContent>
    </Card>
  )
}
