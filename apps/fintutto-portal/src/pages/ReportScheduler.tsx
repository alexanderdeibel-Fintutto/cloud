import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useReportScheduler, ScheduledReport, ReportType, ScheduleFrequency, ExportFormat, DeliveryMethod
} from '@/hooks/useReportScheduler';
import {
  Calendar, Clock, Plus, Play, Pause, Trash2, Edit, Download,
  Mail, Archive, CheckCircle, XCircle, AlertTriangle, BarChart3
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  yearly: 'Jährlich',
};

const FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: 'PDF',
  csv: 'CSV',
  xlsx: 'Excel',
  datev: 'DATEV',
};

const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  email: 'E-Mail',
  download: 'Download-Bereich',
  archive: 'Archiv',
};

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export default function ReportScheduler() {
  const {
    schedules,
    executions,
    reportTypes,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    executeReport,
    stats,
  } = useReportScheduler();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    reportType: 'bwa' as ReportType,
    frequency: 'monthly' as ScheduleFrequency,
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '08:00',
    format: 'pdf' as ExportFormat,
    delivery: 'email' as DeliveryMethod,
    recipients: '',
    isActive: true,
  });

  const handleOpenDialog = (schedule?: ScheduledReport) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        name: schedule.name,
        reportType: schedule.reportType,
        frequency: schedule.frequency,
        dayOfWeek: schedule.dayOfWeek || 1,
        dayOfMonth: schedule.dayOfMonth || 1,
        time: schedule.time,
        format: schedule.format,
        delivery: schedule.delivery,
        recipients: schedule.recipients?.join(', ') || '',
        isActive: schedule.isActive,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        name: '',
        reportType: 'bwa',
        frequency: 'monthly',
        dayOfWeek: 1,
        dayOfMonth: 1,
        time: '08:00',
        format: 'pdf',
        delivery: 'email',
        recipients: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    const data = {
      name: formData.name,
      reportType: formData.reportType,
      frequency: formData.frequency,
      dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
      dayOfMonth: ['monthly', 'quarterly', 'yearly'].includes(formData.frequency) ? formData.dayOfMonth : undefined,
      time: formData.time,
      format: formData.format,
      delivery: formData.delivery,
      recipients: formData.delivery === 'email' ? formData.recipients.split(',').map(e => e.trim()).filter(Boolean) : undefined,
      isActive: formData.isActive,
    };

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, data);
      toast.success('Zeitplan aktualisiert');
    } else {
      createSchedule(data);
      toast.success('Zeitplan erstellt');
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteSchedule(id);
    toast.success('Zeitplan gelöscht');
  };

  const handleExecuteNow = async (id: string) => {
    toast.info('Bericht wird erstellt...');
    await executeReport(id, async () => {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { fileUrl: '#' };
    });
    toast.success('Bericht erstellt');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Report-Scheduler
          </h1>
          <p className="text-muted-foreground">Automatisierte Berichtserstellung planen</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Zeitplan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Zeitpläne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSchedules}</div>
            <p className="text-xs text-muted-foreground">von {stats.totalSchedules} gesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ausführungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Nächster Bericht</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.nextScheduledReport ? (
              <>
                <div className="font-medium truncate">{stats.nextScheduledReport.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(stats.nextScheduledReport.nextRun || ''), 'dd.MM. HH:mm', { locale: de })}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Keine geplant</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedules">
        <TabsList>
          <TabsTrigger value="schedules">Zeitpläne</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geplante Berichte</CardTitle>
              <CardDescription>Verwalten Sie Ihre automatisierten Berichte</CardDescription>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Keine Zeitpläne erstellt</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                    Ersten Zeitplan erstellen
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Berichtstyp</TableHead>
                      <TableHead>Häufigkeit</TableHead>
                      <TableHead>Nächste Ausführung</TableHead>
                      <TableHead>Zustellung</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {reportTypes.find(r => r.type === schedule.reportType)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{FREQUENCY_LABELS[schedule.frequency]}</TableCell>
                        <TableCell>
                          {schedule.nextRun && (
                            <div>
                              <div>{format(new Date(schedule.nextRun), 'dd.MM.yyyy HH:mm', { locale: de })}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(schedule.nextRun), { addSuffix: true, locale: de })}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {schedule.delivery === 'email' && <Mail className="h-4 w-4" />}
                            {schedule.delivery === 'download' && <Download className="h-4 w-4" />}
                            {schedule.delivery === 'archive' && <Archive className="h-4 w-4" />}
                            {DELIVERY_LABELS[schedule.delivery]}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={schedule.isActive}
                            onCheckedChange={() => toggleSchedule(schedule.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExecuteNow(schedule.id)}
                              title="Jetzt ausführen"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(schedule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ausführungsverlauf</CardTitle>
              <CardDescription>Letzte Berichtsausführungen</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {executions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Noch keine Berichte erstellt</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {executions.slice(0, 50).map((execution) => (
                      <div
                        key={execution.id}
                        className="flex items-center gap-4 p-3 rounded-lg border"
                      >
                        <div className="shrink-0">
                          {execution.status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {execution.status === 'failed' && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          {execution.status === 'running' && (
                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          )}
                          {execution.status === 'pending' && (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{execution.reportName}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(execution.startedAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </div>
                          {execution.error && (
                            <div className="text-sm text-red-600">{execution.error}</div>
                          )}
                        </div>
                        {execution.fileUrl && execution.status === 'completed' && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={execution.fileUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Zeitplan bearbeiten' : 'Neuer Zeitplan'}
            </DialogTitle>
            <DialogDescription>
              Konfigurieren Sie die automatische Berichtserstellung
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Monatliche BWA"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Berichtstyp</Label>
                <Select
                  value={formData.reportType}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, reportType: v as ReportType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.type} value={type.type}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={formData.format}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, format: v as ExportFormat }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Häufigkeit</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, frequency: v as ScheduleFrequency }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Uhrzeit</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            {formData.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Wochentag</Label>
                <Select
                  value={formData.dayOfWeek.toString()}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {['monthly', 'quarterly', 'yearly'].includes(formData.frequency) && (
              <div className="space-y-2">
                <Label>Tag des Monats</Label>
                <Select
                  value={formData.dayOfMonth.toString()}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>{day}.</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Zustellung</Label>
              <Select
                value={formData.delivery}
                onValueChange={(v) => setFormData(prev => ({ ...prev, delivery: v as DeliveryMethod }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DELIVERY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.delivery === 'email' && (
              <div className="space-y-2">
                <Label>Empfänger (kommagetrennt)</Label>
                <Input
                  value={formData.recipients}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                  placeholder="email@beispiel.de, andere@beispiel.de"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Aktiv</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave}>
              {editingSchedule ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
