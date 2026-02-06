import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, Home, TrendingUp, Receipt,
  Key, Wrench, AlertTriangle, UserX,
  Building, Paintbrush, ArrowRight, Download,
  FileSignature, Mail, Scale, Shield, Clock,
  DollarSign, Thermometer, Volume2, Bug,
  Droplets, Zap, Wifi, Car, Dog, Baby,
  Users, Lock, Camera, Trash2, Leaf,
  Sun, Moon, CloudRain, Wind, Flame,
  Phone, MessageSquare, Calendar, FileCheck,
  ClipboardList, PenTool, Eye, Ban, Bell
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FormularItem {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  category: 'miete' | 'kuendigung' | 'maengel' | 'auszug' | 'einzug' | 'kommunikation' | 'rechte' | 'sonstige'
  popular?: boolean
  checkerLink?: string
}

const FORMULARE: FormularItem[] = [
  // ===== MIETE & KOSTEN (12 Formulare) =====
  {
    id: 'mietpreisbremse-ruege',
    name: 'Mietpreisbremse-Ruege',
    description: 'Ruegen Sie die ueberhöhte Miete und fordern Sie Geld zurueck',
    icon: Home,
    color: 'bg-blue-500',
    category: 'miete',
    popular: true,
    checkerLink: '/checker/mietpreisbremse',
  },
  {
    id: 'mieterhoehung-widerspruch',
    name: 'Mieterhoehung-Widerspruch',
    description: 'Widersprechen Sie einer unzulaessigen Mieterhoehung',
    icon: TrendingUp,
    color: 'bg-green-500',
    category: 'miete',
    popular: true,
    checkerLink: '/checker/mieterhoehung',
  },
  {
    id: 'nebenkostenabrechnung-widerspruch',
    name: 'Nebenkosten-Widerspruch',
    description: 'Widersprechen Sie fehlerhaften Nebenkostenabrechnungen',
    icon: Receipt,
    color: 'bg-yellow-500',
    category: 'miete',
    popular: true,
    checkerLink: '/checker/nebenkosten',
  },
  {
    id: 'betriebskosten-pruefung',
    name: 'Betriebskosten-Belegeinsicht',
    description: 'Anfrage zur Belegeinsicht bei Betriebskosten',
    icon: FileText,
    color: 'bg-orange-500',
    category: 'miete',
    checkerLink: '/checker/betriebskosten',
  },
  {
    id: 'mietrueckstand-ratenzahlung',
    name: 'Ratenzahlungsvereinbarung',
    description: 'Vereinbaren Sie Ratenzahlung bei Mietrueckstand',
    icon: DollarSign,
    color: 'bg-emerald-500',
    category: 'miete',
  },
  {
    id: 'mietzahlung-unter-vorbehalt',
    name: 'Zahlung unter Vorbehalt',
    description: 'Mietzahlung unter Vorbehalt bei strittigen Kosten',
    icon: Shield,
    color: 'bg-indigo-500',
    category: 'miete',
  },
  {
    id: 'staffelmiete-pruefung',
    name: 'Staffelmiete-Pruefung',
    description: 'Pruefen Sie die Wirksamkeit Ihrer Staffelmiete',
    icon: TrendingUp,
    color: 'bg-violet-500',
    category: 'miete',
  },
  {
    id: 'indexmiete-pruefung',
    name: 'Indexmiete-Pruefung',
    description: 'Pruefen Sie die korrekte Berechnung der Indexmiete',
    icon: TrendingUp,
    color: 'bg-fuchsia-500',
    category: 'miete',
  },
  {
    id: 'heizkosten-widerspruch',
    name: 'Heizkosten-Widerspruch',
    description: 'Widersprechen Sie fehlerhafter Heizkostenabrechnung',
    icon: Flame,
    color: 'bg-red-400',
    category: 'miete',
  },
  {
    id: 'wasserkosten-widerspruch',
    name: 'Wasserkosten-Widerspruch',
    description: 'Widersprechen Sie fehlerhafter Wasserkostenabrechnung',
    icon: Droplets,
    color: 'bg-blue-400',
    category: 'miete',
  },
  {
    id: 'stromkosten-pruefung',
    name: 'Allgemeinstrom-Pruefung',
    description: 'Pruefen Sie die Umlage von Allgemeinstromkosten',
    icon: Zap,
    color: 'bg-yellow-400',
    category: 'miete',
  },
  {
    id: 'guthaben-auszahlung',
    name: 'Guthaben-Auszahlung',
    description: 'Fordern Sie Ihr Nebenkostenguthaben ein',
    icon: DollarSign,
    color: 'bg-green-400',
    category: 'miete',
  },

  // ===== KUENDIGUNG (10 Formulare) =====
  {
    id: 'kuendigung-widerspruch',
    name: 'Kuendigungs-Widerspruch',
    description: 'Widersprechen Sie der Kuendigung durch den Vermieter',
    icon: AlertTriangle,
    color: 'bg-red-500',
    category: 'kuendigung',
    popular: true,
    checkerLink: '/checker/kuendigung',
  },
  {
    id: 'eigenbedarf-widerspruch',
    name: 'Eigenbedarf-Widerspruch',
    description: 'Widersprechen Sie einer Eigenbedarfskuendigung',
    icon: UserX,
    color: 'bg-pink-500',
    category: 'kuendigung',
    checkerLink: '/checker/eigenbedarf',
  },
  {
    id: 'haertefall-einwand',
    name: 'Haertefall-Einwand',
    description: 'Machen Sie soziale Haerte gegen Kuendigung geltend',
    icon: Scale,
    color: 'bg-rose-500',
    category: 'kuendigung',
  },
  {
    id: 'mieter-kuendigung',
    name: 'Mieterkuendigung',
    description: 'Kuendigen Sie Ihren Mietvertrag ordentlich',
    icon: FileSignature,
    color: 'bg-gray-500',
    category: 'kuendigung',
  },
  {
    id: 'sonderkuendigung-mieter',
    name: 'Sonderkuendigung (Mieter)',
    description: 'Ausserordentliche Kuendigung bei schweren Maengeln',
    icon: AlertTriangle,
    color: 'bg-orange-500',
    category: 'kuendigung',
  },
  {
    id: 'fristverlaengerung-antrag',
    name: 'Raeumungsfrist-Verlaengerung',
    description: 'Beantragen Sie eine Verlaengerung der Raeumungsfrist',
    icon: Clock,
    color: 'bg-blue-500',
    category: 'kuendigung',
  },
  {
    id: 'untervermietung-kuendigung',
    name: 'Untervermietung-Kuendigung',
    description: 'Kuendigen Sie eine Untervermietung',
    icon: Users,
    color: 'bg-purple-500',
    category: 'kuendigung',
  },
  {
    id: 'widerspruch-abmahnung',
    name: 'Abmahnung-Widerspruch',
    description: 'Widersprechen Sie einer unberechtigten Abmahnung',
    icon: Ban,
    color: 'bg-red-400',
    category: 'kuendigung',
  },
  {
    id: 'kuendigung-garage',
    name: 'Kuendigung Stellplatz/Garage',
    description: 'Kuendigen Sie einen separaten Stellplatzmietvertrag',
    icon: Car,
    color: 'bg-slate-500',
    category: 'kuendigung',
  },
  {
    id: 'aufhebungsvertrag',
    name: 'Aufhebungsvertrag',
    description: 'Einvernehmliche Aufhebung des Mietverhaeltnisses',
    icon: FileCheck,
    color: 'bg-teal-500',
    category: 'kuendigung',
  },

  // ===== MAENGEL & REPARATUREN (12 Formulare) =====
  {
    id: 'mietminderung-anzeige',
    name: 'Mietminderung-Anzeige',
    description: 'Zeigen Sie Maengel an und mindern Sie die Miete',
    icon: Wrench,
    color: 'bg-indigo-500',
    category: 'maengel',
    popular: true,
    checkerLink: '/checker/mietminderung',
  },
  {
    id: 'maengelanzeige',
    name: 'Maengelanzeige (Allgemein)',
    description: 'Melden Sie allgemeine Maengel an Ihren Vermieter',
    icon: AlertTriangle,
    color: 'bg-amber-500',
    category: 'maengel',
  },
  {
    id: 'instandsetzung-aufforderung',
    name: 'Instandsetzungs-Aufforderung',
    description: 'Fordern Sie den Vermieter zur Reparatur auf',
    icon: Wrench,
    color: 'bg-violet-500',
    category: 'maengel',
  },
  {
    id: 'modernisierung-widerspruch',
    name: 'Modernisierung-Widerspruch',
    description: 'Widersprechen Sie unzulaessigen Modernisierungskosten',
    icon: Building,
    color: 'bg-teal-500',
    category: 'maengel',
    checkerLink: '/checker/modernisierung',
  },
  {
    id: 'schimmel-anzeige',
    name: 'Schimmel-Anzeige',
    description: 'Melden Sie Schimmelbefall in der Wohnung',
    icon: Bug,
    color: 'bg-gray-600',
    category: 'maengel',
    popular: true,
  },
  {
    id: 'heizung-ausfall',
    name: 'Heizungsausfall-Anzeige',
    description: 'Melden Sie defekte oder unzureichende Heizung',
    icon: Thermometer,
    color: 'bg-red-500',
    category: 'maengel',
  },
  {
    id: 'laerm-beschwerde',
    name: 'Laerm-Beschwerde',
    description: 'Beschweren Sie sich ueber Laermbelaestigung',
    icon: Volume2,
    color: 'bg-orange-400',
    category: 'maengel',
  },
  {
    id: 'wasserschaden-anzeige',
    name: 'Wasserschaden-Anzeige',
    description: 'Melden Sie einen Wasserschaden sofort',
    icon: Droplets,
    color: 'bg-blue-500',
    category: 'maengel',
  },
  {
    id: 'ungeziefer-anzeige',
    name: 'Ungeziefer-Anzeige',
    description: 'Melden Sie Ungezieferbefall in der Wohnung',
    icon: Bug,
    color: 'bg-yellow-600',
    category: 'maengel',
  },
  {
    id: 'fenster-tueren-mangel',
    name: 'Fenster/Tueren-Mangel',
    description: 'Melden Sie defekte Fenster oder Tueren',
    icon: Wind,
    color: 'bg-cyan-500',
    category: 'maengel',
  },
  {
    id: 'elektrik-mangel',
    name: 'Elektrik-Mangel',
    description: 'Melden Sie Maengel an der elektrischen Anlage',
    icon: Zap,
    color: 'bg-yellow-500',
    category: 'maengel',
  },
  {
    id: 'selbstvornahme-ankuendigung',
    name: 'Selbstvornahme-Ankuendigung',
    description: 'Kuendigen Sie Ersatzvornahme bei Untaetigkeit an',
    icon: Wrench,
    color: 'bg-purple-500',
    category: 'maengel',
  },

  // ===== EINZUG (8 Formulare) =====
  {
    id: 'wohnungsuebergabe-einzug',
    name: 'Uebergabeprotokoll Einzug',
    description: 'Dokumentieren Sie den Zustand beim Einzug',
    icon: ClipboardList,
    color: 'bg-green-500',
    category: 'einzug',
    popular: true,
  },
  {
    id: 'mietvertrag-pruefung',
    name: 'Mietvertrag-Checkliste',
    description: 'Checkliste zur Pruefung des Mietvertrags',
    icon: FileCheck,
    color: 'bg-blue-500',
    category: 'einzug',
  },
  {
    id: 'kaution-bestaetigung',
    name: 'Kautions-Bestaetigung',
    description: 'Bestaetigung ueber geleistete Kautionszahlung',
    icon: Key,
    color: 'bg-purple-500',
    category: 'einzug',
  },
  {
    id: 'schluessel-uebergabe',
    name: 'Schluessel-Uebergabe',
    description: 'Protokoll der Schluesseluebergabe',
    icon: Key,
    color: 'bg-amber-500',
    category: 'einzug',
  },
  {
    id: 'zaehlerstand-protokoll',
    name: 'Zaehlerstand-Protokoll',
    description: 'Dokumentieren Sie alle Zaehlerstaende',
    icon: Zap,
    color: 'bg-yellow-500',
    category: 'einzug',
  },
  {
    id: 'nachmieter-vorschlag',
    name: 'Nachmieter-Vorschlag',
    description: 'Schlagen Sie einen Nachmieter vor',
    icon: Users,
    color: 'bg-teal-500',
    category: 'einzug',
  },
  {
    id: 'untervermietung-antrag',
    name: 'Untervermietung-Antrag',
    description: 'Beantragen Sie die Erlaubnis zur Untervermietung',
    icon: Users,
    color: 'bg-indigo-500',
    category: 'einzug',
  },
  {
    id: 'wohngemeinschaft-antrag',
    name: 'WG-Mitbewohner-Antrag',
    description: 'Antrag auf Aufnahme eines Mitbewohners',
    icon: Users,
    color: 'bg-pink-500',
    category: 'einzug',
  },

  // ===== AUSZUG (10 Formulare) =====
  {
    id: 'kaution-rueckforderung',
    name: 'Kaution-Rueckforderung',
    description: 'Fordern Sie Ihre Kaution zurueck',
    icon: Key,
    color: 'bg-purple-500',
    category: 'auszug',
    popular: true,
    checkerLink: '/checker/kaution',
  },
  {
    id: 'schoenheitsreparaturen-widerspruch',
    name: 'Schoenheitsreparaturen-Widerspruch',
    description: 'Widersprechen Sie unzulaessigen Renovierungsforderungen',
    icon: Paintbrush,
    color: 'bg-cyan-500',
    category: 'auszug',
    checkerLink: '/checker/schoenheitsreparaturen',
  },
  {
    id: 'uebergabeprotokoll',
    name: 'Uebergabeprotokoll Auszug',
    description: 'Dokumentieren Sie den Zustand beim Auszug',
    icon: FileSignature,
    color: 'bg-slate-500',
    category: 'auszug',
  },
  {
    id: 'endreinigung-protokoll',
    name: 'Endreinigung-Protokoll',
    description: 'Dokumentieren Sie die durchgefuehrte Endreinigung',
    icon: Trash2,
    color: 'bg-green-500',
    category: 'auszug',
  },
  {
    id: 'kaution-mahnung',
    name: 'Kaution-Mahnung',
    description: 'Mahnen Sie die ausstehende Kautionsrueckzahlung an',
    icon: Bell,
    color: 'bg-red-500',
    category: 'auszug',
  },
  {
    id: 'schadenersatz-widerspruch',
    name: 'Schadenersatz-Widerspruch',
    description: 'Widersprechen Sie unberechtigten Schadenersatzforderungen',
    icon: Ban,
    color: 'bg-orange-500',
    category: 'auszug',
  },
  {
    id: 'renovierung-vereinbarung',
    name: 'Renovierungs-Vereinbarung',
    description: 'Vereinbaren Sie Renovierungsarbeiten beim Auszug',
    icon: Paintbrush,
    color: 'bg-violet-500',
    category: 'auszug',
  },
  {
    id: 'schluessel-rueckgabe',
    name: 'Schluessel-Rueckgabe',
    description: 'Protokoll der Schluesselrueckgabe',
    icon: Key,
    color: 'bg-gray-500',
    category: 'auszug',
  },
  {
    id: 'nebenkostenabrechnung-anforderung',
    name: 'Nebenkostenabrechnung anfordern',
    description: 'Fordern Sie die ausstehende Nebenkostenabrechnung',
    icon: Receipt,
    color: 'bg-blue-500',
    category: 'auszug',
  },
  {
    id: 'restmuell-entsorgung',
    name: 'Restmuell-Bestaetigung',
    description: 'Bestaetigung ueber ordnungsgemaesse Raeumung',
    icon: Trash2,
    color: 'bg-gray-600',
    category: 'auszug',
  },

  // ===== KOMMUNIKATION (8 Formulare) =====
  {
    id: 'kontaktdaten-mitteilung',
    name: 'Kontaktdaten-Mitteilung',
    description: 'Teilen Sie Aenderungen Ihrer Kontaktdaten mit',
    icon: Phone,
    color: 'bg-blue-500',
    category: 'kommunikation',
  },
  {
    id: 'beschwerde-hausverwaltung',
    name: 'Beschwerde Hausverwaltung',
    description: 'Beschwerde an die Hausverwaltung',
    icon: MessageSquare,
    color: 'bg-red-400',
    category: 'kommunikation',
  },
  {
    id: 'terminvereinbarung',
    name: 'Terminvereinbarung',
    description: 'Vereinbaren Sie einen Besichtigungstermin',
    icon: Calendar,
    color: 'bg-green-500',
    category: 'kommunikation',
  },
  {
    id: 'fristverlängerung-antrag',
    name: 'Fristverlaengerung-Antrag',
    description: 'Beantragen Sie eine Fristverlaengerung',
    icon: Clock,
    color: 'bg-orange-500',
    category: 'kommunikation',
  },
  {
    id: 'empfangsbestaetigung',
    name: 'Empfangsbestaetigung',
    description: 'Fordern Sie eine Empfangsbestaetigung an',
    icon: FileCheck,
    color: 'bg-teal-500',
    category: 'kommunikation',
  },
  {
    id: 'vollmacht-vertreter',
    name: 'Vollmacht fuer Vertreter',
    description: 'Bevollmaechtigen Sie jemanden fuer Ihre Anliegen',
    icon: PenTool,
    color: 'bg-purple-500',
    category: 'kommunikation',
  },
  {
    id: 'mieterbund-vollmacht',
    name: 'Mieterbund-Vollmacht',
    description: 'Vollmacht fuer den Mieterbund/Mieterverein',
    icon: Shield,
    color: 'bg-indigo-500',
    category: 'kommunikation',
  },
  {
    id: 'anwalt-vollmacht',
    name: 'Anwalts-Vollmacht',
    description: 'Bevollmaechtigen Sie einen Rechtsanwalt',
    icon: Scale,
    color: 'bg-gray-700',
    category: 'kommunikation',
  },

  // ===== MIETERRECHTE (8 Formulare) =====
  {
    id: 'zutritt-verweigerung',
    name: 'Zutritts-Verweigerung',
    description: 'Widersprechen Sie unberechtigten Wohnungsbegehungen',
    icon: Lock,
    color: 'bg-red-500',
    category: 'rechte',
  },
  {
    id: 'besichtigung-zustimmung',
    name: 'Besichtigung-Zustimmung',
    description: 'Zustimmung zu Wohnungsbesichtigung mit Bedingungen',
    icon: Eye,
    color: 'bg-blue-500',
    category: 'rechte',
  },
  {
    id: 'hausordnung-widerspruch',
    name: 'Hausordnung-Widerspruch',
    description: 'Widersprechen Sie unzulaessigen Hausordnungsregeln',
    icon: Ban,
    color: 'bg-orange-500',
    category: 'rechte',
  },
  {
    id: 'tierhaltung-antrag',
    name: 'Tierhaltung-Antrag',
    description: 'Beantragen Sie die Erlaubnis zur Tierhaltung',
    icon: Dog,
    color: 'bg-amber-500',
    category: 'rechte',
  },
  {
    id: 'parabolantenne-antrag',
    name: 'Parabolantenne-Antrag',
    description: 'Antrag auf Installation einer Satellitenanlage',
    icon: Wifi,
    color: 'bg-cyan-500',
    category: 'rechte',
  },
  {
    id: 'balkon-nutzung',
    name: 'Balkon-Nutzung',
    description: 'Anfrage zur erlaubten Balkonnutzung',
    icon: Sun,
    color: 'bg-yellow-500',
    category: 'rechte',
  },
  {
    id: 'garten-nutzung',
    name: 'Garten-Nutzung',
    description: 'Anfrage zur Gartennutzung und -gestaltung',
    icon: Leaf,
    color: 'bg-green-500',
    category: 'rechte',
  },
  {
    id: 'stellplatz-anfrage',
    name: 'Stellplatz-Anfrage',
    description: 'Anfrage nach einem Parkplatz oder Stellplatz',
    icon: Car,
    color: 'bg-gray-500',
    category: 'rechte',
  },

  // ===== SONSTIGE (7 Formulare) =====
  {
    id: 'auskunftsanfrage',
    name: 'Auskunftsanfrage',
    description: 'Fordern Sie Informationen vom Vermieter an',
    icon: Mail,
    color: 'bg-gray-500',
    category: 'sonstige',
  },
  {
    id: 'datenschutz-auskunft',
    name: 'Datenschutz-Auskunft',
    description: 'DSGVO-Auskunftsanfrage an den Vermieter',
    icon: FileText,
    color: 'bg-emerald-500',
    category: 'sonstige',
  },
  {
    id: 'widerspruch-fotos',
    name: 'Widerspruch Fotos',
    description: 'Widerspruch gegen Fotoaufnahmen in der Wohnung',
    icon: Camera,
    color: 'bg-pink-500',
    category: 'sonstige',
  },
  {
    id: 'mietbescheinigung-anfrage',
    name: 'Mietbescheinigung',
    description: 'Anfrage fuer eine Mietbescheinigung',
    icon: FileText,
    color: 'bg-blue-400',
    category: 'sonstige',
  },
  {
    id: 'wohngeld-bescheinigung',
    name: 'Vermieterbescheinigung Wohngeld',
    description: 'Anfrage fuer Wohngeld-Bescheinigung',
    icon: FileCheck,
    color: 'bg-green-400',
    category: 'sonstige',
  },
  {
    id: 'kinderzuschlag-bescheinigung',
    name: 'Bescheinigung Kinderzuschlag',
    description: 'Vermieterbescheinigung fuer Kinderzuschlag',
    icon: Baby,
    color: 'bg-pink-400',
    category: 'sonstige',
  },
  {
    id: 'ruhezeiten-beschwerde',
    name: 'Ruhezeiten-Beschwerde',
    description: 'Beschwerde wegen Verletzung der Ruhezeiten',
    icon: Moon,
    color: 'bg-indigo-400',
    category: 'sonstige',
  },
]

