// ══════════════════════════════════════════════════════════════
// Persona Generator – Erzeugt 500 realistische Personas
// ══════════════════════════════════════════════════════════════

import type {
  Persona, PersonaProfile, PersonaActivity,
  Gender, Situation, Ton, Schreibstil, PostingFrequency,
  TimeProfile, EngagementStyle, ForumId, ContentTag,
} from './types'

// ── Seeded RNG ──
function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5)
  return shuffled.slice(0, n)
}

function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

// ── Name Pools ──

const VORNAMEN_W = [
  'Lisa','Sandra','Petra','Jenny','Aylin','Claudia','Tanja','Stefanie','Olena',
  'Anna','Maria','Kathrin','Nicole','Sabine','Andrea','Heike','Silke','Birgit',
  'Monika','Michaela','Susanne','Kerstin','Manuela','Nadine','Anja','Melanie',
  'Christine','Daniela','Julia','Laura','Sarah','Lena','Jana','Miriam','Sonja',
  'Martina','Bettina','Doreen','Simone','Yvonne','Vanessa','Denise','Tatjana',
  'Natascha','Irina','Fatima','Aisha','Elif','Meryem','Hanna','Gabi','Renate',
  'Beate','Dagmar','Elke','Gudrun','Helga','Inga','Jasmin','Karin','Leyla',
]

const VORNAMEN_M = [
  'Thomas','Marcus','Stefan','Mike','Jens','Markus','Denny','Karl-Heinz',
  'Andreas','Michael','Frank','Daniel','Alexander','Christian','Matthias',
  'Patrick','Tobias','Sebastian','Oliver','Martin','Sven','Torsten','Uwe',
  'Ralf','Peter','Klaus','Wolfgang','Bernd','Dirk','Holger','Kai','Lars',
  'Rainer','Robert','Ahmed','Mehmet','Sergej','Dimitri','Pawel','Armin',
  'Dieter','Gerhard','Hans','Jürgen','Norbert','Werner','Kevin','Dennis',
  'Sascha','René','Rico','Enrico','Ronny','Maik','Timo','Florian','Jan',
]

const NACHNAMEN_INITIAL = [
  'M.','K.','S.','B.','R.','W.','H.','F.','L.','D.','P.','N.','G.','T.','A.',
  'E.','J.','C.','V.','Z.','Sch.','St.','Br.','Kr.','Fr.',
]

const STAEDTE = [
  { name: 'Berlin', typ: 'grossstadt', land: 'Berlin' },
  { name: 'Hamburg', typ: 'grossstadt', land: 'Hamburg' },
  { name: 'München', typ: 'grossstadt', land: 'Bayern' },
  { name: 'Köln', typ: 'grossstadt', land: 'NRW' },
  { name: 'Frankfurt', typ: 'grossstadt', land: 'Hessen' },
  { name: 'Dortmund', typ: 'grossstadt', land: 'NRW' },
  { name: 'Essen', typ: 'grossstadt', land: 'NRW' },
  { name: 'Leipzig', typ: 'grossstadt', land: 'Sachsen' },
  { name: 'Dresden', typ: 'grossstadt', land: 'Sachsen' },
  { name: 'Bremen', typ: 'grossstadt', land: 'Bremen' },
  { name: 'Hannover', typ: 'grossstadt', land: 'Niedersachsen' },
  { name: 'Duisburg', typ: 'grossstadt', land: 'NRW' },
  { name: 'Nürnberg', typ: 'grossstadt', land: 'Bayern' },
  { name: 'Bochum', typ: 'grossstadt', land: 'NRW' },
  { name: 'Wuppertal', typ: 'grossstadt', land: 'NRW' },
  { name: 'Bielefeld', typ: 'mittelstadt', land: 'NRW' },
  { name: 'Gelsenkirchen', typ: 'mittelstadt', land: 'NRW' },
  { name: 'Halle', typ: 'mittelstadt', land: 'Sachsen-Anhalt' },
  { name: 'Magdeburg', typ: 'mittelstadt', land: 'Sachsen-Anhalt' },
  { name: 'Rostock', typ: 'mittelstadt', land: 'Mecklenburg-Vorpommern' },
  { name: 'Chemnitz', typ: 'mittelstadt', land: 'Sachsen' },
  { name: 'Kassel', typ: 'mittelstadt', land: 'Hessen' },
  { name: 'Krefeld', typ: 'mittelstadt', land: 'NRW' },
  { name: 'Oberhausen', typ: 'mittelstadt', land: 'NRW' },
  { name: 'Erfurt', typ: 'mittelstadt', land: 'Thüringen' },
  { name: 'Schwerin', typ: 'kleinstadt', land: 'Mecklenburg-Vorpommern' },
  { name: 'Cottbus', typ: 'kleinstadt', land: 'Brandenburg' },
  { name: 'Flensburg', typ: 'kleinstadt', land: 'Schleswig-Holstein' },
  { name: 'Pirmasens', typ: 'kleinstadt', land: 'Rheinland-Pfalz' },
  { name: 'Bremerhaven', typ: 'mittelstadt', land: 'Bremen' },
]

