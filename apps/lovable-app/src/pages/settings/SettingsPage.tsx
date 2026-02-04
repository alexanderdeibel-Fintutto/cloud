import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Building2,
  User,
  CreditCard,
  Bell,
  Lock,
  Palette,
  Globe,
  FileText,
  Download,
  Upload,
  Check,
  AlertTriangle,
} from 'lucide-react';

const settingsTabs = [
  { id: 'company', label: 'Unternehmen', icon: Building2 },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'billing', label: 'Abrechnung', icon: CreditCard },
  { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
  { id: 'security', label: 'Sicherheit', icon: Lock },
  { id: 'appearance', label: 'Darstellung', icon: Palette },
  { id: 'integrations', label: 'Integrationen', icon: Globe },
  { id: 'export', label: 'Datenexport', icon: Download },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-500 mt-1">
          Verwalten Sie Ihr Unternehmen und Ihre Kontoeinstellungen
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Company Settings */}
          {activeTab === 'company' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Unternehmensdaten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Firmenname</Label>
                      <Input id="companyName" defaultValue="Meine Firma GmbH" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legalForm">Rechtsform</Label>
                      <select
                        id="legalForm"
                        className="w-full h-10 px-3 border rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                        defaultValue="gmbh"
                      >
                        <option value="gmbh">GmbH</option>
                        <option value="ug">UG (haftungsbeschränkt)</option>
                        <option value="ag">AG</option>
                        <option value="kg">KG</option>
                        <option value="ohg">OHG</option>
                        <option value="gbr">GbR</option>
                        <option value="einzelunternehmen">Einzelunternehmen</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Steuernummer</Label>
                      <Input id="taxId" defaultValue="123/456/78901" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vatId">USt-IdNr.</Label>
                      <Input id="vatId" defaultValue="DE123456789" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input id="address" defaultValue="Musterstraße 1" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip">PLZ</Label>
                      <Input id="zip" defaultValue="12345" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="city">Stadt</Label>
                      <Input id="city" defaultValue="Musterstadt" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Buchhaltungseinstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chartOfAccounts">Kontenrahmen</Label>
                      <select
                        id="chartOfAccounts"
                        className="w-full h-10 px-3 border rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                        defaultValue="skr03"
                      >
                        <option value="skr03">SKR03</option>
                        <option value="skr04">SKR04</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fiscalYear">Geschäftsjahresbeginn</Label>
                      <select
                        id="fiscalYear"
                        className="w-full h-10 px-3 border rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                        defaultValue="01"
                      >
                        <option value="01">Januar</option>
                        <option value="04">April</option>
                        <option value="07">Juli</option>
                        <option value="10">Oktober</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vatPeriod">USt-Voranmeldungszeitraum</Label>
                      <select
                        id="vatPeriod"
                        className="w-full h-10 px-3 border rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                        defaultValue="monthly"
                      >
                        <option value="monthly">Monatlich</option>
                        <option value="quarterly">Quartalsweise</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Währung</Label>
                      <select
                        id="currency"
                        className="w-full h-10 px-3 border rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                        defaultValue="EUR"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="CHF">CHF (Fr.)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rechnungseinstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoicePrefix">Rechnungsnummer-Präfix</Label>
                      <Input id="invoicePrefix" defaultValue="R-" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceStart">Startnummer</Label>
                      <Input id="invoiceStart" type="number" defaultValue="1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Standard-Zahlungsziel (Tage)</Label>
                    <Input id="paymentTerms" type="number" defaultValue="14" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceFooter">Rechnungsfußzeile</Label>
                    <textarea
                      id="invoiceFooter"
                      className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      defaultValue="Vielen Dank für Ihren Auftrag! Bitte überweisen Sie den Betrag innerhalb der angegebenen Frist."
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Persönliche Daten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                    AD
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Bild hochladen
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG max. 2MB</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Vorname</Label>
                    <Input id="firstName" defaultValue="Alexander" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nachname</Label>
                    <Input id="lastName" defaultValue="Deibel" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" type="email" defaultValue="demo@fintutto.cloud" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" type="tel" defaultValue="+49 170 1234567" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aktueller Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary-50 border border-primary-200">
                    <div>
                      <p className="font-semibold text-primary-900">Professional</p>
                      <p className="text-sm text-primary-700">49€ / Monat</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-medium">
                      Aktiv
                    </span>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-gray-500">Buchungen</p>
                      <p className="font-semibold">42 / unbegrenzt</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-gray-500">Rechnungen</p>
                      <p className="font-semibold">12 / unbegrenzt</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-gray-500">Belege</p>
                      <p className="font-semibold">8 / unbegrenzt</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button variant="outline">Plan ändern</Button>
                    <Button variant="outline">Rechnungen anzeigen</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Zahlungsmethode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Visa •••• 4242</p>
                        <p className="text-sm text-gray-500">Läuft ab 12/2027</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Ändern</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Passwort ändern</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Neues Passwort</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Passwort ändern</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Zwei-Faktor-Authentifizierung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">2FA ist aktiviert</p>
                        <p className="text-sm text-gray-500">Authenticator App</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Verwalten</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aktive Sitzungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-sm">Chrome auf MacOS</p>
                        <p className="text-xs text-gray-500">Berlin, Deutschland • Aktiv</p>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Aktuelle Sitzung</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-sm">Safari auf iPhone</p>
                        <p className="text-xs text-gray-500">München, Deutschland • vor 2 Stunden</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Abmelden
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Export Settings */}
          {activeTab === 'export' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datenexport</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border hover:border-primary-500 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">DATEV Export</p>
                        <p className="text-sm text-gray-500">Für Ihren Steuerberater</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Exportieren
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border hover:border-primary-500 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">GDPdU Export</p>
                        <p className="text-sm text-gray-500">Für Betriebsprüfungen</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Exportieren
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border hover:border-primary-500 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">CSV Export</p>
                        <p className="text-sm text-gray-500">Alle Buchungen als CSV</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Exportieren
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border hover:border-primary-500 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Kompletter Backup</p>
                        <p className="text-sm text-gray-500">Alle Daten herunterladen</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Exportieren
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">GoBD-Hinweis</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Alle Exporte sind revisionssicher und entsprechen den Anforderungen der GoBD.
                        Ein Änderungsprotokoll wird automatisch mitexportiert.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other tabs placeholder */}
          {!['company', 'profile', 'billing', 'security', 'export'].includes(activeTab) && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  {settingsTabs.find((t) => t.id === activeTab)?.icon &&
                    (() => {
                      const Icon = settingsTabs.find((t) => t.id === activeTab)!.icon;
                      return <Icon className="w-8 h-8 text-gray-400" />;
                    })()}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {settingsTabs.find((t) => t.id === activeTab)?.label}
                </h3>
                <p className="text-gray-500">
                  Diese Einstellungen werden in der vollständigen Version verfügbar sein.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Abbrechen</Button>
            <Button variant="gradient" onClick={handleSave}>
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Gespeichert
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
