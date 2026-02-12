import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMultiCurrency, CurrencyCode, CURRENCIES } from '@/hooks/useMultiCurrency';
import { RefreshCw, Settings, TrendingUp, TrendingDown, ArrowRightLeft, Calculator, History } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MultiCurrency() {
  const {
    settings,
    updateSettings,
    exchangeRates,
    transactions,
    getExchangeRate,
    convertAmount,
    updateExchangeRates,
    setManualRate,
    formatCurrency,
    getHistoricalRates,
    currencies,
    stats,
  } = useMultiCurrency();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [converterOpen, setConverterOpen] = useState(false);
  const [manualRateOpen, setManualRateOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Converter state
  const [fromAmount, setFromAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('EUR');

  // Manual rate state
  const [manualFrom, setManualFrom] = useState<CurrencyCode>('USD');
  const [manualTo, setManualTo] = useState<CurrencyCode>('EUR');
  const [manualRateValue, setManualRateValue] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  const handleUpdateRates = async () => {
    setIsUpdating(true);
    try {
      await updateExchangeRates();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetManualRate = () => {
    if (manualRateValue && parseFloat(manualRateValue) > 0) {
      setManualRate(manualFrom, manualTo, parseFloat(manualRateValue), manualDate);
      setManualRateOpen(false);
      setManualRateValue('');
    }
  };

  // Get current rates for display
  const currentRates = currencies
    .filter(c => c.code !== settings.baseCurrency)
    .map(currency => {
      const rate = getExchangeRate(currency.code, settings.baseCurrency);
      const prevRate = exchangeRates.find(r =>
        r.fromCurrency === currency.code &&
        r.toCurrency === settings.baseCurrency
      );
      return {
        ...currency,
        rate,
        change: prevRate ? ((rate - prevRate.rate) / prevRate.rate) * 100 : 0,
      };
    });

  // Chart data for selected currency
  const chartData = selectedCurrency
    ? getHistoricalRates(selectedCurrency, 30).map(r => ({
        date: format(new Date(r.date), 'dd.MM', { locale: de }),
        rate: r.rate,
      })).reverse()
    : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Währungen</h1>
          <p className="text-muted-foreground">Multi-Currency Management und Wechselkurse</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setConverterOpen(true)}>
            <Calculator className="mr-2 h-4 w-4" />
            Umrechner
          </Button>
          <Button variant="outline" onClick={handleUpdateRates} disabled={isUpdating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            Kurse aktualisieren
          </Button>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Basiswährung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.baseCurrency}</div>
            <p className="text-xs text-muted-foreground">
              {currencies.find(c => c.code === settings.baseCurrency)?.name}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verwendete Währungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currenciesUsed.length}</div>
            <p className="text-xs text-muted-foreground">In Transaktionen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kursgewinne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalExchangeGains, settings.baseCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kursverluste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalExchangeLosses, settings.baseCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rates">
        <TabsList>
          <TabsTrigger value="rates">Wechselkurse</TabsTrigger>
          <TabsTrigger value="transactions">Transaktionen</TabsTrigger>
          <TabsTrigger value="history">Kursverlauf</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Aktuelle Wechselkurse</CardTitle>
                <CardDescription>
                  {settings.lastRateUpdate
                    ? `Letzte Aktualisierung: ${format(new Date(settings.lastRateUpdate), 'dd.MM.yyyy HH:mm', { locale: de })}`
                    : 'Noch nicht aktualisiert'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setManualRateOpen(true)}>
                Manueller Kurs
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Währung</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Kurs zu {settings.baseCurrency}</TableHead>
                    <TableHead className="text-right">Änderung</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRates.map((currency) => (
                    <TableRow key={currency.code}>
                      <TableCell className="font-medium">
                        {currency.symbol} {currency.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{currency.code}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {currency.rate.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 ${
                          currency.change > 0 ? 'text-green-600' : currency.change < 0 ? 'text-red-600' : ''
                        }`}>
                          {currency.change > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : currency.change < 0 ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : null}
                          {currency.change.toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCurrency(currency.code)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Währungstransaktionen</CardTitle>
              <CardDescription>Buchungen mit Fremdwährungen</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Währungstransaktionen vorhanden
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead className="text-right">Originalbetrag</TableHead>
                      <TableHead className="text-right">Umgerechnet</TableHead>
                      <TableHead className="text-right">Kurs</TableHead>
                      <TableHead className="text-right">Differenz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 20).map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {format(new Date(tx.date), 'dd.MM.yyyy', { locale: de })}
                        </TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(tx.originalAmount, tx.originalCurrency)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(tx.convertedAmount, tx.baseCurrency)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {tx.exchangeRate.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right">
                          {tx.exchangeDifference ? (
                            <span className={tx.exchangeDifference > 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(tx.exchangeDifference, tx.baseCurrency)}
                            </span>
                          ) : (
                            '-'
                          )}
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
              <CardTitle>Kursverlauf</CardTitle>
              <CardDescription>
                {selectedCurrency
                  ? `${selectedCurrency} zu ${settings.baseCurrency}`
                  : 'Wählen Sie eine Währung aus'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select
                  value={selectedCurrency || ''}
                  onValueChange={(v) => setSelectedCurrency(v as CurrencyCode)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Währung wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies
                      .filter(c => c.code !== settings.baseCurrency)
                      .map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCurrency && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  Wählen Sie eine Währung, um den Kursverlauf zu sehen
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Converter Dialog */}
      <Dialog open={converterOpen} onOpenChange={setConverterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Währungsumrechner</DialogTitle>
            <DialogDescription>Berechnen Sie Wechselkurse in Echtzeit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Betrag</Label>
                <Input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Von</Label>
                <Select value={fromCurrency} onValueChange={(v) => setFromCurrency(v as CurrencyCode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-center">
              <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ergebnis</Label>
                <div className="p-3 bg-muted rounded-md font-mono text-lg">
                  {convertAmount(parseFloat(fromAmount) || 0, fromCurrency, toCurrency).toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nach</Label>
                <Select value={toCurrency} onValueChange={(v) => setToCurrency(v as CurrencyCode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Kurs: 1 {fromCurrency} = {getExchangeRate(fromCurrency, toCurrency).toFixed(4)} {toCurrency}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Rate Dialog */}
      <Dialog open={manualRateOpen} onOpenChange={setManualRateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manueller Wechselkurs</DialogTitle>
            <DialogDescription>Tragen Sie einen eigenen Wechselkurs ein</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Von</Label>
                <Select value={manualFrom} onValueChange={(v) => setManualFrom(v as CurrencyCode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nach</Label>
                <Select value={manualTo} onValueChange={(v) => setManualTo(v as CurrencyCode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Wechselkurs</Label>
              <Input
                type="number"
                step="0.0001"
                placeholder="z.B. 1.0856"
                value={manualRateValue}
                onChange={(e) => setManualRateValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Datum</Label>
              <Input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualRateOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSetManualRate}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Währungseinstellungen</SheetTitle>
            <SheetDescription>Konfigurieren Sie die Währungsverwaltung</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label>Basiswährung</Label>
              <Select
                value={settings.baseCurrency}
                onValueChange={(v) => updateSettings({ baseCurrency: v as CurrencyCode })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Automatische Kursaktualisierung</Label>
                <p className="text-sm text-muted-foreground">Kurse automatisch abrufen</p>
              </div>
              <Switch
                checked={settings.autoUpdateRates}
                onCheckedChange={(checked) => updateSettings({ autoUpdateRates: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Aktualisierungsfrequenz</Label>
              <Select
                value={settings.updateFrequency}
                onValueChange={(v) => updateSettings({ updateFrequency: v as 'daily' | 'weekly' | 'manual' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="manual">Manuell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rundungsmodus</Label>
              <Select
                value={settings.roundingMode}
                onValueChange={(v) => updateSettings({ roundingMode: v as 'standard' | 'commercial' | 'banking' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="commercial">Kaufmännisch</SelectItem>
                  <SelectItem value="banking">Banker's Rounding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dezimalstellen</Label>
              <Select
                value={settings.decimalPlaces.toString()}
                onValueChange={(v) => updateSettings({ decimalPlaces: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Stellen</SelectItem>
                  <SelectItem value="3">3 Stellen</SelectItem>
                  <SelectItem value="4">4 Stellen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
