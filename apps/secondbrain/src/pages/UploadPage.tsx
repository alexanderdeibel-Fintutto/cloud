import { Upload, Brain, Zap, Shield, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import DocumentUpload from '@/components/documents/DocumentUpload'
import { useUploadDocument } from '@/hooks/useDocuments'
import { toast } from 'sonner'

const features = [
  { icon: Brain, title: 'KI-Analyse', desc: 'Automatische Zusammenfassung & Kategorisierung' },
  { icon: Zap, title: 'OCR-Erkennung', desc: 'Text wird aus Bildern & PDFs extrahiert' },
  { icon: FileText, title: 'Volltextsuche', desc: 'Jedes Dokument wird durchsuchbar' },
  { icon: Shield, title: 'Sicher', desc: 'Ende-zu-Ende verschlüsselt gespeichert' },
]

export default function UploadPage() {
  const uploadDocument = useUploadDocument()

  const handleUpload = async (files: File[]) => {
    try {
      await uploadDocument.mutateAsync(files)
      toast.success(`${files.length} ${files.length === 1 ? 'Dokument' : 'Dokumente'} erfolgreich hochgeladen`)
    } catch (error) {
      toast.error('Fehler beim Hochladen')
      throw error
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary" />
          Dokumente hochladen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lade Dokumente hoch — sie werden automatisch per KI analysiert und durchsuchbar gemacht.
        </p>
      </div>

      {/* Upload Zone */}
      <DocumentUpload onUpload={handleUpload} />

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supported Formats */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3">Unterstützte Formate</h3>
          <div className="flex flex-wrap gap-2">
            {['PDF', 'JPG', 'PNG', 'WebP', 'GIF', 'TXT', 'MD', 'DOC', 'DOCX', 'CSV'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground"
              >
                .{fmt.toLowerCase()}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Maximale Dateigröße: 50 MB pro Datei. Bis zu 10 Dateien gleichzeitig.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