const AVATAR_COLORS = [
  '#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c',
  '#e67e22','#34495e','#16a085','#c0392b','#2980b9','#8e44ad',
  '#d35400','#27ae60','#7f8c8d',
]

const SITUATIONS: Situation[] = [
  'alleinerziehend','single','paar_ohne_kinder','paar_mit_kindern',
  'senior','geflüchtet','langzeitbezieher','neubezieher','aufstocker',
  'behinderung','trennung',
]

// Weighted situation distribution (more realistic)
const SITUATION_WEIGHTS: [Situation, number][] = [
  ['single', 25], ['alleinerziehend', 18], ['langzeitbezieher', 15],
  ['neubezieher', 12], ['paar_mit_kindern', 8], ['aufstocker', 7],
  ['trennung', 5], ['senior', 4], ['geflüchtet', 3],
  ['paar_ohne_kinder', 2], ['behinderung', 1],
]

const TONE_MAP: Record<string, Ton[]> = {
  alleinerziehend: ['emotional_aber_sachlich','warmherzig','direkt_stark','kämpferisch'],
  single: ['frustriert_sarkastisch','verunsichert','positiv_lösungsorientiert','pragmatisch'],
  langzeitbezieher: ['abgeklärt_ironisch','frustriert_sarkastisch','kämpferisch','pragmatisch'],
  neubezieher: ['unsicher','verunsichert','dankbar_unsicher'],
  senior: ['höflich_altmodisch','pragmatisch'],
  geflüchtet: ['dankbar_unsicher','höflich_altmodisch'],
  aufstocker: ['pragmatisch','positiv_lösungsorientiert','frustriert_sarkastisch'],
  trennung: ['verunsichert','emotional_aber_sachlich','frustriert_sarkastisch'],
  paar_mit_kindern: ['emotional_aber_sachlich','warmherzig','kämpferisch'],
  paar_ohne_kinder: ['pragmatisch','frustriert_sarkastisch','verunsichert'],
  behinderung: ['emotional_aber_sachlich','kämpferisch','pragmatisch'],
}

const FORUM_MAP: Record<string, ForumId[]> = {
  alleinerziehend: ['hilfe-bescheid','kdu-miete','auskotzen','erfolge'],
  single: ['hilfe-bescheid','widerspruch','sanktionen','auskotzen'],
  langzeitbezieher: ['widerspruch','auskotzen','allgemeines','erfolge'],
  neubezieher: ['hilfe-bescheid','allgemeines','kdu-miete'],
  senior: ['hilfe-bescheid','allgemeines'],
  geflüchtet: ['hilfe-bescheid','allgemeines'],
  aufstocker: ['zuverdienst','hilfe-bescheid','erfolge'],
  trennung: ['hilfe-bescheid','kdu-miete','allgemeines','auskotzen'],
  paar_mit_kindern: ['hilfe-bescheid','kdu-miete','auskotzen','sanktionen'],
  paar_ohne_kinder: ['hilfe-bescheid','widerspruch','zuverdienst'],
  behinderung: ['hilfe-bescheid','widerspruch','sanktionen'],
}

const TAG_MAP: Record<string, ContentTag[]> = {
  alleinerziehend: ['mehrbedarf','kinder','alleinerziehend','kdu','bescheid'],
  single: ['regelsatz','sanktion','bescheid','widerspruch','buergergeld'],
  langzeitbezieher: ['widerspruch','klage','sozialgericht','sanktion','egv'],
  neubezieher: ['bescheid','berechnung','regelsatz','buergergeld'],
  senior: ['bescheid','berechnung','mehrbedarf'],
  geflüchtet: ['bescheid','buergergeld'],
  aufstocker: ['minijob','einkommen','freibetrag','anrechnung'],
  trennung: ['bedarfsgemeinschaft','trennung','kdu','umzug'],
  paar_mit_kindern: ['kinder','kdu','mehrbedarf','bescheid','heizkosten'],
  paar_ohne_kinder: ['regelsatz','bescheid','einkommen'],
  behinderung: ['mehrbedarf','schwerbehinderung','bescheid','widerspruch'],
}

