import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Upload,
  Search,
  Clock,
  ShieldAlert,
  Settings,
  HelpCircle,
  Users,
  Moon,
  Sun,
  Type,
  Download,
  BarChart3,
  ArrowLeftRight,
  CalendarDays,
  Calculator,
  User,
  Building2,
  ClipboardCheck,
  FileStack,
  CreditCard,
  FolderUp,
  FileDown,
  Archive,
  Zap,
  PieChart,
  FolderOpen,
  Bell,
  Sparkles,
  Activity,
  Lightbulb,
  LifeBuoy,
  FolderDown,
  Home,
  Receipt,
  ScanLine,
  LayoutGrid,
  Landmark,
  GitBranch,
  Wallet,
  Scale,
  Briefcase,
  Bot,
  BookOpen,
  UserCheck,
  TrendingUp,
  ReceiptText,
  Percent,
  Newspaper,
  CalendarClock,
  BadgeDollarSign,
  ShieldCheck,
  FileSignature,
  Navigation,
  KeyRound,
  Send,
  PiggyBank,
  HeartHandshake,
  CalendarCheck,
  BookOpenCheck,
  ReceiptEuro,
  Factory,
  History,
  Wrench,
  FileSpreadsheet,
  Building,
  HeartPulse,
  Umbrella,
  ArrowDownUp,
  Bitcoin,
  Coins,
  Baby,
  GitCompareArrows,
  SunMedium,
  Car,
  UsersRound,
  ArrowUpFromLine,
  Monitor,
  GraduationCap,
  HandCoins,
  Truck,
  Plane,
  FileSearch,
  ShieldPlus,
  BookMarked,
  Banknote,
  Gift,
  HeartCrack,
  TrendingDown,
} from 'lucide-react'
import { useBescheidContext } from '../contexts/BescheidContext'
import { useTheme } from '../contexts/ThemeContext'
import { exportBescheideAsCsv } from '../lib/csv-export'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  keywords?: string[]
  category: 'navigation' | 'aktion' | 'einstellung'
}

