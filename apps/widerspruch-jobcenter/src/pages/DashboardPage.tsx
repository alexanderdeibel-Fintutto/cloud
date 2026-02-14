import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Play, Square, RefreshCw, Users, Calendar, Activity,
  Settings, Wifi, WifiOff, Bot, BarChart3, Clock,
} from 'lucide-react'
import { api } from '@/lib/api'

interface WpSetupProgress {
  running: boolean
  total: number
  current: number
  created: number
  skipped: number
  errors: number
  currentPersona: string
}

export default function DashboardPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [wpProgress, setWpProgress] = useState<WpSetupProgress | null>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const startProgressPolling = () => {
    if (progressInterval.current) return
    progressInterval.current = setInterval(async () => {
      try {
        const progress = await api.getWpSetupProgress()
        setWpProgress(progress)
        if (!progress.running) {
          stopProgressPolling()
          setActionLoading(null)
          await fetchStatus()
        }
      } catch { /* ignore */ }
    }, 1000)
  }

  const stopProgressPolling = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
  }

  useEffect(() => {
    fetchStatus()
    // Beim Laden prüfen ob WP-Setup gerade läuft
    api.getWpSetupProgress().then(p => {
      if (p.running) {
        setWpProgress(p)
        setActionLoading('wp')
        startProgressPolling()
      }
    }).catch(() => {})
    const interval = setInterval(fetchStatus, 5000)
    return () => {
      clearInterval(interval)
      stopProgressPolling()
    }
  }, [])

  const handleAction = async (action: string, fn: () => Promise<any>) => {
    setActionLoading(action)
    try {
      const result = await fn()
      // WP-Setup: Start polling statt auf Response warten
      if (action === 'wp' && result?.progress?.running) {
        setWpProgress(result.progress)
        startProgressPolling()
        return // Nicht actionLoading clearen – polling macht das
      }
      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      if (action !== 'wp') setActionLoading(null)
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

  const wpPercent = wpProgress && wpProgress.total > 0
    ? Math.round((wpProgress.current / wpProgress.total) * 100)
    : 0

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

      {/* WP-Setup Progress Bar */}
      {wpProgress?.running && (
        <div className="bg-card border border-primary/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
              WP-User werden angelegt...
            </h3>
            <span className="text-xs font-mono text-primary">{wpProgress.current}/{wpProgress.total} ({wpPercent}%)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 mb-2">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${wpPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Aktuell: {wpProgress.currentPersona}</span>
            <span className="flex items-center gap-3">
              <span className="text-green-600">{wpProgress.created} erstellt</span>
              <span>{wpProgress.skipped} übersprungen</span>
              {wpProgress.errors > 0 && <span className="text-destructive">{wpProgress.errors} Fehler</span>}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            ~{Math.ceil((wpProgress.total - wpProgress.current) / 60)} Min. verbleibend (1 User/Sekunde)
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
            {actionLoading === 'wp' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Settings className="w-3.5 h-3.5" />
            )}
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
