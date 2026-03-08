import { Link } from 'react-router-dom'
import { Sparkles, ArrowUpRight, Brain } from 'lucide-react'
import { getEcosystemBarItems } from '@fintutto/shared'

const ecosystemApps = getEcosystemBarItems('portal')

const footerLinks = {
  rechner: [
    { name: 'Kautions-Rechner', href: '/rechner/kaution' },
    { name: 'Mieterhoehungs-Rechner', href: '/rechner/mieterhoehung' },
    { name: 'Kaufnebenkosten-Rechner', href: '/rechner/kaufnebenkosten' },
    { name: 'Rendite-Rechner', href: '/rechner/rendite' },
    { name: 'Grundsteuer-Rechner', href: '/rechner/grundsteuer' },
    { name: 'Nebenkosten-Rechner', href: '/rechner/nebenkosten' },
  ],
  checker: [
    { name: 'Mietpreisbremse', href: '/checker/mietpreisbremse' },
    { name: 'Mieterhoehung', href: '/checker/mieterhoehung' },
    { name: 'Nebenkosten', href: '/checker/nebenkosten' },
    { name: 'Kuendigung', href: '/checker/kuendigung' },
    { name: 'Kaution', href: '/checker/kaution' },
    { name: 'Mietminderung', href: '/checker/mietminderung' },
  ],
  formulare: [
    { name: 'Mietvertrag', href: '/formulare/mietvertrag' },
    { name: 'Uebergabeprotokoll', href: '/formulare/uebergabeprotokoll' },
    { name: 'Betriebskosten', href: '/formulare/betriebskosten' },
    { name: 'Kuendigung', href: '/formulare/kuendigung' },
    { name: 'Selbstauskunft', href: '/formulare/selbstauskunft' },
    { name: 'Mietbescheinigung', href: '/formulare/mietbescheinigung' },
  ],
  oekosystem: [
    { name: 'Alle Apps', href: '/apps' },
    { name: 'FinTech-Module', href: '/fintech' },
    { name: 'Preise & Credits', href: '/preise' },
    { name: 'Referral-Programm', href: '/referral' },
  ],
  rechtliches: [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/datenschutz' },
    { name: 'AGB', href: '/agb' },
  ],
}

function FooterSection({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div>
      <h3 className="font-bold text-sm mb-4 text-foreground">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-portal shadow-lg group-hover:shadow-xl transition-shadow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-black text-lg gradient-text-portal">Fintutto</span>
                <span className="text-[10px] block text-muted-foreground uppercase tracking-wider -mt-0.5">Portal</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Professionelle Tools fuer Mieter & Vermieter. Rechtssicher, einfach, digital.
            </p>
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
              <Brain className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-primary">KI-gestuetzt</span>
            </div>
          </div>

          <FooterSection title="Rechner" links={footerLinks.rechner} />
          <FooterSection title="Checker" links={footerLinks.checker} />
          <FooterSection title="Formulare" links={footerLinks.formulare} />
          <FooterSection title="Oekosystem" links={footerLinks.oekosystem} />
          <FooterSection title="Rechtliches" links={footerLinks.rechtliches} />
        </div>

        {/* Ecosystem Apps Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-4">
            Fintutto Oekosystem
          </p>
          <div className="flex flex-wrap gap-2">
            {ecosystemApps.map((app) => (
              <a
                key={app.key}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-full group"
              >
                {app.icon} {app.name}
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            \u00a9 {new Date().getFullYear()} Fintutto. Alle Rechte vorbehalten.
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Basierend auf deutschem Mietrecht (BGB). Keine Rechtsberatung.
          </p>
        </div>
      </div>
    </footer>
  )
}