function weightedPick(weights: [string, number][], rng: () => number): string {
  const total = weights.reduce((s, [, w]) => s + w, 0)
  let r = rng() * total
  for (const [val, w] of weights) {
    r -= w
    if (r <= 0) return val
  }
  return weights[0][0]
}

export function sanitizeForEmail(s: string): string {
  const map: Record<string, string> = {
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
    'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'á': 'a', 'à': 'a', 'â': 'a',
    'ó': 'o', 'ò': 'o', 'ô': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u',
    'í': 'i', 'ì': 'i', 'î': 'i',
    'ñ': 'n', 'ç': 'c',
  }
  return s.replace(/[^\x00-\x7F]/g, ch => map[ch] || '')
}

function generateUsername(
  vorname: string,
  nachname: string,
  idx: number,
  situation: Situation,
  rng: () => number,
): string {
  const style = rng()
  const yr = randInt(22, 26, rng)

  if (style < 0.28) {
    // real-name based: lisa_m_2025
    return `${vorname.toLowerCase()}_${nachname.toLowerCase().replace('.','')}_20${yr}`
  } else if (style < 0.44) {
    // topic-based
    const topics = [
      'widerspruch_held','bescheid_checker','buergergeld_frage',
      'sanktion_nein','egv_verweigerer','kdu_kaempfer','mehrbedarf_check',
      'regelsatz_rebel','sozialrecht_fan','jc_kritiker','hilfe_gesucht',
      'neustart','hoffnung','kaempferin','frust_im_system',
      'alleinerziehend_stark','raus_da','system_survivor','minijob_checker',
      'recht_muss_recht','papa_sucht_rat','mama_kaempft','betroffen',
      // Situation & Identität
      'hartz4_veteran','bg_neuling','umschulung_now',
      'bewerbungsmarathon','massnahme_nein','weiterbildung_statt_jc',
      'amt_vs_ich','eingliederung_nein','bg_chaos',
      'aufstocker_alltag','teilzeit_mama','schichtarbeit_bg',
      'ue50_sucht_job','langzeit_arbeitslos','solo_mama',
      'papa_im_bg','bedarfsgemeinschaft_frage','unterhalt_null',
      'quereinsteiger_bg','wg_oder_bg','trennung_neuanfang',
      // Emotionen & Haltung
      'genug_ist_genug','endlich_wehren','nicht_schweigen',
      'kopf_hoch_bg','wird_schon','kein_bock_mehr',
      'trotzdem_weiter','noch_nicht_aufgegeben','licht_am_ende',
      'schritt_fuer_schritt','muede_aber_da','aufstehen_weiter',
      // Bürokratie & Verfahren
      'bescheid_versteher','formular_dschungel','antrag_marathon',
      'sozialgericht_erfahren','egv_experte','kdu_drama',
      'heizkosten_streit','freibetrag_check','sanktion_widerspruch',
      'mietobergrenze_bg','erstausstattung_frage','umzugskosten_streit',
      'nebenkostenabrechnung_bg','rueckforderung_nein','weiterbewilligung',
    ]
    return pick(topics, rng) + '_' + randInt(1, 99, rng)
  } else if (style < 0.54) {
    // anonym
    const prefixes = [
      'Betroffener','Betroffene','BG_','JC_User','Anonym',
      'HilfeGesucht','Verzweifelt','NeuHier','FrageAnAlle',
      'Hilfesuchende','Ratloser','Ratlose','SoNichtJC',
      'Ratsuchend','StillerLeser','MitlesendesMitglied',
      'OhneNamen','EinfachNurIch','NurEineFrage','GanzNeuHier',
      'BraucheHilfe','Ueberfordert','WerKenntSich','MalNachfragen',
      'EineVonVielen','EinerVonVielen','ImSystemVerloren',
      'AmAnfang','Orientierungslos','HoffnungHaben','MutterInNot',
    ]
    const fmt = rng()
    if (fmt < 0.4) return pick(prefixes, rng) + `_20${yr}_${randInt(1,99,rng)}`
    if (fmt < 0.7) return pick(prefixes, rng) + `_${randInt(1,999,rng)}`
    return pick(prefixes, rng) + `${randInt(1,99,rng)}`
  } else if (style < 0.76) {
    // vorname + stadt hint
    const cities = [
      'HH','B','K','DO','L','DD','HB','M','F','E','N',
      'GE','BO','W','BI','OB','KS','MD','HRO','C','EF',
      'FL','BHV','SZ','WOB',
    ]
    return `${vorname}${pick(cities, rng)}${randInt(1,99,rng)}`
  } else if (style < 0.88) {
    // kreativ
    const kreativ = [
      'Paragraphenreiter','Amtsschimmel','BescheidPruefer','Klagewelle',
      'SanktionsFighter','RegelsatzRebel','ForumHelfer','MutMacher',
      'WiderstandJetzt','SozialesNetz','GemeinsamStark','KeineAngst',
      'RechtHaben','Durchkaempfer','StarkBleiben','NichtAufgeben',
      // Bürokratie-Humor
      'Aktenfresser','Wartenummer','Antragsgegner','BescheidSammler',
      'Stempelkissen','Dienstweg','Sachbearbeitet','AktenzeichenXY',
      'Warteschleife','GelberBrief','Massnahmenkritik','EGV_Rebell',
      'SanktionsResistent','FormularHeld','Amtsgang',
      // Community & Motivation
      'Durchhalter','SolidarischJetzt','KeinEinzelfall',
      'NichtAllein','InfoTeiler','TippGeber','ErfahrungsSchatz',
      'WissenIstMacht','MutMacherin','WeiterKaempfen',
      'DranBleiben','KopfUeberWasser','Netzwerker','Aufklaerer',
      // Persönlichkeit
      'Realistin','Pragmatiker','LeiseRebellion',
      'Sturkopf','Dickschaedel','Querulant2punkt0',
      'UnbequemeFragen','Klartext','HarterHund','Loewin',
    ]
    return pick(kreativ, rng) + '_' + randInt(1, 999, rng)
  } else {
    // alltagsnamen — generische Internet-Handles, nicht forenspezifisch
    const alltag = [
      'Sonnenschein','Schneeflocke','Sternenstaub','Blumenwiese',
      'Regenbogen','Keksdose','Zimtstern','Wolkenfrei',
      'Mondlicht','Sommerregen','Herbstwind','Morgentau',
      'Pusteblume','Gluecksklee','Sternchen','Perle',
      'Loewenzahn','Traumfaenger','Nachtfalter','Silbermond',
      'Wirbelwind','Nordlicht','Freigeist','Zitronenfalter',
      'Schattenlaeufer','Tagtraeumer','KaffeeMitMilch','Seelenvogel',
      'Goldstueck','Donnerwetter','SpaetiStammgast','NachtEule',
    ]
    return pick(alltag, rng) + '_' + randInt(1, 999, rng)
  }
}

