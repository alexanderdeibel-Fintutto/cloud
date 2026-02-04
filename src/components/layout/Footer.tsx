'use client'

import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Beschreibung */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">Mietrecht Formulare</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professionelle Mietrecht-Formulare für Vermieter und Mieter.
              Rechtssicher, einfach zu nutzen und mit intelligenter KI-Unterstützung.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Formulare</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/formulare/mietvertrag" className="text-muted-foreground hover:text-foreground">
                  Mietvertrag
                </Link>
              </li>
              <li>
                <Link to="/formulare/kuendigung" className="text-muted-foreground hover:text-foreground">
                  Kündigung
                </Link>
              </li>
              <li>
                <Link to="/formulare/uebergabeprotokoll" className="text-muted-foreground hover:text-foreground">
                  Übergabeprotokoll
                </Link>
              </li>
              <li>
                <Link to="/formulare/betriebskosten" className="text-muted-foreground hover:text-foreground">
                  Betriebskosten
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="font-semibold mb-4">Rechtliches</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/impressum" className="text-muted-foreground hover:text-foreground">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-muted-foreground hover:text-foreground">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/agb" className="text-muted-foreground hover:text-foreground">
                  AGB
                </Link>
              </li>
              <li>
                <Link to="/hilfe" className="text-muted-foreground hover:text-foreground">
                  Hilfe & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mietrecht Formulare. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-muted-foreground">
            Hinweis: Diese Formulare ersetzen keine Rechtsberatung.
          </p>
        </div>
      </div>
    </footer>
  )
}
