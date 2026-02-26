import { ExternalLink, X } from 'lucide-react';
import { useState } from 'react';
import { FINTUTTO_APPS, buildCrossMarketingLink, type FintuttoApp } from '@/lib/referral';

interface EcosystemBannerProps {
  variant?: 'inline' | 'bar';
  maxApps?: number;
}

export function EcosystemBanner({ variant = 'inline', maxApps = 3 }: EcosystemBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('pm_ecosystem_dismissed') === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const apps = FINTUTTO_APPS.slice(0, maxApps);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem('pm_ecosystem_dismissed', '1'); } catch {}
  };

  if (variant === 'bar') {
    return (
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="font-medium whitespace-nowrap">Fintutto Apps:</span>
          {FINTUTTO_APPS.map(app => (
            <a
              key={app.key}
              href={buildCrossMarketingLink(app.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 whitespace-nowrap hover:underline opacity-90 hover:opacity-100"
            >
              <span>{app.icon}</span>
              <span>{app.name}</span>
            </a>
          ))}
        </div>
        <button onClick={dismiss} className="ml-2 opacity-60 hover:opacity-100 shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Inline card variant
  return (
    <div className="rounded-lg border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
          Weitere Fintutto Apps
        </p>
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {apps.map(app => (
          <a
            key={app.key}
            href={buildCrossMarketingLink(app.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-xs font-medium hover:shadow-sm hover:border-green-400 transition-all"
          >
            <span>{app.icon}</span>
            <span>{app.name}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        ))}
      </div>
    </div>
  );
}

// Smaller inline CTA for specific contexts
export function EcosystemCTA({ app, text }: { app: FintuttoApp; text?: string }) {
  return (
    <a
      href={buildCrossMarketingLink(app.url)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 rounded-lg border hover:shadow-sm hover:border-primary/30 transition-all group"
    >
      <span className="text-xl">{app.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium group-hover:text-primary transition-colors">{app.name}</p>
        <p className="text-xs text-muted-foreground truncate">{text || app.description}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
    </a>
  );
}
