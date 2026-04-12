import { FINTUTTO_APPS, APP_CATEGORIES } from '../apps'

const appCount = Object.keys(FINTUTTO_APPS).length
const categoryCount = Object.keys(APP_CATEGORIES).length

interface EcosystemStatsBarProps {
  linkTo?: string
  renderLink?: (props: { to: string; children: React.ReactNode; className: string }) => React.ReactNode
}

export function EcosystemStatsBar({ linkTo = '/apps', renderLink }: EcosystemStatsBarProps) {
  const stats = [
    { value: String(appCount), label: 'Apps' },
    { value: String(categoryCount), label: 'Kategorien' },
    { value: '1', label: 'Account' },
    { value: '∞', label: 'Möglichkeiten' },
  ]

  const content = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      padding: '1rem 1.5rem',
      borderRadius: '0.75rem',
      border: '1px solid var(--border, #e5e7eb)',
      background: 'linear-gradient(135deg, var(--muted, #f8fafc) 0%, var(--background, white) 100%)',
      cursor: 'pointer',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--primary, #6366f1)'
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border, #e5e7eb)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    >
      <div style={{ flex: '0 0 auto' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground, #6b7280)' }}>
          Fintutto Ökosystem
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground, #9ca3af)', marginTop: '0.125rem' }}>
          Alle Apps entdecken →
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1.25rem', marginLeft: 'auto' }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--muted-foreground, #9ca3af)', marginTop: '0.125rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (renderLink) {
    return renderLink({ to: linkTo, children: content, className: 'block no-underline text-inherit' })
  }

  return (
    <a href={linkTo} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      {content}
    </a>
  )
}
