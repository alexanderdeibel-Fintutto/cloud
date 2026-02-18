import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Activity, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'

export default function ActivityPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getActivity(200).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="forum-container">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <h1 className="text-xl font-bold flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" /> Aktivitäts-Log
      </h1>

      {loading ? (
        <div className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
      ) : data?.entries?.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left p-2 font-medium">Zeit</th>
                  <th className="text-left p-2 font-medium">Persona</th>
                  <th className="text-left p-2 font-medium">Aktion</th>
                  <th className="text-left p-2 font-medium">WP-ID</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((e: any, i: number) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-2 font-mono text-muted-foreground">
                      {new Date(e.timestamp).toLocaleString('de-DE', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="p-2">{e.persona_id}</td>
                    <td className="p-2">{e.action_type}</td>
                    <td className="p-2">{e.wp_id || '–'}</td>
                    <td className="p-2">
                      {e.success ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </td>
                    <td className="p-2 text-muted-foreground max-w-[200px] truncate">
                      {e.details || '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Noch keine Aktivitäten.</p>
        </div>
      )}
    </div>
  )
}
