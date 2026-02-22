import { FINTUTTO_APPS, APP_CATEGORIES, type FintuttoAppKey, type AppCategory } from '../index'

/**
 * Returns a flat list of ecosystem apps for navigation (excluding current app).
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
      category: app.category,
    }))
}

/**
 * Returns ecosystem apps grouped by category (excluding current app).
 */
export function getEcosystemBarGrouped(currentAppSlug: string) {
  const items = getEcosystemBarItems(currentAppSlug)
  const groups: { category: AppCategory; label: string; apps: typeof items }[] = []

  for (const [key, label] of Object.entries(APP_CATEGORIES)) {
    const categoryApps = items.filter((app) => app.category === key)
    if (categoryApps.length > 0) {
      groups.push({ category: key as AppCategory, label, apps: categoryApps })
    }
  }

  return groups
}

/**
 * Configuration for the EcosystemBar.
 */
export const ECOSYSTEM_BAR_STYLE = {
  container: 'flex gap-3 overflow-x-auto py-1.5 px-4 bg-slate-50 border-b text-xs items-center',
  label: 'text-slate-400 shrink-0 font-medium',
  link: 'shrink-0 text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap',
  activeLink: 'shrink-0 text-blue-600 font-semibold whitespace-nowrap',
  separator: 'text-slate-200 shrink-0',
  categoryLabel: 'text-slate-300 shrink-0 font-medium uppercase tracking-wider',
} as const