function generateExampleSentences(
  ton: Ton,
  schreibstil: Schreibstil,
  situation: Situation,
  rng: () => number,
): string[] {
  const pool: Record<Ton, string[]> = {
    'emotional_aber_sachlich': [
      'hab gerade meinen bescheid geprüft und bin echt schockiert...',
      'ich versuch sachlich zu bleiben aber das ist einfach nicht fair',
      'danke für die tipps, hat mir echt geholfen. bin aber trotzdem wütend',
    ],
    'warmherzig': [
      'oh je, das kenne ich gut. halt durch! 💪',
      'wollte euch nur sagen: es wird besser. wirklich.',
      'fühl dich gedrückt. wir schaffen das zusammen',
    ],
    'unsicher': [
      'sorry für die dumme frage aber kann mir jemand erklären...',
      'bin mir total unsicher ob ich das richtig verstehe',
      'trau mich fast nicht zu fragen aber...',
    ],
    'kämpferisch': [
      'Leute, lasst euch das NICHT gefallen!',
      'Widerspruch einlegen, sofort! Die rechnen auf eure Ahnungslosigkeit!',
      'Hab gekämpft und GEWONNEN. Ihr könnt das auch!',
    ],
    'verunsichert': [
      'bin seit kurzem im bürgergeld und hab echt keine ahnung...',
      'kann mir jemand erklären was dieses schreiben bedeutet?',
      'fühle mich komplett überfordert von dem ganzen system',
    ],
    'präzise_juristisch': [
      'Laut § 22 Abs. 1 SGB II muss das Jobcenter die tatsächlichen KdU...',
      'Das BSG hat in seinem Urteil vom... entschieden, dass...',
      'Hier liegt ein Verstoß gegen den Bestimmtheitsgrundsatz vor.',
    ],
    'frustriert_sarkastisch': [
      '3 Stunden gewartet, dann sagt die mir ich soll nochmal kommen 🙄',
      'ach ja, das Jobcenter. verlässlich unzuverlässig seit...',
      'willkommen im Bürokratie-Wahnsinn. wird hier nie langweilig',
    ],
    'positiv_lösungsorientiert': [
      'Hat jemand Tipps? Will da raus und was verändern!',
      'es gibt Möglichkeiten, man muss sie nur kennen 💡',
      'Update: hat funktioniert! Danke an alle die geholfen haben!',
    ],
    'höflich_altmodisch': [
      'Guten Tag, ich bin neu hier und hoffe auf Hilfe.',
      'Vielen Dank im Voraus für Ihre Bemühungen.',
      'Ich möchte höflich anfragen, ob jemand Erfahrung hat mit...',
    ],
    'direkt_stark': [
      'Girls/Jungs, hört auf euren Bescheid zu ignorieren!',
      'Kurz und knapp: Widerspruch. Jetzt. Sofort.',
      'Klartext: Die haben falsch gerechnet und das ist EUER Geld.',
    ],
    'professionell': [
      'In meiner Beratung sehe ich das häufig. Mein Tipp:',
      'Ich empfehle dringend, sich an eine Sozialberatungsstelle zu wenden.',
      'Aus meiner Erfahrung: Dokumentiert alles schriftlich.',
    ],
    'abgeklärt_ironisch': [
      '10 Jahre Hartz/Bürgergeld. Ich kenn jeden Trick im Buch.',
      'Das System ist kaputt. Überrascht? Ich nicht mehr.',
      'Spoiler: Am Ende gewinnt meistens, wer nicht aufgibt.',
    ],
    'pragmatisch': [
      'Also rechnen wir mal nach: 563€ Regelsatz, davon...',
      'Schritt 1: Bescheid prüfen. Schritt 2: Widerspruch. Schritt 3: abwarten.',
      'Die Zahlen sprechen für sich. Hier ist der Fehler:',
    ],
    'dankbar_unsicher': [
      'Entschuldigung für mein Deutsch. Ich habe eine Frage...',
      'Vielen Dank für die Hilfe. Ich bin noch neu in Deutschland.',
      'Verstehe ich richtig, dass...?',
    ],
  }

  return pickN(pool[ton] || pool['emotional_aber_sachlich'], 3, rng)
}

