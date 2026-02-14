// ══════════════════════════════════════════════════════════════
// Content Generator – Erzeugt Inhalte im Stil der jeweiligen Persona
// Kombiniert Templates + Persona-Profil + BescheidBoxer-Logik
// ══════════════════════════════════════════════════════════════

import type { Persona, ScheduledAction, ForumId, ActionType } from '../personas/types'
import {
  TITLE_TEMPLATES,
  CONTENT_OPENERS,
  CONTENT_BODIES,
  COMMENT_TEMPLATES,
  BESCHEIDBOXER_MENTIONS,
  fillTemplate,
} from './templates'

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

// ── Schreibstil-Transformation ──

function applySchreibstil(text: string, persona: Persona, rng: () => number): string {
  let result = text
  const { schreibstil, tippfehler_rate, gross_klein_fehler, emoji_nutzung } = persona.profile

  // Groß-/Kleinschreibung
  if (gross_klein_fehler && schreibstil !== 'hochdeutsch' && schreibstil !== 'juristisch') {
    if (rng() < 0.6) {
      result = result.toLowerCase()
      // Satzanfänge teilweise großschreiben
      result = result.replace(/(^|[.!?]\s+)([a-zäöü])/g, (_, prefix, char) => {
        return rng() < 0.3 ? prefix + char.toUpperCase() : prefix + char
      })
    }
  }

  // Tippfehler einstreuen
  if (tippfehler_rate > 0) {
    const chars = result.split('')
    for (let i = 0; i < chars.length; i++) {
      if (rng() < tippfehler_rate && chars[i].match(/[a-zäöü]/i)) {
        const typos: Record<string, string> = {
          'e': 'r', 'r': 'e', 'i': 'u', 'u': 'i', 's': 'd', 'd': 's',
          'n': 'm', 'm': 'n', 'a': 's', 't': 'z', 'z': 't',
          'ä': 'a', 'ö': 'o', 'ü': 'u',
        }
        const lower = chars[i].toLowerCase()
        if (typos[lower]) {
          chars[i] = chars[i] === lower ? typos[lower] : typos[lower].toUpperCase()
        }
      }
    }
    result = chars.join('')
  }

  // Umgangssprache-Abkürzungen
  if (schreibstil === 'umgangssprache_stark' || schreibstil === 'umgangssprache_mittel') {
    const subs: [RegExp, string][] = [
      [/\beine\b/gi, 'ne'],
      [/\beinen\b/gi, 'nen'],
      [/\bnicht\b/gi, rng() < 0.3 ? 'nich' : 'nicht'],
      [/\bwirklich\b/gi, rng() < 0.4 ? 'echt' : 'wirklich'],
      [/\bDas ist\b/g, rng() < 0.3 ? 'Is' : 'Das ist'],
    ]
    if (schreibstil === 'umgangssprache_stark') {
      for (const [pattern, replacement] of subs) {
        if (rng() < 0.5) {
          result = result.replace(pattern, replacement)
        }
      }
    }
  }

  // Emojis einfügen
  if (emoji_nutzung !== 'nie') {
    const emojiChance = emoji_nutzung === 'häufig' ? 0.4 :
      emoji_nutzung === 'gelegentlich' ? 0.2 : 0.08
    if (rng() < emojiChance) {
      const emojis = ['😤','😢','🙏','💪','❤️','👍','😊','🤔','😡','🎉','👆','💡','⚠️']
      result += ' ' + pick(emojis, rng)
    }
  }

  return result
}

// ── Hauptfunktionen ──

/**
 * Generiert einen vollständigen Post (Titel + Content) für eine Persona
 */
