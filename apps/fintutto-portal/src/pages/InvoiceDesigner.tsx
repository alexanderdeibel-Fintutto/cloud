import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Palette, Type, Layout, Image, Download, Eye, Save,
  Upload, Trash2, Move, Grid, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

interface InvoiceTemplate {
  id: string;
  name: string;
  // Branding
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // Typography
  fontFamily: string;
  headerSize: number;
  bodySize: number;
  // Layout
  layout: 'classic' | 'modern' | 'minimal' | 'detailed';
  headerAlignment: 'left' | 'center' | 'right';
  showLogo: boolean;
  logoPosition: 'left' | 'right' | 'center';
  logoSize: number;
  // Content
  headerText: string;
  footerText: string;
  paymentInfo: string;
  showQRCode: boolean;
  showBankDetails: boolean;
  // Company
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  taxId: string;
  vatId: string;
  bankName: string;
  iban: string;
  bic: string;
}

const DEFAULT_TEMPLATE: InvoiceTemplate = {
  id: 'default',
  name: 'Standard-Vorlage',
  primaryColor: '#10b981',
  secondaryColor: '#1f2937',
  accentColor: '#6366f1',
  fontFamily: 'Inter',
  headerSize: 24,
  bodySize: 11,
  layout: 'classic',
  headerAlignment: 'left',
  showLogo: true,
  logoPosition: 'right',
  logoSize: 120,
  headerText: 'Vielen Dank für Ihren Auftrag!',
  footerText: 'Bei Fragen stehen wir Ihnen gerne zur Verfügung.',
  paymentInfo: 'Bitte überweisen Sie den Betrag innerhalb von 14 Tagen auf das unten angegebene Konto.',
  showQRCode: false,
  showBankDetails: true,
  companyName: 'Musterfirma GmbH',
  companyAddress: 'Musterstraße 123\n12345 Musterstadt',
  companyPhone: '+49 123 456789',
  companyEmail: 'info@musterfirma.de',
  companyWebsite: 'www.musterfirma.de',
  taxId: '123/456/78901',
  vatId: 'DE123456789',
  bankName: 'Musterbank',
  iban: 'DE89 3704 0044 0532 0130 00',
  bic: 'COBADEFFXXX',
};

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Lato', label: 'Lato (Professional)' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro (Technical)' },
  { value: 'Merriweather', label: 'Merriweather (Elegant)' },
];

const LAYOUT_OPTIONS = [
  { value: 'classic', label: 'Klassisch', description: 'Traditionelles Layout mit klarer Struktur' },
  { value: 'modern', label: 'Modern', description: 'Zeitgemäßes Design mit farbigen Akzenten' },
  { value: 'minimal', label: 'Minimalistisch', description: 'Reduziertes Design, Fokus auf Inhalt' },
  { value: 'detailed', label: 'Detailliert', description: 'Ausführlich mit allen Informationen' },
];

const COLOR_PRESETS = [
  { name: 'Fintutto', primary: '#10b981', secondary: '#1f2937', accent: '#6366f1' },
  { name: 'Professional', primary: '#2563eb', secondary: '#1e293b', accent: '#0ea5e9' },
  { name: 'Elegant', primary: '#7c3aed', secondary: '#18181b', accent: '#a855f7' },
  { name: 'Nature', primary: '#059669', secondary: '#064e3b', accent: '#34d399' },
  { name: 'Warm', primary: '#ea580c', secondary: '#431407', accent: '#fb923c' },
  { name: 'Corporate', primary: '#475569', secondary: '#0f172a', accent: '#94a3b8' },
];

const STORAGE_KEY = 'fintutto_invoice_template';