// ── Generation Options ──

export interface GenerateOptions {
  count?: number
  seed?: number
  /** Append to existing personas instead of overwriting */
  append?: boolean
  /** Start ID offset (for append mode – auto-detected if not given) */
  startId?: number
  /** Label for this generation wave, e.g. "gruender", "welle2", "spaeteinsteiger" */
  wave?: string
  /** Force specific time profile(s) — one or comma-separated */
  timeProfile?: TimeProfile | TimeProfile[]
  /** Force specific posting frequency(ies) */
  frequency?: PostingFrequency | PostingFrequency[]
  /** Force specific engagement style(s) */
  engagement?: EngagementStyle | EngagementStyle[]
  /** Force specific situation(s) */
  situation?: Situation | Situation[]
  /** BescheidBoxer affinity range: "low"=0-0.1, "medium"=0.1-0.3, "high"=0.3-0.7, "none"=0, or "0.2-0.5" */
  bbAffinity?: string
  /** Earliest simulated join date (YYYY-MM) */
  joinFrom?: string
  /** Latest simulated join date (YYYY-MM) */
  joinTo?: string
}

function parseRange(spec: string): [number, number] {
  if (spec === 'none') return [0, 0]
  if (spec === 'low') return [0.01, 0.10]
  if (spec === 'medium') return [0.10, 0.30]
  if (spec === 'high') return [0.30, 0.70]
  if (spec.includes('-')) {
    const [a, b] = spec.split('-').map(Number)
    return [a, b]
  }
  const v = Number(spec)
  return [v, v]
}