export function generatePostContent(
  persona: Persona,
  action: ScheduledAction,
  globalMentionRate: number,
): { title: string; body: string; tags: string[] } {
  const seed = parseInt(action.id.replace(/[^0-9]/g, '') || '0', 10) + Date.now()
  const rng = seededRng(seed)

  const forumId = (action.target.forum_id || persona.activity.active_forums[0] || 'allgemeines') as ForumId
  const titles = TITLE_TEMPLATES[forumId] || TITLE_TEMPLATES['allgemeines']
  const bodies = CONTENT_BODIES[forumId] || CONTENT_BODIES['allgemeines']

  // Titel generieren
  const titleTemplate = pick(titles, rng)
  let title = fillTemplate(titleTemplate, rng)

  // Content generieren
  const openType = action.action_type === 'forum_topic'
    ? (rng() < 0.5 ? 'frage' : rng() < 0.7 ? 'bericht' : 'frust')
    : (rng() < 0.3 ? 'tipp' : rng() < 0.6 ? 'bericht' : 'erfolg')

  const openers = CONTENT_OPENERS[openType] || CONTENT_OPENERS['frage']
  const opener = pick(openers, rng)
  const bodyTemplate = pick(bodies, rng)
  const body = fillTemplate(bodyTemplate, rng)

  let fullContent = `${opener}\n\n${body}`

  // BescheidBoxer Mention?
  const shouldMention = rng() < (persona.activity.bescheidboxer_affinity * globalMentionRate * 5)
  if (shouldMention) {
    const mentionType = rng() < 0.4 ? 'beilaeufig' :
      rng() < 0.6 ? 'antwort_auf_frage' :
      rng() < 0.8 ? 'erfolgsgeschichte' : 'skeptisch_dann_ueberzeugt'

    const mentions = BESCHEIDBOXER_MENTIONS[mentionType as keyof typeof BESCHEIDBOXER_MENTIONS]
    if (mentions) {
      const mention = fillTemplate(pick(mentions, rng), rng)
      fullContent += `\n\n${mention}`
    }
  }

  // Abschluss
  const closings = [
    'Was meint ihr?', 'Hat jemand ähnliche Erfahrungen?',
    'Danke schonmal!', 'Bin für jeden Tipp dankbar.',
    'Freue mich auf eure Antworten.', 'LG', 'Gruß', '',
    'Danke im Voraus!', 'Wäre super wenn jemand helfen kann.',
  ]
  const closing = pick(closings, rng)
  if (closing) fullContent += `\n\n${closing}`

  // Stil anwenden
  fullContent = applySchreibstil(fullContent, persona, rng)

  // Tags aus Persona-Schwerpunkten
  const tags = persona.activity.themen_schwerpunkte.slice(0, 3).map(String)

  return { title, body: fullContent, tags }
}

/**
 * Generiert einen Kommentar / eine Antwort
 */
export function generateCommentContent(
  persona: Persona,
  action: ScheduledAction,
  globalMentionRate: number,
  contextPostTitle?: string,
): string {
  const seed = parseInt(action.id.replace(/[^0-9]/g, '') || '0', 10) + Date.now()
  const rng = seededRng(seed)

  const { engagement_style, kommentar_laenge, bescheidboxer_affinity } = persona.activity

  // Kommentar-Typ wählen basierend auf Persona
  const typeWeights: [string, number][] =
    engagement_style === 'kommentierer'
      ? [['rat', 30], ['empathie', 20], ['frage', 15], ['zustimmung', 15], ['rechtlich', 10], ['danke', 10]]
      : [['empathie', 25], ['zustimmung', 20], ['frage', 20], ['rat', 15], ['danke', 15], ['rechtlich', 5]]

  const total = typeWeights.reduce((s, [, w]) => s + w, 0)
  let r = rng() * total
  let commentType = 'empathie'
  for (const [type, weight] of typeWeights) {
    r -= weight
    if (r <= 0) { commentType = type; break }
  }

  const templates = COMMENT_TEMPLATES[commentType as keyof typeof COMMENT_TEMPLATES] || COMMENT_TEMPLATES.empathie
  let content = fillTemplate(pick(templates, rng), rng)

  // Längere Kommentare für bestimmte Stile
  if (kommentar_laenge === 'lang' || (kommentar_laenge === 'mixed' && rng() < 0.3)) {
    const extra = COMMENT_TEMPLATES[
      pick(['rat', 'empathie', 'rechtlich'] as const, rng)
    ]
    if (extra) {
      content += '\n\n' + fillTemplate(pick(extra, rng), rng)
    }
  }

  // BescheidBoxer Mention?
  const shouldMention = rng() < (bescheidboxer_affinity * globalMentionRate * 4)
  if (shouldMention) {
    const mentionPool = rng() < 0.4
      ? BESCHEIDBOXER_MENTIONS.kurz
      : rng() < 0.7
        ? BESCHEIDBOXER_MENTIONS.antwort_auf_frage
        : BESCHEIDBOXER_MENTIONS.beilaeufig
    content += '\n\n' + fillTemplate(pick(mentionPool, rng), rng)
  }

  // Stil anwenden
  content = applySchreibstil(content, persona, rng)

  return content
}

/**
 * Generiert Content für eine beliebige ScheduledAction
 */
export function generateContent(
  persona: Persona,
  action: ScheduledAction,
  globalMentionRate: number,
): ScheduledAction {
  if (action.action_type === 'blog_post' || action.action_type === 'forum_topic') {
    const { title, body, tags } = generatePostContent(persona, action, globalMentionRate)
    return {
      ...action,
      content: { title, body, tags },
    }
  }

  if (
    action.action_type === 'blog_comment' ||
    action.action_type === 'blog_comment_reply' ||
    action.action_type === 'forum_reply'
  ) {
    const body = generateCommentContent(persona, action, globalMentionRate)
    return {
      ...action,
      content: { body },
    }
  }

  // Like: kein Content nötig
  return action
}
