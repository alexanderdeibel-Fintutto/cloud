import { Link } from 'react-router-dom'
import { EcosystemFooter } from '@fintutto/shared'

export default function Footer() {
  return (
    <EcosystemFooter
      currentAppSlug="vermieter-portal"
      appName="Vermieter-Portal"
      appIcon="🏢"
      appDescription="Professionelle Tools für Vermieter. Rechtssicher und kostenfrei."
      columns={[
        {
          title: 'Rechner',
          links: [
            { name: 'Kautions-Rechner', href: '/rechner/kaution' },
            { name: 'Mieterhöhungs-Rechner', href: '/rechner/mieterhoehung' },
            { name: 'Kaufnebenkosten-Rechner', href: '/rechner/kaufnebenkosten' },
            { name: 'Eigenkapital-Rechner', href: '/rechner/eigenkapital' },
            { name: 'Rendite-Rechner', href: '/rechner/rendite' },
          ],
        },
        {
          title: 'Formulare',
          links: [
            { name: 'Mietvertrag', href: '/formulare/mietvertrag' },
            { name: 'Übergabeprotokoll', href: '/formulare/uebergabeprotokoll' },
            { name: 'Mieterhöhung', href: '/formulare/mieterhoehung' },
            { name: 'Selbstauskunft', href: '/formulare/selbstauskunft' },
            { name: 'Betriebskosten', href: '/formulare/betriebskosten' },
          ],
        },
        {
          title: 'Unternehmen',
          links: [
            { name: 'Alle Apps', href: '/apps' },
            { name: 'Über uns', href: '/ueber-uns' },
            { name: 'Preise', href: '/pricing' },
            { name: 'Kontakt', href: '/kontakt' },
          ],
        },
        {
          title: 'Rechtliches',
          links: [
            { name: 'Impressum', href: '/impressum' },
            { name: 'Datenschutz', href: '/datenschutz' },
            { name: 'AGB', href: '/agb' },
          ],
        },
      ]}
      renderLink={({ to, children, className }) => (
        <Link to={to} className={className}>{children}</Link>
      )}
    />
  )
}