function toArray<T>(v: T | T[] | undefined): T[] | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v : [v]
}

/**
 * Simuliert gestaffelte Beitrittszeitpunkte:
 * - Erste 40% (Gründer): 60-120 Tage alt → volle Aktivität
 * - Nächste 30% (Welle 2): 14-60 Tage alt → fast volle Aktivität
 * - Letzte 30% (Späteinsteiger): 0-14 Tage → Warm-Up-Phase
 */
function simulatedJoinTimestamp(index: number, total: number, rng: () => number): string {
  const now = Date.now()
  const pct = index / total

  let daysAgo: number
  if (pct < 0.4) {
    // Gründer-Welle: 60-120 Tage alt
    daysAgo = 60 + Math.floor(rng() * 60)
  } else if (pct < 0.7) {
    // Welle 2: 14-60 Tage alt
    daysAgo = 14 + Math.floor(rng() * 46)
  } else {
    // Späteinsteiger: 3-14 Tage alt (fast alle schon im Warm-Up)
    daysAgo = 3 + Math.floor(rng() * 11)
  }

  return new Date(now - daysAgo * 86400000).toISOString()
}

function randomJoinDate(
  rng: () => number,
  from?: string,
  to?: string,
): string {
  const parseYM = (s: string) => {
    const [y, m] = s.split('-').map(Number)
    return y * 12 + (m - 1)
  }
  const fromMonths = from ? parseYM(from) : parseYM('2024-01')
  const toMonths = to ? parseYM(to) : parseYM('2026-02')
  const m = fromMonths + Math.floor(rng() * (toMonths - fromMonths + 1))
  const year = Math.floor(m / 12)
  const month = (m % 12) + 1
  return `${year}-${String(month).padStart(2, '0')}`
}

// ── Main Generator ──

