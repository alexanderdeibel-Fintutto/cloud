import { useState } from 'react';
import {
  useVATHelper,
  VATReportingPeriod,
  VAT_FIELD_LABELS
} from '@/hooks/useVATHelper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Calculator,
  Send,
  Calendar,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Euro,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

const VATHelper = () => {
  const { toast } = useToast();
  const {
    returns,
    settings,
    isLoading,
    updateSettings,
    calculateReturn,
    saveReturn,
    submitReturn,
    getUpcomingDeadlines,
    generateElsterXML,
    getSummary,
  } = useVATHelper();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const upcomingDeadlines = getUpcomingDeadlines();
  const yearSummary = getSummary(selectedYear);
  const currentPeriodReturn = calculateReturn(selectedYear, selectedMonth);

  const handleCalculate = () => {
    const vatReturn = calculateReturn(selectedYear, selectedMonth);
    saveReturn(vatReturn);
    toast({
      title: 'USt-Voranmeldung berechnet',
      description: `Periode ${vatReturn.period} wurde berechnet.`,
    });
  };

  const handleSubmit = (returnId: string) => {
    const result = submitReturn(returnId);
    if (result.success) {
      toast({
        title: 'Erfolgreich übermittelt',
        description: `ELSTER-Ticket: ${result.ticket}`,
      });
    } else {
      toast({
        title: 'Fehler bei der Übermittlung',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadXML = (returnId: string) => {
    const xml = generateElsterXML(returnId);
    if (xml) {
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ustva_${returnId}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="outline">Entwurf</Badge>;
      case 'calculated': return <Badge variant="secondary">Berechnet</Badge>;
      case 'submitted': return <Badge className="bg-blue-500">Übermittelt</Badge>;
      case 'accepted': return <Badge className="bg-green-500">Akzeptiert</Badge>;
      case 'rejected': return <Badge variant="destructive">Abgelehnt</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">USt-Voranmeldung</h1>
          <p className="text-muted-foreground">
            Umsatzsteuer-Voranmeldung berechnen und an ELSTER übermitteln
          </p>
        </div>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>USt-Einstellungen</DialogTitle>
              <DialogDescription>
                Konfigurieren Sie Ihre Umsatzsteuer-Einstellungen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Abgabezeitraum</Label>
                <Select
                  value={settings.reportingPeriod}
                  onValueChange={(v) => updateSettings({ reportingPeriod: v as VATReportingPeriod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Steuernummer</Label>
                <Input
                  value={settings.taxNumber}
                  onChange={(e) => updateSettings({ taxNumber: e.target.value })}
                  placeholder="z.B. 123/456/78901"
                />
              </div>

              <div className="space-y-2">
                <Label>USt-IdNr.</Label>
                <Input
                  value={settings.vatId}
                  onChange={(e) => updateSettings({ vatId: e.target.value })}
                  placeholder="z.B. DE123456789"
                />
              </div>

              <div className="space-y-2">
                <Label>Finanzamt</Label>
                <Input
                  value={settings.finanzamt}
                  onChange={(e) => updateSettings({ finanzamt: e.target.value })}
                  placeholder="z.B. Berlin-Mitte"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dauerfristverlängerung</Label>
                  <p className="text-sm text-muted-foreground">
                    Frist um einen Monat verlängern
                  </p>
                </div>
                <Switch
                  checked={settings.dauerfristverlaengerung}
                  onCheckedChange={(c) => updateSettings({ dauerfristverlaengerung: c })}
                />
              </div>

              {settings.dauerfristverlaengerung && (
                <div className="space-y-2">
                  <Label>Sondervorauszahlung (1/11)</Label>
                  <Input
                    type="number"
                    value={settings.sondervorauszahlung}
                    onChange={(e) => updateSettings({ sondervorauszahlung: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Anstehende Fristen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingDeadlines.map((d) => (
              <Card key={d.period} className={d.daysRemaining < 0 ? 'border-red-500' : d.daysRemaining < 7 ? 'border-yellow-500' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{d.period}</span>
                    {d.vatReturn ? (
                      getStatusBadge(d.vatReturn.status)
                    ) : (
                      <Badge variant="outline">Offen</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {d.daysRemaining < 0 ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-500">
                          {Math.abs(d.daysRemaining)} Tage überfällig
                        </span>
                      </>
                    ) : d.daysRemaining === 0 ? (
                      <>
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-500">Heute fällig</span>
                      </>
                    ) : d.daysRemaining < 7 ? (
                      <>
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-500">
                          {d.daysRemaining} Tage verbleibend
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Frist: {format(d.deadline, 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="berechnung">
        <TabsList>
          <TabsTrigger value="berechnung">Berechnung</TabsTrigger>
          <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
          <TabsTrigger value="verlauf">Verlauf</TabsTrigger>
        </TabsList>

        {/* Calculation Tab */}
        <TabsContent value="berechnung" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Periode auswählen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="space-y-2">
                  <Label>Jahr</Label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(v) => setSelectedYear(parseInt(v))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monat</Label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(v) => setSelectedMonth(parseInt(v))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {format(new Date(2024, m - 1, 1), 'MMMM', { locale: de })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCalculate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Berechnen
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Output VAT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Umsatzsteuer (Ausgangsumsätze)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">KZ 81: {VAT_FIELD_LABELS.kz81}</p>
                    <p className="text-sm text-muted-foreground">Steuersatz: 19%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(currentPeriodReturn.kz81)}</p>
                    <p className="text-sm text-muted-foreground">
                      USt: {formatCurrency(currentPeriodReturn.steuer81)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">KZ 86: {VAT_FIELD_LABELS.kz86}</p>
                    <p className="text-sm text-muted-foreground">Steuersatz: 7%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(currentPeriodReturn.kz86)}</p>
                    <p className="text-sm text-muted-foreground">
                      USt: {formatCurrency(currentPeriodReturn.steuer86)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">KZ 35: {VAT_FIELD_LABELS.kz35}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(currentPeriodReturn.kz35)}</p>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium">KZ 77: {VAT_FIELD_LABELS.kz77}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(currentPeriodReturn.kz77)}</p>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Gesamt-Umsatzsteuer</span>
                  <span className="text-green-600">{formatCurrency(currentPeriodReturn.umsatzsteuer)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Input VAT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-blue-500" />
                  Vorsteuer (Abzugsfähig)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">KZ 66: {VAT_FIELD_LABELS.kz66}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(currentPeriodReturn.kz66)}</p>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">KZ 67: {VAT_FIELD_LABELS.kz67}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(currentPeriodReturn.kz67)}</p>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium">KZ 63: {VAT_FIELD_LABELS.kz63}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(currentPeriodReturn.kz63)}</p>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Gesamt-Vorsteuer</span>
                  <span className="text-blue-600">{formatCurrency(currentPeriodReturn.vorsteuer)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Result */}
          <Card className={currentPeriodReturn.zahllast >= 0 ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : 'border-green-200 bg-green-50 dark:bg-green-950/20'}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Euro className="h-8 w-8" />
                  <div>
                    <p className="text-lg font-medium">
                      {currentPeriodReturn.zahllast >= 0 ? 'Zahllast' : 'Erstattung'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      (Umsatzsteuer - Vorsteuer)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${currentPeriodReturn.zahllast >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(currentPeriodReturn.zahllast))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="uebersicht" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jahresübersicht {selectedYear}</CardTitle>
              <CardDescription>
                Monatliche Aufschlüsselung der Umsatzsteuer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Monat</TableHead>
                    <TableHead className="text-right">Umsatzsteuer</TableHead>
                    <TableHead className="text-right">Vorsteuer</TableHead>
                    <TableHead className="text-right">Zahllast / Erstattung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearSummary.byMonth.map((m) => (
                    <TableRow key={m.month}>
                      <TableCell>
                        {format(new Date(selectedYear, m.month - 1, 1), 'MMMM', { locale: de })}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(m.output)}
                      </TableCell>
                      <TableCell className="text-right text-blue-600">
                        {formatCurrency(m.input)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${m.payable >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(m.payable)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Gesamt</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(yearSummary.totalOutput)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      {formatCurrency(yearSummary.totalInput)}
                    </TableCell>
                    <TableCell className={`text-right ${yearSummary.totalPayable >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(yearSummary.totalPayable)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="verlauf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abgegebene Voranmeldungen</CardTitle>
            </CardHeader>
            <CardContent>
              {returns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Voranmeldungen berechnet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Zahllast</TableHead>
                      <TableHead>ELSTER-Ticket</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returns
                      .sort((a, b) => b.period.localeCompare(a.period))
                      .map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.period}</TableCell>
                          <TableCell>{getStatusBadge(r.status)}</TableCell>
                          <TableCell className={`text-right ${r.zahllast >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(r.zahllast)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {r.elsterTicket || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadXML(r.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {r.status === 'calculated' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmit(r.id)}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Senden
                                </Button>
                              )}
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
      </Tabs>
    </div>
  );
};

export default VATHelper;
