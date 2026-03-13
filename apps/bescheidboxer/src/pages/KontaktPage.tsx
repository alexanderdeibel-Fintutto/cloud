import { useState } from 'react'
import {
  LifeBuoy,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  CheckCircle2,
  BookOpen,
  Shield,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

interface FaqItem {
  frage: string
  antwort: string
  kategorie: string
}

const FAQ: FaqItem[] = [
  {
    frage: 'Wie lade ich einen Steuerbescheid hoch?',
    antwort: 'Gehen Sie zur Upload-Seite und ziehen Sie Ihre PDF- oder Bilddatei in den Upload-Bereich. Alternativ klicken Sie auf "Datei auswaehlen". Der Steuer-Bescheidprüfer erkennt automatisch alle wichtigen Daten per OCR.',
    kategorie: 'Upload',
  },
  {
    frage: 'Wie genau ist die KI-Analyse?',
    antwort: 'Unsere KI prueft jeden Bescheid anhand aktueller Steuergesetze und erkennt typische Fehler mit einer hohen Trefferquote. Die Analyse ersetzt jedoch keine professionelle Steuerberatung - bei komplexen Faellen empfehlen wir, einen Steuerberater hinzuzuziehen.',
    kategorie: 'Analyse',
  },
  {
    frage: 'Was kostet ein Einspruch?',
    antwort: 'Ein Einspruch beim Finanzamt ist grundsaetzlich kostenlos. Der Steuer-Bescheidprüfer stellt Ihnen professionelle Vorlagen bereit. Nur wenn Sie einen Steuerberater beauftragen oder vor dem Finanzgericht klagen, fallen Kosten an.',
    kategorie: 'Einspruch',
  },
  {
    frage: 'Wie lange habe ich Zeit fuer einen Einspruch?',
    antwort: 'Die Einspruchsfrist betraegt in der Regel einen Monat ab Bekanntgabe des Bescheids. Der Bescheid gilt 3 Tage nach Aufgabe zur Post als bekannt gegeben. Der Steuer-Bescheidprüfer ueberwacht diese Fristen automatisch fuer Sie.',
    kategorie: 'Fristen',
  },
  {
    frage: 'Sind meine Daten sicher?',
    antwort: 'Ja, alle Daten werden verschluesselt uebertragen und gespeichert. Wir verwenden modernste Sicherheitsstandards (TLS 1.3, AES-256). Ihre Dokumente werden ausschliesslich in deutschen Rechenzentren gespeichert.',
    kategorie: 'Sicherheit',
  },
  {
    frage: 'Was ist der Unterschied zwischen Free und Pro?',
    antwort: 'Mit Free koennen Sie bis zu 3 Bescheide pro Jahr hochladen und analysieren. Pro bietet unbegrenzte Analysen, automatische Einspruch-Generierung, erweiterte Statistiken, Jahresberichte und Priority-Support.',
    kategorie: 'Konto',
  },
  {
    frage: 'Kann ich Bescheide aus frueheren Jahren pruefen lassen?',
    antwort: 'Ja, Sie koennen Bescheide aus beliebigen Jahren hochladen. Beachten Sie jedoch, dass die Einspruchsfrist (1 Monat) moeglicherweise abgelaufen ist. In bestimmten Faellen ist aber ein Aenderungsantrag noch moeglich.',
    kategorie: 'Analyse',
  },
  {
    frage: 'Wie kann ich mein Konto loeschen?',
    antwort: 'Gehen Sie zu Einstellungen > Konto und klicken Sie auf "Konto loeschen". Alle Ihre Daten werden innerhalb von 30 Tagen vollstaendig geloescht. Sie erhalten eine Bestaetigungsmail.',
    kategorie: 'Konto',
  },
]

export default function KontaktPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [betreff, setBetreff] = useState('')
  const [nachricht, setNachricht] = useState('')
  const [gesendet, setGesendet] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate sending
    setGesendet(true)
    setTimeout(() => {
      setBetreff('')
      setNachricht('')
      setGesendet(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LifeBuoy className="h-8 w-8" />
          Kontakt & Support
        </h1>
        <p className="text-muted-foreground mt-1">
          Wir helfen Ihnen gerne weiter
        </p>
      </div>

      {/* Kontakt-Optionen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex rounded-xl bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-3 mb-3">
              <Mail className="h-6 w-6 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
            </div>
            <h3 className="font-semibold">E-Mail</h3>
            <p className="text-sm text-muted-foreground mt-1">
              support@fintutto.de
            </p>
            <Badge variant="secondary" className="mt-2 text-[10px]">
              <Clock className="h-3 w-3 mr-1" />
              Antwort in 24h
            </Badge>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex rounded-xl bg-green-100 dark:bg-green-900/40 p-3 mb-3">
              <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Live-Chat</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Mo-Fr, 9:00-18:00 Uhr
            </p>
            <Badge variant="secondary" className="mt-2 text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
              Online
            </Badge>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex rounded-xl bg-purple-100 dark:bg-purple-900/40 p-3 mb-3">
              <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Telefon</h3>
            <p className="text-sm text-muted-foreground mt-1">
              +49 30 1234 5678
            </p>
            <Badge variant="secondary" className="mt-2 text-[10px]">
              Pro-Kunden
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Haeufige Fragen
            </CardTitle>
            <CardDescription>{FAQ.length} Antworten auf die wichtigsten Fragen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {item.kategorie}
                    </Badge>
                    <span className="text-sm font-medium truncate">{item.frage}</span>
                  </div>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 pt-1 bg-muted/30">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.antwort}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Kontaktformular */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" />
                Nachricht senden
              </CardTitle>
              <CardDescription>Beschreiben Sie Ihr Anliegen</CardDescription>
            </CardHeader>
            <CardContent>
              {gesendet ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    Nachricht gesendet!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wir melden uns innerhalb von 24 Stunden.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Betreff</label>
                    <Input
                      value={betreff}
                      onChange={e => setBetreff(e.target.value)}
                      placeholder="Worum geht es?"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nachricht</label>
                    <textarea
                      value={nachricht}
                      onChange={e => setNachricht(e.target.value)}
                      placeholder="Beschreiben Sie Ihr Anliegen moeglichst genau..."
                      required
                      rows={5}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Absenden
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* System-Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System-Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Web-App', status: 'online' },
                { name: 'KI-Analyse', status: 'online' },
                { name: 'OCR-Service', status: 'online' },
                { name: 'Datenbank', status: 'online' },
              ].map(service => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-sm">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Betriebsbereit
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
