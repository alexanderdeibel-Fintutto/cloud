import { Link } from 'react-router-dom'
import { ArrowLeft, Settings, Bell, Shield, Globe, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function EinstellungenPage() {
  return (
    <div>
      <section className="gradient-energy py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Einstellungen</h1>
              <p className="text-white/80">App- und OCR-Einstellungen verwalten</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Allgemein
              </CardTitle>
              <CardDescription>Grundlegende App-Einstellungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Sprache</p>
                  <p className="text-xs text-muted-foreground">Sprache der Benutzeroberfläche</p>
                </div>
                <select className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm">
                  <option>Deutsch</option>
                  <option>English</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Währung</p>
                  <p className="text-xs text-muted-foreground">Standard-Währung für Beträge</p>
                </div>
                <select className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm">
                  <option>EUR (€)</option>
                  <option>CHF</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                OCR-Einstellungen
              </CardTitle>
              <CardDescription>Einstellungen für die Rechnungserkennung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Automatische Erkennung</p>
                  <p className="text-xs text-muted-foreground">Rechnungstyp automatisch erkennen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Versorger-Datenbank</p>
                  <p className="text-xs text-muted-foreground">Bekannte Versorger für bessere Erkennung</p>
                </div>
                <span className="text-sm text-muted-foreground">15+ Versorger</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
              <CardDescription>Benachrichtigungseinstellungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Abrechnungs-Erinnerungen</p>
                  <p className="text-xs text-muted-foreground">Erinnerung an anstehende Abrechnungen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Datenschutz
              </CardTitle>
              <CardDescription>Datenschutz- und Sicherheitseinstellungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Lokale Verarbeitung</p>
                  <p className="text-xs text-muted-foreground">OCR-Daten nur lokal verarbeiten</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <Button variant="outline" size="sm" className="text-destructive">
                Alle gespeicherten Rechnungen löschen
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
