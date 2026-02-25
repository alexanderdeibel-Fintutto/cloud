import { FINTUTTO_APPS, AppsDirectory } from '@fintutto/shared'

const apps = Object.values(FINTUTTO_APPS)

export default function AppsPage() {
  return <AppsDirectory apps={apps} currentAppSlug="ablesung" />
}
