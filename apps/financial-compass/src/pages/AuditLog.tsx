import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useAuditLog, AuditLogEntry, AuditAction, AuditModule
} from '@/hooks/useAuditLog';
import {
  History, Search, Download, Filter, CheckCircle, XCircle,
  FileText, Users, CreditCard, Settings, Package, Archive,
  Shield, Landmark, Calendar, TrendingUp, AlertTriangle, BarChart3
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const ACTION_COLORS: Record<AuditAction, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  view: 'bg-gray-100 text-gray-800',
  export: 'bg-purple-100 text-purple-800',
  import: 'bg-cyan-100 text-cyan-800',
  login: 'bg-emerald-100 text-emerald-800',
  logout: 'bg-slate-100 text-slate-800',
  send: 'bg-indigo-100 text-indigo-800',
  approve: 'bg-lime-100 text-lime-800',
  reject: 'bg-orange-100 text-orange-800',
  archive: 'bg-amber-100 text-amber-800',
  restore: 'bg-teal-100 text-teal-800',
  sync: 'bg-sky-100 text-sky-800',
  reconcile: 'bg-violet-100 text-violet-800',
  reverse: 'bg-rose-100 text-rose-800',
};

const MODULE_ICONS: Record<AuditModule, React.ElementType> = {
  invoices: FileText,
  receipts: FileText,
  bookings: FileText,
  contacts: Users,
  bank: CreditCard,
  reports: BarChart3,
  settings: Settings,
  users: Shield,
  assets: Package,
  archive: Archive,
  auth: Shield,
  sepa: CreditCard,
  elster: Landmark,
  system: Settings,
};