const CATEGORY_LABELS: Record<string, string> = {
  navigation: 'Navigation',
  aktion: 'Aktionen',
  einstellung: 'Einstellungen',
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { bescheide } = useBescheidContext()
  const { theme, setTheme, fontSize, setFontSize } = useTheme()

  const runAndClose = useCallback((fn: () => void) => {
    fn()
    setOpen(false)
    setQuery('')
  }, [])

  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-dashboard', label: 'Dashboard', description: 'Zur Uebersicht', icon: LayoutDashboard, category: 'navigation', keywords: ['home', 'start', 'uebersicht'], action: () => runAndClose(() => navigate('/')) },
    { id: 'nav-bescheide', label: 'Bescheide', description: 'Alle Steuerbescheide', icon: FileText, category: 'navigation', keywords: ['steuer', 'liste'], action: () => runAndClose(() => navigate('/bescheide')) },
    { id: 'nav-upload', label: 'Bescheid hochladen', description: 'Neuen Bescheid hochladen', icon: Upload, category: 'navigation', keywords: ['neu', 'pdf', 'foto', 'dokument'], action: () => runAndClose(() => navigate('/upload')) },
    { id: 'nav-analyse', label: 'Analyse', description: 'Bescheid pruefen lassen', icon: Search, category: 'navigation', keywords: ['ki', 'pruefen', 'check'], action: () => runAndClose(() => navigate('/analyse')) },
    { id: 'nav-fristen', label: 'Fristen', description: 'Fristen & Termine', icon: Clock, category: 'navigation', keywords: ['termin', 'deadline', 'ablauf'], action: () => runAndClose(() => navigate('/fristen')) },
    { id: 'nav-kalender', label: 'Steuer-Kalender', description: 'Kalenderansicht fuer Fristen', icon: CalendarDays, category: 'navigation', keywords: ['kalender', 'monat', 'termin', 'calendar'], action: () => runAndClose(() => navigate('/kalender')) },
    { id: 'nav-einspruch', label: 'Einspruch', description: 'Einsprueche verwalten', icon: ShieldAlert, category: 'navigation', keywords: ['widerspruch', 'beschwerde'], action: () => runAndClose(() => navigate('/einspruch')) },
    { id: 'nav-referral', label: 'Freunde werben', description: 'Referral-Programm', icon: Users, category: 'navigation', keywords: ['empfehlung', 'werben', 'bonus'], action: () => runAndClose(() => navigate('/referral')) },
    { id: 'nav-hilfe', label: 'Hilfe & Glossar', description: 'Steuer-Begriffe erklaert', icon: HelpCircle, category: 'navigation', keywords: ['faq', 'glossar', 'hilfe', 'erklaerung'], action: () => runAndClose(() => navigate('/hilfe')) },
    { id: 'nav-jahresbericht', label: 'Jahresbericht', description: 'Jaehrliche Zusammenfassung', icon: BarChart3, category: 'navigation', keywords: ['bericht', 'zusammenfassung', 'statistik', 'report'], action: () => runAndClose(() => navigate('/jahresbericht')) },
    { id: 'nav-vergleich', label: 'Bescheid-Vergleich', description: 'Zwei Bescheide vergleichen', icon: ArrowLeftRight, category: 'navigation', keywords: ['vergleich', 'vergleichen', 'gegenueber', 'diff'], action: () => runAndClose(() => navigate('/vergleich')) },
    { id: 'nav-rechner', label: 'Steuer-Rechner', description: 'Einkommensteuer berechnen', icon: Calculator, category: 'navigation', keywords: ['rechner', 'calculator', 'berechnen', 'steuer', 'einkommen'], action: () => runAndClose(() => navigate('/steuerrechner')) },
    { id: 'nav-suche', label: 'Suche', description: 'Alles durchsuchen', icon: Search, category: 'navigation', keywords: ['suche', 'suchen', 'finden', 'search'], action: () => runAndClose(() => navigate('/suche')) },
    { id: 'nav-profil', label: 'Mein Profil', description: 'Profil & Statistiken', icon: User, category: 'navigation', keywords: ['profil', 'konto', 'account', 'benutzer'], action: () => runAndClose(() => navigate('/profil')) },
    { id: 'nav-vorlagen', label: 'Einspruch-Vorlagen', description: 'Professionelle Einspruch-Templates', icon: FileStack, category: 'navigation', keywords: ['vorlage', 'template', 'einspruch', 'muster'], action: () => runAndClose(() => navigate('/einspruch/vorlagen')) },
    { id: 'nav-checkliste', label: 'Steuer-Checkliste', description: 'Schritt-fuer-Schritt Pruefung', icon: ClipboardCheck, category: 'navigation', keywords: ['checkliste', 'todo', 'schritte', 'pruefung'], action: () => runAndClose(() => navigate('/checkliste')) },
    { id: 'nav-finanzaemter', label: 'Finanzamt-Verzeichnis', description: 'Finanzaemter finden', icon: Building2, category: 'navigation', keywords: ['finanzamt', 'verzeichnis', 'adresse', 'kontakt', 'telefon'], action: () => runAndClose(() => navigate('/finanzaemter')) },
    { id: 'nav-upgrade', label: 'Upgrade', description: 'Tarife & Preise', icon: CreditCard, category: 'navigation', keywords: ['upgrade', 'premium', 'pro', 'tarif', 'preis', 'abo'], action: () => runAndClose(() => navigate('/upgrade')) },
    { id: 'nav-mehrfach', label: 'Mehrfach-Upload', description: 'Mehrere Bescheide hochladen', icon: FolderUp, category: 'navigation', keywords: ['mehrfach', 'batch', 'multi', 'upload', 'drag', 'drop'], action: () => runAndClose(() => navigate('/mehrfach-upload')) },
    { id: 'nav-bericht', label: 'Bericht exportieren', description: 'Steuerbericht erstellen', icon: FileDown, category: 'navigation', keywords: ['bericht', 'export', 'pdf', 'drucken', 'report'], action: () => runAndClose(() => navigate('/bericht')) },
    { id: 'nav-archiv', label: 'Archiv', description: 'Abgeschlossene Bescheide', icon: Archive, category: 'navigation', keywords: ['archiv', 'erledigt', 'abgeschlossen', 'alt', 'history'], action: () => runAndClose(() => navigate('/archiv')) },
    { id: 'nav-schnell', label: 'Schnellerfassung', description: 'Bescheid schnell anlegen', icon: Zap, category: 'navigation', keywords: ['schnell', 'neu', 'anlegen', 'erfassen', 'wizard', 'quick'], action: () => runAndClose(() => navigate('/schnellerfassung')) },
    { id: 'nav-statistik', label: 'Statistiken', description: 'Charts & Auswertungen', icon: PieChart, category: 'navigation', keywords: ['statistik', 'chart', 'auswertung', 'analytics', 'diagramm'], action: () => runAndClose(() => navigate('/statistiken')) },
    { id: 'nav-dokumente', label: 'Dokumente', description: 'Alle hochgeladenen Dateien', icon: FolderOpen, category: 'navigation', keywords: ['dokument', 'datei', 'file', 'pdf', 'bild', 'foto'], action: () => runAndClose(() => navigate('/dokumente')) },
    { id: 'nav-benachrichtigungen', label: 'Benachrichtigungen', description: 'Alle Nachrichten', icon: Bell, category: 'navigation', keywords: ['benachrichtigung', 'nachricht', 'notification', 'alarm', 'glocke'], action: () => runAndClose(() => navigate('/benachrichtigungen')) },
    { id: 'nav-onboarding', label: 'Einfuehrung', description: 'App-Tour starten', icon: Sparkles, category: 'navigation', keywords: ['onboarding', 'tour', 'einfuehrung', 'willkommen', 'hilfe', 'start'], action: () => runAndClose(() => navigate('/onboarding')) },
    { id: 'nav-aktivitaeten', label: 'Aktivitaeten', description: 'Aktivitaets-Protokoll', icon: Activity, category: 'navigation', keywords: ['aktivitaet', 'protokoll', 'timeline', 'verlauf', 'log'], action: () => runAndClose(() => navigate('/aktivitaeten')) },
    { id: 'nav-steuer-tipps', label: 'Steuer-Tipps', description: 'Tipps zur Steuerersparnis', icon: Lightbulb, category: 'navigation', keywords: ['tipp', 'steuer', 'sparen', 'ratgeber', 'hinweis'], action: () => runAndClose(() => navigate('/steuer-tipps')) },
    { id: 'nav-kontakt', label: 'Kontakt & Support', description: 'Hilfe & FAQ', icon: LifeBuoy, category: 'navigation', keywords: ['kontakt', 'support', 'hilfe', 'faq', 'frage', 'telefon', 'email'], action: () => runAndClose(() => navigate('/kontakt')) },
    { id: 'nav-daten-export', label: 'Daten-Export', description: 'Daten herunterladen', icon: FolderDown, category: 'navigation', keywords: ['export', 'daten', 'download', 'csv', 'json', 'pdf', 'herunterladen'], action: () => runAndClose(() => navigate('/daten-export')) },
    { id: 'nav-immobilien', label: 'Immobilien', description: 'Immobilien verwalten', icon: Home, category: 'navigation', keywords: ['immobilie', 'haus', 'wohnung', 'gebaeude', 'property'], action: () => runAndClose(() => navigate('/immobilien')) },
    { id: 'nav-mieterbereich', label: 'Mieterbereich', description: 'Mieter Self-Service', icon: Users, category: 'navigation', keywords: ['mieter', 'tenant', 'wohnung', 'zaehler', 'meldung'], action: () => runAndClose(() => navigate('/mieterbereich')) },
    { id: 'nav-nebenkosten', label: 'Nebenkosten', description: 'Nebenkostenabrechnung', icon: Receipt, category: 'navigation', keywords: ['nebenkosten', 'betriebskosten', 'abrechnung', 'heizung', 'wasser'], action: () => runAndClose(() => navigate('/nebenkosten')) },
    { id: 'nav-scanner', label: 'Dokument-Scanner', description: 'OCR-Scan starten', icon: ScanLine, category: 'navigation', keywords: ['scan', 'scanner', 'ocr', 'kamera', 'foto', 'erkennung'], action: () => runAndClose(() => navigate('/dokument-scanner')) },
    { id: 'nav-steuerkalender', label: 'Steuerkalender', description: 'Steuertermine 2026', icon: CalendarDays, category: 'navigation', keywords: ['steuerkalender', 'termin', 'frist', 'vorauszahlung', 'abgabe'], action: () => runAndClose(() => navigate('/steuerkalender')) },
    { id: 'nav-verwalter', label: 'Verwalter-Dashboard', description: 'Immobilien-Management', icon: LayoutGrid, category: 'navigation', keywords: ['verwalter', 'manager', 'verwaltung', 'dashboard', 'ueberblick'], action: () => runAndClose(() => navigate('/verwalter')) },
    { id: 'nav-grundsteuer-sim', label: 'Grundsteuer-Simulator', description: 'Grundsteuer berechnen', icon: Landmark, category: 'navigation', keywords: ['grundsteuer', 'simulator', 'berechnen', 'bundesmodell', 'hebesatz', 'bodenrichtwert'], action: () => runAndClose(() => navigate('/grundsteuer-simulator')) },
    { id: 'nav-widerspruch-tracker', label: 'Widerspruch-Tracker', description: 'Einsprüche verfolgen', icon: GitBranch, category: 'navigation', keywords: ['widerspruch', 'tracker', 'einspruch', 'status', 'timeline', 'verfolgen'], action: () => runAndClose(() => navigate('/widerspruch-tracker')) },
    { id: 'nav-zahlungen', label: 'Zahlungsübersicht', description: 'Steuer-Zahlungen & Erstattungen', icon: Wallet, category: 'navigation', keywords: ['zahlung', 'erstattung', 'belastung', 'uebersicht', 'transaktion', 'saldo'], action: () => runAndClose(() => navigate('/zahlungen')) },
    { id: 'nav-benchmark', label: 'Steuer-Benchmark', description: 'Regionale Vergleiche', icon: Scale, category: 'navigation', keywords: ['benchmark', 'vergleich', 'regional', 'bundesland', 'ranking', 'durchschnitt'], action: () => runAndClose(() => navigate('/benchmark')) },
    { id: 'nav-steuerberater', label: 'Steuerberater finden', description: 'Berater in der Nähe', icon: Briefcase, category: 'navigation', keywords: ['steuerberater', 'berater', 'kanzlei', 'finden', 'suche', 'beratung'], action: () => runAndClose(() => navigate('/steuerberater')) },
    { id: 'nav-automatisierung', label: 'Automatisierung', description: 'Regeln & Workflows', icon: Bot, category: 'navigation', keywords: ['automatisierung', 'regel', 'workflow', 'trigger', 'aktion', 'automatisch'], action: () => runAndClose(() => navigate('/automatisierung')) },
    { id: 'nav-wissensdatenbank', label: 'Wissens-Datenbank', description: 'Steuer-Fachwissen', icon: BookOpen, category: 'navigation', keywords: ['wissen', 'datenbank', 'artikel', 'faq', 'lexikon', 'steuerrecht'], action: () => runAndClose(() => navigate('/wissensdatenbank')) },
    { id: 'nav-mandanten', label: 'Mandantenverwaltung', description: 'Mandanten verwalten', icon: UserCheck, category: 'navigation', keywords: ['mandant', 'kunde', 'verwaltung', 'berater', 'kanzlei'], action: () => runAndClose(() => navigate('/mandanten')) },
    { id: 'nav-steuerlast', label: 'Steuerlast-Prognose', description: 'Steuerbelastung prognostizieren', icon: TrendingUp, category: 'navigation', keywords: ['prognose', 'forecast', 'trend', 'steuerlast', 'vorhersage', 'entwicklung'], action: () => runAndClose(() => navigate('/steuerlast-prognose')) },
    { id: 'nav-belege', label: 'Beleg-Manager', description: 'Belege verwalten & OCR', icon: ReceiptText, category: 'navigation', keywords: ['beleg', 'quittung', 'rechnung', 'ocr', 'scan', 'bon'], action: () => runAndClose(() => navigate('/belege')) },
    { id: 'nav-afa', label: 'AfA-Rechner', description: 'Abschreibung berechnen', icon: Percent, category: 'navigation', keywords: ['afa', 'abschreibung', 'immobilie', 'nutzungsdauer', 'degressiv', 'linear'], action: () => runAndClose(() => navigate('/afa-rechner')) },
    { id: 'nav-news', label: 'Steuer-News', description: 'Aktuelle Steuer-Nachrichten', icon: Newspaper, category: 'navigation', keywords: ['news', 'nachrichten', 'aktuell', 'urteil', 'gesetz', 'aenderung'], action: () => runAndClose(() => navigate('/steuer-news')) },
    { id: 'nav-vorauszahlungen', label: 'Vorauszahlungen', description: 'Vorauszahlungsplaner', icon: CalendarClock, category: 'navigation', keywords: ['vorauszahlung', 'planer', 'quartal', 'termin', 'liquiditaet'], action: () => runAndClose(() => navigate('/vorauszahlungen')) },
    { id: 'nav-steuerspar', label: 'Steuerspar-Rechner', description: 'Sparmöglichkeiten finden', icon: BadgeDollarSign, category: 'navigation', keywords: ['sparen', 'optimierung', 'tipp', 'potential', 'absetzen', 'werbungskosten'], action: () => runAndClose(() => navigate('/steuerspar-rechner')) },
    { id: 'nav-betriebspruefung', label: 'Betriebsprüfung', description: 'Prüfungs-Vorbereitung', icon: ShieldCheck, category: 'navigation', keywords: ['betriebspruefung', 'pruefung', 'audit', 'checkliste', 'risiko', 'vorbereitung'], action: () => runAndClose(() => navigate('/betriebspruefung')) },
    { id: 'nav-vorlagen', label: 'Dokument-Vorlagen', description: 'Brief- und Antragsvorlagen', icon: FileSignature, category: 'navigation', keywords: ['vorlage', 'template', 'brief', 'antrag', 'formular', 'muster', 'schreiben'], action: () => runAndClose(() => navigate('/dokument-vorlagen')) },
    { id: 'nav-pendler', label: 'Pendler-Rechner', description: 'Entfernungspauschale berechnen', icon: Navigation, category: 'navigation', keywords: ['pendler', 'fahrtkosten', 'entfernung', 'pauschale', 'kilometer', 'auto', 'oepnv'], action: () => runAndClose(() => navigate('/pendler-rechner')) },
    { id: 'nav-steuerident', label: 'Steuer-Ident', description: 'IDs & Steuernummern verwalten', icon: KeyRound, category: 'navigation', keywords: ['steuerid', 'steuernummer', 'identifikation', 'ust', 'idnr'], action: () => runAndClose(() => navigate('/steuer-ident')) },
    { id: 'nav-elster', label: 'ELSTER-Status', description: 'Übermittlungsstatus prüfen', icon: Send, category: 'navigation', keywords: ['elster', 'uebermittlung', 'status', 'transferticket', 'elektronisch'], action: () => runAndClose(() => navigate('/elster-status')) },
    { id: 'nav-finanzplanung', label: 'Finanzplanung', description: 'Steuer-Szenarien vergleichen', icon: PiggyBank, category: 'navigation', keywords: ['finanzplanung', 'szenario', 'netto', 'brutto', 'planung', 'vergleich'], action: () => runAndClose(() => navigate('/finanzplanung')) },
    { id: 'nav-erbschaftsteuer', label: 'Erbschaftsteuer', description: 'Erbschaft-/Schenkungsteuer berechnen', icon: HeartHandshake, category: 'navigation', keywords: ['erbschaft', 'schenkung', 'erbschaftsteuer', 'freibetrag', 'steuerklasse'], action: () => runAndClose(() => navigate('/erbschaftsteuer')) },
    { id: 'nav-steuertermine', label: 'Steuer-Termine', description: 'Beratungstermine verwalten', icon: CalendarCheck, category: 'navigation', keywords: ['termin', 'beratung', 'finanzamt', 'meeting', 'besprechung'], action: () => runAndClose(() => navigate('/steuer-termine')) },
    { id: 'nav-kassenbuch', label: 'Kassenbuch', description: 'Einnahmen & Ausgaben erfassen', icon: BookOpenCheck, category: 'navigation', keywords: ['kassenbuch', 'euer', 'einnahme', 'ausgabe', 'buchung', 'freiberufler'], action: () => runAndClose(() => navigate('/kassenbuch')) },
    { id: 'nav-umsatzsteuer', label: 'Umsatzsteuer', description: 'UStVA-Übersicht & Zahllast', icon: ReceiptEuro, category: 'navigation', keywords: ['umsatzsteuer', 'ust', 'voranmeldung', 'ustva', 'vorsteuer', 'zahllast', 'mehrwertsteuer'], action: () => runAndClose(() => navigate('/umsatzsteuer')) },
    { id: 'nav-gewerbesteuer', label: 'Gewerbesteuer', description: 'GewSt berechnen mit Hebesatz', icon: Factory, category: 'navigation', keywords: ['gewerbesteuer', 'gewst', 'hebesatz', 'messbetrag', 'gewerbe', 'anrechnung'], action: () => runAndClose(() => navigate('/gewerbesteuer')) },
    { id: 'nav-historie', label: 'Steuer-Historie', description: 'Steuerjahre im Überblick', icon: History, category: 'navigation', keywords: ['historie', 'verlauf', 'jahresvergleich', 'steuerquote', 'timeline'], action: () => runAndClose(() => navigate('/steuer-historie')) },
    { id: 'nav-haushaltsnahe', label: 'Haushaltsnahe Dienste', description: '§ 35a Steuerermäßigung', icon: Wrench, category: 'navigation', keywords: ['haushaltsnahe', 'handwerker', 'dienstleistung', '35a', 'minijob', 'reinigung'], action: () => runAndClose(() => navigate('/haushaltsnahe')) },
    { id: 'nav-formulare', label: 'Steuer-Formulare', description: 'Anlagen & Vordrucke erklärt', icon: FileSpreadsheet, category: 'navigation', keywords: ['formular', 'anlage', 'vordruck', 'mantelbogen', 'anlage-n', 'anlage-v', 'elster'], action: () => runAndClose(() => navigate('/steuer-formulare')) },
    { id: 'nav-doppelhaushalt', label: 'Doppelte Haushaltsführung', description: 'Zweithaushalt absetzen', icon: Building, category: 'navigation', keywords: ['doppelte', 'haushaltsfuehrung', 'zweitwohnung', 'miete', 'heimfahrt', 'werbungskosten'], action: () => runAndClose(() => navigate('/doppelte-haushaltsfuehrung')) },
    { id: 'nav-spenden', label: 'Spenden-Rechner', description: 'Spendenabzug berechnen', icon: HeartPulse, category: 'navigation', keywords: ['spende', 'spenden', 'gemeinnuetzig', 'partei', 'stiftung', 'sonderausgabe'], action: () => runAndClose(() => navigate('/spenden-rechner')) },
    { id: 'nav-riester', label: 'Riester-Rechner', description: 'Zulagen & Sonderausgabenabzug', icon: Umbrella, category: 'navigation', keywords: ['riester', 'rente', 'zulage', 'altersvorsorge', 'sonderausgabe', 'guenstigerpruefung'], action: () => runAndClose(() => navigate('/riester-rechner')) },
    { id: 'nav-verlustverrechnung', label: 'Verlustverrechnung', description: 'Verlustvorträge verwalten', icon: ArrowDownUp, category: 'navigation', keywords: ['verlust', 'vortrag', 'verrechnung', 'ruecktrag', 'topf', 'aktien'], action: () => runAndClose(() => navigate('/verlustverrechnung')) },
    { id: 'nav-krypto', label: 'Krypto-Steuer', description: 'Haltefrist & Freigrenze', icon: Bitcoin, category: 'navigation', keywords: ['krypto', 'bitcoin', 'ethereum', 'haltefrist', 'freigrenze', 'coin', 'token'], action: () => runAndClose(() => navigate('/krypto-steuer')) },
    { id: 'nav-minijob', label: 'Minijob-Rechner', description: 'Minijob & Midijob Abgaben', icon: Coins, category: 'navigation', keywords: ['minijob', 'midijob', '538', 'geringfuegig', 'gleitzone', 'uebergangsbereich'], action: () => runAndClose(() => navigate('/minijob-rechner')) },
    { id: 'nav-elterngeld', label: 'Elterngeld', description: 'Basis, Plus & Partnerbonus', icon: Baby, category: 'navigation', keywords: ['elterngeld', 'elternzeit', 'baby', 'kind', 'geburt', 'zulage', 'partnerschaftsbonus'], action: () => runAndClose(() => navigate('/elterngeld-rechner')) },
    { id: 'nav-bescheidvergleich', label: 'Bescheid-Vergleicher', description: 'Bescheide vergleichen', icon: GitCompareArrows, category: 'navigation', keywords: ['vergleich', 'bescheid', 'abweichung', 'differenz', 'aenderung', 'einspruch'], action: () => runAndClose(() => navigate('/bescheid-vergleicher')) },
    { id: 'nav-photovoltaik', label: 'Photovoltaik-Steuer', description: 'PV-Anlage steuerlich bewerten', icon: SunMedium, category: 'navigation', keywords: ['photovoltaik', 'pv', 'solar', 'einspeiseverguetung', 'eigenverbrauch', 'strom'], action: () => runAndClose(() => navigate('/photovoltaik')) },
    { id: 'nav-firmenwagen', label: 'Firmenwagen-Rechner', description: '1%-Regelung & geldwerter Vorteil', icon: Car, category: 'navigation', keywords: ['firmenwagen', 'dienstwagen', '1prozent', 'geldwerter', 'vorteil', 'auto', 'elektro'], action: () => runAndClose(() => navigate('/firmenwagen-rechner')) },
    { id: 'nav-steuerklassen', label: 'Steuerklassenwahl', description: 'Optimale Steuerklasse für Ehepaare', icon: UsersRound, category: 'navigation', keywords: ['steuerklasse', 'ehepaar', 'splitting', 'faktor', 'lohnsteuer', 'kombination'], action: () => runAndClose(() => navigate('/steuerklassenwahl')) },
    { id: 'nav-progressionsvorbehalt', label: 'Progressionsvorbehalt', description: 'Steuersatz-Auswirkung § 32b', icon: ArrowUpFromLine, category: 'navigation', keywords: ['progression', 'vorbehalt', 'alg', 'kurzarbeit', 'elterngeld', 'krankengeld', 'steuersatz'], action: () => runAndClose(() => navigate('/progressionsvorbehalt')) },
    { id: 'nav-arbeitszimmer', label: 'Arbeitszimmer-Rechner', description: 'Homeoffice-Pauschale & Arbeitszimmer', icon: Monitor, category: 'navigation', keywords: ['arbeitszimmer', 'homeoffice', 'pauschale', 'buero', 'heimarbeit', 'werbungskosten'], action: () => runAndClose(() => navigate('/arbeitszimmer')) },
    { id: 'nav-kinderfreibetrag', label: 'Kinderfreibetrag', description: 'Kindergeld vs. Freibetrag', icon: GraduationCap, category: 'navigation', keywords: ['kinderfreibetrag', 'kindergeld', 'kind', 'guenstiger', 'freibetrag', 'bea'], action: () => runAndClose(() => navigate('/kinderfreibetrag')) },
    { id: 'nav-soli', label: 'Solidaritätszuschlag', description: 'Soli mit Freigrenze berechnen', icon: HandCoins, category: 'navigation', keywords: ['soli', 'solidaritaet', 'zuschlag', 'freigrenze', 'milderung', 'ergaenzungsabgabe'], action: () => runAndClose(() => navigate('/solidaritaetszuschlag')) },
    { id: 'nav-umzugskosten', label: 'Umzugskosten', description: 'Berufsbedingten Umzug absetzen', icon: Truck, category: 'navigation', keywords: ['umzug', 'umzugskosten', 'pauschale', 'spedition', 'werbungskosten', 'beruflich'], action: () => runAndClose(() => navigate('/umzugskosten')) },
    { id: 'nav-reisekosten', label: 'Reisekosten', description: 'Dienstreisen steuerlich absetzen', icon: Plane, category: 'navigation', keywords: ['reisekosten', 'dienstreise', 'verpflegung', 'uebernachtung', 'fahrtkosten', 'vpma'], action: () => runAndClose(() => navigate('/reisekosten')) },
    { id: 'nav-bewerbungskosten', label: 'Bewerbungskosten', description: 'Bewerbungen als WK absetzen', icon: FileSearch, category: 'navigation', keywords: ['bewerbung', 'bewerbungskosten', 'vorstellung', 'porto', 'werbungskosten'], action: () => runAndClose(() => navigate('/bewerbungskosten')) },
    { id: 'nav-vorsorge', label: 'Vorsorgeaufwendungen', description: 'Rente, Kranken- & Pflegeversicherung', icon: ShieldPlus, category: 'navigation', keywords: ['vorsorge', 'rente', 'krankenversicherung', 'pflege', 'ruerup', 'sonderausgabe'], action: () => runAndClose(() => navigate('/vorsorgeaufwendungen')) },
    { id: 'nav-fortbildung', label: 'Fortbildungskosten', description: 'Weiterbildung & Studium absetzen', icon: BookMarked, category: 'navigation', keywords: ['fortbildung', 'weiterbildung', 'studium', 'kurs', 'seminar', 'werbungskosten'], action: () => runAndClose(() => navigate('/fortbildungskosten')) },
    { id: 'nav-abfindung', label: 'Abfindungsrechner', description: 'Fünftelregelung § 34 EStG', icon: Banknote, category: 'navigation', keywords: ['abfindung', 'fuenftel', 'regelung', 'entlassung', 'entschaedigung', 'steuer'], action: () => runAndClose(() => navigate('/abfindungsrechner')) },
    { id: 'nav-sachbezuege', label: 'Sachbezüge', description: 'Steuerfreie Benefits optimieren', icon: Gift, category: 'navigation', keywords: ['sachbezug', 'gutschein', 'jobticket', 'freigrenze', '50euro', 'benefit'], action: () => runAndClose(() => navigate('/sachbezuege')) },
    { id: 'nav-agbelastungen', label: 'Außergew. Belastungen', description: 'Krankheit, Pflege, Bestattung', icon: HeartCrack, category: 'navigation', keywords: ['aussergewoehnlich', 'belastung', 'krankheit', 'zumutbar', 'pflege', 'bestattung'], action: () => runAndClose(() => navigate('/aussergewoehnliche-belastungen')) },
    { id: 'nav-kapitalertraege', label: 'Kapitalerträge', description: 'Abgeltungsteuer & Günstigerprüfung', icon: TrendingDown, category: 'navigation', keywords: ['kapital', 'zinsen', 'dividende', 'abgeltung', 'sparerpauschbetrag', 'aktien'], action: () => runAndClose(() => navigate('/kapitalertraege')) },
    { id: 'nav-settings', label: 'Einstellungen', description: 'Konto & Einstellungen', icon: Settings, category: 'navigation', keywords: ['einstellungen', 'konto', 'passwort'], action: () => runAndClose(() => navigate('/einstellungen')) },

    // Aktionen
    { id: 'act-export', label: 'Bescheide exportieren', description: 'Als CSV herunterladen', icon: Download, category: 'aktion', keywords: ['csv', 'download', 'export', 'excel'], action: () => runAndClose(() => exportBescheideAsCsv(bescheide)) },

    // Einstellungen
    { id: 'set-dark', label: 'Dunkles Design', description: theme === 'dark' ? 'Aktiv' : 'Aktivieren', icon: Moon, category: 'einstellung', keywords: ['dark', 'dunkel', 'nacht'], action: () => runAndClose(() => setTheme('dark')) },
    { id: 'set-light', label: 'Helles Design', description: theme === 'light' ? 'Aktiv' : 'Aktivieren', icon: Sun, category: 'einstellung', keywords: ['light', 'hell', 'tag'], action: () => runAndClose(() => setTheme('light')) },
    { id: 'set-font-large', label: 'Grosse Schrift', description: fontSize === 'large' ? 'Aktiv' : 'Aktivieren', icon: Type, category: 'einstellung', keywords: ['schrift', 'gross', 'font', 'accessibility'], action: () => runAndClose(() => setFontSize(fontSize === 'large' ? 'normal' : 'large')) },
    { id: 'set-font-xlarge', label: 'Sehr grosse Schrift', description: fontSize === 'xlarge' ? 'Aktiv' : 'Aktivieren', icon: Type, category: 'einstellung', keywords: ['schrift', 'sehr gross', 'font', 'xl'], action: () => runAndClose(() => setFontSize(fontSize === 'xlarge' ? 'normal' : 'xlarge')) },
  ]

  const filtered = query.trim()
    ? commands.filter(cmd => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some(k => k.includes(q))
        )
      })
    : commands

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  // Flat list for keyboard navigation
  const flatList = Object.values(grouped).flat()

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-cmd-item]')
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, flatList.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      flatList[selectedIndex]?.action()
    }
  }

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!open) return null

  let flatIdx = -1

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Befehlspalette">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { setOpen(false); setQuery('') }}
      />

      {/* Dialog */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg">
        <div className="mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Suche oder Befehl eingeben..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {flatList.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Keine Ergebnisse fuer &ldquo;{query}&rdquo;
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {CATEGORY_LABELS[category] || category}
                  </p>
                  {items.map(cmd => {
                    flatIdx++
                    const idx = flatIdx
                    const Icon = cmd.icon
                    return (
                      <button
                        key={cmd.id}
                        data-cmd-item
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          selectedIndex === idx
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground hover:bg-accent/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{cmd.label}</span>
                          {cmd.description && (
                            <span className="ml-2 text-xs text-muted-foreground">{cmd.description}</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑</kbd>
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↓</kbd>
                Navigieren
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↵</kbd>
                Ausfuehren
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">⌘K</kbd>
              Oeffnen
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
