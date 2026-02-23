import { getEcosystemBarItems } from '@fintutto/shared'

const apps = getEcosystemBarItems('portal')

export default function EcosystemBar() {
  return (
    <div className="flex gap-3 overflow-x-auto py-1.5 px-4 bg-slate-50 border-b text-xs items-center">
      <span className="text-slate-400 shrink-0 font-medium">Fintutto</span>
      {apps.map((app) => (
        <a
          key={app.key}
          href={app.url}
          className="shrink-0 text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap"
          target="_blank"
          rel="noopener noreferrer"
        >
          {app.icon} {app.name}
        </a>
      ))}
    </div>
  )
}
