import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

export interface CommandItem {
  id: string
  title: string
  category: string
  path: string
  icon?: string
  keywords?: string[]
  external?: boolean
}

interface CommandPaletteProps {
  items: CommandItem[]
  onSelect: (item: CommandItem) => void
  placeholder?: string
}

function isMac() {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
}

/** Returns "⌘" on Mac, "Ctrl" elsewhere */
export function modKey() {
  return isMac() ? '\u2318' : 'Ctrl'
}

/**
 * Ctrl+K command palette for quick tool navigation.
 * Render this once in your app layout and provide navigation items.
 *
 * Usage:
 *   <CommandPalette
 *     items={[
 *       { id: 'kaution', title: 'Kautions-Rechner', category: 'Rechner', path: '/rechner/kaution' },
 *     ]}
 *     onSelect={(item) => navigate(item.path)}
 *   />
 */
export function CommandPalette({ items, onSelect, placeholder = 'Tool suchen...' }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Ctrl+K / Cmd+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Filter items
  const filtered = query.trim()
    ? items.filter((item) => {
        const q = query.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords?.some((k) => k.toLowerCase().includes(q))
        )
      })
    : items

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const flatList = Object.values(grouped).flat()

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && flatList[selectedIndex]) {
        e.preventDefault()
        onSelect(flatList[selectedIndex])
        setOpen(false)
      }
    },
    [flatList, selectedIndex, onSelect]
  )

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          margin: '0 1rem',
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          <svg style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af', marginRight: '0.75rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              backgroundColor: 'transparent',
            }}
          />
          <kbd
            style={{
              padding: '0.125rem 0.375rem',
              fontSize: '0.75rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.25rem',
              border: '1px solid #d1d5db',
              color: '#6b7280',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: '320px', overflowY: 'auto', padding: '0.5rem 0' }}>
          {flatList.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
              Kein Tool gefunden
            </div>
          ) : (
            Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category}>
                <div
                  style={{
                    padding: '0.375rem 1rem',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#9ca3af',
                  }}
                >
                  {category}
                </div>
                {categoryItems.map((item) => {
                  const idx = flatList.indexOf(item)
                  const isSelected = idx === selectedIndex
                  return (
                    <div
                      key={item.id}
                      data-index={idx}
                      onClick={() => {
                        onSelect(item)
                        setOpen(false)
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
                        fontSize: '0.875rem',
                      }}
                    >
                      {item.icon && <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>}
                      <span style={{ fontWeight: isSelected ? 600 : 400, flex: 1 }}>{item.title}</span>
                      {item.external && (
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg style={{ width: '0.75rem', height: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: '0.5rem 1rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '1rem',
            fontSize: '0.7rem',
            color: '#9ca3af',
          }}
        >
          <span>
            <kbd style={{ padding: '0 0.25rem', backgroundColor: '#f3f4f6', borderRadius: '0.2rem', border: '1px solid #d1d5db' }}>&uarr;</kbd>
            <kbd style={{ padding: '0 0.25rem', backgroundColor: '#f3f4f6', borderRadius: '0.2rem', border: '1px solid #d1d5db', marginLeft: '0.125rem' }}>&darr;</kbd>
            {' '}Navigieren
          </span>
          <span>
            <kbd style={{ padding: '0 0.25rem', backgroundColor: '#f3f4f6', borderRadius: '0.2rem', border: '1px solid #d1d5db' }}>&crarr;</kbd>
            {' '}Oeffnen
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Predefined tool lists for each app ────────────────────────

export const PORTAL_TOOLS: CommandItem[] = [
  // Rechner
  { id: 'r-kaution', title: 'Kautions-Rechner', category: 'Rechner', path: '/rechner/kaution', icon: '\uD83D\uDCB0', keywords: ['kaution', 'deposit'] },
  { id: 'r-mieterhoehung', title: 'Mieterhoehungs-Rechner', category: 'Rechner', path: '/rechner/mieterhoehung', icon: '\uD83D\uDCC8', keywords: ['miete', 'erhoehung'] },
  { id: 'r-kaufnebenkosten', title: 'Kaufnebenkosten-Rechner', category: 'Rechner', path: '/rechner/kaufnebenkosten', icon: '\uD83C\uDFE0', keywords: ['kauf', 'nebenkosten', 'grunderwerbsteuer'] },
  { id: 'r-eigenkapital', title: 'Eigenkapital-Rechner', category: 'Rechner', path: '/rechner/eigenkapital', icon: '\uD83D\uDCB3', keywords: ['eigenkapital', 'finanzierung'] },
  { id: 'r-grundsteuer', title: 'Grundsteuer-Rechner', category: 'Rechner', path: '/rechner/grundsteuer', icon: '\uD83C\uDFDB\uFE0F', keywords: ['steuer', 'grundsteuer'] },
  { id: 'r-rendite', title: 'Rendite-Rechner', category: 'Rechner', path: '/rechner/rendite', icon: '\uD83D\uDCCA', keywords: ['rendite', 'roi', 'ertrag'] },
  { id: 'r-nebenkosten', title: 'Nebenkosten-Rechner', category: 'Rechner', path: '/rechner/nebenkosten', icon: '\uD83D\uDCDD', keywords: ['nebenkosten', 'betriebskosten'] },

  // Formulare
  { id: 'f-mietvertrag', title: 'Mietvertrag erstellen', category: 'Formulare', path: '/formulare/mietvertrag', icon: '\uD83D\uDCDC', keywords: ['vertrag', 'miete'] },
  { id: 'f-uebergabe', title: 'Uebergabeprotokoll', category: 'Formulare', path: '/formulare/uebergabeprotokoll', icon: '\uD83D\uDD11', keywords: ['uebergabe', 'protokoll', 'wohnung'] },
  { id: 'f-mieterhoehung', title: 'Mieterhoehung', category: 'Formulare', path: '/formulare/mieterhoehung', icon: '\uD83D\uDCC8', keywords: ['miete', 'erhoehung', 'schreiben'] },
  { id: 'f-selbstauskunft', title: 'Selbstauskunft', category: 'Formulare', path: '/formulare/selbstauskunft', icon: '\uD83D\uDCCB', keywords: ['mieter', 'auskunft', 'bewerbung'] },
  { id: 'f-betriebskosten', title: 'Betriebskostenabrechnung', category: 'Formulare', path: '/formulare/betriebskosten', icon: '\uD83E\uDDFE', keywords: ['betriebskosten', 'abrechnung', 'nebenkosten'] },
  { id: 'f-kuendigung', title: 'Kuendigung', category: 'Formulare', path: '/formulare/kuendigung', icon: '\u2709\uFE0F', keywords: ['kuendigung', 'mietvertrag'] },
  { id: 'f-mahnung', title: 'Mahnung', category: 'Formulare', path: '/formulare/mahnung', icon: '\u26A0\uFE0F', keywords: ['mahnung', 'zahlung'] },
  { id: 'f-mietbescheinigung', title: 'Mietbescheinigung', category: 'Formulare', path: '/formulare/mietbescheinigung', icon: '\uD83D\uDCC4', keywords: ['bescheinigung', 'nachweis'] },
  { id: 'f-wohnungsgeber', title: 'Wohnungsgeberbestaetigung', category: 'Formulare', path: '/formulare/wohnungsgeberbestaetigung', icon: '\uD83C\uDFE2', keywords: ['wohnungsgeber', 'bestaetigung', 'anmeldung'] },
  { id: 'f-nkv', title: 'Nebenkostenvorauszahlung', category: 'Formulare', path: '/formulare/nebenkostenvorauszahlung', icon: '\uD83D\uDCB6', keywords: ['nebenkosten', 'vorauszahlung'] },
]

export const CHECKER_TOOLS: CommandItem[] = [
  { id: 'c-mietpreisbremse', title: 'Mietpreisbremse-Checker', category: 'Checker', path: '/checker/mietpreisbremse', icon: '\uD83D\uDCB6', keywords: ['miete', 'preis', 'bremse'] },
  { id: 'c-mieterhoehung', title: 'Mieterhoehungs-Checker', category: 'Checker', path: '/checker/mieterhoehung', icon: '\uD83D\uDCC8', keywords: ['miete', 'erhoehung'] },
  { id: 'c-nebenkosten', title: 'Nebenkosten-Checker', category: 'Checker', path: '/checker/nebenkosten', icon: '\uD83D\uDCDD', keywords: ['nebenkosten'] },
  { id: 'c-betriebskosten', title: 'Betriebskosten-Checker', category: 'Checker', path: '/checker/betriebskosten', icon: '\uD83E\uDDFE', keywords: ['betriebskosten'] },
  { id: 'c-kuendigung', title: 'Kuendigungs-Checker', category: 'Checker', path: '/checker/kuendigung', icon: '\u2709\uFE0F', keywords: ['kuendigung'] },
  { id: 'c-kaution', title: 'Kautions-Checker', category: 'Checker', path: '/checker/kaution', icon: '\uD83D\uDCB0', keywords: ['kaution', 'deposit'] },
  { id: 'c-mietminderung', title: 'Mietminderungs-Checker', category: 'Checker', path: '/checker/mietminderung', icon: '\uD83D\uDD27', keywords: ['mietminderung', 'mangel'] },
  { id: 'c-eigenbedarf', title: 'Eigenbedarf-Checker', category: 'Checker', path: '/checker/eigenbedarf', icon: '\uD83C\uDFE0', keywords: ['eigenbedarf'] },
  { id: 'c-modernisierung', title: 'Modernisierungs-Checker', category: 'Checker', path: '/checker/modernisierung', icon: '\uD83D\uDD28', keywords: ['modernisierung'] },
  { id: 'c-schoenheit', title: 'Schoenheitsreparaturen-Checker', category: 'Checker', path: '/checker/schoenheitsreparaturen', icon: '\uD83C\uDFA8', keywords: ['schoenheit', 'renovierung'] },
]

export const ECOSYSTEM_TOOLS: CommandItem[] = [
  { id: 'e-vermietify', title: 'Vermietify', category: 'Ökosystem', path: 'https://vermietify.vercel.app', icon: '🏠', keywords: ['immobilien', 'verwaltung', 'vermieter'], external: true },
  { id: 'e-ablesung', title: 'Ablesung', category: 'Ökosystem', path: 'https://ablesung.vercel.app', icon: '📊', keywords: ['zähler', 'strom', 'gas', 'wasser'], external: true },
  { id: 'e-hausmeister', title: 'HausmeisterPro', category: 'Ökosystem', path: 'https://hausmeister-pro.vercel.app', icon: '🔧', keywords: ['hausmeister', 'facility'], external: true },
  { id: 'e-mieter', title: 'Mieter-App', category: 'Ökosystem', path: 'https://mieter-kw8d.vercel.app', icon: '🏡', keywords: ['mieter', 'mängel', 'wohnung'], external: true },
  { id: 'e-bescheidboxer', title: 'BescheidBoxer', category: 'Ökosystem', path: 'https://bescheidboxer.vercel.app', icon: '📋', keywords: ['bescheid', 'steuer', 'widerspruch'], external: true },
  { id: 'e-portal', title: 'Fintutto Portal', category: 'Ökosystem', path: 'https://portal.fintutto.cloud', icon: '🧮', keywords: ['rechner', 'checker', 'formulare'], external: true },
  { id: 'e-financial', title: 'Financial Compass', category: 'Ökosystem', path: 'https://fintutto-your-financial-compass.vercel.app', icon: '🧭', keywords: ['finanzen', 'buchhaltung', 'steuer'], external: true },
  { id: 'e-admin', title: 'Admin-Hub', category: 'Ökosystem', path: 'https://fintutto-admin-hub.vercel.app', icon: '⚙️', keywords: ['admin', 'verwaltung'], external: true },
  { id: 'e-translator', title: 'Übersetzer', category: 'Ökosystem', path: 'https://translator-fintutto.vercel.app', icon: '🌐', keywords: ['übersetzer', 'sprachen', 'translator'], external: true },
  { id: 'e-pflanzen', title: 'Pflanzen-Manager', category: 'Ökosystem', path: 'https://zimmerpflanze.vercel.app', icon: '🌱', keywords: ['pflanzen', 'gießen', 'zimmerpflanze'], external: true },
  { id: 'e-fitness', title: 'Personaltrainer', category: 'Ökosystem', path: 'https://personaltrainer-murex.vercel.app', icon: '💪', keywords: ['fitness', 'training', 'sport'], external: true },
  { id: 'e-luggage', title: 'LuggageX', category: 'Ökosystem', path: 'https://luggagex-fintutto.vercel.app', icon: '🧳', keywords: ['gepäck', 'reise', 'koffer'], external: true },
  { id: 'e-guide', title: 'GuideTranslator', category: 'Ökosystem', path: 'https://app.guidetranslator.com', icon: '🚢', keywords: ['kreuzfahrt', 'guide', 'übersetzer'], external: true },
]
