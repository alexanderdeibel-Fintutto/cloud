// ══════════════════════════════════════════════════════════════
// Scheduling Engine – Erstellt realistische Tagespläne
// 4 Uhrzeitprofile, Häufigkeitsprofile, Wochenend-Logik
// ══════════════════════════════════════════════════════════════

import type {
  Persona, ScheduledAction, ActionType,
  TimeProfile, PostingFrequency, EngagementStyle, BotConfig,
} from '../personas/types'
import { loadPersonas } from '../db'

// ── 4 Uhrzeitprofile (Stunden mit Gewichtung) ──

const TIME_PROFILES: Record<TimeProfile, [number, number][]> = {
  // [Stunde, relatives Gewicht]
  fruehaufsteher: [
    [6, 3], [7, 8], [8, 10], [9, 9], [10, 7],
    [11, 4], [12, 6], [13, 5], [14, 3],
    [15, 2], [16, 1], [17, 1], [18, 2], [19, 2], [20, 1],
  ],
  berufstaetig: [
    [7, 3], [8, 2],
    [12, 5], [13, 4],
    [18, 6], [19, 9], [20, 10], [21, 9], [22, 7], [23, 3],
  ],
  nachtaktiv: [
    [14, 3], [15, 4], [16, 5], [17, 6], [18, 7],
    [19, 8], [20, 9], [21, 10], [22, 10], [23, 9],
    [0, 6], [1, 3],
  ],
  ganztags: [
    [8, 4], [9, 6], [10, 7], [11, 6], [12, 5],
    [13, 5], [14, 6], [15, 5], [16, 5], [17, 6],
    [18, 7], [19, 8], [20, 8], [21, 7], [22, 5],
  ],
}

// ── Häufigkeitsprofile: Aktionen pro Woche ──

const FREQUENCY_MAP: Record<PostingFrequency, { min: number; max: number }> = {
  taeglich:         { min: 5, max: 10 },
  '3_4_pro_woche':  { min: 3, max: 5 },
  '2_3_pro_woche':  { min: 2, max: 4 },
  '1_2_pro_woche':  { min: 1, max: 2 },
  gelegentlich:     { min: 0, max: 1 },
  selten:           { min: 0, max: 1 },
}

// ── Engagement-Stil → Action-Type Verteilung ──

const ENGAGEMENT_ACTION_WEIGHTS: Record<EngagementStyle, [ActionType, number][]> = {
  schreiber: [
    ['blog_post', 20], ['forum_topic', 25],
    ['blog_comment', 15], ['forum_reply', 20],
    ['like', 20],
  ],
  kommentierer: [
    ['blog_post', 5], ['forum_topic', 5],
    ['blog_comment', 30], ['forum_reply', 30],
    ['like', 30],
  ],
  liker: [
    ['blog_post', 2], ['forum_topic', 2],
    ['blog_comment', 10], ['forum_reply', 10],
    ['like', 76],
  ],
  lurker_gelegentlich: [
    ['blog_post', 5], ['forum_topic', 5],
    ['blog_comment', 15], ['forum_reply', 15],
    ['like', 60],
  ],
  mixed: [
    ['blog_post', 12], ['forum_topic', 13],
    ['blog_comment', 20], ['forum_reply', 20],
    ['like', 35],
  ],
}

// ── Helpers ──

