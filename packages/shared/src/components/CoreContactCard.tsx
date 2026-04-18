/**
 * CoreContactCard — Zeigt einen Kontakt mit allen Details an
 *
 * Kann in allen Apps genutzt werden, um einen core_contact
 * mit seinen Rollen (Mieter, Kunde, etc.) anzuzeigen.
 *
 * Usage:
 *   <CoreContactCard
 *     contact={contact}
 *     onEdit={() => setEditOpen(true)}
 *     showRoles
 *   />
 */
import type { CoreContact } from '../hooks/useCoreContacts'

export interface CoreContactCardProps {
  contact: CoreContact & {
    display_name?: string
    street?: string | null
    house_number?: string | null
    postal_code?: string | null
    city?: string | null
    country?: string | null
    address_formatted?: string | null
    is_tenant?: boolean
    is_biz_client?: boolean
    document_count?: number
  }
  onEdit?: () => void
  onDelete?: () => void
  showRoles?: boolean
  compact?: boolean
  className?: string
}

export function CoreContactCard({
  contact,
  onEdit,
  onDelete,
  showRoles = false,
  compact = false,
  className = '',
}: CoreContactCardProps) {
  const displayName = contact.display_name ??
    (contact.contact_type === 'company'
      ? contact.company_name
      : [contact.first_name, contact.last_name].filter(Boolean).join(' '))

  const addressLine = contact.address_formatted ??
    [
      [contact.street, contact.house_number].filter(Boolean).join(' '),
      [contact.postal_code, contact.city].filter(Boolean).join(' '),
    ].filter(Boolean).join(', ')

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-lg">{contact.contact_type === 'company' ? '🏢' : '👤'}</span>
        <div className="min-w-0">
          <div className="truncate font-medium text-sm">{displayName}</div>
          {contact.email && (
            <div className="truncate text-xs text-muted-foreground">{contact.email}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border bg-card p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl">
            {contact.contact_type === 'company' ? '🏢' : '👤'}
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight">{displayName}</h3>
            {contact.contact_type === 'person' && contact.company_name && (
              <p className="text-sm text-muted-foreground">{contact.company_name}</p>
            )}
          </div>
        </div>
        {/* Aktionen */}
        {(onEdit || onDelete) && (
          <div className="flex gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Bearbeiten"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Löschen"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-3 space-y-1.5 text-sm">
        {contact.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a href={`mailto:${contact.email}`} className="hover:text-foreground truncate">
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            <a href={`tel:${contact.phone}`} className="hover:text-foreground">
              {contact.phone}
            </a>
          </div>
        )}
        {addressLine && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <svg className="h-3.5 w-3.5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{addressLine}</span>
          </div>
        )}
        {contact.iban && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span className="font-mono text-xs">{contact.iban}</span>
          </div>
        )}
      </div>

      {/* Rollen-Badges */}
      {showRoles && (contact.is_tenant || contact.is_biz_client) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {contact.is_tenant && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Mieter
            </span>
          )}
          {contact.is_biz_client && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Kunde
            </span>
          )}
          {(contact.document_count ?? 0) > 0 && (
            <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
              {contact.document_count} Dokument{contact.document_count !== 1 ? 'e' : ''}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {contact.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoreContactCard
