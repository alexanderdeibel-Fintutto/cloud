import { Link } from 'react-router-dom'
import { getOtherApps } from '@fintutto/shared'

const ecosystemApps = getOtherApps('mieter-checker')

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-fintutto-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="font-bold text-xl text-white">Fintutto Checker</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Kostenlose Mietrechts-Checks mit KI-Unterstuetzung. Pruefen Sie Ihre Rechte als
              Mieter und erhalten Sie sofort Handlungsempfehlungen.
            </p>
          </div>

          {/* Checker Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Beliebte Checker</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/checker/mietpreisbremse" className="hover:text-fintutto-accent">
                  Mietpreisbremse
                </Link>
              </li>
              <li>
                <Link to="/checker/nebenkosten" className="hover:text-fintutto-accent">
                  Nebenkosten
                </Link>
              </li>
              <li>
                <Link to="/checker/mieterhoehung" className="hover:text-fintutto-accent">
                  Mieterhoehung
                </Link>
              </li>
              <li>
                <Link to="/checker/kuendigung" className="hover:text-fintutto-accent">
                  Kuendigung
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Rechtliches</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://fintutto.de/impressum" className="hover:text-fintutto-accent">
                  Impressum
                </a>
              </li>
              <li>
                <a href="https://fintutto.de/datenschutz" className="hover:text-fintutto-accent">
                  Datenschutz
                </a>
              </li>
              <li>
                <a href="https://fintutto.de/agb" className="hover:text-fintutto-accent">
                  AGB
                </a>
              </li>
            </ul>
          </div>
        </div>

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
          </div>
        </div>
      </div>
    </footer>
  )
}
