import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calculator, ArrowRight, Copy, Percent, Euro, History, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalculationHistory {
  id: string;
  type: 'netto-to-brutto' | 'brutto-to-netto';
  input: number;
  rate: number;
  netto: number;
  mwst: number;
  brutto: number;
  timestamp: Date;
}

const VAT_RATES = [
  { value: 19, label: '19% (Regelsteuersatz)', description: 'Standard für die meisten Waren und Dienstleistungen' },
  { value: 7, label: '7% (Ermäßigt)', description: 'Lebensmittel, Bücher, Zeitungen, ÖPNV' },
  { value: 0, label: '0% (Steuerfrei)', description: 'Innergemeinschaftliche Lieferungen, Exporte' },
];

const STORAGE_KEY = 'fintutto_mwst_history';

const VATCalculator = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'netto-to-brutto' | 'brutto-to-netto'>('netto-to-brutto');
  const [inputValue, setInputValue] = useState<string>('');
  const [vatRate, setVatRate] = useState<number>(19);
  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const parseGermanNumber = (value: string): number => {
    // Handle German number format (1.234,56) and standard format (1234.56)
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.includes(',')) {
      return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
    }
    return parseFloat(cleaned) || 0;
  };

  const calculation = useMemo(() => {
    const input = parseGermanNumber(inputValue);
    if (input <= 0) return null;

    let netto: number;
    let brutto: number;
    let mwst: number;

    if (mode === 'netto-to-brutto') {
      netto = input;
      mwst = netto * (vatRate / 100);
      brutto = netto + mwst;
    } else {
      brutto = input;
      netto = brutto / (1 + vatRate / 100);
      mwst = brutto - netto;
    }

    return {
      netto: Math.round(netto * 100) / 100,
      mwst: Math.round(mwst * 100) / 100,
      brutto: Math.round(brutto * 100) / 100,
    };
  }, [inputValue, vatRate, mode]);

  const handleSaveToHistory = () => {
    if (!calculation) return;

    const entry: CalculationHistory = {
      id: crypto.randomUUID(),
      type: mode,
      input: parseGermanNumber(inputValue),
      rate: vatRate,
      ...calculation,
      timestamp: new Date(),
    };

    const newHistory = [entry, ...history].slice(0, 50); // Keep last 50 entries
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

    toast({ title: 'Gespeichert', description: 'Berechnung wurde zum Verlauf hinzugefügt.' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: 'Verlauf gelöscht', description: 'Alle Berechnungen wurden entfernt.' });
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: 'Kopiert', description: 'Wert wurde in die Zwischenablage kopiert.' });
  };

  const handleQuickAmount = (amount: number) => {
    setInputValue(amount.toString());
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            MwSt-Rechner
          </h1>
          <p className="text-muted-foreground">Schnelle Mehrwertsteuer-Berechnung für Deutschland</p>
        </div>
        <Badge variant="secondary" className="text-sm">Kostenlos</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calculator */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Berechnung</CardTitle>
            <CardDescription>Wählen Sie die Berechnungsrichtung und geben Sie den Betrag ein</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="grid grid-cols-2 gap-4">
              <Label
                htmlFor="netto-to-brutto"
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${mode === 'netto-to-brutto' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
              >
                <RadioGroupItem value="netto-to-brutto" id="netto-to-brutto" className="sr-only" />
                <span className="text-lg font-medium">Netto → Brutto</span>
                <span className="text-sm text-muted-foreground">MwSt aufschlagen</span>
              </Label>
              <Label
                htmlFor="brutto-to-netto"
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${mode === 'brutto-to-netto' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
              >
                <RadioGroupItem value="brutto-to-netto" id="brutto-to-netto" className="sr-only" />
                <span className="text-lg font-medium">Brutto → Netto</span>
                <span className="text-sm text-muted-foreground">MwSt herausrechnen</span>
              </Label>
            </RadioGroup>

            {/* VAT Rate Selection */}
            <div className="space-y-2">
              <Label>Steuersatz</Label>
              <Select value={vatRate.toString()} onValueChange={(v) => setVatRate(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VAT_RATES.map((rate) => (
                    <SelectItem key={rate.value} value={rate.value.toString()}>
                      <div className="flex flex-col">
                        <span>{rate.label}</span>
                        <span className="text-xs text-muted-foreground">{rate.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <Label>{mode === 'netto-to-brutto' ? 'Nettobetrag' : 'Bruttobetrag'}</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="0,00"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-10 text-lg"
                />
              </div>
              {/* Quick Amounts */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[100, 500, 1000, 5000, 10000].map((amount) => (
                  <Button key={amount} variant="outline" size="sm" onClick={() => handleQuickAmount(amount)}>
                    {amount.toLocaleString('de-DE')} €
                  </Button>
                ))}
              </div>
            </div>

            {/* Results */}
            {calculation && (
              <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className={`p-3 rounded-lg ${mode === 'netto-to-brutto' ? 'bg-background border-2 border-primary' : 'bg-background'}`}>
                    <p className="text-sm text-muted-foreground">Netto</p>
                    <p className="text-xl font-bold">{formatCurrency(calculation.netto)}</p>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(calculation.netto.toFixed(2))}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-background rounded-lg flex flex-col items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground mb-1" />
                    <Badge variant="secondary">{vatRate}% MwSt</Badge>
                    <p className="text-lg font-medium text-primary mt-1">{formatCurrency(calculation.mwst)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${mode === 'brutto-to-netto' ? 'bg-background border-2 border-primary' : 'bg-background'}`}>
                    <p className="text-sm text-muted-foreground">Brutto</p>
                    <p className="text-xl font-bold">{formatCurrency(calculation.brutto)}</p>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(calculation.brutto.toFixed(2))}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSaveToHistory} className="w-full">
                  <History className="h-4 w-4 mr-2" />
                  Zum Verlauf hinzufügen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Steuersätze
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">19% Regelsteuersatz</p>
                <p className="text-sm text-muted-foreground">Gilt für die meisten Waren und Dienstleistungen</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">7% Ermäßigter Satz</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>Lebensmittel (außer Getränke)</li>
                  <li>Bücher, Zeitungen, Zeitschriften</li>
                  <li>Öffentlicher Nahverkehr</li>
                  <li>Hotelübernachtungen</li>
                  <li>Kulturelle Veranstaltungen</li>
                </ul>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">0% Steuerbefreit</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>Innergemeinschaftliche Lieferungen</li>
                  <li>Ausfuhrlieferungen (Export)</li>
                  <li>Bestimmte Finanzdienstleistungen</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formeln</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-2 bg-muted rounded font-mono">
                Brutto = Netto × (1 + Satz)
              </div>
              <div className="p-2 bg-muted rounded font-mono">
                Netto = Brutto ÷ (1 + Satz)
              </div>
              <div className="p-2 bg-muted rounded font-mono">
                MwSt = Brutto - Netto
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Berechnungsverlauf
              </CardTitle>
              <CardDescription>{history.length} Berechnungen gespeichert</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Verlauf löschen
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Steuersatz</TableHead>
                  <TableHead className="text-right">Netto</TableHead>
                  <TableHead className="text-right">MwSt</TableHead>
                  <TableHead className="text-right">Brutto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.slice(0, 10).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entry.type === 'netto-to-brutto' ? 'N → B' : 'B → N'}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.rate}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.netto)}</TableCell>
                    <TableCell className="text-right text-primary">{formatCurrency(entry.mwst)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(entry.brutto)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VATCalculator;
