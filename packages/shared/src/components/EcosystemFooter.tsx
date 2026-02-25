import { useState } from 'react'
import { getOtherApps } from '../index'

interface EcosystemFooterProps {
  currentAppSlug: string
  appName: string
  appIcon: string
  appDescription: string
  /** Extra link columns to show before the ecosystem section */
  columns?: Array<{
    title: string
    links: Array<{ name: string; href: string; external?: boolean }>
  }>
  /** Render a router Link for internal navigation */
  renderLink?: (props: { to: string; children: React.ReactNode; className: string }) => React.ReactNode
}

export function EcosystemFooter({
  currentAppSlug,
  appName,
  appIcon,
  appDescription,
  columns = [],
  renderLink,
}: EcosystemFooterProps) {
  const ecosystemApps = getOtherApps(currentAppSlug)

  const linkEl = (href: string, children: React.ReactNode, className: string, external?: boolean) => {
    if (external || href.startsWith('http')) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
    }
    if (renderLink) {
      return renderLink({ to: href, children, className })
    }
    return <a href={href} className={className}>{children}</a>
  }

  return (
    <footer style={{ borderTop: '1px solid var(--border, #e5e7eb)', background: 'var(--muted, #f9fafb)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        {/* App branding + optional columns */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(columns.length + 2, 5)}, 1fr)`, gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{appIcon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{appName}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground, #6b7280)', lineHeight: 1.5 }}>{appDescription}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>{col.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {col.links.map((link) => (
                  <li key={link.name}>
                    {linkEl(
                      link.href,
                      link.name,
                      '',
                      link.external,
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Fintutto</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>{linkEl('/apps', 'Alle Apps', '')}</li>
            </ul>
          </div>
        </div>

        {/* Ecosystem bar */}
        <div style={{ borderTop: '1px solid var(--border, #e5e7eb)', paddingTop: '1rem', marginTop: '1rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--muted-foreground, #6b7280)', marginBottom: '0.5rem' }}>
            Fintutto Ökosystem
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            {ecosystemApps.map((app) => (
              <a
                key={app.slug}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.8rem', color: 'var(--muted-foreground, #6b7280)', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                {app.icon} {app.name}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid var(--border, #e5e7eb)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground, #6b7280)' }}>
            &copy; {new Date().getFullYear()} Fintutto. Alle Rechte vorbehalten.
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground, #6b7280)' }}>
            Ein Produkt des Fintutto-Ökosystems
          </p>
        </div>
      </div>
    </footer>
  )
}