export function generatePersonas(opts: GenerateOptions = {}): Persona[] {
  const {
    count = 500,
    seed = 42,
    startId = 1,
    wave,
    joinFrom,
    joinTo,
  } = opts

  const rng = seededRng(seed)
  const personas: Persona[] = []
  const usedUsernames = new Set<string>()

  // Resolve filter arrays
  const filterTimeProfile = toArray(opts.timeProfile)
  const filterFrequency = toArray(opts.frequency)
  const filterEngagement = toArray(opts.engagement)
  const filterSituation = toArray(opts.situation)

  // Resolve BB affinity range
  const bbRange: [number, number] | undefined =
    opts.bbAffinity !== undefined ? parseRange(opts.bbAffinity) : undefined

  // Build situation weights filtered by opts
  const effectiveSituationWeights: [Situation, number][] = filterSituation
    ? SITUATION_WEIGHTS.filter(([s]) => filterSituation.includes(s))
    : [...SITUATION_WEIGHTS]

  // Fallback if filter matched nothing
  if (effectiveSituationWeights.length === 0) {
    effectiveSituationWeights.push(...SITUATION_WEIGHTS)
  }

  for (let i = 0; i < count; i++) {
    const idx = startId + i
    const id = `p_${String(idx).padStart(3, '0')}`
    const geschlecht: Gender = rng() < 0.55 ? 'w' : rng() < 0.97 ? 'm' : 'd'
    const vornamen = geschlecht === 'w' ? VORNAMEN_W : VORNAMEN_M
    const vorname = pick(vornamen, rng)
    const nachname = pick(NACHNAMEN_INITIAL, rng)
    const situation = weightedPick(
      effectiveSituationWeights as [string, number][],
      rng,
    ) as Situation
    const stadt = pick(STAEDTE, rng)

    // Generate unique username
    let username: string
    let attempts = 0
    do {
      username = sanitizeForEmail(generateUsername(vorname, nachname, i, situation, rng))
      attempts++
    } while (usedUsernames.has(username) && attempts < 20)
    if (usedUsernames.has(username)) username = `${username}_${idx}`
    usedUsernames.add(username)

    const alter = situation === 'senior'
      ? randInt(58, 75, rng)
      : situation === 'geflüchtet'
        ? randInt(22, 45, rng)
        : randInt(20, 58, rng)

    const hasKinder = ['alleinerziehend','paar_mit_kindern'].includes(situation)
    const kinderCount = hasKinder ? randInt(1, 4, rng) : 0

    const ton = pick(TONE_MAP[situation] || ['emotional_aber_sachlich' as Ton], rng)

    const schreibstilMap: Record<string, Schreibstil[]> = {
      geflüchtet: ['gebrochen_deutsch'],
      senior: ['hochdeutsch','umgangssprache_leicht'],
    }
    const schreibstil = pick(
      schreibstilMap[situation] || [
        'umgangssprache_stark','umgangssprache_mittel',
        'umgangssprache_leicht','hochdeutsch',
      ] as Schreibstil[],
      rng,
    )

    // Engagement style – use filter or random distribution
    let engagement_style: EngagementStyle
    if (filterEngagement) {
      engagement_style = pick(filterEngagement, rng)
    } else {
      const engagementRoll = rng()
      engagement_style =
        engagementRoll < 0.15 ? 'schreiber' :
        engagementRoll < 0.35 ? 'kommentierer' :
        engagementRoll < 0.50 ? 'mixed' :
        engagementRoll < 0.70 ? 'liker' : 'lurker_gelegentlich'
    }

    // Posting frequency – use filter or correlate with engagement
    let posting_frequency: PostingFrequency
    if (filterFrequency) {
      posting_frequency = pick(filterFrequency, rng)
    } else {
      const freqMap: Record<EngagementStyle, PostingFrequency[]> = {
        schreiber: ['taeglich','3_4_pro_woche'],
        kommentierer: ['3_4_pro_woche','2_3_pro_woche'],
        mixed: ['2_3_pro_woche','1_2_pro_woche'],
        liker: ['1_2_pro_woche','gelegentlich'],
        lurker_gelegentlich: ['gelegentlich','selten'],
      }
      posting_frequency = pick(freqMap[engagement_style], rng)
    }

    // Time profile – use filter or random
    const time_profile: TimeProfile = filterTimeProfile
      ? pick(filterTimeProfile, rng)
      : pick(['fruehaufsteher','berufstaetig','nachtaktiv','ganztags'] as TimeProfile[], rng)

    // Active forums based on situation
    const availableForums = FORUM_MAP[situation] || ['hilfe-bescheid','allgemeines']
    const forumCount = Math.min(availableForums.length, randInt(2, 4, rng))
    const active_forums = pickN(availableForums, forumCount, rng) as ForumId[]

    // Tags
    const baseTags = TAG_MAP[situation] || ['bescheid','buergergeld']
    const themen = pickN(baseTags, Math.min(baseTags.length, randInt(2, 5, rng)), rng) as ContentTag[]

    // Bescheidboxer affinity – use range or default distribution
    let bescheidboxer_affinity: number
    if (bbRange) {
      const [lo, hi] = bbRange
      bescheidboxer_affinity = lo === hi ? lo : Math.round((lo + rng() * (hi - lo)) * 100) / 100
    } else {
      const bb_roll = rng()
      bescheidboxer_affinity =
        bb_roll < 0.30 ? 0 :
        bb_roll < 0.55 ? Math.round(rng() * 10) / 100 :
        bb_roll < 0.80 ? Math.round((0.10 + rng() * 0.20) * 100) / 100 :
        Math.round((0.30 + rng() * 0.40) * 100) / 100
    }

    const display_name = rng() < 0.3
      ? vorname
      : `${vorname} ${nachname}`

    // Join date – use range or default distribution
    const seit = (joinFrom || joinTo)
      ? randomJoinDate(rng, joinFrom, joinTo)
      : (() => {
          const joinYear = 2024 + (rng() < 0.15 ? 0 : rng() < 0.4 ? 1 : 2)
          const joinMonth = randInt(1, 12, rng)
          return `${joinYear}-${String(joinMonth).padStart(2, '0')}`
        })()

    const profile: PersonaProfile = {
      alter,
      geschlecht,
      situation,
      kinder: kinderCount > 0 ? kinderCount : undefined,
      kinder_alter: kinderCount > 0
        ? Array.from({ length: kinderCount }, () => randInt(1, 16, rng))
        : undefined,
      stadt_typ: `${stadt.typ}_${stadt.land.toLowerCase().replace(/[^a-z]/g,'_')}`,
      bundesland: stadt.land,
      seit_buergergeld: seit,
      probleme: pickN(baseTags.map(String), randInt(1, 3, rng), rng),
      erfahrung_widerspruch: rng() < 0.4,
      ton,
      schreibstil,
      emoji_nutzung: pick(['nie','selten','gelegentlich','häufig'] as const, rng),
      tippfehler_rate: schreibstil === 'umgangssprache_stark'
        ? Math.round(rng() * 8) / 100
        : schreibstil === 'hochdeutsch' ? 0 : Math.round(rng() * 3) / 100,
      gross_klein_fehler: schreibstil === 'umgangssprache_stark' ? true :
        schreibstil === 'umgangssprache_mittel' ? rng() < 0.5 : false,
      beispiel_saetze: generateExampleSentences(ton, schreibstil, situation, rng),
    }

    const activity: PersonaActivity = {
      posting_frequency,
      time_profile,
      engagement_style,
      active_forums,
      themen_schwerpunkte: themen,
      kommentar_laenge: pick(['kurz','mittel','lang','mixed'] as const, rng),
      bescheidboxer_affinity,
    }

    const persona: Persona = {
      id,
      wp_user_id: null,
      username,
      email: `${sanitizeForEmail(username)}@buergergeld-blog.de`,
      display_name,
      password: generatePassword(rng),
      bio: generateBio(display_name, situation, stadt.name, alter, rng),
      avatar_color: pick(AVATAR_COLORS, rng),
      profile,
      activity,
      stats: {
        created_at: simulatedJoinTimestamp(i, count, rng),
        last_action: null,
        total_posts: 0,
        total_comments: 0,
        total_likes: 0,
        total_forum_topics: 0,
        total_forum_replies: 0,
      },
      ...(wave ? { wave } : {}),
    }

    personas.push(persona)
  }

  return personas
}

