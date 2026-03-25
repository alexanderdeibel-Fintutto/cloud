import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { getOtherApps } from '@fintutto/shared'

const ecosystemApps = getOtherApps('vermieter-portal')

const footerLinks = {
  rechner: [
    { name: 'Kautions-Rechner', href: '/rechner/kaution' },
    { name: 'Mieterhöhungs-Rechner', href: '/rechner/mieterhoehung' },
    { name: 'Kaufnebenkosten-Rechner', href: '/rechner/kaufnebenkosten' },
    { name: 'Eigenkapital-Rechner', href: '/rechner/eigenkapital' },
    { name: 'Rendite-Rechner', href: '/rechner/rendite' },
  ],
  formulare: [
    { name: 'Mietvertrag', href: '/formulare/mietvertrag' },
    { name: 'Übergabeprotokoll', href: '/formulare/uebergabeprotokoll' },
    { name: 'Mieterhöhung', href: '/formulare/mieterhoehung' },
    { name: 'Selbstauskunft', href: '/formulare/selbstauskunft' },
    { name: 'Betriebskosten', href: '/formulare/betriebskosten' },
  ],
  unternehmen: [
    { name: 'Alle Apps', href: '/apps' },
    { name: 'Über uns', href: '/ueber-uns' },
    { name: 'Preise', href: '/pricing' },
    { name: 'Kontakt', href: '/kontakt' },
  ],
  rechtliches: [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/datenschutz' },
    { name: 'AGB', href: '/agb' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-vermieter">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold gradient-text-vermieter">Fintutto</span>
                <span className="text-xs block text-muted-foreground -mt-1">Vermieter-Portal</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professionelle Tools für Vermieter. Rechtssicher und kostenfrei.
            </p>
          </div>

          {/* Rechner */}
          <div>
            <h3 className="font-semibold mb-3">Rechner</h3>
            <ul className="space-y-2">
              {footerLinks.rechner.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Formulare */}
          <div>
            <h3 className="font-semibold mb-3">Formulare</h3>
            <ul className="space-y-2">
              {footerLinks.formulare.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <h3 className="font-semibold mb-3">Unternehmen</h3>
            <ul className="space-y-2">
              {footerLinks.unternehmen.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="font-semibold mb-3">Rechtliches</h3>
            <ul className="space-y-2">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ecosystem */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Fintutto Oekosystem</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {ecosystemApps.map((app) => (
              <a
                key={app.key}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {app.icon} {app.name}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-4 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Fintutto. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-muted-foreground">
            Basierend auf deutschem Mietrecht. Keine Rechtsberatung.
          </p>
        </div>
      </div>
    </footer>
  )
}
