import { Link } from 'react-router-dom'
import { EcosystemNotFound, useDocumentTitle } from '@fintutto/shared'

export default function NotFoundPage() {
  useDocumentTitle('Seite nicht gefunden', 'Fintutto Vermieter')

  return (
    <EcosystemNotFound
      currentAppSlug="vermieter-portal"
      homeHref="/"
      renderLink={({ to, children, style }) => <Link to={to} style={style}>{children}</Link>}
    />
  )
}
