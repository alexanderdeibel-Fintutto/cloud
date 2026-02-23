import { getEcosystemBarGrouped } from '@fintutto/shared'

const groups = getEcosystemBarGrouped('mieter-checker')

export default function EcosystemBar() {
  return (
    <div className="flex gap-2 overflow-x-auto py-1.5 px-4 bg-slate-50 border-b text-xs items-center">
      <span className="text-slate-400 shrink-0 font-medium">Fintutto</span>
      {groups.map((group, gi) => (
        <div key={group.category} className="flex gap-2 items-center shrink-0">
          {gi > 0 && <span className="text-slate-200">|</span>}
          {group.apps.map((app) => (
            <a
              key={app.key}
              href={app.url}
              className="shrink-0 text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap"
              target="_blank"
              rel="noopener noreferrer"
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
