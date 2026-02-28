import { FINTUTTO_APPS, APP_CATEGORIES, type AppCategory } from '../index'

interface Recommendation {
  name: string
  icon: string
  url: string
  description: string
  reason: string
}

const APP_RECOMMENDATIONS: Record<string, string[]> = {
  // Rechner pages → suggest property management & meter reading
  '/rechner/kaution': ['vermietify', 'mieter', 'translator'],
  '/rechner/mieterhoehung': ['vermietify', 'bescheidboxer', 'translator'],
  '/rechner/kaufnebenkosten': ['vermietify', 'financialCompass', 'translator'],
  '/rechner/eigenkapital': ['financialCompass', 'vermietify', 'translator'],
  '/rechner/grundsteuer': ['bescheidboxer', 'financialCompass', 'translator'],
  '/rechner/rendite': ['vermietify', 'financialCompass', 'translator'],
  '/rechner/nebenkosten': ['ablesung', 'bescheidboxer', 'translator'],
  // Checker pages → suggest related tools
  '/checker/mietpreisbremse': ['mieter', 'bescheidboxer', 'translator'],
  '/checker/nebenkosten': ['ablesung', 'bescheidboxer', 'translator'],
  '/checker/betriebskosten': ['ablesung', 'vermietify', 'translator'],
  '/checker/kuendigung': ['mieter', 'bescheidboxer', 'translator'],
  '/checker/kaution': ['mieter', 'vermietify', 'translator'],
  // Formulare pages → suggest property management
  '/formulare/mietvertrag': ['vermietify', 'mieter', 'translator'],
  '/formulare/betriebskosten': ['ablesung', 'vermietify', 'translator'],
  // Translator page → suggest complementary apps
  '/uebersetzer': ['portal', 'bescheidboxer', 'mieter'],
  '/translator': ['portal', 'bescheidboxer', 'mieter'],
  // Fallback by section
  '/rechner': ['vermietify', 'financialCompass', 'translator'],
  '/checker': ['mieter', 'bescheidboxer', 'translator'],
  '/formulare': ['vermietify', 'mieter', 'translator'],
}

const REASONS: Record<string, string> = {
  vermietify: 'Gebäude & Mieter zentral verwalten',
  ablesung: 'Zählerstände digital erfassen',
  mieter: 'Mieterrechte prüfen & Mängel melden',
  bescheidboxer: 'Bescheide auf Fehler prüfen',
  financialCompass: 'Einnahmen & Ausgaben im Blick',
  hausmeisterPro: 'Aufgaben & Belege verwalten',
  adminHub: 'Alle Apps zentral steuern',
  portal: 'Rechner, Checker & Formulare',
  translator: 'Kostenlos uebersetzen in 22 Sprachen mit Spracheingabe & TTS',
  pflanzenManager: 'Zimmerpflanzen-Pflege tracken',
  personaltrainer: 'Trainingspläne erstellen',
  luggageX: 'Reisegepäck organisieren',
}

function getRecommendations(currentPath: string, currentAppSlug: string, max = 3): Recommendation[] {
  // Find matching recommendations, trying exact path first, then prefix
  let appKeys: string[] = []

  if (APP_RECOMMENDATIONS[currentPath]) {
    appKeys = APP_RECOMMENDATIONS[currentPath]
  } else {
    // Try prefix match
    const prefix = Object.keys(APP_RECOMMENDATIONS)
      .filter(p => currentPath.startsWith(p))
      .sort((a, b) => b.length - a.length)[0]
    if (prefix) appKeys = APP_RECOMMENDATIONS[prefix]
  }

  if (!appKeys.length) return []

  return appKeys
    .filter(key => {
      const app = FINTUTTO_APPS[key as keyof typeof FINTUTTO_APPS]
      return app && app.slug !== currentAppSlug
    })
    .slice(0, max)
    .map(key => {
      const app = FINTUTTO_APPS[key as keyof typeof FINTUTTO_APPS]
      return {
        name: app.name,
        icon: app.icon,
        url: app.url,
        description: app.description,
        reason: REASONS[key] || app.description,
      }
    })
}

interface CrossAppRecommendationsProps {
  currentPath: string
  currentAppSlug: string
  max?: number
}

export function CrossAppRecommendations({ currentPath, currentAppSlug, max = 3 }: CrossAppRecommendationsProps) {
  const recommendations = getRecommendations(currentPath, currentAppSlug, max)

  if (recommendations.length === 0) return null

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.25rem',
      borderRadius: '0.75rem',
      border: '1px solid var(--border, #e5e7eb)',
      backgroundColor: 'var(--muted, #f9fafb)',
    }}>
      <p style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--muted-foreground, #6b7280)',
        marginBottom: '0.75rem',
      }}>
        Passende Fintutto-Apps
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recommendations.map((rec) => (
          <a
            key={rec.url}
            href={rec.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--background, white)',
              border: '1px solid var(--border, #e5e7eb)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary, #6366f1)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border, #e5e7eb)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{rec.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{rec.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground, #6b7280)' }}>
                {rec.reason}
              </div>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground, #9ca3af)', flexShrink: 0 }}>→</span>
          </a>
        ))}
      </div>
    </div>
  )
}
