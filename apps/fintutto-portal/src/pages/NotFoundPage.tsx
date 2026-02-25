import { Link } from 'react-router-dom'
import { EcosystemNotFound, useDocumentTitle } from '@fintutto/shared'

export default function NotFoundPage() {
  useDocumentTitle('Seite nicht gefunden', 'Fintutto Portal')

  return (
    <EcosystemNotFound
      currentAppSlug="portal"
      homeHref="/"
      renderLink={({ to, children, style }) => <Link to={to} style={style}>{children}</Link>}
    />
  )
}