export default function AuditLog() {
  const {
    entries,
    filters,
    setFilters,
    exportLog,
    clearOldEntries,
    stats,
    actionLabels,
    moduleLabels,
  } = useAuditLog();

  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleClearFilters = () => {
    setFilters({
      action: null,
      module: null,
      userId: null,
      dateFrom: null,
      dateTo: null,
      searchQuery: '',
      successOnly: false,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8" />
            Audit-Log
          </h1>
          <p className="text-muted-foreground">Vollständige Änderungshistorie aller Aktivitäten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportLog('csv')}>
            <Download className="mr-2 h-4 w-4" />
            CSV Export
          </Button>
          <Button variant="outline" onClick={() => exportLog('json')}>
            <Download className="mr-2 h-4 w-4" />
            JSON Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString('de-DE')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Heute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Diese Woche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Erfolgsrate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fehler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="log">
        <TabsList>
          <TabsTrigger value="log">Protokoll</TabsTrigger>
          <TabsTrigger value="stats">Statistiken</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Suchen..."
                      className="pl-10"
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    />
                  </div>
                </div>

                <Select
                  value={filters.action || 'all'}
                  onValueChange={(v) => setFilters({ ...filters, action: v === 'all' ? null : v as AuditAction })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Aktion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Aktionen</SelectItem>
                    {Object.entries(actionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label.de}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.module || 'all'}
                  onValueChange={(v) => setFilters({ ...filters, module: v === 'all' ? null : v as AuditModule })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Modul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Module</SelectItem>
                    {Object.entries(moduleLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label.de}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  className="w-[150px]"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || null })}
                  placeholder="Von"
                />

                <Input
                  type="date"
                  className="w-[150px]"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || null })}
                  placeholder="Bis"
                />

                <Button variant="outline" onClick={handleClearFilters}>
                  Filter zurücksetzen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Log Table */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitäten ({entries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zeitpunkt</TableHead>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Aktion</TableHead>
                      <TableHead>Modul</TableHead>
                      <TableHead>Objekt</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>Keine Einträge gefunden</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      entries.slice(0, 100).map((entry) => {
                        const ModuleIcon = MODULE_ICONS[entry.module] || Settings;
                        return (
                          <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedEntry(entry)}>
                            <TableCell>
                              <div className="text-sm">{format(new Date(entry.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: de })}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: de })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{entry.userName}</div>
                              <div className="text-xs text-muted-foreground">{entry.userEmail}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={ACTION_COLORS[entry.action]}>
                                {actionLabels[entry.action]?.de || entry.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                                {moduleLabels[entry.module]?.de || entry.module}
                              </div>
                            </TableCell>
                            <TableCell>
                              {entry.entityName || entry.entityId || '-'}
                            </TableCell>
                            <TableCell>
                              {entry.success ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Details</Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
              {entries.length > 100 && (
                <div className="text-center py-4 text-muted-foreground">
                  Zeige 100 von {entries.length} Einträgen. Verwenden Sie Filter für genauere Ergebnisse.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Actions by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Nach Aktion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byAction)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([action, count]) => (
                      <div key={action} className="flex items-center justify-between">
                        <Badge className={ACTION_COLORS[action as AuditAction]}>
                          {actionLabels[action as AuditAction]?.de || action}
                        </Badge>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions by Module */}
            <Card>
              <CardHeader>
                <CardTitle>Nach Modul</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byModule)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([module, count]) => {
                      const ModuleIcon = MODULE_ICONS[module as AuditModule] || Settings;
                      return (
                        <div key={module} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                            {moduleLabels[module as AuditModule]?.de || module}
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivste Benutzer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byUser)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 10)
                    .map(([userId, data]) => (
                      <div key={userId} className="flex items-center justify-between">
                        <span>{data.name}</span>
                        <Badge variant="outline">{data.count} Aktionen</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle>Wartung</CardTitle>
                <CardDescription>Log-Bereinigung und Export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">Alte Einträge löschen</div>
                    <div className="text-sm text-muted-foreground">Einträge älter als 90 Tage</div>
                  </div>
                  <Button variant="outline" onClick={() => clearOldEntries(90)}>
                    Bereinigen
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">Speichernutzung</div>
                    <div className="text-sm text-muted-foreground">{stats.total.toLocaleString('de-DE')} Einträge</div>
                  </div>
                  <Badge variant="outline">
                    ~{Math.round(JSON.stringify(entries).length / 1024)} KB
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Entry Detail Sheet */}
      <Sheet open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <SheetContent className="w-[500px]">
          <SheetHeader>
            <SheetTitle>Audit-Eintrag Details</SheetTitle>
            <SheetDescription>
              {selectedEntry && format(new Date(selectedEntry.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
            </SheetDescription>
          </SheetHeader>
          {selectedEntry && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Benutzer</Label>
                  <p className="font-medium">{selectedEntry.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedEntry.userEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedEntry.success ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Erfolgreich</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Fehlgeschlagen</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Aktion</Label>
                  <Badge className={ACTION_COLORS[selectedEntry.action]}>
                    {actionLabels[selectedEntry.action]?.de}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Modul</Label>
                  <p className="font-medium">{moduleLabels[selectedEntry.module]?.de}</p>
                </div>
              </div>

              {selectedEntry.entityName && (
                <div>
                  <Label className="text-muted-foreground">Objekt</Label>
                  <p className="font-medium">{selectedEntry.entityName}</p>
                  {selectedEntry.entityId && (
                    <p className="text-xs text-muted-foreground font-mono">{selectedEntry.entityId}</p>
                  )}
                </div>
              )}

              {selectedEntry.changes && selectedEntry.changes.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Änderungen</Label>
                  <div className="mt-2 space-y-2">
                    {selectedEntry.changes.map((change, index) => (
                      <div key={index} className="p-2 rounded bg-muted/50 text-sm">
                        <div className="font-medium">{change.field}</div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="line-through">{String(change.oldValue)}</span>
                          <span>→</span>
                          <span className="text-foreground">{String(change.newValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.details && Object.keys(selectedEntry.details).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Details</Label>
                  <pre className="mt-2 p-3 rounded bg-muted/50 text-xs overflow-x-auto">
                    {JSON.stringify(selectedEntry.details, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEntry.errorMessage && (
                <div>
                  <Label className="text-muted-foreground text-red-600">Fehlermeldung</Label>
                  <p className="mt-1 p-2 rounded bg-red-50 text-red-800 text-sm">
                    {selectedEntry.errorMessage}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t text-xs text-muted-foreground">
                <div>ID: {selectedEntry.id}</div>
                {selectedEntry.ipAddress && <div>IP: {selectedEntry.ipAddress}</div>}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
