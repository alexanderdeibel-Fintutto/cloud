import { Link } from 'react-router-dom'
import {
  ArrowLeft, Shield, Activity, Users, ScanLine, Server,
  BarChart3, AlertTriangle, CheckCircle2, Clock, HardDrive, Cpu
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const systemStats = {
  totalScans: 1247,
  scansToday: 34,
  activeUsers: 156,
  avgConfidence: 87,
  uptime: '99.97%',
  avgProcessingTime: '2.3s',
  storageUsed: '4.2 GB',
  apiCalls: 8934,
}

const recentActivity = [
  { id: '1', type: 'scan', user: 'user@example.com', detail: 'Strom-Rechnung gescannt (92%)', time: 'vor 5 Min.' },
  { id: '2', type: 'scan', user: 'mieter42@gmail.com', detail: 'Gas-Rechnung gescannt (78%)', time: 'vor 12 Min.' },
  { id: '3', type: 'error', user: 'test@test.de', detail: 'OCR-Fehler: Bild zu unscharf', time: 'vor 25 Min.' },
  { id: '4', type: 'scan', user: 'vermieter@web.de', detail: 'Wasser-Rechnung gescannt (95%)', time: 'vor 1 Std.' },
  { id: '5', type: 'user', user: 'neu@fintutto.de', detail: 'Neuer Benutzer registriert', time: 'vor 2 Std.' },
]

const providerStats = [
  { name: 'Vattenfall', scans: 312, avgConfidence: 91 },
  { name: 'E.ON', scans: 287, avgConfidence: 89 },
  { name: 'Stadtwerke (diverse)', scans: 198, avgConfidence: 85 },
  { name: 'EnBW', scans: 145, avgConfidence: 88 },
  { name: 'GASAG', scans: 112, avgConfidence: 86 },
  { name: 'RWE', scans: 98, avgConfidence: 87 },
  { name: 'Sonstige', scans: 95, avgConfidence: 72 },
]

export default function AdminDashboardPage() {
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/80">System-Monitoring & Verwaltung</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <ScanLine className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.totalScans.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Scans gesamt</p>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">+{systemStats.scansToday} heute</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.activeUsers}</p>
                    <p className="text-xs text-muted-foreground">Aktive Nutzer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.avgConfidence}%</p>
                    <p className="text-xs text-muted-foreground">Ø Konfidenz</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.uptime}</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Letzte Aktivitäten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      {item.type === 'error' ? (
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                      ) : item.type === 'scan' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <Users className="h-5 w-5 text-blue-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.detail}</p>
                        <p className="text-xs text-muted-foreground">{item.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* System Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Server className="h-4 w-4" />
                    System-Ressourcen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> Verarbeitungszeit</span>
                      <span className="font-medium">{systemStats.avgProcessingTime}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1"><HardDrive className="h-3.5 w-3.5" /> Speicher</span>
                      <span className="font-medium">{systemStats.storageUsed} / 50 GB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> API Calls</span>
                      <span className="font-medium">{systemStats.apiCalls.toLocaleString()} / Mo.</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Versorger</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {providerStats.map((p) => (
                      <div key={p.name} className="flex items-center justify-between text-sm">
                        <span className="truncate">{p.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{p.scans} Scans</span>
                          <span className={`font-medium ${p.avgConfidence >= 85 ? 'text-green-600' : 'text-orange-500'}`}>
                            {p.avgConfidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
