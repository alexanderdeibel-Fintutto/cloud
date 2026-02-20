import { FINTUTTO_APPS, type FintuttoAppKey } from '../index'

/**
 * Returns HTML for a slim ecosystem navigation bar.
 * Can be injected into any app's layout (header/footer).
 * Framework-agnostic: returns plain data for rendering.
 */
export function getEcosystemBarItems(currentAppSlug: string) {
  return Object.entries(FINTUTTO_APPS)
    .filter(([_, app]) => app.slug !== currentAppSlug)
    .map(([key, app]) => ({
      key: key as FintuttoAppKey,
      name: app.name,
      icon: app.icon,
      url: app.url,
      description: app.description,
    }))
}

/**
 * Configuration for the EcosystemBar.
 * Use this in your React component:
 *
 * ```tsx
 * import { getEcosystemBarItems } from '@fintutto/shared'
 *
 * function EcosystemBar() {
 *   const apps = getEcosystemBarItems('vermietify')
 *   return (
 *     <div className="flex gap-2 overflow-x-auto py-2 px-4 bg-gray-50 border-b text-xs">
 *       <span className="text-gray-400 shrink-0">Fintutto:</span>
 *       {apps.map(app => (
 *         <a key={app.key} href={app.url} className="shrink-0 text-blue-600 hover:underline">
 *           {app.icon} {app.name}
 *         </a>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const ECOSYSTEM_BAR_STYLE = {
  container: 'flex gap-3 overflow-x-auto py-1.5 px-4 bg-slate-50 border-b text-xs items-center',
  label: 'text-slate-400 shrink-0 font-medium',
  link: 'shrink-0 text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap',
  activeLink: 'shrink-0 text-blue-600 font-semibold whitespace-nowrap',
} as const
