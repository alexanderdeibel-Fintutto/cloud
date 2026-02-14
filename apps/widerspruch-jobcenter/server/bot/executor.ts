// ══════════════════════════════════════════════════════════════
// Bot Executor – Führt geplante Aktionen aus
// Verbindet Scheduler + Content Generator + WordPress API
// ══════════════════════════════════════════════════════════════

import type { BotConfig, ScheduledAction, Persona } from '../personas/types'
import { WordPressClient } from '../wordpress/client'
import {
  loadPersonas, getPersonaById, updatePersona,
  getPendingActions, updateScheduledAction,
  logActivity, getTodaysActivityCount,
  loadSchedule, saveSchedule,
} from '../db'
import { generateContent } from '../content/generator'
import { generateDailySchedule, summarizeSchedule } from './scheduler'
import { sanitizeForEmail } from '../personas/generator'

export class BotExecutor {
  private wp: WordPressClient
  private running = false
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor(private config: BotConfig) {
    this.wp = new WordPressClient(config)
  }

  // ── Einmaliges Setup: Personas als WP-User anlegen ──

  async setupPersonasInWordPress(): Promise<{ created: number; skipped: number; errors: string[] }> {
    const personas = loadPersonas()
    let created = 0
    let skipped = 0
    const errors: string[] = []

    for (const persona of personas) {
      if (persona.wp_user_id) {
        skipped++
        continue
      }

      try {
        const nameParts = persona.display_name.split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ') || ''

        const wpUser = await this.wp.createUser({
          username: persona.username,
          email: sanitizeForEmail(persona.email),
          password: persona.password,
          first_name: firstName,
          last_name: lastName,
          name: persona.display_name,
          nickname: persona.display_name,
          description: persona.bio,
          roles: ['subscriber'],
        })

        updatePersona(persona.id, { wp_user_id: wpUser.id })
        created++

        // Rate limiting: 1 Request/Sekunde
        await sleep(1000)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)

        // User existiert bereits in WP → ID nachsynchronisieren
        if (msg.includes('existing_user_login') || msg.includes('existing_user_email')) {
          try {
            const existing = await this.wp.getUserByUsername(persona.username)
            if (existing) {
              updatePersona(persona.id, { wp_user_id: existing.id })
              skipped++
              await sleep(500)
              continue
            }
          } catch { /* lookup fehlgeschlagen → als Fehler melden */ }
        }

        errors.push(`${persona.id} (${persona.username}): ${msg}`)
      }
    }