const CATEGORIES = [
  { id: 'miete', name: 'Miete & Kosten', description: 'Formulare zu Miete, Erhoehungen und Nebenkosten' },
  { id: 'kuendigung', name: 'Kuendigung', description: 'Widerspruch gegen Kuendigungen und eigene Kuendigung' },
  { id: 'maengel', name: 'Maengel & Reparaturen', description: 'Maengelanzeigen, Mietminderung und Instandsetzung' },
  { id: 'einzug', name: 'Einzug & Vertrag', description: 'Uebergabeprotokolle, Kaution und Untervermietung' },
  { id: 'auszug', name: 'Auszug & Rueckgabe', description: 'Kaution, Renovierung und Wohnungsuebergabe' },
  { id: 'kommunikation', name: 'Kommunikation', description: 'Schriftverkehr und Vollmachten' },
  { id: 'rechte', name: 'Mieterrechte', description: 'Zutritt, Tierhaltung und Nutzungsrechte' },
  { id: 'sonstige', name: 'Sonstige Formulare', description: 'Bescheinigungen und weitere Dokumente' },
]

export default function FormularePage() {
  const popularFormulare = FORMULARE.filter(f => f.popular)

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mieter-Formulare
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professionelle Vorlagen fuer alle wichtigen Mieter-Anliegen.
            Einfach ausfuellen, herunterladen und absenden.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-fintutto-light rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-fintutto-primary">{FORMULARE.length}+</div>
            <div className="text-sm text-gray-600">Formulare verfuegbar</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">PDF</div>
            <div className="text-sm text-gray-600">Download moeglich</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">Rechtlich</div>
            <div className="text-sm text-gray-600">geprueft</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">Einfach</div>
            <div className="text-sm text-gray-600">auszufuellen</div>
          </div>
        </motion.div>

        {/* Popular Formulare */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Beliebte Formulare</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularFormulare.map((formular, index) => (
              <motion.div
                key={formular.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-fintutto-primary">
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 ${formular.color} rounded-lg flex items-center justify-center mb-3`}>
                      <formular.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{formular.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{formular.description}</CardDescription>
                    <div className="space-y-2">
                      {formular.checkerLink && (
                        <Link
                          to={formular.checkerLink}
                          className="flex items-center text-fintutto-primary font-medium text-sm hover:underline"
                        >
                          Erst pruefen <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                      <div className="flex items-center text-gray-600 text-sm">
                        <Download className="w-4 h-4 mr-1" /> Als PDF
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Formulare by Category */}
        {CATEGORIES.map((category, catIndex) => {
          const categoryFormulare = FORMULARE.filter(f => f.category === category.id)
          if (categoryFormulare.length === 0) return null

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + catIndex * 0.1 }}
              className="mb-12"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryFormulare.map((formular) => (
                  <Card key={formular.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 ${formular.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <formular.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-fintutto-primary transition-colors truncate">
                            {formular.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{formular.description}</p>
                          {formular.checkerLink && (
                            <Link
                              to={formular.checkerLink}
                              className="text-xs text-fintutto-primary hover:underline mt-1 inline-block"
                            >
                              → Zuerst mit Checker pruefen
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )
        })}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center bg-gradient-to-r from-fintutto-primary to-blue-600 rounded-2xl p-8 text-white"
        >
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Welches Formular brauchen Sie?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Nutzen Sie unsere Checker, um herauszufinden, welches Formular fuer Ihre Situation passt.
            Der Checker analysiert Ihren Fall und empfiehlt das passende Dokument.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/checker">
              Zu den Checkern
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
