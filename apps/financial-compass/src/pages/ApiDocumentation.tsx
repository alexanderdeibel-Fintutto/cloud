import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Code, Copy, Check, ChevronDown, ChevronRight, Search,
  Lock, Globe, Zap, Book, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  authentication: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  requestBody?: {
    contentType: string;
    schema: Record<string, unknown>;
  };
  responses: {
    status: number;
    description: string;
    schema?: Record<string, unknown>;
  }[];
}

interface ApiCategory {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
}

const API_DOCUMENTATION: ApiCategory[] = [
  {
    name: 'Authentifizierung',
    description: 'Endpunkte für Benutzerauthentifizierung und Session-Management',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/auth/register',
        description: 'Registriert einen neuen Benutzer',
        authentication: false,
        requestBody: {
          contentType: 'application/json',
          schema: {
            email: 'string',
            password: 'string',
            name: 'string',
          },
        },
        responses: [
          { status: 201, description: 'Benutzer erfolgreich erstellt' },
          { status: 400, description: 'Validierungsfehler' },
          { status: 409, description: 'E-Mail bereits registriert' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        description: 'Authentifiziert einen Benutzer und gibt JWT zurück',
        authentication: false,
        requestBody: {
          contentType: 'application/json',
          schema: {
            email: 'string',
            password: 'string',
          },
        },
        responses: [
          { status: 200, description: 'Erfolgreich angemeldet', schema: { token: 'string', user: 'object' } },
          { status: 401, description: 'Ungültige Anmeldedaten' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/auth/logout',
        description: 'Beendet die aktuelle Session',
        authentication: true,
        responses: [
          { status: 200, description: 'Erfolgreich abgemeldet' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/auth/refresh',
        description: 'Erneuert das JWT Token',
        authentication: true,
        responses: [
          { status: 200, description: 'Token erneuert', schema: { token: 'string' } },
          { status: 401, description: 'Token abgelaufen' },
        ],
      },
    ],
  },
  {
    name: 'Organisationen',
    description: 'Verwaltung von Unternehmen und Mandanten',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/organizations',
        description: 'Listet alle Organisationen des Benutzers',
        authentication: true,
        parameters: [
          { name: 'page', type: 'number', required: false, description: 'Seite für Pagination' },
          { name: 'limit', type: 'number', required: false, description: 'Einträge pro Seite (max. 100)' },
        ],
        responses: [
          { status: 200, description: 'Liste der Organisationen', schema: { data: 'array', total: 'number' } },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/organizations',
        description: 'Erstellt eine neue Organisation',
        authentication: true,
        requestBody: {
          contentType: 'application/json',
          schema: {
            name: 'string',
            legalForm: 'string',
            taxId: 'string?',
            vatId: 'string?',
            address: 'object',
          },
        },
        responses: [
          { status: 201, description: 'Organisation erstellt' },
          { status: 400, description: 'Validierungsfehler' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/organizations/:id',
        description: 'Gibt Details einer Organisation zurück',
        authentication: true,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Organisation ID' },
        ],
        responses: [
          { status: 200, description: 'Organisation gefunden' },
          { status: 404, description: 'Organisation nicht gefunden' },
        ],
      },
      {
        method: 'PATCH',
        path: '/api/v1/organizations/:id',
        description: 'Aktualisiert eine Organisation',
        authentication: true,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Organisation ID' },
        ],
        responses: [
          { status: 200, description: 'Organisation aktualisiert' },
          { status: 404, description: 'Organisation nicht gefunden' },
        ],
      },
    ],
  },
  {
    name: 'Rechnungen',
    description: 'Erstellen und Verwalten von Rechnungen',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/invoices',
        description: 'Listet alle Rechnungen',
        authentication: true,
        parameters: [
          { name: 'status', type: 'string', required: false, description: 'Filter nach Status (draft, sent, paid, overdue)' },
          { name: 'from', type: 'date', required: false, description: 'Startdatum (ISO 8601)' },
          { name: 'to', type: 'date', required: false, description: 'Enddatum (ISO 8601)' },
          { name: 'contactId', type: 'string', required: false, description: 'Filter nach Kontakt' },
        ],
        responses: [
          { status: 200, description: 'Liste der Rechnungen' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/invoices',
        description: 'Erstellt eine neue Rechnung',
        authentication: true,
        requestBody: {
          contentType: 'application/json',
          schema: {
            contactId: 'string',
            items: 'array',
            dueDate: 'date',
            notes: 'string?',
          },
        },
        responses: [
          { status: 201, description: 'Rechnung erstellt' },
          { status: 400, description: 'Validierungsfehler' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/invoices/:id/send',
        description: 'Versendet eine Rechnung per E-Mail',
        authentication: true,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Rechnungs-ID' },
        ],
        requestBody: {
          contentType: 'application/json',
          schema: {
            email: 'string?',
            subject: 'string?',
            message: 'string?',
          },
        },
        responses: [
          { status: 200, description: 'Rechnung versendet' },
          { status: 404, description: 'Rechnung nicht gefunden' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/invoices/:id/pdf',
        description: 'Generiert PDF für eine Rechnung',
        authentication: true,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Rechnungs-ID' },
        ],
        responses: [
          { status: 200, description: 'PDF-Datei (application/pdf)' },
          { status: 404, description: 'Rechnung nicht gefunden' },
        ],
      },
    ],
  },
  {
    name: 'Belege',
    description: 'Verwaltung von Eingangsbelegen',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/receipts',
        description: 'Listet alle Belege',
        authentication: true,
        responses: [
          { status: 200, description: 'Liste der Belege' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/receipts',
        description: 'Lädt einen neuen Beleg hoch',
        authentication: true,
        requestBody: {
          contentType: 'multipart/form-data',
          schema: {
            file: 'binary',
            metadata: 'object?',
          },
        },
        responses: [
          { status: 201, description: 'Beleg hochgeladen' },
          { status: 400, description: 'Ungültiges Dateiformat' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/receipts/:id/analyze',
        description: 'Analysiert Beleg mit KI',
        authentication: true,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Beleg-ID' },
        ],
        responses: [
          { status: 200, description: 'Analyseergebnis', schema: { vendor: 'string', amount: 'number', date: 'date', category: 'string' } },
        ],
      },
    ],
  },
  {
    name: 'Buchungen',
    description: 'Finanzbuchungen verwalten',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/bookings',
        description: 'Listet alle Buchungen',
        authentication: true,
        parameters: [
          { name: 'from', type: 'date', required: false, description: 'Startdatum' },
          { name: 'to', type: 'date', required: false, description: 'Enddatum' },
          { name: 'account', type: 'string', required: false, description: 'Kontonummer' },
        ],
        responses: [
          { status: 200, description: 'Liste der Buchungen' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/bookings',
        description: 'Erstellt eine neue Buchung',
        authentication: true,
        requestBody: {
          contentType: 'application/json',
          schema: {
            date: 'date',
            debitAccount: 'string',
            creditAccount: 'string',
            amount: 'number',
            description: 'string',
            receiptId: 'string?',
          },
        },
        responses: [
          { status: 201, description: 'Buchung erstellt' },
          { status: 400, description: 'Validierungsfehler' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/bookings/:id/reverse',
        description: 'Storniert eine Buchung (GoBD-konform)',
        authentication: true,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Buchungs-ID' },
        ],
        responses: [
          { status: 200, description: 'Stornobuchung erstellt' },
          { status: 404, description: 'Buchung nicht gefunden' },
        ],
      },
    ],
  },
  {
    name: 'Bank',
    description: 'Banking-Integration und Transaktionen',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/bank-accounts',
        description: 'Listet alle Bankkonten',
        authentication: true,
        responses: [
          { status: 200, description: 'Liste der Bankkonten' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/bank-accounts/:id/sync',
        description: 'Synchronisiert Transaktionen via FinAPI',
        authentication: true,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Bankkonto-ID' },
        ],
        responses: [
          { status: 200, description: 'Synchronisierung gestartet', schema: { jobId: 'string', transactionsImported: 'number' } },
          { status: 401, description: 'Bankverbindung abgelaufen' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/bank-accounts/:id/transactions',
        description: 'Listet Transaktionen eines Kontos',
        authentication: true,
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Bankkonto-ID' },
          { name: 'from', type: 'date', required: false, description: 'Startdatum' },
          { name: 'to', type: 'date', required: false, description: 'Enddatum' },
        ],
        responses: [
          { status: 200, description: 'Liste der Transaktionen' },
        ],
      },
    ],
  },
  {
    name: 'Berichte',
    description: 'Finanzberichte generieren',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/reports/bwa',
        description: 'Generiert BWA (Betriebswirtschaftliche Auswertung)',
        authentication: true,
        parameters: [
          { name: 'year', type: 'number', required: true, description: 'Geschäftsjahr' },
          { name: 'month', type: 'number', required: false, description: 'Monat (1-12)' },
        ],
        responses: [
          { status: 200, description: 'BWA-Daten' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/reports/balance-sheet',
        description: 'Generiert Bilanz',
        authentication: true,
        parameters: [
          { name: 'year', type: 'number', required: true, description: 'Geschäftsjahr' },
          { name: 'date', type: 'date', required: false, description: 'Stichtag' },
        ],
        responses: [
          { status: 200, description: 'Bilanzdaten' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/reports/income-statement',
        description: 'Generiert GuV (Gewinn- und Verlustrechnung)',
        authentication: true,
        parameters: [
          { name: 'year', type: 'number', required: true, description: 'Geschäftsjahr' },
          { name: 'from', type: 'date', required: false, description: 'Startdatum' },
          { name: 'to', type: 'date', required: false, description: 'Enddatum' },
        ],
        responses: [
          { status: 200, description: 'GuV-Daten' },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/reports/vat',
        description: 'Generiert UStVA-Daten',
        authentication: true,
        parameters: [
          { name: 'year', type: 'number', required: true, description: 'Jahr' },
          { name: 'period', type: 'string', required: true, description: 'Zeitraum (monatlich/quartalsweise)' },
        ],
        responses: [
          { status: 200, description: 'UStVA-Daten' },
        ],
      },
    ],
  },
  {
    name: 'Exporte',
    description: 'Datenexport in verschiedenen Formaten',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/exports/datev',
        description: 'Exportiert Daten im DATEV-Format',
        authentication: true,
        requestBody: {
          contentType: 'application/json',
          schema: {
            year: 'number',
            from: 'date',
            to: 'date',
            format: 'string (ascii|csv)',
          },
        },
        responses: [
          { status: 200, description: 'DATEV-Export-Datei' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/exports/gdpdu',
        description: 'Exportiert Daten für GDPdU/GoBD',
        authentication: true,
        requestBody: {
          contentType: 'application/json',
          schema: {
            year: 'number',
            includeDocuments: 'boolean',
          },
        },
        responses: [
          { status: 200, description: 'GDPdU-Export-ZIP' },
        ],
      },
    ],
  },
  {
    name: 'KI',
    description: 'KI-gestützte Analyse und Assistenz',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/ai/recognize-receipt',
        description: 'Erkennt Beleg-Inhalte mit Vision AI',
        authentication: true,
        requestBody: {
          contentType: 'multipart/form-data',
          schema: {
            image: 'binary',
          },
        },
        responses: [
          { status: 200, description: 'Erkennungsergebnis', schema: { vendor: 'string', amount: 'number', date: 'date', items: 'array' } },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/ai/suggest-booking',
        description: 'Schlägt Buchungskonto vor',
        authentication: true,
        requestBody: {
          contentType: 'application/json',
          schema: {
            description: 'string',
            amount: 'number',
            vendor: 'string?',
          },
        },
        responses: [
          { status: 200, description: 'Buchungsvorschlag', schema: { debitAccount: 'string', creditAccount: 'string', confidence: 'number' } },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/ai/chat',
        description: 'Chat-Assistent für Buchhaltungsfragen',
        authentication: true,
        requestBody: {
          contentType: 'application/json',
          schema: {
            message: 'string',
            context: 'string?',
          },
        },
        responses: [
          { status: 200, description: 'Antwort', schema: { response: 'string' } },
        ],
      },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-orange-100 text-orange-800',
  PATCH: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
};

function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPath = () => {
    navigator.clipboard.writeText(endpoint.path);
    setCopied(true);
    toast.success('Pfad kopiert');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer group">
          <Badge className={METHOD_COLORS[endpoint.method]}>{endpoint.method}</Badge>
          <code className="flex-1 text-sm font-mono">{endpoint.path}</code>
          {endpoint.authentication && <Lock className="h-4 w-4 text-muted-foreground" />}
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 p-4 border-l-2 space-y-4">
          <p className="text-sm text-muted-foreground">{endpoint.description}</p>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyPath}>
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              Kopieren
            </Button>
          </div>

          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Parameter</h4>
              <div className="space-y-2">
                {endpoint.parameters.map((param) => (
                  <div key={param.name} className="flex items-start gap-2 text-sm">
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs">{param.name}</code>
                    <Badge variant="outline" className="text-xs">{param.type}</Badge>
                    {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    <span className="text-muted-foreground">{param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.requestBody && (
            <div>
              <h4 className="text-sm font-medium mb-2">Request Body</h4>
              <Badge variant="outline" className="mb-2">{endpoint.requestBody.contentType}</Badge>
              <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(endpoint.requestBody.schema, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">Responses</h4>
            <div className="space-y-2">
              {endpoint.responses.map((response) => (
                <div key={response.status} className="flex items-start gap-2 text-sm">
                  <Badge
                    variant={response.status < 300 ? 'default' : 'destructive'}
                    className={response.status < 300 ? 'bg-green-600' : ''}
                  >
                    {response.status}
                  </Badge>
                  <span className="text-muted-foreground">{response.description}</span>
                  {response.schema && (
                    <code className="text-xs text-muted-foreground">
                      {JSON.stringify(response.schema)}
                    </code>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ApiDocumentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = API_DOCUMENTATION.filter(category => {
    if (selectedCategory && category.name !== selectedCategory) return false;
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.endpoints.some(
        e => e.path.toLowerCase().includes(query) || e.description.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API-Dokumentation</h1>
          <p className="text-muted-foreground">REST API Referenz für Fintutto</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            <Globe className="mr-1 h-3 w-3" />
            v1.0
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Zap className="mr-1 h-3 w-3" />
            OpenAPI 3.0
          </Badge>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Base URL</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm">https://api.fintutto.de/api/v1</code>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Authentifizierung</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm">Authorization: Bearer &lt;token&gt;</code>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Content-Type</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm">application/json</code>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints">Endpunkte</TabsTrigger>
          <TabsTrigger value="authentication">Authentifizierung</TabsTrigger>
          <TabsTrigger value="errors">Fehler</TabsTrigger>
          <TabsTrigger value="ratelimits">Rate Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Endpunkte durchsuchen..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">Alle Kategorien</option>
              {API_DOCUMENTATION.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-6">
              {filteredCategories.map((category) => (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {category.endpoints
                      .filter(
                        e =>
                          !searchQuery ||
                          e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((endpoint) => (
                        <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JWT Authentication</CardTitle>
              <CardDescription>Alle geschützten Endpunkte erfordern ein gültiges JWT Token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Token erhalten</h4>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Token verwenden</h4>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`GET /api/v1/invoices
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. Token erneuern</h4>
                <p className="text-sm text-muted-foreground">
                  Tokens sind 24 Stunden gültig. Verwenden Sie den <code>/auth/refresh</code> Endpunkt, um ein neues Token zu erhalten.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fehlerbehandlung</CardTitle>
              <CardDescription>Standard HTTP-Statuscodes und Fehlerformat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Fehlerformat</h4>
                  <pre className="p-4 bg-muted rounded-lg text-sm">
{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Die Anfrage enthält ungültige Daten",
    "details": [
      {
        "field": "email",
        "message": "Ungültiges E-Mail-Format"
      }
    ]
  }
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">HTTP Status Codes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">200</Badge>
                      <span>Erfolgreiche Anfrage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">201</Badge>
                      <span>Ressource erfolgreich erstellt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">400</Badge>
                      <span>Ungültige Anfrage / Validierungsfehler</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">401</Badge>
                      <span>Nicht authentifiziert</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">403</Badge>
                      <span>Keine Berechtigung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">404</Badge>
                      <span>Ressource nicht gefunden</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">429</Badge>
                      <span>Rate Limit überschritten</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">500</Badge>
                      <span>Serverfehler</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratelimits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>Anfragelimits zum Schutz der API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Standard</h4>
                    <p className="text-2xl font-bold">1000</p>
                    <p className="text-sm text-muted-foreground">Anfragen pro Stunde</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Premium</h4>
                    <p className="text-2xl font-bold">10000</p>
                    <p className="text-sm text-muted-foreground">Anfragen pro Stunde</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Response Headers</h4>
                  <pre className="p-4 bg-muted rounded-lg text-sm">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
