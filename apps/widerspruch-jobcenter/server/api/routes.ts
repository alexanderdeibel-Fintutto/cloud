// ══════════════════════════════════════════════════════════════
// Express API Routes – Dashboard ↔ Bot Kommunikation
// ══════════════════════════════════════════════════════════════

import { Router, json } from 'express'
import type { BotConfig } from '../personas/types'
import { BotExecutor } from '../bot/executor'
import {
  loadPersonas, savePersonas, loadSchedule,
  loadActivityLog, getTodaysActions,
} from '../db'
import { generatePersonas, sanitizeForEmail } from '../personas/generator'
import { summarizeSchedule } from '../bot/scheduler'
import type { Persona } from '../personas/types'

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
    try {
      const result = await executor.setupPersonasInWordPress()
      res.json({
        message: `${result.created} Users erstellt, ${result.skipped} übersprungen`,
        errors: result.errors.length > 0 ? result.errors : undefined,
      })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
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

  router.get('/personas', (req, res) => {
    const personas = loadPersonas()
    const page = parseInt(req.query.page as string) || 1
    const perPage = parseInt(req.query.per_page as string) || 50
    const start = (page - 1) * perPage

    res.json({
      total: personas.length,
      page,
      per_page: perPage,
      data: personas.slice(start, start + perPage).map(p => ({
        id: p.id,
        username: p.username,
        display_name: p.display_name,
        wp_user_id: p.wp_user_id,
        situation: p.profile.situation,
        ton: p.profile.ton,
        engagement_style: p.activity.engagement_style,
        posting_frequency: p.activity.posting_frequency,
        time_profile: p.activity.time_profile,
        active_forums: p.activity.active_forums,
        bescheidboxer_affinity: p.activity.bescheidboxer_affinity,
        stats: p.stats,
      })),
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
    const personas = generatePersonas({ count, seed })
    savePersonas(personas)
    res.json({
      message: `${personas.length} Personas generiert`,
      stats: {
        total: personas.length,
        by_situation: countBy(personas, p => p.profile.situation),
        by_engagement: countBy(personas, p => p.activity.engagement_style),
        by_frequency: countBy(personas, p => p.activity.posting_frequency),
        by_time_profile: countBy(personas, p => p.activity.time_profile),
        avg_bescheidboxer_affinity: average(personas.map(p => p.activity.bescheidboxer_affinity)),
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
