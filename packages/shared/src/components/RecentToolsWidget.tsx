import { useMemo } from 'react'

interface RecentTool {
  path: string
  title: string
  timestamp: number
}

interface RecentToolsWidgetProps {
  tools: RecentTool[]
  /** Filter to only show tools matching a path prefix, e.g. '/rechner' */
  pathPrefix?: string
  /** Link component – receives href and children */
  renderLink: (props: { href: string; children: React.ReactNode }) => React.ReactNode
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Gerade eben'
  if (mins < 60) return `Vor ${mins} Min.`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Vor ${hours} Std.`
  const days = Math.floor(hours / 24)
  return `Vor ${days} Tag${days > 1 ? 'en' : ''}`
}

/**
 * Displays recently used tools as a compact horizontal list.
 * Renders nothing if there are no matching tools.
 *
 * Usage:
 *   <RecentToolsWidget
 *     tools={recentTools}
 *     pathPrefix="/rechner"
 *     renderLink={({ href, children }) => <Link to={href}>{children}</Link>}
 *   />
 */
export function RecentToolsWidget({ tools, pathPrefix, renderLink }: RecentToolsWidgetProps) {
  const filtered = useMemo(() => {
    if (!pathPrefix) return tools
    return tools.filter((t) => t.path.startsWith(pathPrefix))
  }, [tools, pathPrefix])

  if (filtered.length === 0) return null

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p
        style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--muted-foreground, #64748b)',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Zuletzt verwendet
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {filtered.map((tool) =>
          renderLink({
            href: tool.path,
            children: (
              <span
                key={tool.path}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--border, #e2e8f0)',
                  background: 'var(--card, #fff)',
                  color: 'var(--foreground, #0f172a)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tool.title}
                <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground, #94a3b8)' }}>
                  {timeAgo(tool.timestamp)}
                </span>
              </span>
            ),
          }),
        )}
      </div>
    </div>
  )
}
