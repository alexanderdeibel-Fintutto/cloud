import { Link } from 'react-router-dom'
import { EcosystemFooter } from '@fintutto/shared'

export default function Footer() {
  return (
    <EcosystemFooter
      currentAppSlug="arbeitslos-portal"
      appName="Arbeitslos-Portal"
      appIcon="⚔️"
      appDescription="KI-Assistent gegen falsche Bescheide. Rechte kennen, Fehler finden, Widerspruch einlegen."
      columns={[
        {
          title: 'Hilfe',
          links: [
            { name: 'BescheidScan', href: '/scan' },
            { name: 'KI-Rechtsberater', href: '/chat' },
            { name: 'Dokumenten-Werkstatt', href: '/musterschreiben' },
            { name: 'AmtsRechner-Suite', href: '/rechner' },
            { name: 'Widerspruch-Tracker', href: '/tracker' },
            { name: 'FAQ', href: '/faq' },
            { name: 'Kontakt & Hilfe', href: '/kontakt' },
          ],
        },
        {
          title: 'Rechtsgebiete',
          links: [
            { name: 'Bürgergeld (SGB II)', href: '/musterschreiben?kategorie=sgb2' },
            { name: 'ALG I (SGB III)', href: '/musterschreiben?kategorie=sgb3' },
            { name: 'Kosten der Unterkunft', href: '/musterschreiben?kategorie=kdu' },
            { name: 'Widerspruch & Klage', href: '/musterschreiben?kategorie=sgb10' },
            { name: 'Wissen & Ratgeber', href: '/wissen' },
            { name: 'Glossar', href: '/glossar' },
          ],
        },
        {
          title: 'Konto',
          links: [
            { name: 'Mein Profil', href: '/profil' },
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Meine Dokumente', href: '/dokumente' },
            { name: 'Preise & Abos', href: '/preise' },
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
