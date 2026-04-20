import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Upload,
  MessageSquare,
  Search,
  Settings,
  Brain,
  FolderOpen,
  Star,
  Clock,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useOcrUsage } from '@/hooks/useOcrUsage'

const mainNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dokumente', icon: FileText, label: 'Dokumente' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/chat', icon: MessageSquare, label: 'KI-Chat' },
  { to: '/suche', icon: Search, label: 'Suche' },
]

const secondaryNav = [
  { to: '/sammlungen', icon: FolderOpen, label: 'Sammlungen' },
  { to: '/favoriten', icon: Star, label: 'Favoriten' },
  { to: '/verlauf', icon: Clock, label: 'Verlauf' },
]

export default function Sidebar() {
  const { tierSupportsOcr, ocrLimit, ocrUsed, ocrRemaining, isLoading } = useOcrUsage()

  const usagePercent = ocrLimit > 0 ? Math.min(100, Math.round((ocrUsed / ocrLimit) * 100)) : 0
  const isNearLimit = ocrLimit > 0 && ocrRemaining <= 10 && ocrRemaining > 0
  const isAtLimit = ocrLimit > 0 && ocrRemaining === 0

  return (
    <aside className="sidebar hidden lg:flex flex-col w-64 border-r border-border bg-card/50 h-[calc(100vh-3.5rem)] sticky top-14 no-print">
      {/* Brand */}
      <div className="p-4">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">SecondBrain</h2>
            <p className="text-[10px] text-muted-foreground">Wissensmanagement</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Hauptmenü
        </p>
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn('sidebar-item', isActive && 'sidebar-item-active')
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}

        <Separator className="my-3" />

        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Bibliothek
        </p>
        {secondaryNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('sidebar-item', isActive && 'sidebar-item-active')
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* OCR-Kontingent Widget */}
      {!isLoading && (
        <div className="px-3 pb-2">
          {tierSupportsOcr && ocrLimit > 0 ? (
            // Pro-Nutzer: Kontingent-Anzeige
            <div className={cn(
              'p-3 rounded-lg border',
              isAtLimit
                ? 'border-destructive/30 bg-destructive/5'
                : isNearLimit
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-border bg-muted/30'
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Brain className={cn(
                    'w-3.5 h-3.5',
                    isAtLimit ? 'text-destructive' : isNearLimit ? 'text-amber-500' : 'text-primary'
                  )} />
                  <span className="text-[11px] font-medium text-foreground">OCR-Kontingent</span>
                </div>
                <span className={cn(
                  'text-[10px] font-mono',
                  isAtLimit ? 'text-destructive' : isNearLimit ? 'text-amber-500' : 'text-muted-foreground'
                )}>
                  {ocrUsed}/{ocrLimit}
                </span>
              </div>
              {/* Fortschrittsbalken */}
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-amber-500' : 'bg-primary'
                  )}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className={cn(
                'text-[10px] mt-1.5',
                isAtLimit ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {isAtLimit
                  ? 'Kontingent erschöpft — erneuert sich am 1.'
                  : `${ocrRemaining} Seiten verbleibend diesen Monat`}
              </p>
            </div>
          ) : !tierSupportsOcr ? (
            // Free-Nutzer: Upgrade-Hinweis
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-medium text-foreground">SecondBrain Pro</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2 leading-relaxed">
                100 OCR-Seiten/Monat, Volltextsuche & KI-Zusammenfassungen
              </p>
              <a
                href="/pricing"
                className="block text-center text-[11px] font-medium text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 rounded-md py-1.5 transition-colors"
              >
                Upgrade für €9.99/Monat →
              </a>
            </div>
          ) : null}
        </div>
      )}

      {/* Bottom */}
      <div className="p-3 border-t border-border">
        <NavLink
          to="/einstellungen"
          className={({ isActive }) =>
            cn('sidebar-item', isActive && 'sidebar-item-active')
          }
        >
          <Settings className="w-4 h-4" />
          Einstellungen
        </NavLink>
      </div>
    </aside>
  )
}
