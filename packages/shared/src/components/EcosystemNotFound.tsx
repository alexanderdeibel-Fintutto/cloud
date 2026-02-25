import { FINTUTTO_APPS, APP_CATEGORIES, type AppCategory } from '../index'

interface EcosystemNotFoundProps {
  currentAppSlug: string
  homeHref?: string
  renderLink?: (props: { to: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) => React.ReactNode
}

const FEATURED_SLUGS = ['vermietify', 'portal', 'ablesung', 'translator', 'pflanzen-manager', 'vermieter-portal']

export function EcosystemNotFound({ currentAppSlug, homeHref = '/', renderLink }: EcosystemNotFoundProps) {
  const featured = FEATURED_SLUGS
    .filter((s) => s !== currentAppSlug)
    .slice(0, 4)
    .map((s) => Object.values(FINTUTTO_APPS).find((a) => a.slug === s)!)
    .filter(Boolean)

  const linkStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
    fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
    background: 'var(--primary, #7c3aed)', color: '#fff',
    border: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem', opacity: 0.3 }}>404</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
        Seite nicht gefunden
      </h1>
      <p style={{ fontSize: '1rem', color: 'var(--muted-foreground, #6b7280)', marginBottom: '2rem', maxWidth: '28rem' }}>
        Diese Seite existiert leider nicht. Vielleicht findest du hier, was du suchst:
      </p>

      <div style={{ marginBottom: '3rem' }}>
        {renderLink ? (
          renderLink({ to: homeHref, children: 'Zur Startseite', style: linkStyle })
        ) : (
          <a href={homeHref} style={linkStyle}>Zur Startseite</a>
        )}
      </div>

      {/* Ecosystem suggestions */}
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground, #6b7280)', marginBottom: '1rem' }}>
          Entdecke andere Fintutto-Apps
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {featured.map((app) => (
            <a
              key={app.slug}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1rem', borderRadius: '0.75rem',
                border: '1px solid var(--border, #e5e7eb)',
                background: 'var(--card, #fff)',
                textDecoration: 'none', color: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary, #7c3aed)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border, #e5e7eb)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{app.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground, #6b7280)' }}>
                  {APP_CATEGORIES[app.category]}
                </div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--muted-foreground, #9ca3af)' }}>↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
