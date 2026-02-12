import { useState } from 'react';
import { useBalanceSheet, BALANCE_SHEET_STRUCTURE, BalanceSheetData, BalanceSheetRow } from '@/hooks/useBalanceSheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Scale, Download, Printer, Building2, Wallet, CreditCard, Landmark } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const BalanceSheet = () => {
  const { toast } = useToast();
  const { isLoading, structure, generateBalanceSheet, exportToCSV } = useBalanceSheet();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleGenerate = () => {
    const data = generateBalanceSheet(selectedDate);
    setBalanceSheet(data);
    toast({ title: 'Bilanz erstellt', description: `Bilanz zum ${format(new Date(selectedDate), 'dd.MM.yyyy', { locale: de })}` });
  };

  const handleExportCSV = () => {
    if (!balanceSheet) return;
    const csv = exportToCSV(balanceSheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bilanz_${selectedDate}.csv`;
    link.click();
    toast({ title: 'Export erstellt', description: 'Die Bilanz wurde als CSV exportiert.' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // Get structure items by side
  const assetsStructure = structure.filter(item => item.side === 'assets');
  const liabilitiesStructure = structure.filter(item => item.side === 'liabilities');

  // Calculate totals for display
  const eigenkapital = balanceSheet?.liabilities
    .filter(r => r.position.id.startsWith('P.A'))
    .filter(r => r.position.level === 0)
    .reduce((sum, r) => sum + r.currentYear, 0) || 0;

  const fremdkapital = balanceSheet?.liabilities
    .filter(r => !r.position.id.startsWith('P.A') && r.position.level === 0)
    .reduce((sum, r) => sum + r.currentYear, 0) || 0;

  const anlagevermoegen = balanceSheet?.assets
    .filter(r => r.position.id === 'A')
    .reduce((sum, r) => sum + r.currentYear, 0) || 0;

  const umlaufvermoegen = balanceSheet?.assets
    .filter(r => r.position.id === 'B')
    .reduce((sum, r) => sum + r.currentYear, 0) || 0;

  const renderSection = (rows: BalanceSheetRow[], sideStructure: typeof structure) => {
    const level0Items = sideStructure.filter(s => s.level === 0);

    return (
      <Accordion type="multiple" defaultValue={level0Items.map(i => i.id)}>
        {level0Items.map((section) => {
          const sectionRow = rows.find(r => r.position.id === section.id);
          const children = sideStructure.filter(s => s.parentId === section.id);

          return (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex justify-between w-full pr-4">
                  <span className="font-bold">{section.number}. {section.label}</span>
                  <span className="font-bold">{formatCurrency(sectionRow?.currentYear || 0)}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead className="text-right">Aktuell</TableHead>
                      <TableHead className="text-right">Vorjahr</TableHead>
                      <TableHead className="text-right">Veränderung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {children.map((item) => {
                      const itemRow = rows.find(r => r.position.id === item.id);
                      const subChildren = sideStructure.filter(s => s.parentId === item.id);

                      return (
                        <>
                          <TableRow key={item.id} className={item.isSubtotal ? 'font-medium bg-muted/50' : ''}>
                            <TableCell className="pl-4">
                              {item.number} {item.label}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(itemRow?.currentYear || 0)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(itemRow?.previousYear || 0)}
                            </TableCell>
                            <TableCell className={`text-right ${(itemRow?.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {itemRow?.changePercent ? `${itemRow.changePercent >= 0 ? '+' : ''}${itemRow.changePercent.toFixed(1)}%` : '-'}
                            </TableCell>
                          </TableRow>
                          {subChildren.map((subItem) => {
                            const subRow = rows.find(r => r.position.id === subItem.id);
                            return (
                              <TableRow key={subItem.id}>
                                <TableCell className="pl-8">
                                  {subItem.number} {subItem.label}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(subRow?.currentYear || 0)}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                  {formatCurrency(subRow?.previousYear || 0)}
                                </TableCell>
                                <TableCell className={`text-right ${(subRow?.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {subRow?.changePercent ? `${subRow.changePercent >= 0 ? '+' : ''}${subRow.changePercent.toFixed(1)}%` : '-'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bilanz</h1>
          <p className="text-muted-foreground">Vermögensübersicht nach HGB § 266</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Drucken</Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={!balanceSheet}><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      {/* Date Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stichtag</label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-[180px]" />
            </div>
            <Button onClick={handleGenerate}>Bilanz erstellen</Button>
          </div>
        </CardContent>
      </Card>

      {balanceSheet && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bilanzsumme Aktiva</p>
                    <p className="text-2xl font-bold">{formatCurrency(balanceSheet.totalAssets)}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bilanzsumme Passiva</p>
                    <p className="text-2xl font-bold">{formatCurrency(balanceSheet.totalLiabilities)}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Eigenkapital</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(eigenkapital)}</p>
                  </div>
                  <Landmark className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fremdkapital</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(fremdkapital)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balance Check */}
          {!balanceSheet.isBalanced && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950">
              <CardContent className="pt-6">
                <p className="text-red-600 font-medium">⚠️ Bilanz nicht ausgeglichen! Differenz: {formatCurrency(Math.abs(balanceSheet.totalAssets - balanceSheet.totalLiabilities))}</p>
              </CardContent>
            </Card>
          )}

          {/* Balance Sheet Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Aktiva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Aktiva (Vermögen)
                </CardTitle>
                <CardDescription>Mittelverwendung</CardDescription>
              </CardHeader>
              <CardContent>
                {renderSection(balanceSheet.assets, assetsStructure)}

                <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
                  <span>Summe Aktiva</span>
                  <span>{formatCurrency(balanceSheet.totalAssets)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Passiva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Passiva (Kapital)
                </CardTitle>
                <CardDescription>Mittelherkunft</CardDescription>
              </CardHeader>
              <CardContent>
                {renderSection(balanceSheet.liabilities, liabilitiesStructure)}

                <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
                  <span>Summe Passiva</span>
                  <span>{formatCurrency(balanceSheet.totalLiabilities)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Ratios */}
          <Card>
            <CardHeader>
              <CardTitle>Bilanzkennzahlen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Eigenkapitalquote</p>
                  <p className="text-xl font-bold">{balanceSheet.totalLiabilities > 0 ? ((eigenkapital / balanceSheet.totalLiabilities) * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Fremdkapitalquote</p>
                  <p className="text-xl font-bold">{balanceSheet.totalLiabilities > 0 ? ((fremdkapital / balanceSheet.totalLiabilities) * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Anlagenintensität</p>
                  <p className="text-xl font-bold">{balanceSheet.totalAssets > 0 ? ((anlagevermoegen / balanceSheet.totalAssets) * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Umlaufintensität</p>
                  <p className="text-xl font-bold">{balanceSheet.totalAssets > 0 ? ((umlaufvermoegen / balanceSheet.totalAssets) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!balanceSheet && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Wählen Sie einen Stichtag und erstellen Sie die Bilanz.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BalanceSheet;