function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function weightedPick<T>(items: [T, number][], rng: () => number): T {
  const total = items.reduce((s, [, w]) => s + w, 0)
  let r = rng() * total
  for (const [val, w] of items) {
    r -= w
    if (r <= 0) return val
  }
  return items[0][0]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/**
 * Wählt eine realistische Uhrzeit basierend auf dem Zeitprofil
 */
function pickHour(profile: TimeProfile, rng: () => number): number {
  const weights = TIME_PROFILES[profile]
  return weightedPick(weights, rng)
}

function pickMinute(rng: () => number): number {
  return Math.floor(rng() * 60)
}

/**
 * Prüft ob eine Persona heute aktiv sein sollte
 * Berücksichtigt jetzt auch Warm-Up (Account-Alter)
 */
function isActiveToday(
  persona: Persona,
  dayOfWeek: number, // 0=So, 6=Sa
  rng: () => number,
  today?: Date,
): boolean {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const freq = persona.activity.posting_frequency

  // Basis-Wahrscheinlichkeit pro Tag
  const dailyChance: Record<PostingFrequency, number> = {
    taeglich: 0.85,
    '3_4_pro_woche': 0.50,
    '2_3_pro_woche': 0.35,
    '1_2_pro_woche': 0.20,
    gelegentlich: 0.08,
    selten: 0.03,
  }

  let chance = dailyChance[freq]

  // Wochenende: 60% der Werktags-Aktivität
  if (isWeekend) chance *= 0.6

  // ── Warm-Up: Neue Personas starten langsam ──
  if (persona.stats.created_at && today) {
    const createdAt = new Date(persona.stats.created_at)
    const ageDays = Math.floor((today.getTime() - createdAt.getTime()) / 86400000)

    if (ageDays < 3) chance = 0            // Tage 0-2: Nur Profil angelegt, noch nicht aktiv
    else if (ageDays < 7) chance *= 0.15   // Tage 3-6: Sehr selten (erste Kommentare)
    else if (ageDays < 14) chance *= 0.4   // Tage 7-13: Langsam reinwachsen
    else if (ageDays < 30) chance *= 0.7   // Tage 14-29: Fast normal
    // Ab Tag 30: volle Aktivität
  }

  // ── Zufällige Pausen: ~5% Chance auf "freien Tag" ──
  if (rng() < 0.05) return false

  return rng() < chance
}

/**
 * Bestimmt wie viele Aktionen eine Persona heute durchführt
 */
function getActionCount(persona: Persona, rng: () => number): number {
  const freq = persona.activity.posting_frequency
  const range = FREQUENCY_MAP[freq]

  // Pro Tag: max 1-3 Aktionen je nach Frequenz
  const maxToday = freq === 'taeglich' ? 3 :
    freq === '3_4_pro_woche' ? 2 : 1

  return Math.min(maxToday, Math.max(1, Math.floor(rng() * (range.max + 1))))
}

/**
 * Generiert den Tagesplan für ALLE Personas
 */
export function generateDailySchedule(
  date: Date,
  config: BotConfig,
): ScheduledAction[] {
  const personas = loadPersonas()
  const dayOfWeek = date.getDay()
  const dateStr = date.toISOString().slice(0, 10)
  const seed = parseInt(dateStr.replace(/-/g, ''), 10)
  const rng = seededRng(seed)

  const schedule: ScheduledAction[] = []
  let totalPosts = 0
  let totalComments = 0

  for (const persona of personas) {
    // Soll diese Persona heute aktiv sein? (inkl. Warm-Up + Pausen)
    if (!isActiveToday(persona, dayOfWeek, rng, date)) continue

    const actionCount = getActionCount(persona, rng)

    // Warm-Up: Account-Alter berechnen für Action-Type-Steuerung
    const personaAgeDays = persona.stats.created_at
      ? Math.floor((date.getTime() - new Date(persona.stats.created_at).getTime()) / 86400000)
      : 999

    for (let a = 0; a < actionCount; a++) {
      // Rate-Limits prüfen
      let actionType: ActionType

      // Warm-Up Phase: Neue Personas kommentieren nur, posten nicht
      if (personaAgeDays < 14) {
        // Erste 2 Wochen: Nur Kommentare, Replies, Likes (keine eigenen Posts/Topics)
        const warmupWeights: [ActionType, number][] = [
          ['blog_comment', 30], ['forum_reply', 40], ['like', 30],
        ]
        actionType = weightedPick(warmupWeights, rng)
      } else {
        actionType = weightedPick(
          ENGAGEMENT_ACTION_WEIGHTS[persona.activity.engagement_style],
          rng,
        )
      }

      const isPost = actionType === 'blog_post' || actionType === 'forum_topic'
      const isComment = actionType === 'blog_comment' || actionType === 'blog_comment_reply' || actionType === 'forum_reply'

      if (isPost && totalPosts >= config.bot_max_posts_per_day) continue
      if (isComment && totalComments >= config.bot_max_comments_per_day) continue

      // Uhrzeit wählen
      const hour = pickHour(persona.activity.time_profile, rng)
      if (hour < config.bot_active_hours_start || hour >= config.bot_active_hours_end) continue

      const minute = pickMinute(rng)
      const scheduledAt = new Date(
        date.getFullYear(), date.getMonth(), date.getDate(),
        hour, minute, Math.floor(rng() * 60)
      )

      // Forum-ID für forum_topic / forum_reply
      const forumId = persona.activity.active_forums.length > 0
        ? persona.activity.active_forums[Math.floor(rng() * persona.activity.active_forums.length)]
        : 'allgemeines'

      // Kategorie-ID für blog_post basierend auf Forum-Mapping
      const forumToCategoryKey: Record<string, string> = {
        'hilfe-bescheid': 'aktuelles',
        'widerspruch': 'widerspruch',
        'sanktionen': 'sanktionen',
        'kdu-miete': 'kdu_miete',
        'zuverdienst': 'einkommen',
        'erfolge': 'erfahrungen',
        'auskotzen': 'erfahrungen',
        'allgemeines': 'aktuelles',
      }
      const categoryKey = forumToCategoryKey[forumId] || 'aktuelles'
      const categoryId = config.category_ids[categoryKey] || 0

      const action: ScheduledAction = {
        id: generateId(),
        persona_id: persona.id,
        action_type: actionType,
        scheduled_at: scheduledAt.toISOString(),
        executed_at: null,
        status: 'pending',
        target: {
          forum_id: forumId,
          ...(actionType === 'blog_post' && categoryId > 0 ? { category_id: categoryId } : {}),
        },
      }

      schedule.push(action)

      if (isPost) totalPosts++
      if (isComment) totalComments++
    }
  }

  // Nach Zeit sortieren + Mindestabstand erzwingen
  schedule.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))

  return enforceMinDelay(schedule, config.bot_min_delay_minutes)
}

