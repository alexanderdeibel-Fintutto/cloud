import { getEcosystemBarGrouped, AppSwitcher, APP_CATEGORIES } from '@fintutto/shared'

const groups = getEcosystemBarGrouped('mieter-checker')

export default function EcosystemBar() {
  return (
    <div className="flex gap-2 overflow-x-auto py-1.5 px-4 bg-slate-50 border-b text-xs items-center">
      <AppSwitcher currentAppSlug="mieter-checker" />
      {groups.map((group) => (
        <div key={group.category} className="flex gap-2 items-center shrink-0">
          <span className="text-slate-200">|</span>
          <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
            {APP_CATEGORIES[group.category]}
          </span>
          {group.apps.map((app) => (
            <a
              key={app.key}
              href={app.url}
              className="shrink-0 text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap"
              target={app.url.startsWith('/') ? undefined : '_blank'}
              rel={app.url.startsWith('/') ? undefined : 'noopener noreferrer'}
              title={app.description}
            >
              {app.icon} {app.name}
            </a>
          ))}
        </div>
      ))}
    </div>
  )
}
