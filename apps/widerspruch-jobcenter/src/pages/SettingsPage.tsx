import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const [config, setConfig] = useState<any>(null)
  const [wpTest, setWpTest] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    api.getConfig().then(setConfig).catch(console.error)
  }, [])

  const testWp = async () => {
    setTesting(true)
    try {
      const result = await api.testWp()
      setWpTest(result)
    } catch (err) {
      setWpTest({ connected: false, error: err instanceof Error ? err.message : 'Fehler' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="forum-container">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-primary" /> Einstellungen
      </h1>

      {/* WP Connection */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">WordPress-Verbindung</h2>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">URL:</span>
            <span className="font-mono">{config?.wp_base_url || '–'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Admin-User:</span>
            <span className="font-mono">{config?.wp_admin_user || '–'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">App-Password:</span>
            <span className="font-mono">{config?.wp_admin_app_password || '–'}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button onClick={testWp} disabled={testing} className="btn-forum-primary text-xs">
            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
            Verbindung testen
          </button>
          {wpTest && (
            wpTest.connected ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Wifi className="w-3.5 h-3.5" /> Verbunden (User: {wpTest.user?.name})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <WifiOff className="w-3.5 h-3.5" /> {wpTest.error}
              </span>
            )
          )}
        </div>
      </div>

      {/* Bot Config */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">Bot-Konfiguration</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block">Max Posts/Tag</span>
            <span className="font-semibold">{config?.bot_max_posts_per_day}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Max Kommentare/Tag</span>
            <span className="font-semibold">{config?.bot_max_comments_per_day}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Aktive Stunden</span>
            <span className="font-semibold">{config?.bot_active_hours_start}:00 – {config?.bot_active_hours_end}:00</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Min. Delay</span>
            <span className="font-semibold">{config?.bot_min_delay_minutes} Minuten</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Max. Delay</span>
            <span className="font-semibold">{config?.bot_max_delay_minutes} Minuten</span>
          </div>
          <div>
            <span className="text-muted-foreground block">BescheidBoxer Rate</span>
            <span className="font-semibold">{((config?.bescheidboxer_mention_rate || 0) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Forum IDs */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Forum IDs (bbPress)</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {config?.forum_ids && Object.entries(config.forum_ids).map(([key, value]: [string, any]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-mono">{value || '0 (nicht konfiguriert)'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-xs text-muted-foreground">
        <p>Konfiguration wird aus der <code className="bg-muted px-1 rounded">.env</code> Datei geladen.</p>
        <p className="mt-1">Kopiere <code className="bg-muted px-1 rounded">.env.example</code> zu <code className="bg-muted px-1 rounded">.env</code> und passe die Werte an.</p>
      </div>
    </div>
  )
}
