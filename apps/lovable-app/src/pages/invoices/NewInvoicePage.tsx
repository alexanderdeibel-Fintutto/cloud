import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Search,
  Plus,
  Trash2,
  Eye,
  Send,
  Save,
  User,
} from 'lucide-react';

// Demo Kunden
const demoCustomers = [
  { id: '1', name: 'TechStart GmbH', email: 'accounting@techstart.de', address: 'Hauptstraße 1, 10115 Berlin' },
  { id: '2', name: 'Digital Solutions AG', email: 'finance@digitalsolutions.de', address: 'Industriepark 5, 80331 München' },
  { id: '3', name: 'Müller & Partner', email: 'buchhaltung@mueller-partner.de', address: 'Kaiserstraße 42, 60311 Frankfurt' },
  { id: '4', name: 'Innovation Labs KG', email: 'office@innovationlabs.de', address: 'Technologieweg 8, 70173 Stuttgart' },
  { id: '5', name: 'Green Energy GmbH', email: 'finanzen@greenenergy.de', address: 'Windpark Allee 12, 20095 Hamburg' },
];

interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
}

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<typeof demoCustomers[0] | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [invoiceNumber, setInvoiceNumber] = useState('R-2026-00013');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<InvoiceLine[]>([
    { id: '1', description: '', quantity: 1, unit: 'Stück', unitPrice: 0, taxRate: 19 },
  ]);

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unit: 'Stück',
        unitPrice: 0,
        taxRate: 19,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter((l) => l.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof InvoiceLine, value: string | number) => {
    setLines(
      lines.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      )
    );
  };

  const filteredCustomers = demoCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Berechnungen
  const netTotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const taxGroups = lines.reduce((groups, l) => {
    const key = l.taxRate;
    const amount = l.quantity * l.unitPrice * (l.taxRate / 100);
    groups[key] = (groups[key] || 0) + amount;
    return groups;
  }, {} as Record<number, number>);
  const taxTotal = Object.values(taxGroups).reduce((sum, t) => sum + t, 0);
  const grossTotal = netTotal + taxTotal;

  const handleSubmit = (action: 'draft' | 'send') => {
    console.log('Rechnung erstellen:', {
      action,
      customer: selectedCustomer,
      invoiceNumber,
      invoiceDate,
      dueDate,
      lines,
      notes,
    });
    navigate('/invoices');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/invoices">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neue Rechnung</h1>
          <p className="text-gray-500 mt-1">Erstellen Sie eine neue Ausgangsrechnung</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kunde</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="flex items-start justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedCustomer.address}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerSearch(true);
                    }}
                  >
                    Ändern
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50/50"
                    onClick={() => setShowCustomerSearch(true)}
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500">Kunden auswählen...</span>
                  </div>

                  {showCustomerSearch && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-80 overflow-auto">
                      <div className="p-3 border-b sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Kunde suchen..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="pl-10"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="p-2">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowCustomerSearch(false);
                              setCustomerSearch('');
                            }}
                          >
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          </div>
                        ))}
                        <div
                          className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-primary-50 text-primary-600"
                          onClick={() => {
                            // TODO: Neuen Kunden anlegen
                          }}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Neuen Kunden anlegen</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rechnungsdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Rechnungsnummer</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Rechnungsdatum</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Lines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Positionen</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="w-4 h-4 mr-2" />
                Position hinzufügen
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lines.map((line, index) => (
                  <div key={line.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Position {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(line.id)}
                        disabled={lines.length <= 1}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Beschreibung</Label>
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                        placeholder="z.B. Webdesign Startseite"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Menge</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Einheit</Label>
                        <Input
                          value={line.unit}
                          onChange={(e) => updateLine(line.id, 'unit', e.target.value)}
                          placeholder="Stück"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Einzelpreis (netto)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>USt %</Label>
                        <select
                          className="w-full h-10 px-3 border rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                          value={line.taxRate}
                          onChange={(e) =>
                            updateLine(line.id, 'taxRate', parseInt(e.target.value))
                          }
                        >
                          <option value={19}>19%</option>
                          <option value={7}>7%</option>
                          <option value={0}>0%</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <span className="text-gray-500">Summe: </span>
                      <span className="font-semibold">
                        {formatCurrency(line.quantity * line.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Anmerkungen</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Zusätzliche Hinweise für den Kunden (optional)..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zusammenfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Zwischensumme (netto)</span>
                  <span className="font-medium">{formatCurrency(netTotal)}</span>
                </div>
                {Object.entries(taxGroups).map(([rate, amount]) => (
                  <div key={rate} className="flex justify-between text-sm">
                    <span className="text-gray-500">USt {rate}%</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t flex justify-between">
                  <span className="font-semibold">Gesamtbetrag</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(grossTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button
                variant="gradient"
                className="w-full"
                onClick={() => handleSubmit('send')}
                disabled={!selectedCustomer || lines.every((l) => !l.description)}
              >
                <Send className="w-4 h-4 mr-2" />
                Senden & Buchen
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubmit('draft')}
              >
                <Save className="w-4 h-4 mr-2" />
                Als Entwurf speichern
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                PDF Vorschau
              </Button>
            </CardContent>
          </Card>

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
                Beschreiben Sie die Leistung und die KI füllt die Rechnung automatisch aus.
              </p>
              <textarea
                className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="z.B. 'Webdesign für TechStart, 40 Stunden à 95€'"
              />
              <Button variant="gradient" className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Rechnung ausfüllen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
