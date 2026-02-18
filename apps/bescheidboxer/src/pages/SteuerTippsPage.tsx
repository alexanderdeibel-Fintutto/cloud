import { useState, useMemo } from 'react'
import {
  Lightbulb,
  Search,
  Bookmark,
  BookmarkCheck,
  Euro,
  Home,
  Briefcase,
  Heart,
  GraduationCap,
  Building2,
  TrendingDown,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

type TippKategorie = 'allgemein' | 'arbeitnehmer' | 'immobilien' | 'selbstaendig' | 'familie' | 'bildung' | 'vorsorge'

interface SteuerTipp {
  id: string
  titel: string
  beschreibung: string
  kategorie: TippKategorie
  einsparpotenzial?: string
  wichtigkeit: 'hoch' | 'mittel' | 'niedrig'
  tags: string[]
}

const KATEGORIE_CONFIG: Record<TippKategorie, { icon: typeof Lightbulb; label: string; farbe: string; bg: string }> = {
  allgemein: { icon: Euro, label: 'Allgemein', farbe: 'text-fintutto-blue-500', bg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40' },
  arbeitnehmer: { icon: Briefcase, label: 'Arbeitnehmer', farbe: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  immobilien: { icon: Home, label: 'Immobilien', farbe: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  selbstaendig: { icon: Building2, label: 'Selbstaendig', farbe: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40' },
  familie: { icon: Heart, label: 'Familie', farbe: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40' },
  bildung: { icon: GraduationCap, label: 'Bildung', farbe: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40' },
  vorsorge: { icon: TrendingDown, label: 'Vorsorge', farbe: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
}

const TIPPS: SteuerTipp[] = [
  {
    id: '1',
    titel: 'Arbeitszimmer absetzen',
    beschreibung: 'Wenn Sie ein haeusliches Arbeitszimmer nutzen, koennen Sie bis zu 1.260 EUR im Jahr als Homeoffice-Pauschale geltend machen. Bei einem separaten Arbeitszimmer, das den Mittelpunkt der Taetigkeit darstellt, sind die vollen Kosten absetzbar.',
    kategorie: 'arbeitnehmer',
    einsparpotenzial: 'bis 1.260 EUR/Jahr',
    wichtigkeit: 'hoch',
    tags: ['homeoffice', 'arbeitszimmer', 'pauschale', 'werbungskosten'],
  },
  {
    id: '2',
    titel: 'Handwerkerleistungen absetzen',
    beschreibung: 'Handwerkerkosten fuer Renovierung, Erhaltung und Modernisierung koennen zu 20% direkt von der Steuer abgezogen werden - maximal 1.200 EUR Steuererstattung pro Jahr (bei 6.000 EUR Arbeitskosten).',
    kategorie: 'immobilien',
    einsparpotenzial: 'bis 1.200 EUR/Jahr',
    wichtigkeit: 'hoch',
    tags: ['handwerker', 'renovierung', 'haushalt', 'steuermaessigung'],
  },
  {
    id: '3',
    titel: 'Pendlerpauschale optimieren',
    beschreibung: 'Ab dem 21. Entfernungskilometer betraegt die Pendlerpauschale 0,38 EUR. Bei langen Arbeitswegen kann dies erheblich sein. Pruefen Sie auch, ob alternative Verkehrsmittel steuerlich guenstiger sind.',
    kategorie: 'arbeitnehmer',
    einsparpotenzial: '100-2.000 EUR/Jahr',
    wichtigkeit: 'hoch',
    tags: ['pendler', 'fahrtkosten', 'entfernungspauschale', 'arbeitswege'],
  },
  {
    id: '4',
    titel: 'Sonderausgaben pruefen',
    beschreibung: 'Kirchensteuer, Spenden, Vorsorgeaufwendungen und Krankenversicherungsbeitraege sind als Sonderausgaben abziehbar. Viele Steuerzahler vergessen die Basisvorsorge (Rentenversicherung), die bis zu 26.528 EUR absetzbar ist.',
    kategorie: 'vorsorge',
    einsparpotenzial: 'mehrere Tausend EUR',
    wichtigkeit: 'hoch',
    tags: ['sonderausgaben', 'vorsorge', 'kirche', 'spenden', 'krankenversicherung'],
  },
  {
    id: '5',
    titel: 'Kinderbetreuungskosten',
    beschreibung: 'Kosten fuer die Kinderbetreuung (Kita, Tagesmutter, Hort) sind zu 2/3 absetzbar, maximal 4.000 EUR pro Kind und Jahr. Dies gilt fuer Kinder bis 14 Jahre.',
    kategorie: 'familie',
    einsparpotenzial: 'bis 4.000 EUR/Kind',
    wichtigkeit: 'hoch',
    tags: ['kinder', 'kita', 'betreuung', 'tagesmutter'],
  },
  {
    id: '6',
    titel: 'Fortbildungskosten absetzen',
    beschreibung: 'Kosten fuer berufliche Fortbildungen, Fachbuecher, Seminare und auch ein berufsbegleitendes Studium sind vollstaendig als Werbungskosten absetzbar. Auch Fahrt- und Uebernachtungskosten zaehlen.',
    kategorie: 'bildung',
    einsparpotenzial: '500-5.000 EUR/Jahr',
    wichtigkeit: 'mittel',
    tags: ['fortbildung', 'studium', 'seminar', 'werbungskosten'],
  },
  {
    id: '7',
    titel: 'Doppelte Haushaltsfuehrung',
    beschreibung: 'Wenn Sie berufsbedingt eine Zweitwohnung unterhalten, koennen Sie die Kosten (Miete bis 1.000 EUR/Monat, Heimfahrten, Verpflegungsmehraufwand in den ersten 3 Monaten) absetzen.',
    kategorie: 'arbeitnehmer',
    einsparpotenzial: 'bis 12.000 EUR/Jahr',
    wichtigkeit: 'mittel',
    tags: ['zweitwohnung', 'umzug', 'doppelter haushalt'],
  },
  {
    id: '8',
    titel: 'Abschreibung fuer Vermieter',
    beschreibung: 'Vermieter koennen Gebaeude linear abschreiben: 2% bei Baujahr ab 1925, 2,5% bei aelteren Gebaeuden, und seit 2023 sogar 3% bei Neubauten (AfA). Zusaetzlich sind alle Werbungskosten absetzbar.',
    kategorie: 'immobilien',
    einsparpotenzial: 'mehrere Tausend EUR',
    wichtigkeit: 'mittel',
    tags: ['vermietung', 'abschreibung', 'afa', 'immobilie'],
  },
  {
    id: '9',
    titel: 'Betriebsausgaben nicht vergessen',
    beschreibung: 'Selbstaendige koennen alle betrieblich veranlassten Ausgaben absetzen: Bueroausstattung, Software, Telefon, Internet, Fachliteratur, Bewirtungskosten (70%), Reisekosten und mehr.',
    kategorie: 'selbstaendig',
    einsparpotenzial: 'individuell',
    wichtigkeit: 'hoch',
    tags: ['betriebsausgaben', 'selbstaendig', 'freiberufler'],
  },
  {
    id: '10',
    titel: 'Krankheitskosten als aussergewoehnliche Belastung',
    beschreibung: 'Kosten fuer Zahnersatz, Brille, Medikamente und andere Gesundheitsausgaben koennen als aussergewoehnliche Belastung abgesetzt werden, soweit sie die zumutbare Eigenbelastung uebersteigen.',
    kategorie: 'allgemein',
    einsparpotenzial: '200-2.000 EUR/Jahr',
    wichtigkeit: 'niedrig',
    tags: ['krankheit', 'gesundheit', 'brille', 'zahnarzt', 'aussergewoehnliche belastung'],
  },
  {
    id: '11',
    titel: 'Elterngeld-Optimierung',
    beschreibung: 'Durch geschickte Verteilung der Einkuenfte vor der Geburt und Nutzung von Steuerklassenwechsel koennen Eltern das Elterngeld optimieren. Eine fruehzeitige Planung lohnt sich.',
    kategorie: 'familie',
    einsparpotenzial: 'bis zu mehrere Tausend EUR',
    wichtigkeit: 'mittel',
    tags: ['elterngeld', 'geburt', 'steuerklasse', 'optimierung'],
  },
  {
    id: '12',
    titel: 'Investitionsabzugsbetrag nutzen',
    beschreibung: 'Selbstaendige und Gewerbetreibende koennen fuer geplante Investitionen einen Abzugsbetrag von bis zu 50% (max. 200.000 EUR) vorab gewinnmindernd geltend machen.',
    kategorie: 'selbstaendig',
    einsparpotenzial: 'bis 200.000 EUR',
    wichtigkeit: 'mittel',
    tags: ['investitionsabzug', 'iab', 'selbstaendig', 'gewerbe'],
  },
]

const WICHTIGKEIT_CONFIG = {
  hoch: { label: 'Hohe Prioritaet', farbe: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  mittel: { label: 'Mittlere Prioritaet', farbe: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  niedrig: { label: 'Niedrige Prioritaet', farbe: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
}

export default function SteuerTippsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKategorie, setSelectedKategorie] = useState<string>('alle')
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('steuertipps-bookmarks')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })
  const [showBookmarked, setShowBookmarked] = useState(false)

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('steuertipps-bookmarks', JSON.stringify([...next]))
      return next
    })
  }

  const filtered = useMemo(() => {
    let result = TIPPS

    if (showBookmarked) {
      result = result.filter(t => bookmarks.has(t.id))
    }

    if (selectedKategorie !== 'alle') {
      result = result.filter(t => t.kategorie === selectedKategorie)
    }

    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.titel.toLowerCase().includes(q) ||
        t.beschreibung.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q))
      )
    }

    return result
  }, [searchQuery, selectedKategorie, showBookmarked, bookmarks])

  const kategorieCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    TIPPS.forEach(t => {
      counts[t.kategorie] = (counts[t.kategorie] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Lightbulb className="h-8 w-8" />
          Steuer-Tipps
        </h1>
        <p className="text-muted-foreground mt-1">
          {TIPPS.length} Tipps fuer Ihre Steuerersparnis
        </p>
      </div>

      {/* Search + Filters */}
      <Card>
        <CardContent className="pt-4 pb-3 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tipps durchsuchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showBookmarked ? 'default' : 'outline'}
              onClick={() => setShowBookmarked(!showBookmarked)}
              className="gap-2"
            >
              <BookmarkCheck className="h-4 w-4" />
              Gemerkt ({bookmarks.size})
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedKategorie('alle')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedKategorie === 'alle'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Alle ({TIPPS.length})
            </button>
            {Object.entries(KATEGORIE_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKategorie(selectedKategorie === key ? 'alle' : key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedKategorie === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cfg.label} ({kategorieCounts[key] || 0})
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Keine Tipps gefunden</p>
              <p className="text-sm mt-1">Versuchen Sie andere Suchbegriffe oder Filter.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(tipp => {
            const katCfg = KATEGORIE_CONFIG[tipp.kategorie]
            const KatIcon = katCfg.icon
            const wichtCfg = WICHTIGKEIT_CONFIG[tipp.wichtigkeit]
            const isBookmarked = bookmarks.has(tipp.id)

            return (
              <Card key={tipp.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg ${katCfg.bg} p-2 shrink-0 mt-0.5`}>
                        <KatIcon className={`h-4 w-4 ${katCfg.farbe}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{tipp.titel}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{katCfg.label}</Badge>
                          {tipp.wichtigkeit === 'hoch' && (
                            <Badge className={`text-[10px] ${wichtCfg.bg} ${wichtCfg.farbe} border-0`}>
                              <Star className="h-2.5 w-2.5 mr-0.5" />
                              Wichtig
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => toggleBookmark(tipp.id)}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tipp.beschreibung}
                  </p>
                  {tipp.einsparpotenzial && (
                    <div className="mt-3 rounded-lg bg-green-50 dark:bg-green-950/30 px-3 py-2 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        Einsparpotenzial: {tipp.einsparpotenzial}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {tipp.tags.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setSearchQuery(tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
