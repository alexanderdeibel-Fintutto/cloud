import { useQuery } from '@tanstack/react-query'
import { getSupabase } from '@fintutto/core'
import { Card, CardContent, Badge, Skeleton, EmptyState } from '@fintutto/ui'
import { FileBox, Eye, BarChart3, Clock, CheckCircle2, AlertCircle, Upload as UploadIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@fintutto/ui'

interface Document {
  id: string
  file_name: string
  file_size: number
  mime_type: string
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'error'
  document_type: string | null
  created_at: string
  updated_at: string
}

function useDocuments() {
  return useQuery({
    queryKey: ['bescheid-boxer', 'documents'],
    queryFn: async (): Promise<Document[]> => {
      const supabase = getSupabase()

      const { data, error } = await supabase
        .from('documents')
        .select('id, file_name, file_size, mime_type, status, document_type, created_at, updated_at')
        .eq('app_id', 'bescheid-boxer')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as Document[]) ?? []
    },
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'warning'; icon: React.ReactNode }> = {
  uploaded: {
    label: 'Hochgeladen',
    variant: 'secondary',
    icon: <Clock className="h-3 w-3" />,
  },
  analyzing: {
    label: 'Wird analysiert',
    variant: 'warning',
    icon: <BarChart3 className="h-3 w-3" />,
  },
  analyzed: {
    label: 'Analysiert',
    variant: 'default',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  error: {
    label: 'Fehler',
    variant: 'destructive',
    icon: <AlertCircle className="h-3 w-3" />,
  },
}

const documentTypeLabels: Record<string, string> = {
  einkommensteuer: 'Einkommensteuerbescheid',
  gewerbesteuer: 'Gewerbesteuerbescheid',
  umsatzsteuer: 'Umsatzsteuerbescheid',
  grundsteuer: 'Grundsteuerbescheid',
  koerperschaftsteuer: 'Körperschaftsteuerbescheid',
  vorauszahlung: 'Vorauszahlungsbescheid',
  unknown: 'Unbekannter Typ',
}

export default function DocumentsPage() {
  const { data: documents, isLoading } = useDocuments()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meine Bescheide</h1>
          <p className="text-muted-foreground">
            {documents?.length ?? 0} {(documents?.length ?? 0) === 1 ? 'Bescheid' : 'Bescheide'} hochgeladen
          </p>
        </div>
        <Button asChild>
          <Link to="/upload">
            <UploadIcon className="mr-2 h-4 w-4" />
            Hochladen
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => {
            const status = statusConfig[doc.status] ?? statusConfig.uploaded
            return (
              <Card
                key={doc.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => {
                  if (doc.status === 'analyzed') {
                    navigate(`/analysis/${doc.id}`)
                  }
                }}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-red-50 p-2.5 dark:bg-red-950">
                    <FileBox className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(doc.created_at)}
                      </span>
                      {doc.document_type && (
                        <span className="text-xs text-muted-foreground">
                          {documentTypeLabels[doc.document_type] ?? doc.document_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={status.variant} className="flex items-center gap-1">
                      {status.icon}
                      {status.label}
                    </Badge>
                    {doc.status === 'analyzed' && (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<FileBox className="h-8 w-8" />}
          title="Noch keine Bescheide"
          description="Lade deinen ersten Steuerbescheid hoch, um ihn analysieren zu lassen."
        />
      )}
    </div>
  )
}
