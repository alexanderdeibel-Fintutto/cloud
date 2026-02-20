import { useState } from 'react'
import {
  Users,
  Home,
  Euro,
  Calendar,
  FileText,
  Zap,
  Droplets,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Phone,
  Mail,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { formatCurrency, formatDate } from '../lib/utils'

// Demo data representing a tenant's view (based on DB schema from migrations)
const DEMO_TENANT = {
  firstName: 'Max',
  lastName: 'Mustermann',
  unitName: 'Wohnung 3 OG links',
  propertyName: 'Musterhaus Berlin',
  address: 'Musterstrasse 42, 10115 Berlin',
  moveInDate: '2023-06-01',
  baseRent: 750,
  utilityAdvance: 200,
  totalRent: 950,
  depositAmount: 2250,
  depositPaid: true,
  paymentDay: 1,
}

const DEMO_METERS = [
  { id: 'm1', type: 'electricity' as const, number: 'STR-44821', lastReading: 14523.5, lastDate: '2026-01-15', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  { id: 'm2', type: 'water_cold' as const, number: 'WK-7732', lastReading: 456.2, lastDate: '2026-01-15', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  { id: 'm3', type: 'heating' as const, number: 'HZ-1199', lastReading: 8834.0, lastDate: '2026-01-15', icon: Flame, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40' },
]

const DEMO_PAYMENTS = [
  { id: 'p1', month: 'Februar 2026', amount: 950, status: 'paid' as const, paidDate: '2026-02-01' },
  { id: 'p2', month: 'Januar 2026', amount: 950, status: 'paid' as const, paidDate: '2026-01-02' },
  { id: 'p3', month: 'Dezember 2025', amount: 950, status: 'paid' as const, paidDate: '2025-12-01' },
  { id: 'p4', month: 'November 2025', amount: 950, status: 'paid' as const, paidDate: '2025-11-01' },
]

const DEMO_REQUESTS: { id: string; title: string; category: string; status: string; date: string }[] = [
  { id: 'r1', title: 'Heizung macht Geraeusche', category: 'heating', status: 'in_progress', date: '2026-02-10' },
  { id: 'r2', title: 'Fenster undicht (Wohnzimmer)', category: 'structural', status: 'resolved', date: '2025-11-22' },
]

const STATUS_CONFIG = {
  paid: { label: 'Bezahlt', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle2 },
  pending: { label: 'Ausstehend', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
  overdue: { label: 'Ueberfaellig', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertTriangle },
  partial: { label: 'Teilweise', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: Clock },
}

const MAINTENANCE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: 'Offen', color: 'text-amber-600 dark:text-amber-400' },
  in_progress: { label: 'In Bearbeitung', color: 'text-fintutto-blue-600 dark:text-fintutto-blue-400' },
  waiting: { label: 'Wartend', color: 'text-purple-600 dark:text-purple-400' },
  resolved: { label: 'Geloest', color: 'text-green-600 dark:text-green-400' },
  closed: { label: 'Geschlossen', color: 'text-gray-600 dark:text-gray-400' },
}

export default function MieterBereichPage() {
  const t = DEMO_TENANT
  const [activeTab, setActiveTab] = useState<'uebersicht' | 'zahlungen' | 'zaehler' | 'meldungen'>('uebersicht')

  const tabs = [
    { id: 'uebersicht' as const, label: 'Uebersicht' },
    { id: 'zahlungen' as const, label: 'Zahlungen' },
    { id: 'zaehler' as const, label: 'Zaehler' },
    { id: 'meldungen' as const, label: 'Meldungen' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-8 w-8" />
          Mieterbereich
        </h1>
        <p className="text-muted-foreground mt-1">
          Self-Service-Portal fuer Mieter
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Uebersicht Tab */}
      {activeTab === 'uebersicht' && (
        <div className="space-y-6">
          {/* Wohnung Info */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-3">
                  <Home className="h-6 w-6 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{t.unitName}</h2>
                  <p className="text-sm text-muted-foreground">{t.propertyName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.address}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Einzug</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(t.moveInDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kaltmiete</p>
                      <p className="text-sm font-medium">{formatCurrency(t.baseRent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nebenkosten</p>
                      <p className="text-sm font-medium">{formatCurrency(t.utilityAdvance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gesamtmiete</p>
                      <p className="text-sm font-bold text-fintutto-blue-600 dark:text-fintutto-blue-400">
                        {formatCurrency(t.totalRent)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{DEMO_PAYMENTS.filter(p => p.status === 'paid').length}</p>
                <p className="text-xs text-muted-foreground">Zahlungen OK</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <Zap className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{DEMO_METERS.length}</p>
                <p className="text-xs text-muted-foreground">Zaehler</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <Send className="h-5 w-5 text-fintutto-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{DEMO_REQUESTS.filter(r => r.status !== 'resolved' && r.status !== 'closed').length}</p>
                <p className="text-xs text-muted-foreground">Offene Meldungen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <Euro className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{t.depositPaid ? 'Ja' : 'Nein'}</p>
                <p className="text-xs text-muted-foreground">Kaution ({formatCurrency(t.depositAmount)})</p>
              </CardContent>
            </Card>
          </div>

          {/* Vermieter Kontakt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vermieter-Kontakt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>vermieter@fintutto.de</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+49 30 1234 5678</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Zahlungen Tab */}
      {activeTab === 'zahlungen' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Naechste Zahlung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(t.totalRent)}</p>
                  <p className="text-sm text-muted-foreground">Faellig am {t.paymentDay}. Maerz 2026</p>
                </div>
                <Badge variant="outline" className="text-amber-600">
                  <Clock className="h-3 w-3 mr-1" />
                  In 11 Tagen
                </Badge>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Kaltmiete: {formatCurrency(t.baseRent)}</span>
                  <span>NK-Vorauszahlung: {formatCurrency(t.utilityAdvance)}</span>
                </div>
                <Progress value={79} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-1">79% des Monats vergangen</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zahlungshistorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMO_PAYMENTS.map(payment => {
                const cfg = STATUS_CONFIG[payment.status]
                const StatusIcon = cfg.icon
                return (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg ${cfg.bg} p-2`}>
                        <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{payment.month}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.paidDate ? `Bezahlt am ${formatDate(payment.paidDate)}` : 'Ausstehend'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(payment.amount)}</p>
                      <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Zaehler Tab */}
      {activeTab === 'zaehler' && (
        <div className="space-y-4">
          {DEMO_METERS.map(meter => {
            const Icon = meter.icon
            return (
              <Card key={meter.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl ${meter.bg} p-3`}>
                      <Icon className={`h-6 w-6 ${meter.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {meter.type === 'electricity' ? 'Strom' : meter.type === 'water_cold' ? 'Kaltwasser' : 'Heizung'}
                          </h3>
                          <p className="text-xs text-muted-foreground">Nr. {meter.number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{meter.lastReading.toLocaleString('de-DE')}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Letzte Ablesung: {formatDate(meter.lastDate)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="h-3.5 w-3.5" />
                          Neuen Zaehlerstand melden
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Meldungen Tab */}
      {activeTab === 'meldungen' && (
        <div className="space-y-4">
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Neue Meldung erstellen
          </Button>

          {DEMO_REQUESTS.map(req => {
            const statusCfg = MAINTENANCE_STATUS_CONFIG[req.status]
            return (
              <Card key={req.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{req.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Gemeldet am {formatDate(req.date)}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusCfg.color}>
                      {statusCfg.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
