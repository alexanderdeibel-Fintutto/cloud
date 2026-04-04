import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, AlertCircle, Info, Search, Clock, Server, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useErrorLogs, useResolveError, ErrorLog } from '@/hooks/useErrorLogs';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';
type ErrorStatus = 'open' | 'in_progress' | 'resolved';

interface DisplayError {
  id: string;
  timestamp: string;
  app: string;
  severity: ErrorSeverity;
  message: string;
  status: ErrorStatus;
  count: number;
  stackTrace?: string;
  userId?: string;
}

export default function Errors() {
  const { data: rawErrors, isLoading } = useErrorLogs();
  const resolveError = useResolveError();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<DisplayError | null>(null);

  // Transform database errors to display format
  const errors: DisplayError[] = (rawErrors || []).map(e => ({
    id: e.id,
    timestamp: e.occurred_at ? format(new Date(e.occurred_at), 'yyyy-MM-dd HH:mm:ss', { locale: de }) : '-',
    app: e.app_id || 'System',
    severity: (e.error_type as ErrorSeverity) || 'error',
    message: e.error_message || 'Unbekannter Fehler',
    status: e.resolved ? 'resolved' : 'open',
    count: 1,
    stackTrace: e.error_stack || undefined,
    userId: e.user_id || undefined,
  }));

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.message.toLowerCase().includes(search.toLowerCase()) || 
                         error.app.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || error.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || error.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Calculate app stats from real data
  const appStats = Object.entries(
    errors.reduce((acc, e) => {
      if (!acc[e.app]) acc[e.app] = { app: e.app, errors: 0, critical: 0, warnings: 0 };
      acc[e.app].errors++;
      if (e.severity === 'critical') acc[e.app].critical++;
      if (e.severity === 'warning') acc[e.app].warnings++;
      return acc;
    }, {} as Record<string, { app: string; errors: number; critical: number; warnings: number }>)
  ).map(([_, v]) => v);

  const updateStatus = async (id: string, status: ErrorStatus) => {
    if (status === 'resolved') {
      await resolveError.mutateAsync({ id });
    }
  };

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: ErrorSeverity) => {
    const variants: Record<ErrorSeverity, string> = {
      critical: 'bg-destructive text-destructive-foreground',
      error: 'bg-orange-500 text-white',
      warning: 'bg-yellow-500 text-black',
      info: 'bg-blue-500 text-white'
    };
    return <Badge className={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: ErrorStatus) => {
    const config: Record<ErrorStatus, { variant: 'default' | 'secondary' | 'outline', label: string }> = {
      open: { variant: 'destructive' as 'default', label: 'Offen' },
      in_progress: { variant: 'outline', label: 'In Bearbeitung' },
      resolved: { variant: 'secondary', label: 'Gelöst' }
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const criticalCount = errors.filter(e => e.severity === 'critical' && e.status !== 'resolved').length;
  const openCount = errors.filter(e => e.status === 'open').length;
  const resolvedToday = errors.filter(e => e.status === 'resolved').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fehler & Logs</h1>
            <p className="text-muted-foreground">Überwachen und beheben Sie Systemfehler</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['error-logs'] })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className={criticalCount > 0 ? 'border-destructive' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kritische Fehler</p>
                  <p className="text-2xl font-bold">{criticalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Offene Fehler</p>
                  <p className="text-2xl font-bold">{openCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-chart-2/10">
                  <CheckCircle className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heute gelöst</p>
                  <p className="text-2xl font-bold">{resolvedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt Events</p>
                  <p className="text-2xl font-bold">{errors.reduce((sum, e) => sum + e.count, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs">Error Logs</TabsTrigger>
            <TabsTrigger value="apps">Nach App</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="open">Offen</SelectItem>
                  <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                  <SelectItem value="resolved">Gelöst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error List */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {filteredErrors.map((error) => (
                    <Dialog key={error.id}>
                      <DialogTrigger asChild>
                        <div 
                          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedError(error)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getSeverityIcon(error.severity)}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{error.message}</p>
                                  {getSeverityBadge(error.severity)}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span>{error.app}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {error.timestamp}
                                  </span>
                                  <span>{error.count}x aufgetreten</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(error.status)}
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getSeverityIcon(error.severity)}
                            {error.message}
                          </DialogTitle>
                          <DialogDescription>
                            {error.app} • {error.timestamp} • {error.count}x aufgetreten
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            {getSeverityBadge(error.severity)}
                            {getStatusBadge(error.status)}
                          </div>
                          
                          {error.stackTrace && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Stack Trace</p>
                              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                                {error.stackTrace}
                              </pre>
                            </div>
                          )}
                          
                          {error.userId && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Betroffener User</p>
                              <code className="px-2 py-1 rounded bg-muted text-sm">{error.userId}</code>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-4">
                            <Button 
                              variant="outline" 
                              onClick={() => updateStatus(error.id, 'in_progress')}
                              disabled={error.status === 'in_progress'}
                            >
                              In Bearbeitung
                            </Button>
                            <Button 
                              onClick={() => updateStatus(error.id, 'resolved')}
                              disabled={error.status === 'resolved'}
                            >
                              Als gelöst markieren
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appStats.map((app, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{app.app}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Gesamt Fehler</span>
                        <span className="font-bold">{app.errors}</span>
                      </div>
                      {app.critical > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-destructive">Kritisch</span>
                          <Badge variant="destructive">{app.critical}</Badge>
                        </div>
                      )}
                      {app.warnings > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-yellow-600">Warnungen</span>
                          <Badge className="bg-yellow-500 text-black">{app.warnings}</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