const InvoiceDesigner = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [template, setTemplate] = useState<InvoiceTemplate>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_TEMPLATE;
    } catch {
      return DEFAULT_TEMPLATE;
    }
  });
  const [previewMode, setPreviewMode] = useState(false);

  const updateTemplate = (updates: Partial<InvoiceTemplate>) => {
    setTemplate(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
    toast({ title: 'Gespeichert', description: 'Ihre Vorlage wurde gespeichert.' });
  };

  const handleReset = () => {
    setTemplate(DEFAULT_TEMPLATE);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: 'Zurückgesetzt', description: 'Vorlage auf Standard zurückgesetzt.' });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTemplate({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    updateTemplate({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  };

  // Sample invoice data for preview
  const sampleInvoice = {
    number: 'RE-2024-0042',
    date: '12.02.2024',
    dueDate: '26.02.2024',
    customer: {
      name: 'Max Mustermann',
      company: 'Beispiel AG',
      address: 'Beispielweg 42\n54321 Beispielstadt',
    },
    items: [
      { pos: 1, description: 'Webdesign Homepage', qty: 1, unit: 'Pauschal', price: 2500, vat: 19 },
      { pos: 2, description: 'Logo-Erstellung', qty: 1, unit: 'Pauschal', price: 800, vat: 19 },
      { pos: 3, description: 'Hosting (12 Monate)', qty: 12, unit: 'Monat', price: 29.90, vat: 19 },
    ],
  };

  const netTotal = sampleInvoice.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const vatTotal = netTotal * 0.19;
  const grossTotal = netTotal + vatTotal;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Rechnungs-Designer
          </h1>
          <p className="text-muted-foreground">Gestalten Sie Ihre Rechnungsvorlage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <Trash2 className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Bearbeiten' : 'Vorschau'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor Panel */}
        <div className={previewMode ? 'hidden lg:block' : ''}>
          <Tabs defaultValue="branding">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="branding"><Palette className="h-4 w-4 mr-1" />Branding</TabsTrigger>
              <TabsTrigger value="typography"><Type className="h-4 w-4 mr-1" />Schrift</TabsTrigger>
              <TabsTrigger value="layout"><Layout className="h-4 w-4 mr-1" />Layout</TabsTrigger>
              <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1" />Inhalt</TabsTrigger>
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Logo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {template.logo ? (
                      <div className="relative">
                        <img src={template.logo} alt="Logo" className="h-16 object-contain" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => updateTemplate({ logo: undefined })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-16 w-32 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                        <Image className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Logo hochladen
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">PNG oder JPG, max. 2MB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Switch checked={template.showLogo} onCheckedChange={(v) => updateTemplate({ showLogo: v })} />
                    <Label>Logo anzeigen</Label>
                  </div>

                  {template.showLogo && (
                    <>
                      <div className="space-y-2">
                        <Label>Logo-Position</Label>
                        <div className="flex gap-2">
                          {(['left', 'center', 'right'] as const).map((pos) => (
                            <Button
                              key={pos}
                              variant={template.logoPosition === pos ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateTemplate({ logoPosition: pos })}
                            >
                              {pos === 'left' && <AlignLeft className="h-4 w-4" />}
                              {pos === 'center' && <AlignCenter className="h-4 w-4" />}
                              {pos === 'right' && <AlignRight className="h-4 w-4" />}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Logo-Größe: {template.logoSize}px</Label>
                        <Slider
                          value={[template.logoSize]}
                          onValueChange={([v]) => updateTemplate({ logoSize: v })}
                          min={60}
                          max={200}
                          step={10}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Farben</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => applyColorPreset(preset)}
                      >
                        <div className="flex gap-0.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                        </div>
                        {preset.name}
                      </Button>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Primär</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={template.primaryColor}
                          onChange={(e) => updateTemplate({ primaryColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={template.primaryColor}
                          onChange={(e) => updateTemplate({ primaryColor: e.target.value })}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sekundär</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={template.secondaryColor}
                          onChange={(e) => updateTemplate({ secondaryColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={template.secondaryColor}
                          onChange={(e) => updateTemplate({ secondaryColor: e.target.value })}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Akzent</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={template.accentColor}
                          onChange={(e) => updateTemplate({ accentColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={template.accentColor}
                          onChange={(e) => updateTemplate({ accentColor: e.target.value })}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Schriftart</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Schriftfamilie</Label>
                    <Select value={template.fontFamily} onValueChange={(v) => updateTemplate({ fontFamily: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Überschriften: {template.headerSize}px</Label>
                    <Slider
                      value={[template.headerSize]}
                      onValueChange={([v]) => updateTemplate({ headerSize: v })}
                      min={18}
                      max={36}
                      step={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fließtext: {template.bodySize}px</Label>
                    <Slider
                      value={[template.bodySize]}
                      onValueChange={([v]) => updateTemplate({ bodySize: v })}
                      min={9}
                      max={14}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Layout-Stil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {LAYOUT_OPTIONS.map((layout) => (
                      <button
                        key={layout.value}
                        className={`p-4 border rounded-lg text-left transition-all ${
                          template.layout === layout.value
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => updateTemplate({ layout: layout.value as InvoiceTemplate['layout'] })}
                      >
                        <p className="font-medium">{layout.label}</p>
                        <p className="text-xs text-muted-foreground">{layout.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Optionen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>QR-Code für Zahlung</Label>
                    <Switch checked={template.showQRCode} onCheckedChange={(v) => updateTemplate({ showQRCode: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Bankverbindung anzeigen</Label>
                    <Switch checked={template.showBankDetails} onCheckedChange={(v) => updateTemplate({ showBankDetails: v })} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Firmendaten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Firmenname</Label>
                      <Input value={template.companyName} onChange={(e) => updateTemplate({ companyName: e.target.value })} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Adresse</Label>
                      <Textarea value={template.companyAddress} onChange={(e) => updateTemplate({ companyAddress: e.target.value })} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon</Label>
                      <Input value={template.companyPhone} onChange={(e) => updateTemplate({ companyPhone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>E-Mail</Label>
                      <Input value={template.companyEmail} onChange={(e) => updateTemplate({ companyEmail: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Steuernummer</Label>
                      <Input value={template.taxId} onChange={(e) => updateTemplate({ taxId: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>USt-IdNr.</Label>
                      <Input value={template.vatId} onChange={(e) => updateTemplate({ vatId: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Texte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Einleitungstext</Label>
                    <Textarea value={template.headerText} onChange={(e) => updateTemplate({ headerText: e.target.value })} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Zahlungshinweis</Label>
                    <Textarea value={template.paymentInfo} onChange={(e) => updateTemplate({ paymentInfo: e.target.value })} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fußzeile</Label>
                    <Textarea value={template.footerText} onChange={(e) => updateTemplate({ footerText: e.target.value })} rows={2} />
                  </div>
                </CardContent>
              </Card>

              {template.showBankDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bankverbindung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Bank</Label>
                      <Input value={template.bankName} onChange={(e) => updateTemplate({ bankName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>IBAN</Label>
                      <Input value={template.iban} onChange={(e) => updateTemplate({ iban: e.target.value })} className="font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label>BIC</Label>
                      <Input value={template.bic} onChange={(e) => updateTemplate({ bic: e.target.value })} className="font-mono" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live-Vorschau
              </CardTitle>
              <Badge variant="secondary">A4</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-gray-100 dark:bg-gray-900">
            <div
              className="bg-white text-black shadow-lg mx-auto"
              style={{
                width: '100%',
                maxWidth: '595px',
                minHeight: '842px',
                fontFamily: template.fontFamily,
                fontSize: `${template.bodySize}px`,
                padding: '40px',
              }}
            >
              {/* Header */}
              <div className={`flex mb-8 ${template.logoPosition === 'right' ? 'flex-row-reverse' : ''} ${template.logoPosition === 'center' ? 'flex-col items-center' : 'justify-between'}`}>
                {template.showLogo && template.logo && (
                  <img src={template.logo} alt="Logo" style={{ height: `${template.logoSize / 2}px`, objectFit: 'contain' }} />
                )}
                <div className={template.logoPosition === 'center' ? 'text-center mt-4' : ''}>
                  <h2 style={{ color: template.secondaryColor, fontSize: `${template.headerSize / 2}px`, fontWeight: 'bold' }}>
                    {template.companyName}
                  </h2>
                  <p className="text-xs text-gray-600 whitespace-pre-line">{template.companyAddress}</p>
                </div>
              </div>

              {/* Invoice Title */}
              <div className="mb-6">
                <h1 style={{ color: template.primaryColor, fontSize: `${template.headerSize}px`, fontWeight: 'bold' }}>
                  RECHNUNG
                </h1>
                <p className="text-gray-600">{sampleInvoice.number}</p>
              </div>

              {/* Customer & Details */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rechnungsempfänger</p>
                  <p className="font-semibold">{sampleInvoice.customer.company}</p>
                  <p>{sampleInvoice.customer.name}</p>
                  <p className="whitespace-pre-line text-sm">{sampleInvoice.customer.address}</p>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Datum:</span>
                    <span>{sampleInvoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fällig:</span>
                    <span>{sampleInvoice.dueDate}</span>
                  </div>
                </div>
              </div>

              {template.headerText && (
                <p className="mb-4 text-sm">{template.headerText}</p>
              )}

              {/* Items Table */}
              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${template.primaryColor}` }}>
                    <th className="text-left py-2 w-8">Pos</th>
                    <th className="text-left">Beschreibung</th>
                    <th className="text-right w-16">Menge</th>
                    <th className="text-right w-20">Preis</th>
                    <th className="text-right w-20">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleInvoice.items.map((item) => (
                    <tr key={item.pos} className="border-b border-gray-200">
                      <td className="py-2">{item.pos}</td>
                      <td>{item.description}</td>
                      <td className="text-right">{item.qty} {item.unit}</td>
                      <td className="text-right">{item.price.toFixed(2)} €</td>
                      <td className="text-right">{(item.qty * item.price).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-48 text-sm">
                  <div className="flex justify-between py-1">
                    <span>Netto:</span>
                    <span>{netTotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>USt. 19%:</span>
                    <span>{vatTotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 font-bold" style={{ borderColor: template.primaryColor }}>
                    <span>Gesamt:</span>
                    <span style={{ color: template.primaryColor }}>{grossTotal.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {template.paymentInfo && (
                <p className="text-sm mb-4">{template.paymentInfo}</p>
              )}

              {template.showBankDetails && (
                <div className="text-sm bg-gray-50 p-3 rounded mb-4">
                  <p className="font-medium mb-1">Bankverbindung</p>
                  <p>{template.bankName}</p>
                  <p className="font-mono">IBAN: {template.iban}</p>
                  <p className="font-mono">BIC: {template.bic}</p>
                </div>
              )}

              {template.footerText && (
                <p className="text-xs text-gray-600 mt-4">{template.footerText}</p>
              )}

              {/* Footer */}
              <div className="mt-8 pt-4 border-t text-xs text-gray-500">
                <p>{template.companyName} · {template.companyPhone} · {template.companyEmail}</p>
                <p>Steuernr.: {template.taxId} · USt-IdNr.: {template.vatId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceDesigner;
