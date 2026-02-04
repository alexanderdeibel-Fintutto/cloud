import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  Upload,
  Sparkles,
  Eye,
  MoreHorizontal,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileImage,
  FileText,
  Trash2,
} from 'lucide-react';

// Demo-Daten für Belege
const demoReceipts = [
  {
    id: '1',
    filename: 'amazon_büromaterial.pdf',
    uploadedAt: '2026-02-04T10:30:00',
    vendor: 'Amazon',
    date: '2026-02-02',
    amount: 89.9,
    taxRate: 19,
    category: 'Bürobedarf',
    status: 'processed',
    account: '4930',
    description: 'Büromaterial (Stifte, Papier, Ordner)',
  },
  {
    id: '2',
    filename: 'telekom_januar.pdf',
    uploadedAt: '2026-02-03T14:15:00',
    vendor: 'Telekom',
    date: '2026-02-01',
    amount: 45.0,
    taxRate: 19,
    category: 'Telefon',
    status: 'processed',
    account: '4920',
    description: 'Telefonkosten Januar 2026',
  },
  {
    id: '3',
    filename: 'hetzner_server.pdf',
    uploadedAt: '2026-02-02T09:00:00',
    vendor: 'Hetzner',
    date: '2026-01-31',
    amount: 29.9,
    taxRate: 19,
    category: 'IT-Kosten',
    status: 'processed',
    account: '4964',
    description: 'Cloud Server CX21 Januar',
  },
  {
    id: '4',
    filename: 'tank_quittung.jpg',
    uploadedAt: '2026-02-01T16:45:00',
    vendor: null,
    date: null,
    amount: null,
    taxRate: null,
    category: null,
    status: 'pending',
    account: null,
    description: null,
  },
  {
    id: '5',
    filename: 'restaurant_bewirtung.pdf',
    uploadedAt: '2026-02-01T12:00:00',
    vendor: null,
    date: null,
    amount: null,
    taxRate: null,
    category: null,
    status: 'pending',
    account: null,
    description: null,
  },
  {
    id: '6',
    filename: 'ikea_möbel.pdf',
    uploadedAt: '2026-01-30T11:30:00',
    vendor: 'IKEA',
    date: '2026-01-28',
    amount: 459.0,
    taxRate: 19,
    category: 'Betriebs- und Geschäftsausstattung',
    status: 'review',
    account: '0420',
    description: 'Büromöbel (Schreibtisch, Stuhl)',
  },
  {
    id: '7',
    filename: 'versicherung_2026.pdf',
    uploadedAt: '2026-01-28T10:00:00',
    vendor: 'Allianz',
    date: '2026-01-25',
    amount: 350.0,
    taxRate: 0,
    category: 'Versicherungen',
    status: 'processed',
    account: '4360',
    description: 'Betriebshaftpflicht Jahresbeitrag',
  },
  {
    id: '8',
    filename: 'steuerberater_q4.pdf',
    uploadedAt: '2026-01-26T15:20:00',
    vendor: 'Kanzlei Müller',
    date: '2026-01-25',
    amount: 890.0,
    taxRate: 19,
    category: 'Beratungskosten',
    status: 'processed',
    account: '4950',
    description: 'Steuerberatung Q4/2025',
  },
];

const statusConfig = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Wird verarbeitet', color: 'bg-blue-100 text-blue-800', icon: Sparkles },
  review: { label: 'Prüfen', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  processed: { label: 'Verarbeitet', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
};

export default function ReceiptsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredReceipts = demoReceipts.filter((receipt) => {
    const matchesSearch =
      receipt.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistiken
  const stats = {
    total: demoReceipts.length,
    pending: demoReceipts.filter((r) => r.status === 'pending').length,
    review: demoReceipts.filter((r) => r.status === 'review').length,
    processed: demoReceipts.filter((r) => r.status === 'processed').length,
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFiles = (files: FileList) => {
    console.log('Uploading files:', files);
    // TODO: Dateien hochladen
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Belege</h1>
          <p className="text-gray-500 mt-1">
            Laden Sie Belege hoch – die KI erkennt und verbucht automatisch
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Belege hochladen
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors',
          isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belege hier ablegen oder klicken zum Hochladen
            </h3>
            <p className="text-gray-500 mb-4">
              Unterstützte Formate: PDF, JPG, PNG (max. 10MB pro Datei)
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileImage className="w-4 h-4 mr-2" />
                Dateien auswählen
              </Button>
              <span className="text-gray-400">oder</span>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Per E-Mail senden
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              E-Mail: <span className="font-mono">belege@firma.fintutto.cloud</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Belege gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary-100">
                <Receipt className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ausstehend</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Zu prüfen</p>
                <p className="text-2xl font-bold text-orange-600">{stats.review}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Verarbeitet</p>
                <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Receipts - Quick Actions */}
      {stats.pending > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              {stats.pending} Belege warten auf KI-Verarbeitung
            </CardTitle>
            <Button variant="gradient" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Alle verarbeiten
            </Button>
          </CardHeader>
        </Card>
      )}

      {/* Filter & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Suchen nach Dateiname, Lieferant, Beschreibung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Alle' },
                { value: 'pending', label: 'Ausstehend' },
                { value: 'review', label: 'Zu prüfen' },
                { value: 'processed', label: 'Verarbeitet' },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={statusFilter === status.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReceipts.map((receipt) => {
          const status = statusConfig[receipt.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <Card key={receipt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {receipt.filename.endsWith('.pdf') ? (
                        <FileText className="w-5 h-5 text-red-500" />
                      ) : (
                        <FileImage className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm truncate max-w-[180px]">
                        {receipt.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(receipt.uploadedAt).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      status.color
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                {receipt.status === 'processed' || receipt.status === 'review' ? (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Lieferant</span>
                      <span className="font-medium">{receipt.vendor}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Datum</span>
                      <span>{receipt.date && formatDate(receipt.date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Betrag</span>
                      <span className="font-semibold">
                        {receipt.amount && formatCurrency(receipt.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Konto</span>
                      <span className="font-mono">{receipt.account}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      Beleg noch nicht verarbeitet
                    </p>
                    <Button variant="gradient" size="sm" className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      KI-Erkennung starten
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Ansehen
                  </Button>
                  {receipt.status === 'review' && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Bestätigen
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReceipts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Keine Belege gefunden</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
