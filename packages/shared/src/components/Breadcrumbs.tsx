interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Simple breadcrumb navigation.
 * Uses plain <a> tags so it works with any router.
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { label: 'Startseite', href: '/' },
 *     { label: 'Rechner', href: '/rechner' },
 *     { label: 'Kautions-Rechner' },
 *   ]} />
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={className}
      style={{ fontSize: '0.8125rem', color: '#6b7280' }}
    >
      <ol style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {i > 0 && <span aria-hidden="true" style={{ color: '#d1d5db' }}>/</span>}
            {item.href && i < items.length - 1 ? (
              <a href={item.href} style={{ color: '#6b7280', textDecoration: 'none' }}>
                {item.label}
              </a>
            ) : (
              <span style={{ color: '#111827', fontWeight: 500 }} aria-current={i === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
