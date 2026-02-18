import { useAuth, useAppConfig } from '@fintutto/core'
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@fintutto/ui'
import {
  FileBox,
  Upload,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSupabase } from '@fintutto/core'

interface DashboardStats {
  totalDocuments: number
  analyzedDocuments: number
  pendingDocuments: number
}

interface RecentUpload {
  id: string
  file_name: string
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'error'
  created_at: string
  document_type: string | null
}

function useDashboardStats() {
  return useQuery({
    queryKey: ['bescheid-boxer', 'dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const supabase = getSupabase()

      const { count: totalDocuments } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('app_id', 'bescheid-boxer')

      const { count: analyzedDocuments } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('app_id', 'bescheid-boxer')
        .eq('status', 'analyzed')

      const { count: pendingDocuments } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('app_id', 'bescheid-boxer')
        .in('status', ['uploaded', 'analyzing'])

      return {
        totalDocuments: totalDocuments ?? 0,
        analyzedDocuments: analyzedDocuments ?? 0,
        pendingDocuments: pendingDocuments ?? 0,
      }
    },
  })
}

function useRecentUploads() {
  return useQuery({
    queryKey: ['bescheid-boxer', 'recent-uploads'],
    queryFn: async (): Promise<RecentUpload[]> => {
      const supabase = getSupabase()

      const { data, error } = await supabase
        .from('documents')
        .select('id, file_name, status, created_at, document_type')
        .eq('app_id', 'bescheid-boxer')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return (data as RecentUpload[]) ?? []
    },
  })
}

interface QuickStatProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle?: string
  to: string
  color: string
  loading?: boolean
}

function QuickStat({ icon, label, value, subtitle, to, color, loading }: QuickStatProps) {
  return (
    <Link to={to}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className={`rounded-lg p-2.5 ${color}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'warning' }> = {
  uploaded: { label: 'Hochgeladen', variant: 'secondary' },
  analyzing: { label: 'Wird analysiert', variant: 'warning' },
  analyzed: { label: 'Analysiert', variant: 'default' },
  error: { label: 'Fehler', variant: 'destructive' },
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

export default function DashboardPage() {
  const { profile } = useAuth()
  const config = useAppConfig()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentUploads, isLoading: uploadsLoading } = useRecentUploads()

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Guten Morgen'
    if (hour < 18) return 'Guten Tag'
    return 'Guten Abend'
  })()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Willkommen bei {config.displayName}
        </p>
      </div>

      {/* KPI-Karten */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickStat
          icon={<FileBox className="h-5 w-5 text-red-600" />}
          label="Bescheide gesamt"
          value={stats?.totalDocuments ?? 0}
          subtitle="Hochgeladene Dokumente"
          to="/documents"
          color="bg-red-50 dark:bg-red-950"
          loading={statsLoading}
        />
        <QuickStat
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          label="Analysiert"
          value={stats?.analyzedDocuments ?? 0}
          subtitle="Erfolgreich ausgewertet"
          to="/analysis"
          color="bg-emerald-50 dark:bg-emerald-950"
          loading={statsLoading}
        />
        <QuickStat
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          label="Ausstehend"
          value={stats?.pendingDocuments ?? 0}
          subtitle="Warten auf Analyse"
          to="/documents"
          color="bg-amber-50 dark:bg-amber-950"
          loading={statsLoading}
        />
      </div>

      {/* Detail-Karten */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Letzte Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4 text-red-500" />
              Letzte Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : recentUploads && recentUploads.length > 0 ? (
              <ul className="space-y-3">
                {recentUploads.map((doc) => {
                  const status = statusConfig[doc.status] ?? statusConfig.uploaded
                  return (
                    <li key={doc.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</p>
                      </div>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Bescheide hochgeladen.</p>
            )}
            <Link to="/documents" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Alle Bescheide <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Schnellzugriff */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Schnellzugriff
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/upload"
              className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
            >
              <Upload className="h-4 w-4 text-primary" />
              <span>Bescheid hochladen</span>
              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
            </Link>
            <Link
              to="/documents"
              className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
            >
              <FileBox className="h-4 w-4 text-primary" />
              <span>Meine Bescheide</span>
              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
            </Link>
            <Link
              to="/analysis"
              className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
            >
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Analyse ansehen</span>
              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
