import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  PlayCircle,
  Globe,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { useUrlChecker } from '@/hooks/useUrlChecker';
import { UrlCheckResult, UrlStatus } from '@/lib/url-checker';
import { categoryLabels, UrlCategory } from '@/lib/url-registry';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

function getStatusIcon(status: UrlStatus) {
  switch (status) {
    case 'reachable':
      return <CheckCircle className="h-4 w-4 text-chart-2" />;
    case 'unreachable':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'timeout':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'pending':
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }
}

function getStatusBadge(status: UrlStatus) {
  switch (status) {
    case 'reachable':
      return <Badge className="bg-chart-2 text-white">Erreichbar</Badge>;
    case 'unreachable':
      return <Badge variant="destructive">Nicht erreichbar</Badge>;
    case 'timeout':
      return <Badge className="bg-yellow-500 text-black">Zeitüberschreitung</Badge>;
    case 'pending':
      return <Badge variant="outline">Ausstehend</Badge>;
  }
}

function getCategoryBadge(category: UrlCategory) {
  const colors: Record<UrlCategory, string> = {
    cdn: 'bg-purple-500 text-white',
    api: 'bg-blue-500 text-white',
    external: 'bg-gray-500 text-white',
    font: 'bg-pink-500 text-white',
    meta: 'bg-orange-500 text-white',
    stripe: 'bg-indigo-500 text-white',
    docs: 'bg-teal-500 text-white',
  };
  return <Badge className={colors[category]}>{categoryLabels[category]}</Badge>;
}

export default function UrlCheck() {
  const { results, isChecking, progress, total, lastCheckedAt, runCheck } = useUrlChecker();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.url.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const reachableCount = results.filter((r) => r.status === 'reachable').length;
  const unreachableCount = results.filter((r) => r.status === 'unreachable').length;
  const timeoutCount = results.filter((r) => r.status === 'timeout').length;
  const criticalIssues = results.filter(
    (r) => r.critical && (r.status === 'unreachable' || r.status === 'timeout'),
  ).length;

  const progressPercent = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">URL Check</h1>
            <p className="text-muted-foreground">
              Prüfen Sie alle externen URLs auf Erreichbarkeit und Funktionalität
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastCheckedAt && (
              <span className="text-sm text-muted-foreground">
                Zuletzt: {format(new Date(lastCheckedAt), 'dd.MM.yyyy HH:mm', { locale: de })}
              </span>
            )}
            <Button onClick={runCheck} disabled={isChecking}>
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prüfe... ({progress}/{total})
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Alle URLs prüfen
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar during check */}
        {isChecking && (
          <Progress value={progressPercent} className="h-2" />
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt URLs</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-chart-2/10 p-3">
                  <CheckCircle className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Erreichbar</p>
                  <p className="text-2xl font-bold">{reachableCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={unreachableCount > 0 ? 'border-destructive' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nicht erreichbar</p>
                  <p className="text-2xl font-bold">{unreachableCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={criticalIssues > 0 ? 'border-destructive' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kritische Probleme</p>
                  <p className="text-2xl font-bold">{criticalIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="URL oder Label suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="reachable">Erreichbar</SelectItem>
              <SelectItem value="unreachable">Nicht erreichbar</SelectItem>
              <SelectItem value="timeout">Zeitüberschreitung</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Globe className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Noch keine Prüfung durchgeführt</h3>
              <p className="mt-1 text-muted-foreground">
                Klicken Sie auf &quot;Alle URLs prüfen&quot;, um die Erreichbarkeit zu testen.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredResults.map((result) => (
                  <UrlResultRow key={result.url} result={result} />
                ))}
                {filteredResults.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Keine Ergebnisse für die aktuelle Filterung.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function UrlResultRow({ result }: { result: UrlCheckResult }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {getStatusIcon(result.status)}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{result.label}</p>
            {result.critical && (
              <Badge variant="outline" className="border-destructive text-destructive">
                Kritisch
              </Badge>
            )}
            {getCategoryBadge(result.category)}
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">{result.url}</p>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Quelle: {result.source}</span>
            {result.responseTimeMs !== null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {result.responseTimeMs} ms
              </span>
            )}
            {result.statusCode !== null && <span>HTTP {result.statusCode}</span>}
            {result.error && (
              <span className="text-destructive">{result.error}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {getStatusBadge(result.status)}
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
