// ══════════════════════════════════════════════════════════════
// Express API Routes – Dashboard ↔ Bot Kommunikation
// ══════════════════════════════════════════════════════════════

import { Router, json } from 'express'
import type { BotConfig } from '../personas/types'
import { BotExecutor } from '../bot/executor'
import {
  loadPersonas, savePersonas, loadSchedule, saveSchedule,
  loadActivityLog, getTodaysActions,
} from '../db'
import { generatePersonas, sanitizeForEmail } from '../personas/generator'
import { summarizeSchedule } from '../bot/scheduler'
import type { Persona, ScheduledAction } from '../personas/types'
import { STARTER_THREADS } from '../content/starter-threads'

export function createApiRouter(config: BotConfig, executor: BotExecutor): Router {
  const router = Router()
  router.use(json())

  // ── API Index ──

  router.get('/', (_req, res) => {
    res.json({
      service: 'Board-Bot API',
      endpoints: {
        'GET /api/status': 'Bot-Status',
        'GET /api/personas': 'Alle Personas (paginiert)',
        'GET /api/personas/:id': 'Einzelne Persona',
        'GET /api/schedule': 'Vollständiger Schedule',
        'GET /api/schedule/today': 'Heutiger Plan',
        'GET /api/activity': 'Aktivitäts-Log',
        'GET /api/config': 'Bot-Konfiguration',
        'GET /api/wp/test': 'WordPress-Verbindung testen',
        'POST /api/personas/generate': 'Personas generieren',
        'POST /api/bot/start': 'Bot starten',
        'POST /api/bot/stop': 'Bot stoppen',
        'POST /api/bot/generate-schedule': 'Tagesplan erstellen',
        'POST /api/bot/setup-wp-users': 'WP-User anlegen',
      },
    })
  })

  // ── Bot Status ──

  router.get('/status', (_req, res) => {
    res.json(executor.getStatus())
  })

  // ── Bot Controls ──

  router.post('/bot/start', async (_req, res) => {
    await executor.start()
    res.json({ message: 'Bot gestartet', status: executor.getStatus() })
  })

  router.post('/bot/stop', (_req, res) => {
    executor.stop()
    res.json({ message: 'Bot gestoppt', status: executor.getStatus() })
  })

  router.post('/bot/generate-schedule', (_req, res) => {
    const result = executor.generateTodaysSchedule()
    res.json({ message: `${result.actions} Aktionen geplant`, summary: result.summary })
  })

  router.post('/bot/setup-wp-users', async (_req, res) => {
    if (executor.wpSetupProgress.running) {
      return res.json({ message: 'WP-User-Setup läuft bereits', progress: executor.wpSetupProgress })
    }
    // Fire-and-forget: starte Setup im Hintergrund, antworte sofort
    executor.setupPersonasInWordPress().catch(err => {
      console.error('[BOT] WP-Setup-Fehler:', err)
    })
    // Kurz warten damit progress.running = true gesetzt ist
    await new Promise(r => setTimeout(r, 100))
    res.json({ message: 'WP-User-Setup gestartet', progress: executor.wpSetupProgress })
  })

  router.get('/bot/setup-wp-users/progress', (_req, res) => {
    res.json(executor.wpSetupProgress)
  })

  // ── WordPress API Test ──

  router.get('/wp/test', async (_req, res) => {
    try {
      const { WordPressClient } = await import('../wordpress/client')
      const wp = new WordPressClient(config)
      const user = await wp.testConnection()
      res.json({ connected: true, user: { id: user.id, name: user.name } })
    } catch (err) {
      res.json({ connected: false, error: err instanceof Error ? err.message : String(err) })
    }
  })

  // ── Personas ──

  const AUTO_WAVES = new Set([undefined, '', 'gruender', 'welle2', 'spaeteinsteiger'])

  function isManualPersona(p: Persona): boolean {
    return !AUTO_WAVES.has(p.wave)
  }

  function personaSummary(p: Persona) {
    return {
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      wp_user_id: p.wp_user_id,
      wave: p.wave || 'auto',
      avatar_color: p.avatar_color,
      situation: p.profile.situation,
      ton: p.profile.ton,
      engagement_style: p.activity.engagement_style,
      posting_frequency: p.activity.posting_frequency,
      time_profile: p.activity.time_profile,
      active_forums: p.activity.active_forums,
      bescheidboxer_affinity: p.activity.bescheidboxer_affinity,
      stats: p.stats,
    }
  }

  router.get('/personas', (req, res) => {
    let personas = loadPersonas()

    // Text search
    const q = (req.query.q as string || '').toLowerCase().trim()
    if (q) {
      personas = personas.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.display_name.toLowerCase().includes(q) ||
        p.profile.situation.includes(q) ||
        (p.wave || '').toLowerCase().includes(q)
      )
    }

    // Type filter: 'auto' | 'manuell' | 'all'
    const type = req.query.type as string
    if (type === 'manuell') {
      personas = personas.filter(isManualPersona)
    } else if (type === 'auto') {
      personas = personas.filter(p => !isManualPersona(p))
    }

    // Sort
    const sort = req.query.sort as string
    if (sort === 'name') {
      personas.sort((a, b) => a.display_name.localeCompare(b.display_name))
    } else if (sort === 'bb_desc') {
      personas.sort((a, b) => b.activity.bescheidboxer_affinity - a.activity.bescheidboxer_affinity)
    } else if (sort === 'newest') {
      personas.sort((a, b) => (b.stats.created_at || '').localeCompare(a.stats.created_at || ''))
    } else if (sort === 'wave') {
      personas.sort((a, b) => (a.wave || '').localeCompare(b.wave || ''))
    }
    // default: original order (by id)

    // Count totals before pagination (for filter counts in UI)
    const allPersonas = loadPersonas()
    const countAuto = allPersonas.filter(p => !isManualPersona(p)).length
    const countManuell = allPersonas.filter(isManualPersona).length

    const page = parseInt(req.query.page as string) || 1
    const perPage = parseInt(req.query.per_page as string) || 50
    const start = (page - 1) * perPage

    res.json({
      total: personas.length,
      total_auto: countAuto,
      total_manuell: countManuell,
      page,
      per_page: perPage,
      data: personas.slice(start, start + perPage).map(personaSummary),
    })
  })

  // IMPORTANT: these must come BEFORE /personas/:id to avoid "search"/"bb-stats" matching as :id
  router.get('/personas/search', (req, res) => {
    const q = (req.query.q as string || '').toLowerCase()
    const personas = loadPersonas()
    const results = personas
      .filter(p =>
        p.id.includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.display_name.toLowerCase().includes(q) ||
        p.profile.situation.includes(q)
      )
      .slice(0, 20)
      .map(p => ({
        id: p.id,
        username: p.username,
        display_name: p.display_name,
        wp_user_id: p.wp_user_id,
        situation: p.profile.situation,
        ton: p.profile.ton,
        avatar_color: p.avatar_color,
        bescheidboxer_affinity: p.activity.bescheidboxer_affinity,
      }))
    res.json(results)
  })

  router.get('/personas/bb-stats', (_req, res) => {
    const personas = loadPersonas()
    const affinities = personas.map(p => p.activity.bescheidboxer_affinity)
    const distribution = {
      null_pct: affinities.filter(a => a === 0).length,
      low: affinities.filter(a => a > 0 && a <= 0.1).length,
      medium: affinities.filter(a => a > 0.1 && a <= 0.3).length,
      high: affinities.filter(a => a > 0.3).length,
    }
    res.json({
      total: personas.length,
      avg: average(affinities),
      distribution,
      globalMentionRate: config.bescheidboxer_mention_rate,
    })
  })

  router.get('/personas/:id', (req, res) => {
    const personas = loadPersonas()
    const persona = personas.find(p => p.id === req.params.id)
    if (!persona) return res.status(404).json({ error: 'Persona nicht gefunden' })
    res.json(persona)
  })

  // ── Create single persona ──

  router.post('/personas', (req, res) => {
    const personas = loadPersonas()
    const maxId = personas.reduce((max, p) => {
      const num = parseInt(p.id.replace('p_', ''))
      return num > max ? num : max
    }, 0)
    const newId = `p_${String(maxId + 1).padStart(3, '0')}`

    const body = req.body
    const username = body.username || newId
    const persona: Persona = {
      id: newId,
      wp_user_id: null,
      username,
      email: body.email || `${sanitizeForEmail(username)}@buergergeld-blog.de`,
      display_name: body.display_name || username,
      password: body.password || generateRandomPassword(),
      bio: body.bio || '',
      avatar_color: body.avatar_color || '#3498db',
      wave: body.wave || 'manuell',
      profile: {
        alter: body.profile?.alter ?? 30,
        geschlecht: body.profile?.geschlecht ?? 'w',
        situation: body.profile?.situation ?? 'single',
        kinder: body.profile?.kinder,
        kinder_alter: body.profile?.kinder_alter,
        stadt_typ: body.profile?.stadt_typ ?? 'grossstadt_nrw',
        bundesland: body.profile?.bundesland ?? 'NRW',
        seit_buergergeld: body.profile?.seit_buergergeld ?? new Date().toISOString().slice(0, 7),
        probleme: body.profile?.probleme ?? [],
        erfahrung_widerspruch: body.profile?.erfahrung_widerspruch ?? false,
        ton: body.profile?.ton ?? 'pragmatisch',
        schreibstil: body.profile?.schreibstil ?? 'umgangssprache_leicht',
        emoji_nutzung: body.profile?.emoji_nutzung ?? 'selten',
        tippfehler_rate: body.profile?.tippfehler_rate ?? 0,
        gross_klein_fehler: body.profile?.gross_klein_fehler ?? false,
        beispiel_saetze: body.profile?.beispiel_saetze ?? [],
      },
      activity: {
        posting_frequency: body.activity?.posting_frequency ?? 'gelegentlich',
        time_profile: body.activity?.time_profile ?? 'ganztags',
        engagement_style: body.activity?.engagement_style ?? 'mixed',
        active_forums: body.activity?.active_forums ?? ['hilfe-bescheid'],
        themen_schwerpunkte: body.activity?.themen_schwerpunkte ?? [],
        kommentar_laenge: body.activity?.kommentar_laenge ?? 'mittel',
        bescheidboxer_affinity: body.activity?.bescheidboxer_affinity ?? 0,
      },
      stats: {
        created_at: new Date().toISOString(),
        last_action: null,
        total_posts: 0,
        total_comments: 0,
        total_likes: 0,
        total_forum_topics: 0,
        total_forum_replies: 0,
      },
    }

    personas.push(persona)
    savePersonas(personas)
    res.status(201).json(persona)
  })

  // ── Update single persona ──

  router.put('/personas/:id', (req, res) => {
    const personas = loadPersonas()
    const idx = personas.findIndex(p => p.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Persona nicht gefunden' })

    const body = req.body
    const existing = personas[idx]

    // Deep merge profile and activity
    personas[idx] = {
      ...existing,
      username: body.username ?? existing.username,
      email: body.email ?? existing.email,
      display_name: body.display_name ?? existing.display_name,
      password: body.password ?? existing.password,
      bio: body.bio ?? existing.bio,
      avatar_color: body.avatar_color ?? existing.avatar_color,
      wave: body.wave ?? existing.wave,
      profile: {
        ...existing.profile,
        ...(body.profile || {}),
      },
      activity: {
        ...existing.activity,
        ...(body.activity || {}),
      },
      stats: existing.stats, // stats bleiben unverändert
    }

    savePersonas(personas)
    res.json(personas[idx])
  })

  // ── Delete persona ──

  router.delete('/personas/:id', (req, res) => {
    const personas = loadPersonas()
    const idx = personas.findIndex(p => p.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Persona nicht gefunden' })
    const removed = personas.splice(idx, 1)[0]
    savePersonas(personas)
    res.json({ message: `Persona ${removed.id} (${removed.display_name}) gelöscht` })
  })

  router.post('/personas/generate', (req, res) => {
    const count = parseInt(req.body?.count) || 500
    const seed = parseInt(req.body?.seed) || 42

    // Bestehende Personas laden – manuelle und solche mit wp_user_id schützen
    const existing = loadPersonas()
    const manualPersonas = existing.filter(isManualPersona)
    const wpIdMap = new Map<string, number>()
    const statsMap = new Map<string, Persona['stats']>()
    for (const p of existing) {
      if (p.wp_user_id) wpIdMap.set(p.id, p.wp_user_id)
      if (p.stats.last_action || p.stats.total_posts > 0 || p.stats.total_comments > 0) {
        statsMap.set(p.id, p.stats)
      }
    }

    // Neue Auto-Personas generieren
    const generated = generatePersonas({ count, seed })

    // wp_user_ids und Stats von bestehenden Personas übertragen
    for (const p of generated) {
      if (wpIdMap.has(p.id)) p.wp_user_id = wpIdMap.get(p.id)!
      if (statsMap.has(p.id)) p.stats = statsMap.get(p.id)!
    }

    // Manuelle Personas anhängen (nicht überschreiben!)
    const allPersonas = [...generated, ...manualPersonas]
    savePersonas(allPersonas)

    res.json({
      message: `${generated.length} Auto-Personas generiert, ${manualPersonas.length} manuelle beibehalten`,
      stats: {
        total: allPersonas.length,
        auto: generated.length,
        manuell: manualPersonas.length,
        wp_ids_preserved: wpIdMap.size,
        by_situation: countBy(generated, p => p.profile.situation),
        by_engagement: countBy(generated, p => p.activity.engagement_style),
        by_frequency: countBy(generated, p => p.activity.posting_frequency),
        by_time_profile: countBy(generated, p => p.activity.time_profile),
        avg_bescheidboxer_affinity: average(generated.map(p => p.activity.bescheidboxer_affinity)),
      },
    })
  })

  // ── Schedule ──

  router.get('/schedule', (_req, res) => {
    const schedule = loadSchedule()
    const summary = summarizeSchedule(schedule)
    res.json({ summary, actions: schedule.slice(0, 100) })
  })

  router.get('/schedule/today', (_req, res) => {
    const actions = getTodaysActions()
    const summary = summarizeSchedule(actions)
    res.json({ summary, actions })
  })

  // ── Activity Log ──

  router.get('/activity', (req, res) => {
    const log = loadActivityLog()
    const limit = parseInt(req.query.limit as string) || 100
    res.json({
      total: log.length,
      entries: log.slice(-limit).reverse(),
    })
  })

  // ── Config (readonly) ──

  router.get('/config', (_req, res) => {
    res.json({
      ...config,
      wp_admin_app_password: '***hidden***',
    })
  })

  // ── Manual Posting: Als Persona direkt posten ──

  router.post('/bot/post-as-persona', async (req, res) => {
    const { persona_id, action_type, content, target } = req.body
    if (!persona_id || !action_type || !content?.body) {
      return res.status(400).json({ error: 'persona_id, action_type und content.body sind erforderlich' })
    }

    const personas = loadPersonas()
    const persona = personas.find(p => p.id === persona_id)
    if (!persona) return res.status(404).json({ error: 'Persona nicht gefunden' })
    if (!persona.wp_user_id) return res.status(400).json({ error: 'Persona hat keine WP-ID. Erst WP-User anlegen.' })

    try {
      const { WordPressClient } = await import('../wordpress/client')
      const wp = new WordPressClient(config)
      let wpId: number | undefined

      const htmlContent = `<p>${content.body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`

      switch (action_type) {
        case 'blog_post': {
          const post = await wp.createPost({
            title: content.title || 'Untitled',
            content: htmlContent,
            author: persona.wp_user_id,
            categories: target?.category_id ? [target.category_id] : undefined,
          })
          wpId = post.id
          break
        }
        case 'forum_topic': {
          const forumWpId = target?.forum_id
            ? config.forum_ids[target.forum_id as keyof typeof config.forum_ids]
            : 0
          if (!forumWpId) return res.status(400).json({ error: `Forum "${target?.forum_id}" nicht konfiguriert` })
          const topic = await wp.createForumTopic({
            forum_id: forumWpId,
            title: content.title || 'Untitled',
            content: htmlContent,
            author: persona.wp_user_id,
          })
          wpId = topic.id
          break
        }
        case 'blog_comment': {
          if (!target?.post_id) return res.status(400).json({ error: 'post_id erforderlich für Kommentar' })
          const comment = await wp.createComment({
            post: target.post_id,
            author: persona.wp_user_id,
            author_name: persona.display_name,
            author_email: persona.email,
            content: content.body,
            parent: target.comment_id || undefined,
          })
          wpId = comment.id
          break
        }
        case 'forum_reply': {
          if (!target?.topic_id) return res.status(400).json({ error: 'topic_id erforderlich für Forum-Reply' })
          const forumWpId = target?.forum_id
            ? config.forum_ids[target.forum_id as keyof typeof config.forum_ids]
            : 0
          const reply = await wp.createForumReply({
            topic_id: target.topic_id,
            forum_id: forumWpId || 0,
            content: content.body,
            author: persona.wp_user_id,
          })
          wpId = reply.id
          break
        }
        default:
          return res.status(400).json({ error: `Unbekannter action_type: ${action_type}` })
      }

      res.json({
        message: `${action_type} als ${persona.display_name} gepostet`,
        wp_id: wpId,
        persona_id,
      })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  })

  // ── Bulk Update: BB-Affinität für alle Personas ändern ──

  router.put('/personas/bulk-update', (req, res) => {
    const { bescheidboxer_affinity, filter } = req.body
    const personas = loadPersonas()
    let updated = 0

    for (const p of personas) {
      // Optional filtern nach wave, situation, etc.
      if (filter?.wave && p.wave !== filter.wave) continue
      if (filter?.situation && p.profile.situation !== filter.situation) continue

      if (bescheidboxer_affinity !== undefined) {
        p.activity.bescheidboxer_affinity = bescheidboxer_affinity
      }
      updated++
    }

    savePersonas(personas)
    res.json({ message: `${updated} Personas aktualisiert`, updated })
  })

  // ── WP Posts/Topics auslesen (für Kommentare/Replies) ──

  router.get('/wp/posts', async (_req, res) => {
    try {
      const { WordPressClient } = await import('../wordpress/client')
      const wp = new WordPressClient(config)
      const posts = await wp.getRecentPosts(50)
      res.json(posts)
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  })

  router.get('/wp/topics', async (req, res) => {
    try {
      const { WordPressClient } = await import('../wordpress/client')
      const wp = new WordPressClient(config)
      const forumId = req.query.forum_id
        ? config.forum_ids[req.query.forum_id as keyof typeof config.forum_ids]
        : undefined
      const topics = await wp.getForumTopics(forumId, 50)
      res.json(topics)
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  })

  // ── Starter-Threads: Vorgefertigte Forum-Eröffnungen ──

  router.get('/starter-threads', (_req, res) => {
    res.json(STARTER_THREADS)
  })

  router.post('/starter-threads/post', async (req, res) => {
    const { thread_index, persona_id, title_override, body_override } = req.body
    const thread = STARTER_THREADS[thread_index]
    if (!thread) return res.status(400).json({ error: 'Ungültiger thread_index' })

    const personas = loadPersonas()
    const persona = personas.find(p => p.id === persona_id)
    if (!persona) return res.status(404).json({ error: 'Persona nicht gefunden' })
    if (!persona.wp_user_id) return res.status(400).json({ error: 'Persona hat keine WP-ID. Erst WP-User anlegen.' })

    const title = title_override || thread.title
    const body = body_override || thread.body

    try {
      const { WordPressClient } = await import('../wordpress/client')
      const wp = new WordPressClient(config)

      const forumWpId = config.forum_ids[thread.forum_id as keyof typeof config.forum_ids]
      if (!forumWpId) return res.status(400).json({ error: `Forum "${thread.forum_id}" nicht konfiguriert (ID=0)` })

      const htmlContent = `<p>${body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
      const topic = await wp.createForumTopic({
        forum_id: forumWpId,
        title,
        content: htmlContent,
        author: persona.wp_user_id,
      })

      res.json({
        message: `Thread "${title}" im Forum ${thread.forum_label} gepostet`,
        wp_id: topic.id,
        persona: persona.display_name,
        forum: thread.forum_label,
      })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  })

  // ── Organik-Check: Analyse der Bot-Patterns ──

  router.get('/bot/organik-check', (_req, res) => {
    const personas = loadPersonas()
    const schedule = loadSchedule()
    const activity = loadActivityLog()
    const now = new Date()

    const warnings: { level: 'critical' | 'warning' | 'info'; message: string; detail: string }[] = []
    let score = 100 // Start bei 100, Abzüge für Probleme

    // 1. Warm-Up-Verletzungen: Personas die zu früh posten
    const warmupViolations: string[] = []
    for (const p of personas) {
      if (!p.stats.created_at || !p.stats.last_action) continue
      const created = new Date(p.stats.created_at)
      const firstAction = new Date(p.stats.last_action)
      const daysToFirst = (firstAction.getTime() - created.getTime()) / 86400000
      if (daysToFirst < 3) {
        warmupViolations.push(`${p.display_name} (${p.id}): ${daysToFirst.toFixed(1)} Tage`)
      }
    }
    if (warmupViolations.length > 0) {
      score -= Math.min(30, warmupViolations.length * 3)
      warnings.push({
        level: 'critical',
        message: `${warmupViolations.length} Personas ohne Warm-Up`,
        detail: `Diese Personas haben innerhalb von 3 Tagen nach Erstellung gepostet: ${warmupViolations.slice(0, 5).join(', ')}${warmupViolations.length > 5 ? '...' : ''}`,
      })
    }

    // 2. Reply-Quote: Verhältnis Topics vs Replies
    const todayActions = schedule.filter(a => a.scheduled_at.startsWith(now.toISOString().slice(0, 10)))
    const topics = todayActions.filter(a => a.action_type === 'forum_topic' || a.action_type === 'blog_post').length
    const replies = todayActions.filter(a => a.action_type === 'forum_reply' || a.action_type === 'blog_comment').length
    const replyRatio = (topics + replies) > 0 ? replies / (topics + replies) : 0
    if (replyRatio < 0.5 && (topics + replies) > 5) {
      score -= 15
      warnings.push({
        level: 'warning',
        message: `Reply-Quote nur ${(replyRatio * 100).toFixed(0)}% (Ziel: >60%)`,
        detail: `${topics} neue Topics vs ${replies} Replies heute. Echte Foren haben mehr Antworten als neue Threads.`,
      })
    } else if (replyRatio >= 0.6) {
      warnings.push({
        level: 'info',
        message: `Reply-Quote bei ${(replyRatio * 100).toFixed(0)}% – gut!`,
        detail: `${replies} Replies, ${topics} Topics`,
      })
    }

    // 3. Posting-Zeitverteilung (Entropy)
    const hourBuckets = new Array(24).fill(0)
    for (const a of todayActions) {
      const h = new Date(a.scheduled_at).getHours()
      hourBuckets[h]++
    }
    const activeHours = hourBuckets.filter(n => n > 0).length
    const nightPosts = hourBuckets.slice(23, 24).reduce((s, n) => s + n, 0)
      + hourBuckets.slice(0, 7).reduce((s, n) => s + n, 0)
    if (nightPosts === 0 && todayActions.length > 10) {
      score -= 10
      warnings.push({
        level: 'warning',
        message: 'Keine Nacht-Posts (23-7 Uhr)',
        detail: 'Alle Posts fallen ins Tagfenster. Nachtaktive Personas sollten gelegentlich spät posten.',
      })
    }
    if (activeHours < 8 && todayActions.length > 20) {
      score -= 10
      warnings.push({
        level: 'warning',
        message: `Nur ${activeHours} aktive Stunden`,
        detail: 'Posts konzentrieren sich auf wenige Stunden. Breiter verteilen für natürlicheres Muster.',
      })
    }

    // 4. BB-Erwähnungen zu gehäuft?
    const bbActions = todayActions.filter(a => a.content?.body?.toLowerCase().includes('bescheidboxer'))
    const bbRate = todayActions.length > 0 ? bbActions.length / todayActions.length : 0
    if (bbRate > 0.15) {
      score -= 15
      warnings.push({
        level: 'critical',
        message: `BB-Erwähnungsrate ${(bbRate * 100).toFixed(0)}% – zu hoch!`,
        detail: `${bbActions.length} von ${todayActions.length} Posts erwähnen BescheidBoxer. Empfohlen: <10%.`,
      })
    } else if (bbRate > 0.08) {
      score -= 5
      warnings.push({
        level: 'warning',
        message: `BB-Erwähnungsrate ${(bbRate * 100).toFixed(0)}%`,
        detail: `${bbActions.length} von ${todayActions.length} Posts. Empfohlen: <8% für organisches Wirken.`,
      })
    }

    // 5. Konversations-Tiefe: Gibt es Threads mit mehreren Antworten?
    const topicIds = new Set(todayActions.filter(a => a.target?.topic_id).map(a => a.target.topic_id))
    const deepThreads = [...topicIds].filter(tid =>
      todayActions.filter(a => a.target?.topic_id === tid).length >= 2
    ).length
    if (deepThreads === 0 && todayActions.length > 10) {
      score -= 10
      warnings.push({
        level: 'warning',
        message: 'Keine Konversations-Threads',
        detail: 'Keine Topics haben mehrere Bot-Antworten. Plane Konversationen zwischen Personas ein.',
      })
    }

    // 6. Velocity: Zu viele Posts auf einmal?
    const sortedTimes = todayActions
      .map(a => new Date(a.scheduled_at).getTime())
      .sort((a, b) => a - b)
    let maxBurst = 0
    for (let i = 0; i < sortedTimes.length - 2; i++) {
      const span = (sortedTimes[i + 2] - sortedTimes[i]) / 60000
      if (span < 5) maxBurst++
    }
    if (maxBurst > 3) {
      score -= 10
      warnings.push({
        level: 'warning',
        message: `${maxBurst}x Burst-Posting erkannt`,
        detail: '3+ Posts innerhalb von 5 Minuten. Mindestabstand sollte 15+ Minuten sein.',
      })
    }

    // 7. Personas mit WP-ID vs ohne
    const withWp = personas.filter(p => p.wp_user_id).length
    const withoutWp = personas.length - withWp
    if (withoutWp > 0 && withWp > 0) {
      warnings.push({
        level: 'info',
        message: `${withoutWp} Personas ohne WP-User`,
        detail: 'Diese Personas können nicht posten. "WP-User anlegen" ausführen.',
      })
    }

    // Posting pattern heatmap data (24h x 7 days)
    const heatmap: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0))
    for (const a of schedule) {
      const d = new Date(a.scheduled_at)
      const day = d.getDay()
      const hour = d.getHours()
      heatmap[day][hour]++
    }

    // Persona age distribution
    const ageDistribution = { fresh: 0, warmup: 0, active: 0, mature: 0 }
    for (const p of personas) {
      if (!p.stats.created_at) { ageDistribution.mature++; continue }
      const ageDays = (now.getTime() - new Date(p.stats.created_at).getTime()) / 86400000
      if (ageDays < 3) ageDistribution.fresh++
      else if (ageDays < 14) ageDistribution.warmup++
      else if (ageDays < 30) ageDistribution.active++
      else ageDistribution.mature++
    }

    score = Math.max(0, Math.min(100, score))

    res.json({
      score,
      scoreLabel: score >= 80 ? 'Gut' : score >= 60 ? 'Ausbaufähig' : score >= 40 ? 'Riskant' : 'Kritisch',
      warnings,
      stats: {
        totalPersonas: personas.length,
        personasWithWp: withWp,
        todayActions: todayActions.length,
        replyRatio: Math.round(replyRatio * 100),
        bbMentionRate: Math.round(bbRate * 100),
        activeHours,
        deepThreads,
        ageDistribution,
      },
      heatmap,
    })
  })

  // ── Konversations-Planer: Multi-Persona Thread ──

  router.post('/bot/plan-conversation', (req, res) => {
    const { forum_id, topic_title, persona_ids, start_delay_minutes } = req.body
    if (!forum_id || !topic_title || !persona_ids || persona_ids.length < 2) {
      return res.status(400).json({ error: 'forum_id, topic_title und mindestens 2 persona_ids erforderlich' })
    }

    const personas = loadPersonas()
    const participants = persona_ids
      .map((id: string) => personas.find(p => p.id === id))
      .filter((p: Persona | undefined): p is Persona => !!p)

    if (participants.length < 2) {
      return res.status(400).json({ error: 'Mindestens 2 gültige Personas erforderlich' })
    }

    const now = new Date()
    const baseDelay = (start_delay_minutes || 30) * 60000
    const actions: ScheduledAction[] = []

    // 1. Topic-Ersteller: Erste Persona erstellt den Thread
    const topicCreator = participants[0]
    const topicTime = new Date(now.getTime() + baseDelay)
    actions.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      persona_id: topicCreator.id,
      action_type: 'forum_topic',
      scheduled_at: topicTime.toISOString(),
      executed_at: null,
      status: 'pending',
      target: { forum_id },
      content: { title: topic_title, body: '' }, // Body wird manuell ausgefüllt oder vom Content-Generator
    })

    // 2. Antworten: Weitere Personas antworten mit realistischen Abständen
    let lastTime = topicTime.getTime()
    for (let i = 1; i < participants.length; i++) {
      // Realistischer Abstand: 20min-4h, exponentiell wachsend
      const minDelay = 20 * 60000  // 20 Minuten
      const maxDelay = 240 * 60000 // 4 Stunden
      const delay = minDelay + Math.random() * (maxDelay - minDelay) * (1 + i * 0.3)
      const replyTime = new Date(lastTime + delay)

      actions.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + i,
        persona_id: participants[i].id,
        action_type: 'forum_reply',
        scheduled_at: replyTime.toISOString(),
        executed_at: null,
        status: 'pending',
        target: { forum_id },
        content: { body: '' }, // Muss manuell oder automatisch befüllt werden
      })
      lastTime = replyTime.getTime()
    }

    // Optional: Topic-Ersteller antwortet nochmal (Dankeschön/Follow-Up)
    if (participants.length >= 3 && Math.random() > 0.3) {
      const followUpDelay = 30 * 60000 + Math.random() * 120 * 60000
      actions.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + 'f',
        persona_id: topicCreator.id,
        action_type: 'forum_reply',
        scheduled_at: new Date(lastTime + followUpDelay).toISOString(),
        executed_at: null,
        status: 'pending',
        target: { forum_id },
        content: { body: '' },
      })
    }

    // Schedule speichern
    const existingSchedule = loadSchedule()
    saveSchedule([...existingSchedule, ...actions])

    res.json({
      message: `Konversation geplant: "${topic_title}" mit ${participants.length} Personas`,
      actions: actions.map(a => ({
        id: a.id,
        persona_id: a.persona_id,
        persona_name: participants.find((p: Persona) => p.id === a.persona_id)?.display_name,
        action_type: a.action_type,
        scheduled_at: a.scheduled_at,
        time: new Date(a.scheduled_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      })),
    })
  })

  // ── KI-Textgenerator: Stichpunkte → Persona-Stil-Text ──

  router.post('/bot/generate-text', async (req, res) => {
    const { persona_id, stichpunkte, forum_id, kontext } = req.body
    if (!persona_id || !stichpunkte) {
      return res.status(400).json({ error: 'persona_id und stichpunkte sind erforderlich' })
    }

    if (!config.anthropic_api_key) {
      return res.status(400).json({ error: 'ANTHROPIC_API_KEY nicht in .env konfiguriert' })
    }

    const personas = loadPersonas()
    const persona = personas.find(p => p.id === persona_id)
    if (!persona) return res.status(404).json({ error: 'Persona nicht gefunden' })

    const tonMap: Record<string, string> = {
      emotional_aber_sachlich: 'emotional aber sachlich, zeigt Gefühle aber bleibt bei den Fakten',
      warmherzig: 'warmherzig und einfühlsam, tröstet und ermutigt andere',
      unsicher: 'unsicher und fragend, sucht Bestätigung',
      kämpferisch: 'kämpferisch und entschlossen, lässt sich nichts gefallen',
      verunsichert: 'verunsichert und ängstlich, weiß nicht weiter',
      präzise_juristisch: 'präzise und juristisch informiert, zitiert Paragraphen',
      frustriert_sarkastisch: 'frustriert und sarkastisch, hat die Nase voll',
      positiv_lösungsorientiert: 'positiv und lösungsorientiert, sieht das Gute',
      höflich_altmodisch: 'höflich und etwas altmodisch in der Ausdrucksweise',
      pragmatisch: 'pragmatisch und nüchtern, kommt auf den Punkt',
    }

    const stilMap: Record<string, string> = {
      hochdeutsch: 'Korrektes Hochdeutsch, vollständige Sätze, korrekte Grammatik',
      umgangssprache_leicht: 'Leichte Umgangssprache, natürlich und locker aber lesbar',
      umgangssprache_mittel: 'Deutliche Umgangssprache, Abkürzungen, lockerer Satzbau',
      umgangssprache_stark: 'Starke Umgangssprache, fast wie gesprochene Sprache, Dialekteinflüsse',
      jugendsprache: 'Jugendsprache, kurze Sätze, aktuelle Ausdrücke',
    }

    const prompt = `Du schreibst einen Forum-Beitrag als fiktive Persona in einem Bürgergeld-Forum (jobcenter-erfahrungen.de).

PERSONA-PROFIL:
- Name: ${persona.display_name}
- Alter: ${persona.profile.alter}, Geschlecht: ${persona.profile.geschlecht === 'w' ? 'weiblich' : persona.profile.geschlecht === 'm' ? 'männlich' : 'divers'}
- Situation: ${persona.profile.situation}
- Bundesland: ${persona.profile.bundesland}
- Ton: ${tonMap[persona.profile.ton] || persona.profile.ton}
- Schreibstil: ${stilMap[persona.profile.schreibstil] || persona.profile.schreibstil}
- Emoji-Nutzung: ${persona.profile.emoji_nutzung}
- Tippfehler: ${persona.profile.tippfehler_rate > 0.05 ? 'gelegentlich' : persona.profile.tippfehler_rate > 0 ? 'sehr selten' : 'keine'}
- Groß/Klein-Fehler: ${persona.profile.gross_klein_fehler ? 'ja, schreibt oft alles klein' : 'nein, normale Groß/Kleinschreibung'}
${persona.profile.beispiel_saetze?.length ? `- Beispiel-Sätze dieser Persona: "${persona.profile.beispiel_saetze.join('", "')}"` : ''}

FORUM: ${forum_id || 'allgemeines'}
${kontext ? `KONTEXT: ${kontext}` : ''}

STICHPUNKTE DES NUTZERS (daraus den Text erstellen):
${stichpunkte}

REGELN:
- Schreibe NUR den Forum-Beitrag, keine Erklärungen drumherum
- Verwende IMMER korrekte deutsche Umlaute (ä, ö, ü, ß) – niemand schreibt "Koeln" oder "fuer"
- Schreibe authentisch im Stil der Persona – der Text muss wie von einem echten Menschen in einem Forum klingen
- Natürliche Absätze, nicht zu perfekt strukturiert
- Keine Überschriften oder Formatierung die nach KI aussieht
- Länge: 3-8 Absätze, je nach Inhalt
- Wenn die Persona Tippfehler macht, baue sehr vereinzelt welche ein (maximal 1-2)
- Wenn Groß/Klein-Fehler: schreibe lockerer mit der Groß/Kleinschreibung
- KEIN BescheidBoxer erwähnen außer der Nutzer schreibt es explizit in die Stichpunkte`

    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey: config.anthropic_api_key })

      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = message.content
        .filter(b => b.type === 'text')
        .map(b => (b as any).text)
        .join('')

      res.json({ text, persona: persona.display_name, tokens: message.usage })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  })

  return router
}

// ── Helpers ──

function countBy<T>(arr: T[], fn: (item: T) => string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const key = fn(item)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return Math.round((arr.reduce((s, n) => s + n, 0) / arr.length) * 100) / 100
}

function generateRandomPassword(): string {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%'
  return Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
