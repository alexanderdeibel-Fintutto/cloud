import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';

// Demo Konten für die Auswahl
const demoAccounts = [
  { number: '1200', name: 'Bank', type: 'asset' },
  { number: '1400', name: 'Forderungen aus Lieferungen und Leistungen', type: 'asset' },
  { number: '1600', name: 'Verbindlichkeiten aus Lieferungen und Leistungen', type: 'liability' },
  { number: '1800', name: 'Umsatzsteuer', type: 'liability' },
  { number: '1571', name: 'Vorsteuer 19%', type: 'asset' },
  { number: '4210', name: 'Miete', type: 'expense' },
  { number: '4920', name: 'Telefon', type: 'expense' },
  { number: '4930', name: 'Bürobedarf', type: 'expense' },
  { number: '4950', name: 'Rechts- und Beratungskosten', type: 'expense' },
  { number: '4964', name: 'IT-Kosten', type: 'expense' },
  { number: '8400', name: 'Erlöse 19% USt', type: 'revenue' },
  { number: '8300', name: 'Erlöse 7% USt', type: 'revenue' },
  { number: '8120', name: 'Steuerfreie Erlöse', type: 'revenue' },
];

interface BookingLine {
  id: string;
  accountNumber: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
}

export default function NewBookingPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [lines, setLines] = useState<BookingLine[]>([
    { id: '1', accountNumber: '', accountName: '', debitAmount: 0, creditAmount: 0 },
    { id: '2', accountNumber: '', accountName: '', debitAmount: 0, creditAmount: 0 },
  ]);
  const [searchAccount, setSearchAccount] = useState('');
  const [showAccountSearch, setShowAccountSearch] = useState<string | null>(null);

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        accountNumber: '',
        accountName: '',
        debitAmount: 0,
        creditAmount: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter((l) => l.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof BookingLine, value: string | number) => {
    setLines(
      lines.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      )
    );
  };

  const selectAccount = (lineId: string, account: typeof demoAccounts[0]) => {
    setLines(
      lines.map((l) =>
        l.id === lineId
          ? { ...l, accountNumber: account.number, accountName: account.name }
          : l
      )
    );
    setShowAccountSearch(null);
    setSearchAccount('');
  };

  const filteredAccounts = demoAccounts.filter(
    (a) =>
      a.number.includes(searchAccount) ||
      a.name.toLowerCase().includes(searchAccount.toLowerCase())
  );

  const totalDebit = lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API-Aufruf zur Buchungserstellung
    console.log('Buchung erstellen:', { date, description, receiptNumber, lines });
    navigate('/bookings');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/bookings">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neue Buchung</h1>
          <p className="text-gray-500 mt-1">Erstellen Sie eine neue Buchung im Journal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Buchungsdaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Buchungsdatum</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt">Belegnummer</Label>
                    <Input
                      id="receipt"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      placeholder="z.B. R-2026-00001"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Buchungstext</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="z.B. Miete Februar 2026"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Booking Lines */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Buchungszeilen</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="w-4 h-4 mr-2" />
                  Zeile hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 px-2">
                    <div className="col-span-5">Konto</div>
                    <div className="col-span-3 text-right">Soll</div>
                    <div className="col-span-3 text-right">Haben</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Lines */}
                  {lines.map((line) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5 relative">
                        <div
                          className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:border-primary-500"
                          onClick={() => setShowAccountSearch(line.id)}
                        >
                          {line.accountNumber ? (
                            <>
                              <span className="font-mono text-sm">{line.accountNumber}</span>
                              <span className="text-sm text-gray-600 truncate">
                                {line.accountName}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Konto auswählen...</span>
                          )}
                        </div>

                        {/* Account Search Dropdown */}
                        {showAccountSearch === line.id && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-auto">
                            <div className="p-2 border-b sticky top-0 bg-white">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                  placeholder="Suche nach Kontonr. oder Name..."
                                  value={searchAccount}
                                  onChange={(e) => setSearchAccount(e.target.value)}
                                  className="pl-10"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="p-2">
                              {filteredAccounts.map((account) => (
                                <div
                                  key={account.number}
                                  className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                                  onClick={() => selectAccount(line.id, account)}
                                >
                                  <span className="font-mono text-sm w-12">
                                    {account.number}
                                  </span>
                                  <span className="text-sm">{account.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={line.debitAmount || ''}
                          onChange={(e) =>
                            updateLine(line.id, 'debitAmount', parseFloat(e.target.value) || 0)
                          }
                          className="text-right"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={line.creditAmount || ''}
                          onChange={(e) =>
                            updateLine(line.id, 'creditAmount', parseFloat(e.target.value) || 0)
                          }
                          className="text-right"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(line.id)}
                          disabled={lines.length <= 2}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Summen */}
                  <div className="grid grid-cols-12 gap-2 pt-4 border-t">
                    <div className="col-span-5 text-sm font-medium text-gray-900">Summe</div>
                    <div className="col-span-3 text-right font-mono font-semibold">
                      {totalDebit.toFixed(2)} €
                    </div>
                    <div className="col-span-3 text-right font-mono font-semibold">
                      {totalCredit.toFixed(2)} €
                    </div>
                    <div className="col-span-1"></div>
                  </div>

                  {!isBalanced && totalDebit + totalCredit > 0 && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                      ⚠️ Soll und Haben sind nicht ausgeglichen! Differenz:{' '}
                      {Math.abs(totalDebit - totalCredit).toFixed(2)} €
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            <Card className="border-primary-200 bg-primary-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  KI-Assistent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Beschreiben Sie die Buchung in eigenen Worten und die KI erstellt automatisch
                  die korrekten Buchungszeilen.
                </p>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="z.B. 'Büromaterial bei Amazon für 89,90 € mit Kreditkarte gekauft'"
                />
                <Button variant="gradient" className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Buchung vorschlagen
                </Button>
              </CardContent>
            </Card>

            {/* Submit */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={!isBalanced || totalDebit === 0}
                >
                  Buchung speichern
                </Button>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link to="/bookings">Abbrechen</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Buchungshinweise</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Jede Buchung muss ausgeglichen sein (Soll = Haben)</p>
                <p>• Mindestens zwei Zeilen erforderlich</p>
                <p>• Verwenden Sie den SKR03-Kontenrahmen</p>
                <p>• Vorsteuer und USt werden automatisch erkannt</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
