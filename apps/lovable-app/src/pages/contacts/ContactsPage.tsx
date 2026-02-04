import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  Download,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  Users,
  Briefcase,
  FileText,
} from 'lucide-react';

// Demo-Daten für Kontakte
const demoContacts = [
  {
    id: '1',
    type: 'company',
    name: 'TechStart GmbH',
    email: 'accounting@techstart.de',
    phone: '+49 30 12345678',
    address: 'Hauptstraße 1, 10115 Berlin',
    taxId: 'DE123456789',
    category: 'customer',
    invoiceCount: 5,
    totalRevenue: 15000,
  },
  {
    id: '2',
    type: 'company',
    name: 'Digital Solutions AG',
    email: 'finance@digitalsolutions.de',
    phone: '+49 89 87654321',
    address: 'Industriepark 5, 80331 München',
    taxId: 'DE987654321',
    category: 'customer',
    invoiceCount: 3,
    totalRevenue: 8500,
  },
  {
    id: '3',
    type: 'company',
    name: 'Müller & Partner',
    email: 'buchhaltung@mueller-partner.de',
    phone: '+49 69 11223344',
    address: 'Kaiserstraße 42, 60311 Frankfurt',
    taxId: 'DE456789123',
    category: 'customer',
    invoiceCount: 2,
    totalRevenue: 7500,
  },
  {
    id: '4',
    type: 'company',
    name: 'Amazon EU S.à r.l.',
    email: 'suppliers@amazon.de',
    phone: null,
    address: '38 avenue John F. Kennedy, Luxembourg',
    taxId: 'LU20260743',
    category: 'supplier',
    invoiceCount: 12,
    totalRevenue: -2500,
  },
  {
    id: '5',
    type: 'company',
    name: 'Hetzner Online GmbH',
    email: 'billing@hetzner.de',
    phone: '+49 9831 505-0',
    address: 'Industriestr. 25, 91710 Gunzenhausen',
    taxId: 'DE812871812',
    category: 'supplier',
    invoiceCount: 8,
    totalRevenue: -360,
  },
  {
    id: '6',
    type: 'person',
    name: 'Max Mustermann',
    email: 'max.mustermann@example.de',
    phone: '+49 170 1234567',
    address: 'Musterstraße 1, 12345 Musterstadt',
    taxId: null,
    category: 'customer',
    invoiceCount: 1,
    totalRevenue: 500,
  },
  {
    id: '7',
    type: 'company',
    name: 'Kanzlei Steuerberater Müller',
    email: 'info@stb-mueller.de',
    phone: '+49 211 9876543',
    address: 'Königsallee 100, 40212 Düsseldorf',
    taxId: 'DE111222333',
    category: 'supplier',
    invoiceCount: 4,
    totalRevenue: -3560,
  },
  {
    id: '8',
    type: 'company',
    name: 'Telekom Deutschland GmbH',
    email: 'kundenservice@telekom.de',
    phone: '0800 33 01000',
    address: 'Landgrabenweg 151, 53227 Bonn',
    taxId: 'DE123456780',
    category: 'supplier',
    invoiceCount: 12,
    totalRevenue: -540,
  },
];

const categoryConfig = {
  customer: { label: 'Kunde', color: 'bg-green-100 text-green-800' },
  supplier: { label: 'Lieferant', color: 'bg-blue-100 text-blue-800' },
  both: { label: 'Kunde & Lieferant', color: 'bg-purple-100 text-purple-800' },
};

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredContacts = demoContacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || contact.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Statistiken
  const stats = {
    total: demoContacts.length,
    customers: demoContacts.filter((c) => c.category === 'customer').length,
    suppliers: demoContacts.filter((c) => c.category === 'supplier').length,
    companies: demoContacts.filter((c) => c.type === 'company').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontakte</h1>
          <p className="text-gray-500 mt-1">
            Verwalten Sie Ihre Kunden und Lieferanten
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportieren
          </Button>
          <Button variant="gradient" asChild>
            <Link to="/contacts/new">
              <Plus className="w-4 h-4 mr-2" />
              Neuer Kontakt
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kontakte gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary-100">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kunden</p>
                <p className="text-2xl font-bold text-green-600">{stats.customers}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Lieferanten</p>
                <p className="text-2xl font-bold text-blue-600">{stats.suppliers}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Firmen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.companies}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <Building2 className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Suchen nach Name, E-Mail, Adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Alle' },
                { value: 'customer', label: 'Kunden' },
                { value: 'supplier', label: 'Lieferanten' },
              ].map((category) => (
                <Button
                  key={category.value}
                  variant={categoryFilter === category.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(category.value)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const category = categoryConfig[contact.category as keyof typeof categoryConfig];

          return (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-3 rounded-lg',
                        contact.type === 'company' ? 'bg-blue-100' : 'bg-gray-100'
                      )}
                    >
                      {contact.type === 'company' ? (
                        <Building2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      <span
                        className={cn(
                          'inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                          category.color
                        )}
                      >
                        {category.label}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:text-primary-600 truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${contact.phone}`} className="hover:text-primary-600">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{contact.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span>{contact.invoiceCount} Belege</span>
                  </div>
                  {contact.taxId && (
                    <span className="font-mono text-xs text-gray-400">{contact.taxId}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Keine Kontakte gefunden</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
