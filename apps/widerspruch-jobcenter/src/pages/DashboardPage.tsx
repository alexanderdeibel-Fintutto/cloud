import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Play, Square, RefreshCw, Users, Calendar, Activity,
  Settings, Wifi, WifiOff, Bot, BarChart3, Clock,
} from 'lucide-react'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setError(null)
      const data = await api.getStatus()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Server nicht erreichbar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAction = async (action: string, fn: () => Promise<any>) => {
    setActionLoading(action)
    try {
      await fn()
      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="forum-container py-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-3">Verbinde mit Bot-Server...</p>
      </div>
    )
  }

  return (
    <div className="forum-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Board-Bot Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            widerspruchjobcenter.de – Automatisiertes Community-Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error ? (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <WifiOff className="w-3.5 h-3.5" /> Offline
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Wifi className="w-3.5 h-3.5" /> Verbunden
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-6">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-destructive/70 mt-1">
            Stelle sicher, dass der Bot-Server läuft: <code className="bg-destructive/10 px-1 rounded">pnpm dev:server</code>
          </p>
        </div>
      )}

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className={`w-4 h-4 ${status.running ? 'text-green-600' : 'text-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">Bot-Status</span>
            </div>
            <p className={`text-lg font-bold ${status.running ? 'text-green-600' : 'text-muted-foreground'}`}>
              {status.running ? 'Aktiv' : 'Gestoppt'}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Personas</span>
            </div>
            <p className="text-lg font-bold">{status.totalPersonas}</p>
            <p className="text-[10px] text-muted-foreground">{status.personasWithWpId} mit WP-ID</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Heute</span>
            </div>
            <p className="text-lg font-bold">
              {status.todayCounts.posts + status.todayCounts.comments}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {status.todayCounts.posts} Posts, {status.todayCounts.comments} Komm.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Ausstehend</span>
            </div>
            <p className="text-lg font-bold">{status.pendingActions}</p>
            <p className="text-[10px] text-muted-foreground">geplante Aktionen</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">Schnellaktionen</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAction('generate', () => api.generatePersonas())}
            disabled={!!actionLoading}
            className="btn-forum-primary text-xs disabled:opacity-50"
          >
            {actionLoading === 'generate' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Users className="w-3.5 h-3.5" />
            )}
            500 Personas generieren
          </button>

          <button
            onClick={() => handleAction('schedule', () => api.generateSchedule())}
            disabled={!!actionLoading}
            className="btn-forum-primary text-xs disabled:opacity-50"
          >
            {actionLoading === 'schedule' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            Tagesplan erstellen
          </button>

          <button
            onClick={() => handleAction('wp', () => api.setupWpUsers())}
            disabled={!!actionLoading}
            className="btn-forum text-xs border border-border hover:bg-muted disabled:opacity-50"
          >
            <Settings className="w-3.5 h-3.5" />
            WP-User anlegen
          </button>

          {status?.running ? (
            <button
              onClick={() => handleAction('stop', () => api.stopBot())}
              disabled={!!actionLoading}
              className="btn-forum text-xs bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5" />
              Bot stoppen
            </button>
          ) : (
            <button
              onClick={() => handleAction('start', () => api.startBot())}
              disabled={!!actionLoading}
              className="btn-forum text-xs bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Bot starten
            </button>
          )}

          <button
            onClick={() => handleAction('testwp', () => api.testWp())}
            disabled={!!actionLoading}
            className="btn-forum-ghost text-xs disabled:opacity-50"
          >
            <Wifi className="w-3.5 h-3.5" />
            WP testen
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/personas" className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
          <Users className="w-5 h-5 text-primary mb-2" />
          <h3 className="text-sm font-semibold">Personas</h3>
          <p className="text-xs text-muted-foreground mt-1">500 Personas verwalten und ansehen</p>
        </Link>

        <Link to="/schedule" className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
          <Calendar className="w-5 h-5 text-primary mb-2" />
          <h3 className="text-sm font-semibold">Zeitplan</h3>
          <p className="text-xs text-muted-foreground mt-1">Tagesplan und Uhrzeitverteilung</p>
        </Link>

        <Link to="/activity" className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
          <Activity className="w-5 h-5 text-primary mb-2" />
          <h3 className="text-sm font-semibold">Aktivitäten</h3>
          <p className="text-xs text-muted-foreground mt-1">Log aller Bot-Aktionen</p>
        </Link>

        <Link to="/settings" className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
          <Settings className="w-5 h-5 text-primary mb-2" />
          <h3 className="text-sm font-semibold">Einstellungen</h3>
          <p className="text-xs text-muted-foreground mt-1">WordPress-Verbindung & Bot-Config</p>
        </Link>
      </div>
    </div>
  )
}
