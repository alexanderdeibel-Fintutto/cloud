import { useState } from 'react';
import { useAccountStatements } from '@/hooks/useAccountStatements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Download,
  Printer,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const AccountStatements = () => {
  const { toast } = useToast();
  const {
    isLoading,
    getStatement,
    getAvailableAccounts,
    searchTransactions,
    exportStatement,
    getPrintableHTML,
  } = useAccountStatements();

  const [selectedAccount, setSelectedAccount] = useState('1200');
  const [fromDate, setFromDate] = useState(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');

  const accounts = getAvailableAccounts();
  const statement = getStatement(selectedAccount, fromDate, toDate);

  let displayTransactions = statement.transactions;
  if (searchQuery) {
    displayTransactions = searchTransactions(displayTransactions, searchQuery);
  }

  const handleExport = () => {
    exportStatement(statement);
    toast({
      title: 'Export erstellt',
      description: 'Der Kontoauszug wurde als CSV exportiert.',
    });
  };

  const handlePrint = () => {
    const html = getPrintableHTML(statement);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '-';
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
          <h1 className="text-3xl font-bold">Kontoauszüge</h1>
          <p className="text-muted-foreground">
            Kontoblätter mit allen Buchungen und Salden
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Account Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Kontoauswahl</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Konto</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.number} value={acc.number}>
                      {acc.number} - {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Von</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bis</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Suche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buchungstext..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Anfangssaldo</p>
            <p className="text-2xl font-bold">
              {formatCurrency(statement.openingBalance)} €
              <span className="text-sm font-normal ml-1">
                {statement.openingBalanceType === 'debit' ? 'S' : 'H'}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Soll-Umsätze</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(statement.totalDebit)} €
                </p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Haben-Umsätze</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(statement.totalCredit)} €
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Endsaldo</p>
            <p className={`text-2xl font-bold ${statement.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(statement.closingBalance)} €
              <span className="text-sm font-normal ml-1">
                {statement.closingBalanceType === 'debit' ? 'S' : 'H'}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Kontoblatt {statement.accountNumber}: {statement.accountName}
          </CardTitle>
          <CardDescription>
            Zeitraum: {format(new Date(statement.period.from), 'dd.MM.yyyy', { locale: de })} - {format(new Date(statement.period.to), 'dd.MM.yyyy', { locale: de })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Datum</TableHead>
                <TableHead className="w-24">Beleg-Nr.</TableHead>
                <TableHead className="w-32">Belegart</TableHead>
                <TableHead>Buchungstext</TableHead>
                <TableHead className="w-24">Gegenkonto</TableHead>
                <TableHead className="text-right w-28">Soll</TableHead>
                <TableHead className="text-right w-28">Haben</TableHead>
                <TableHead className="text-right w-28">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Opening Balance Row */}
              <TableRow className="bg-muted/50">
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="font-medium">Anfangssaldo</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  {statement.openingBalanceType === 'debit' ? formatCurrency(statement.openingBalance) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {statement.openingBalanceType === 'credit' ? formatCurrency(statement.openingBalance) : '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(statement.openingBalance)}
                </TableCell>
              </TableRow>

              {/* Transaction Rows */}
              {displayTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Keine Buchungen im ausgewählten Zeitraum
                  </TableCell>
                </TableRow>
              ) : (
                displayTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                    <TableCell className="font-mono text-sm">{tx.documentNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.documentType}</Badge>
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className="font-mono">
                      {tx.counterAccount}
                      {tx.counterAccountName && (
                        <span className="text-xs text-muted-foreground block">{tx.counterAccountName}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${tx.balance < 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(tx.balance)}
                    </TableCell>
                  </TableRow>
                ))
              )}

              {/* Totals Row */}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={5}>Summe / Endsaldo</TableCell>
                <TableCell className="text-right text-green-600">{formatCurrency(statement.totalDebit)}</TableCell>
                <TableCell className="text-right text-red-600">{formatCurrency(statement.totalCredit)}</TableCell>
                <TableCell className={`text-right ${statement.closingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(statement.closingBalance)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Account Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellauswahl</CardTitle>
          <CardDescription>Häufig verwendete Konten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {accounts.slice(0, 12).map((acc) => (
              <Button
                key={acc.number}
                variant={selectedAccount === acc.number ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAccount(acc.number)}
              >
                {acc.number}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountStatements;