    return { created, skipped, errors }
  }

  // ── Tagesplan generieren ──

  generateTodaysSchedule(): { actions: number; summary: ReturnType<typeof summarizeSchedule> } {
    const today = new Date()
    const schedule = generateDailySchedule(today, this.config)

    // Bestehende pending actions für heute entfernen
    const todayStr = today.toISOString().slice(0, 10)
    const existingSchedule = loadSchedule()
    const otherDays = existingSchedule.filter(a => !a.scheduled_at.startsWith(todayStr) || a.status !== 'pending')
    saveSchedule([...otherDays, ...schedule])

    // Content für jede Aktion generieren
    const personas = loadPersonas()
    const personaMap = new Map(personas.map(p => [p.id, p]))

    for (const action of schedule) {
      const persona = personaMap.get(action.persona_id)
      if (!persona) continue

      const enriched = generateContent(persona, action, this.config.bescheidboxer_mention_rate)
      updateScheduledAction(enriched.id, { content: enriched.content })
    }

    return {
      actions: schedule.length,
      summary: summarizeSchedule(schedule),
    }
  }

  // ── Einzelne Aktion ausführen ──

  async executeAction(action: ScheduledAction): Promise<void> {
    const persona = getPersonaById(action.persona_id)
    if (!persona || !persona.wp_user_id) {
      updateScheduledAction(action.id, {
        status: 'failed',
        result: { error: 'Persona oder WP-User nicht gefunden' },
      })
      return
    }

    // Tages-Limits prüfen
    const counts = getTodaysActivityCount()
    const isPost = action.action_type === 'blog_post' || action.action_type === 'forum_topic'
    const isComment = ['blog_comment', 'blog_comment_reply', 'forum_reply'].includes(action.action_type)

    if (isPost && counts.posts >= this.config.bot_max_posts_per_day) {
      updateScheduledAction(action.id, { status: 'failed', result: { error: 'Tages-Limit Posts erreicht' } })
      return
    }
    if (isComment && counts.comments >= this.config.bot_max_comments_per_day) {
      updateScheduledAction(action.id, { status: 'failed', result: { error: 'Tages-Limit Comments erreicht' } })
      return
    }

    updateScheduledAction(action.id, { status: 'executing' })

    try {
      let wpId: number | undefined

      // Für comment/reply: post_id/topic_id dynamisch aus WP holen falls nicht gesetzt
      if (
        (action.action_type === 'blog_comment' || action.action_type === 'blog_comment_reply') &&
        !action.target.post_id
      ) {
        try {
          const posts = await this.wp.getRecentPosts(50)
          if (posts.length > 0) {
            // Zufällig einen Post wählen (gewichtet auf neuere)
            const idx = Math.floor(Math.random() * Math.min(posts.length, 20))
            action.target.post_id = posts[idx].id
            updateScheduledAction(action.id, { target: action.target })
          }
        } catch { /* Kein Post verfügbar – wird unten abgefangen */ }
      }

      if (action.action_type === 'forum_reply' && !action.target.topic_id) {
        try {
          const forumWpId = action.target.forum_id
            ? this.config.forum_ids[action.target.forum_id as keyof typeof this.config.forum_ids]
            : 0
          const topics = await this.wp.getForumTopics(forumWpId || undefined, 20)
          if (topics.length > 0) {
            const idx = Math.floor(Math.random() * topics.length)
            action.target.topic_id = topics[idx].id
            updateScheduledAction(action.id, { target: action.target })
          }
        } catch { /* Kein Topic verfügbar */ }
      }

      switch (action.action_type) {
        case 'blog_post': {
          if (!action.content) break
          const post = await this.wp.createPost({
            title: action.content.title || 'Untitled',
            content: `<p>${action.content.body.replace(/\n/g, '</p><p>')}</p>`,
            author: persona.wp_user_id,
            categories: action.target.category_id ? [action.target.category_id] : undefined,
          })
          wpId = post.id
          break
        }

        case 'forum_topic': {
          if (!action.content) break
          const forumWpId = action.target.forum_id
            ? this.config.forum_ids[action.target.forum_id as keyof typeof this.config.forum_ids]
            : 0
          if (forumWpId) {
            const topic = await this.wp.createForumTopic({
              forum_id: forumWpId,
              title: action.content.title || 'Untitled',
              content: `<p>${action.content.body.replace(/\n/g, '</p><p>')}</p>`,
              author: persona.wp_user_id,
            })
            wpId = topic.id
          }
          break
        }

        case 'blog_comment':
        case 'blog_comment_reply': {
          if (!action.content || !action.target.post_id) break
          const comment = await this.wp.createComment({
            post: action.target.post_id,
            author: persona.wp_user_id,
            author_name: persona.display_name,
            author_email: persona.email,
            content: action.content.body,
            parent: action.target.comment_id || undefined,
          })
          wpId = comment.id
          break
        }

        case 'forum_reply': {
          if (!action.content || !action.target.topic_id) break
          const forumWpId = action.target.forum_id
            ? this.config.forum_ids[action.target.forum_id as keyof typeof this.config.forum_ids]
            : 0
          if (forumWpId && action.target.topic_id) {
            const reply = await this.wp.createForumReply({
              topic_id: action.target.topic_id,
              forum_id: forumWpId,
              content: action.content.body,
              author: persona.wp_user_id,
            })
            wpId = reply.id
          }
          break
        }

        case 'like':
          // Likes sind WordPress-abhängig (Plugin nötig) - skip für jetzt
          break
      }

      // Erfolg loggen
      updateScheduledAction(action.id, {
        status: 'done',
        executed_at: new Date().toISOString(),
        result: { wp_id: wpId },
      })

      logActivity({
        timestamp: new Date().toISOString(),
        persona_id: action.persona_id,
        action_type: action.action_type,
        wp_id: wpId,
        success: true,
      })

      // Persona-Stats aktualisieren
      const statKey = isPost ? 'total_posts' : isComment ? 'total_comments' : 'total_likes'
      updatePersona(persona.id, {
        stats: {
          ...persona.stats,
          [statKey]: (persona.stats[statKey as keyof typeof persona.stats] as number || 0) + 1,
          last_action: new Date().toISOString(),
        },
      })

      console.log(`[BOT] ✓ ${action.action_type} von ${persona.username} (WP-ID: ${wpId})`)

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)

      updateScheduledAction(action.id, {
        status: 'failed',
        result: { error: msg },
      })

      logActivity({
        timestamp: new Date().toISOString(),
        persona_id: action.persona_id,
        action_type: action.action_type,
        success: false,
        details: msg,
      })

      console.error(`[BOT] ✗ ${action.action_type} von ${persona.username}: ${msg}`)
    }
  }

  // ── Bot-Loop starten ──

  async start(): Promise<void> {
    if (this.running) {
      console.log('[BOT] Bereits gestartet.')
      return
    }

    this.running = true
    console.log('[BOT] Bot gestartet.')
    console.log(`[BOT] Aktive Stunden: ${this.config.bot_active_hours_start}:00 - ${this.config.bot_active_hours_end}:00`)
    console.log(`[BOT] Max Posts/Tag: ${this.config.bot_max_posts_per_day}, Max Comments/Tag: ${this.config.bot_max_comments_per_day}`)

    await this.tick()
  }

  stop(): void {
    this.running = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    console.log('[BOT] Bot gestoppt.')
  }

  private async tick(): Promise<void> {
    if (!this.running) return

    const now = new Date()
    const hour = now.getHours()

    // Außerhalb der aktiven Stunden: schlafe bis Start
    if (hour < this.config.bot_active_hours_start || hour >= this.config.bot_active_hours_end) {
      const nextStart = new Date(now)
      if (hour >= this.config.bot_active_hours_end) {
        nextStart.setDate(nextStart.getDate() + 1)
      }
      nextStart.setHours(this.config.bot_active_hours_start, 0, 0, 0)
      const sleepMs = nextStart.getTime() - now.getTime()
      console.log(`[BOT] Schlafe bis ${nextStart.toLocaleTimeString('de-DE')} (${Math.round(sleepMs / 60000)} Minuten)`)
      this.timer = setTimeout(() => this.tick(), sleepMs)
      return
    }

    // Pending Actions ausführen
    const pending = getPendingActions()
    if (pending.length > 0) {
      const action = pending[0]
      console.log(`[BOT] Führe Aktion aus: ${action.action_type} für ${action.persona_id}`)
      await this.executeAction(action)
    }

    // Nächsten Tick planen (30 Sekunden bis 2 Minuten)
    const nextTickMs = 30000 + Math.random() * 90000
    this.timer = setTimeout(() => this.tick(), nextTickMs)
  }

  // ── Status ──

  getStatus(): {
    running: boolean
    todayCounts: { posts: number; comments: number }
    pendingActions: number
    totalPersonas: number
    personasWithWpId: number
  } {
    const personas = loadPersonas()
    return {
      running: this.running,
      todayCounts: getTodaysActivityCount(),
      pendingActions: getPendingActions().length,
      totalPersonas: personas.length,
      personasWithWpId: personas.filter(p => p.wp_user_id !== null).length,
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
