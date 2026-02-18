import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSupabase } from '@fintutto/core'
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Separator, EmptyState } from '@fintutto/ui'
import {
  BarChart3,
  FileText,
  Calendar,
  Euro,
  Percent,
  Hash,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface OcrResult {
  id: string
  document_id: string
  detected_type: string | null
  confidence: number | null
  extracted_data: {
    tax_year?: string
    tax_type?: string
    taxpayer_name?: string
    tax_id?: string
    assessment_date?: string
    taxable_income?: number
    tax_amount?: number
    prepayments?: number
    remaining_payment?: number
    church_tax?: number
    solidarity_surcharge?: number
    total_due?: number
    due_date?: string
    line_items?: Array<{
      label: string
      amount: number
    }>
  } | null
  raw_text: string | null
  created_at: string
}

interface DocumentWithOcr {
  id: string
  file_name: string
  status: string
  document_type: string | null
  created_at: string
  ocr_results: OcrResult[]
}

function useAnalysisResults(documentId?: string) {
  return useQuery({
    queryKey: ['bescheid-boxer', 'analysis', documentId],
    queryFn: async (): Promise<DocumentWithOcr[]> => {
      const supabase = getSupabase()

      if (documentId) {
        // Single document analysis
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .select('id, file_name, status, document_type, created_at')
          .eq('id', documentId)
          .eq('app_id', 'bescheid-boxer')
          .single()

        if (docError) throw docError

        const { data: ocrResults, error: ocrError } = await supabase
          .from('document_ocr_results')
          .select('id, document_id, detected_type, confidence, extracted_data, raw_text, created_at')
          .eq('document_id', documentId)
          .order('created_at', { ascending: false })

        if (ocrError) throw ocrError

        return [{ ...doc, ocr_results: ocrResults ?? [] }] as DocumentWithOcr[]
      } else {
        // All analyzed documents
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('id, file_name, status, document_type, created_at')
          .eq('app_id', 'bescheid-boxer')
          .eq('status', 'analyzed')
          .order('created_at', { ascending: false })

        if (docsError) throw docsError
        if (!docs || docs.length === 0) return []

        const docIds = docs.map((d) => d.id)

        const { data: ocrResults, error: ocrError } = await supabase
          .from('document_ocr_results')
          .select('id, document_id, detected_type, confidence, extracted_data, raw_text, created_at')
          .in('document_id', docIds)
          .order('created_at', { ascending: false })

        if (ocrError) throw ocrError

        const ocrByDoc = (ocrResults ?? []).reduce<Record<string, OcrResult[]>>((acc, ocr) => {
          if (!acc[ocr.document_id]) acc[ocr.document_id] = []
          acc[ocr.document_id].push(ocr)
          return acc
        }, {})

        return docs.map((doc) => ({
          ...doc,
          ocr_results: ocrByDoc[doc.id] ?? [],
        })) as DocumentWithOcr[]
      }
    },
  })
}

function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

function formatConfidence(confidence: number | null): string {
  if (confidence === null) return 'N/A'
  return `${(confidence * 100).toFixed(1)}%`
}

const typeLabels: Record<string, string> = {
  einkommensteuer: 'Einkommensteuerbescheid',
  gewerbesteuer: 'Gewerbesteuerbescheid',
  umsatzsteuer: 'Umsatzsteuerbescheid',
  grundsteuer: 'Grundsteuerbescheid',
  koerperschaftsteuer: 'Körperschaftsteuerbescheid',
  vorauszahlung: 'Vorauszahlungsbescheid',
  unknown: 'Unbekannter Typ',
}

function AnalysisCard({ doc }: { doc: DocumentWithOcr }) {
  const ocr = doc.ocr_results[0]
  const data = ocr?.extracted_data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-500" />
              {doc.file_name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Hochgeladen am {formatDate(doc.created_at)}
            </p>
          </div>
          {ocr && (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  (ocr.confidence ?? 0) >= 0.9 ? 'default' :
                  (ocr.confidence ?? 0) >= 0.7 ? 'warning' : 'destructive'
                }
                className="flex items-center gap-1"
              >
                <Percent className="h-3 w-3" />
                {formatConfidence(ocr.confidence)}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!ocr ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Keine Analyseergebnisse vorhanden
          </div>
        ) : (
          <>
            {/* Erkannter Typ */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">Erkannter Typ:</span>
              <Badge variant="secondary">
                {typeLabels[ocr.detected_type ?? 'unknown'] ?? ocr.detected_type ?? 'Unbekannt'}
              </Badge>
            </div>

            <Separator />

            {/* Extrahierte Daten */}
            {data && (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.taxpayer_name && (
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Steuerpflichtiger</p>
                      <p className="text-sm font-medium">{data.taxpayer_name}</p>
                    </div>
                  </div>
                )}
                {data.tax_id && (
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Steuer-ID</p>
                      <p className="text-sm font-medium">{data.tax_id}</p>
                    </div>
                  </div>
                )}
                {data.tax_year && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Steuerjahr</p>
                      <p className="text-sm font-medium">{data.tax_year}</p>
                    </div>
                  </div>
                )}
                {data.assessment_date && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Bescheiddatum</p>
                      <p className="text-sm font-medium">{data.assessment_date}</p>
                    </div>
                  </div>
                )}
                {data.taxable_income !== undefined && (
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Zu versteuerndes Einkommen</p>
                      <p className="text-sm font-medium">{formatEuro(data.taxable_income)}</p>
                    </div>
                  </div>
                )}
                {data.tax_amount !== undefined && (
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Festgesetzte Steuer</p>
                      <p className="text-sm font-medium">{formatEuro(data.tax_amount)}</p>
                    </div>
                  </div>
                )}
                {data.prepayments !== undefined && (
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vorauszahlungen</p>
                      <p className="text-sm font-medium">{formatEuro(data.prepayments)}</p>
                    </div>
                  </div>
                )}
                {data.remaining_payment !== undefined && (
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nachzahlung / Erstattung</p>
                      <p className={`text-sm font-bold ${data.remaining_payment > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                        {formatEuro(data.remaining_payment)}
                      </p>
                    </div>
                  </div>
                )}
                {data.solidarity_surcharge !== undefined && (
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Solidaritätszuschlag</p>
                      <p className="text-sm font-medium">{formatEuro(data.solidarity_surcharge)}</p>
                    </div>
                  </div>
                )}
                {data.church_tax !== undefined && (
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Kirchensteuer</p>
                      <p className="text-sm font-medium">{formatEuro(data.church_tax)}</p>
                    </div>
                  </div>
                )}
                {data.total_due !== undefined && (
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Gesamtbetrag</p>
                      <p className="text-sm font-bold">{formatEuro(data.total_due)}</p>
                    </div>
                  </div>
                )}
                {data.due_date && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fälligkeitsdatum</p>
                      <p className="text-sm font-medium">{data.due_date}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Einzelpositionen */}
            {data?.line_items && data.line_items.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Einzelpositionen</p>
                  <div className="space-y-1">
                    {data.line_items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{formatEuro(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function AnalysisPage() {
  const { documentId } = useParams<{ documentId?: string }>()
  const { data: results, isLoading } = useAnalysisResults(documentId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {documentId ? 'Analyseergebnis' : 'Alle Analysen'}
        </h1>
        <p className="text-muted-foreground">
          {documentId
            ? 'Detaillierte OCR-Auswertung deines Bescheids'
            : 'Übersicht aller analysierten Steuerbescheide'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results && results.length > 0 ? (
        <div className="space-y-4">
          {results.map((doc) => (
            <AnalysisCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="Keine Analyseergebnisse"
          description={
            documentId
              ? 'Für diesen Bescheid liegen noch keine Ergebnisse vor.'
              : 'Lade Bescheide hoch und lasse sie analysieren.'
          }
        />
      )}

      {!documentId && results && results.length > 0 && (
        <div className="text-center">
          <Link
            to="/upload"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Weitere Bescheide hochladen <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  )
}
