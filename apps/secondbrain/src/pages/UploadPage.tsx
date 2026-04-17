import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Upload, Brain, Zap, Shield, FileText, Link2, Building2, Briefcase, Users, Gauge } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DocumentUpload from '@/components/documents/DocumentUpload'
import { useUploadDocument } from '@/hooks/useDocuments'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const features = [
  { icon: Brain, title: 'KI-Analyse', desc: 'Automatische Zusammenfassung & Kategorisierung' },
  { icon: Zap, title: 'OCR-Erkennung', desc: 'Text wird aus Bildern & PDFs extrahiert' },
  { icon: FileText, title: 'Volltextsuche', desc: 'Jedes Dokument wird durchsuchbar' },
  { icon: Shield, title: 'Sicher', desc: 'Ende-zu-Ende verschlüsselt gespeichert' },
]

const ENTITY_ICONS: Record<string, React.ElementType> = {
  building: Building2,
  unit: Building2,
  tenant: Users,
  lease: FileText,
  business: Briefcase,
  expense: FileText,
  invoice: FileText,
  meter: Gauge,
}

const ENTITY_LABELS: Record<string, string> = {
  building: 'Gebäude',
  unit: 'Einheit',
  tenant: 'Mieter',
  lease: 'Mietvertrag',
  business: 'Firma',
  expense: 'Ausgabe',
  invoice: 'Rechnung',
  meter: 'Zähler',
}

type EntityContext = {
  type: string
  id: string
  label?: string
}

async function resolveEntityLabel(type: string, id: string): Promise<string | undefined> {
  try {
    const tableMap: Record<string, { table: string; labelCol: string }> = {
      building: { table: 'buildings', labelCol: 'name' },
      unit: { table: 'units', labelCol: 'name' },
      tenant: { table: 'tenants', labelCol: 'name' },
      business: { table: 'biz_businesses', labelCol: 'name' },
      meter: { table: 'meters', labelCol: 'meter_number' },
    }
    const mapping = tableMap[type]
    if (!mapping) return undefined

    const { data } = await supabase
      .from(mapping.table as never)
      .select(mapping.labelCol)
      .eq('id', id)
      .single()

    return (data as Record<string, string> | null)?.[mapping.labelCol]
  } catch {
    return undefined
  }
}

export default function UploadPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const uploadDocument = useUploadDocument()
  const [entityContext, setEntityContext] = useState<EntityContext | null>(null)
  const [isResolvingLabel, setIsResolvingLabel] = useState(false)

  // URL-Kontext-Parameter auslesen: ?context=building&id=<uuid>
  useEffect(() => {
    const contextType = searchParams.get('context')
    const contextId = searchParams.get('id')

    if (contextType && contextId) {
      setIsResolvingLabel(true)
      resolveEntityLabel(contextType, contextId).then((label) => {
        setEntityContext({ type: contextType, id: contextId, label })
        setIsResolvingLabel(false)
      })
    } else {
      setEntityContext(null)
    }
  }, [searchParams])

  const handleUpload = async (files: File[]) => {
    try {
      const uploadedDocs = await uploadDocument.mutateAsync(files)

      // Wenn ein Kontext vorhanden ist, direkt verknüpfen
      if (entityContext && uploadedDocs?.length) {
        for (const doc of uploadedDocs) {
          await supabase.from('sb_document_entity_links').insert({
            document_id: doc.id,
            entity_type: entityContext.type,
            entity_id: entityContext.id,
            entity_label: entityContext.label,
            app_source: 'upload_context',
            linked_by: user?.id,
          })
        }
        toast.success(
          `${files.length} ${files.length === 1 ? 'Dokument' : 'Dokumente'} hochgeladen und mit ${
            ENTITY_LABELS[entityContext.type] || entityContext.type
          } verknüpft`
        )
      } else {
        toast.success(
          `${files.length} ${files.length === 1 ? 'Dokument' : 'Dokumente'} erfolgreich hochgeladen`
        )
      }
    } catch (error) {
      toast.error('Fehler beim Hochladen')
      throw error
    }
  }

  const EntityIcon = entityContext ? (ENTITY_ICONS[entityContext.type] || Link2) : null

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

      {/* Kontext-Banner: wird angezeigt wenn ?context=...&id=... in der URL */}
      {entityContext && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              {EntityIcon && <EntityIcon className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Dokumente werden automatisch verknüpft mit:
              </p>
              <p className="text-sm text-muted-foreground truncate">
                <Badge variant="outline" className="mr-1.5 text-xs">
                  {ENTITY_LABELS[entityContext.type] || entityContext.type}
                </Badge>
                {isResolvingLabel ? (
                  <span className="text-xs text-muted-foreground">Wird geladen…</span>
                ) : (
                  <span className="font-medium">{entityContext.label || entityContext.id}</span>
                )}
              </p>
            </div>
            <Link2 className="w-4 h-4 text-primary shrink-0" />
          </CardContent>
        </Card>
      )}

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