function generatePassword(rng: () => number): string {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%'
  return Array.from({ length: 20 }, () => chars[Math.floor(rng() * chars.length)]).join('')
}

function generateBio(
  name: string,
  situation: Situation,
  stadt: string,
  alter: number,
  rng: () => number,
): string {
  const bios: Record<string, string[]> = {
    alleinerziehend: [
      `Alleinerziehende Mama aus ${stadt}. Im Bürgergeld seit Kurzem.`,
      `${alter} Jahre, alleinerziehend. Kämpfe mich durch den Bürokratie-Dschungel.`,
      `Mama, Kämpferin, ${stadt}. Hier um zu helfen und Hilfe zu finden.`,
    ],
    single: [
      `Aus ${stadt}. Bin hier weil ich endlich verstehen will was mir zusteht.`,
      `${alter}, ${stadt}. Geteiltes Leid ist halbes Leid.`,
    ],
    langzeitbezieher: [
      `Schon länger im System. Kenne mich mittlerweile gut aus und helfe gerne.`,
      `Seit Jahren im Bürgergeld. ${stadt}. Lasst euch nicht unterkriegen!`,
    ],
    neubezieher: [
      `Neu im Bürgergeld, noch orientierungslos. Dankbar für jeden Tipp!`,
      `Frisch dabei, viele Fragen. ${stadt}.`,
    ],
    senior: [
      `Rentner in ${stadt}. Grundsicherung. Bin noch nicht so fit mit dem Internet.`,
      `Guten Tag, ${alter} Jahre alt, ${stadt}.`,
    ],
    geflüchtet: [
      `Aus der Ukraine. Lebe jetzt in ${stadt}. Lerne noch Deutsch.`,
      `Neu in Deutschland. ${stadt}. Danke für Ihre Hilfe.`,
    ],
    aufstocker: [
      `Arbeite im Minijob und stocke auf. ${stadt}.`,
      `Aufstocker aus ${stadt}. Freibeträge sind mein Lieblingsthema 😅`,
    ],
    trennung: [
      `Nach der Trennung alles neu. ${stadt}.`,
      `${alter}, frisch getrennt, ${stadt}. Versuche klarzukommen.`,
    ],
    paar_mit_kindern: [
      `Familie mit Kindern in ${stadt}. Bürgergeld. Wird schon.`,
    ],
    paar_ohne_kinder: [
      `${stadt}. Gemeinsam durch die Bürokratie.`,
    ],
    behinderung: [
      `${alter}, ${stadt}. Schwerbehindert. Kämpfe um meinen Mehrbedarf.`,
    ],
  }

  return pick(bios[situation] || [`Aus ${stadt}. Hier um Erfahrungen zu teilen.`], rng)
}