/**
 * Erzwingt Mindestabstand zwischen Aktionen
 */
function enforceMinDelay(
  schedule: ScheduledAction[],
  minDelayMinutes: number,
): ScheduledAction[] {
  if (schedule.length <= 1) return schedule

  for (let i = 1; i < schedule.length; i++) {
    const prevTime = new Date(schedule[i - 1].scheduled_at).getTime()
    const currTime = new Date(schedule[i].scheduled_at).getTime()
    const diffMinutes = (currTime - prevTime) / 60000

    if (diffMinutes < minDelayMinutes) {
      const newTime = new Date(prevTime + minDelayMinutes * 60000)
      schedule[i].scheduled_at = newTime.toISOString()
    }
  }

  return schedule
}

/**
 * Generiert einen Wochenplan (7 Tage)
 */
export function generateWeeklySchedule(
  startDate: Date,
  config: BotConfig,
): ScheduledAction[] {
  const allActions: ScheduledAction[] = []

  for (let d = 0; d < 7; d++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + d)
    const daily = generateDailySchedule(date, config)
    allActions.push(...daily)
  }

  return allActions
}

/**
 * Zeigt eine Zusammenfassung des Tagesplans
 */
export function summarizeSchedule(schedule: ScheduledAction[]): {
  total: number
  byType: Record<ActionType, number>
  byHour: Record<number, number>
  personas: number
} {
  const byType: Record<string, number> = {}
  const byHour: Record<number, number> = {}
  const personaSet = new Set<string>()

  for (const action of schedule) {
    byType[action.action_type] = (byType[action.action_type] || 0) + 1
    const hour = new Date(action.scheduled_at).getHours()
    byHour[hour] = (byHour[hour] || 0) + 1
    personaSet.add(action.persona_id)
  }

  return {
    total: schedule.length,
    byType: byType as Record<ActionType, number>,
    byHour,
    personas: personaSet.size,
  }
}
