import { useState } from 'react'

// Import from parent index to avoid circular deps
type AppCategory = 'immobilien' | 'finanzen' | 'lifestyle' | 'sales'

interface AppInfo {
  name: string
  slug: string
  url: string
  icon: string
  description: string
  category: AppCategory
}

interface AppsDirectoryProps {
  apps: AppInfo[]
  currentAppSlug: string
  baseUrl?: string
}

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  alle: { label: 'Alle Apps', icon: '🌐' },
  immobilien: { label: 'Immobilien', icon: '🏠' },
  finanzen: { label: 'Finanzen & Tools', icon: '🧮' },
  lifestyle: { label: 'Lifestyle', icon: '🌱' },
  sales: { label: 'Sales & B2B', icon: '🚀' },
}

export function AppsDirectory({ apps, currentAppSlug }: AppsDirectoryProps) {
  const [filter, setFilter] = useState('alle')
  const filteredApps = apps
    .filter((app) => app.slug !== currentAppSlug)
    .filter((app) => filter === 'alle' || app.category === filter)

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #581c87, #1e1b4b)',
        padding: '4rem 1rem',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.1)', borderRadius: '999px',
            padding: '0.375rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.9)',
          }}>
            ✨ 15 Apps · 1 Ökosystem · Alles kostenlos starten
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', margin: '0 0 1rem' }}>
            Das Fintutto Ökosystem
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            Von der Immobilienverwaltung bis zum Pflanzen-Manager – für jeden Bereich die richtige App. Alle verbunden, ein Account.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div style={{
        padding: '1rem', borderBottom: '1px solid var(--border, #e5e7eb)',
        background: 'var(--muted, #f9fafb)', position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem',
      }}>
        {Object.entries(CATEGORIES).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.85rem',
              fontWeight: 500, border: 'none', cursor: 'pointer',
              background: filter === key ? 'var(--primary, #7c3aed)' : 'var(--card, #fff)',
              color: filter === key ? '#fff' : 'var(--foreground, #111)',
              boxShadow: filter === key ? '0 2px 8px rgba(124,58,237,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredApps.map((app) => (
            <a
              key={app.slug}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', borderRadius: '0.75rem', overflow: 'hidden',
                border: '1px solid var(--border, #e5e7eb)',
                background: 'var(--card, #fff)',
                textDecoration: 'none', color: 'inherit',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                e.currentTarget.style.borderColor = 'var(--primary, #7c3aed)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
                e.currentTarget.style.borderColor = 'var(--border, #e5e7eb)'
              }}
            >
              <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2rem' }}>{app.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.25rem' }}>{app.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground, #6b7280)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                    {app.description}
                  </p>
                  <span style={{
                    fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px',
                    background: 'var(--muted, #f3f4f6)', color: 'var(--muted-foreground, #6b7280)',
                  }}>
                    {CATEGORIES[app.category]?.label || app.category}
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground, #6b7280)' }}>↗</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
