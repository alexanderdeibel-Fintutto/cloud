import { Link } from 'react-router-dom'
import { EcosystemFooter } from '@fintutto/shared'

export default function Footer() {
  return (
    <EcosystemFooter
      currentAppSlug="mieter-checker"
      appName="Mieter-Checker"
      appIcon="✅"
      appDescription="Professionelle Tools für Mieter & Vermieter. Rechtssicher, einfach, digital."
      columns={[
        {
          title: 'Checker',
          links: [
            { name: 'Mietpreisbremse', href: '/checker/mietpreisbremse' },
            { name: 'Mieterhöhung', href: '/checker/mieterhoehung' },
            { name: 'Nebenkosten', href: '/checker/nebenkosten' },
            { name: 'Kündigung', href: '/checker/kuendigung' },
            { name: 'Kaution', href: '/checker/kaution' },
          ],
        },
        {
          title: 'Rechner',
          links: [
            { name: 'Kautions-Rechner', href: '/rechner/kaution' },
            { name: 'Mieterhöhungs-Rechner', href: '/rechner/mieterhoehung' },
            { name: 'Kaufnebenkosten-Rechner', href: '/rechner/kaufnebenkosten' },
            { name: 'Rendite-Rechner', href: '/rechner/rendite' },
            { name: 'Grundsteuer-Rechner', href: '/rechner/grundsteuer' },
          ],
        },
        {
          title: 'Formulare',
          links: [
            { name: 'Mietvertrag', href: '/formulare/mietvertrag' },
            { name: 'Übergabeprotokoll', href: '/formulare/uebergabeprotokoll' },
            { name: 'Betriebskosten', href: '/formulare/betriebskosten' },
            { name: 'Selbstauskunft', href: '/formulare/selbstauskunft' },
            { name: 'Mieterhöhung', href: '/formulare/mieterhoehung' },
          ],
        },
        {
          title: 'Rechtliches',
          links: [
            { name: 'Impressum', href: '/impressum' },
            { name: 'Datenschutz', href: '/datenschutz' },
            { name: 'AGB', href: '/agb' },
            { name: 'Über uns', href: '/ueber-uns' },
          ],
        },
      ]}
      renderLink={({ to, children, className }) => (
        <Link to={to} className={className}>{children}</Link>
      )}
    />
  )
}
