import { Link } from 'react-router-dom'
 claude/improve-app-integration-k7JF2
import { getOtherApps } from '@fintutto/shared'

const ecosystemApps = getOtherApps('mieter-checker')

import { Sparkles } from 'lucide-react'
// import { NewsletterSignup } from '@/components/monetization'
 main

const footerLinks = {
  rechner: [
    { name: 'Kautions-Rechner', href: '/rechner/kaution' },
    { name: 'Mieterhöhungs-Rechner', href: '/rechner/mieterhoehung' },
    { name: 'Kaufnebenkosten-Rechner', href: '/rechner/kaufnebenkosten' },
    { name: 'Rendite-Rechner', href: '/rechner/rendite' },
    { name: 'Grundsteuer-Rechner', href: '/rechner/grundsteuer' },
  ],
  checker: [
    { name: 'Mietpreisbremse', href: '/checker/mietpreisbremse' },
    { name: 'Mieterhöhung', href: '/checker/mieterhoehung' },
    { name: 'Nebenkosten', href: '/checker/nebenkosten' },
    { name: 'Kündigung', href: '/checker/kuendigung' },
    { name: 'Kaution', href: '/checker/kaution' },
  ],
  formulare: [
    { name: 'Mietvertrag', href: '/formulare/mietvertrag' },
    { name: 'Übergabeprotokoll', href: '/formulare/uebergabeprotokoll' },
    { name: 'Betriebskosten', href: '/formulare/betriebskosten' },
    { name: 'Selbstauskunft', href: '/formulare/selbstauskunft' },
    { name: 'Mieterhöhung', href: '/formulare/mieterhoehung' },
  ],
  oekosystem: [
    { name: 'Alle Apps', href: '/apps' },
    { name: 'Referral-Programm', href: '/referral' },
    { name: 'Preise', href: '/preise' },
  ],
  rechtliches: [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/datenschutz' },
    { name: 'AGB', href: '/agb' },
    { name: 'Über uns', href: '/ueber-uns' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-portal">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold gradient-text-portal">Fintutto</span>
                <span className="text-xs block text-muted-foreground -mt-1">Portal</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professionelle Tools für Mieter & Vermieter. Rechtssicher, einfach, digital.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Rechner</h3>
            <ul className="space-y-2">
              {footerLinks.rechner.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Checker</h3>
            <ul className="space-y-2">
              {footerLinks.checker.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Formulare</h3>
            <ul className="space-y-2">
              {footerLinks.formulare.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Ökosystem</h3>
            <ul className="space-y-2">
              {footerLinks.oekosystem.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Rechtliches</h3>
            <ul className="space-y-2">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

 claude/improve-app-integration-k7JF2
        {/* Ecosystem */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-xs text-gray-500 mb-3">Fintutto Oekosystem</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {ecosystemApps.map((app) => (
              <a
                key={app.key}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-fintutto-accent"
              >
                {app.icon} {app.name}
              </a>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              {currentYear} Fintutto. Alle Rechte vorbehalten.
            </p>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            {new Date().getFullYear()} Fintutto. Alle Rechte vorbehalten.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a
              href="https://formulare.fintutto.cloud"
              className="text-sm text-gray-400 hover:text-fintutto-accent"
            >
              Formulare-App
            </a>
            <a
              href="https://rendite.fintutto.cloud"
              className="text-sm text-gray-400 hover:text-fintutto-accent"
            >
              Rendite-Rechner
            </a>
            <a
              href="https://bescheidboxer.fintutto.de"
              className="text-sm text-gray-400 hover:text-fintutto-accent"
            >
              Bescheidboxer
            </a>
 main
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fintutto. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-muted-foreground">
            Basierend auf deutschem Mietrecht. Keine Rechtsberatung.
          </p>
        </div>
      </div>
    </footer>
  )
}
