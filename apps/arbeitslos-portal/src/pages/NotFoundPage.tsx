import { Link } from 'react-router-dom'
import { EcosystemNotFound } from '@fintutto/shared'

export default function NotFoundPage() {
  return (
    <EcosystemNotFound
      currentAppSlug="arbeitslos-portal"
      homeHref="/"
      renderLink={({ to, children, style }) => (
        <Link to={to} style={style}>{children}</Link>
      )}
    />
  )
}
