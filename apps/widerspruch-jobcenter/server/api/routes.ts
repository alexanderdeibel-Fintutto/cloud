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
import { generatePersonas } from '../personas/generator'
import { summarizeSchedule } from '../bot/scheduler'

export function createApiRouter(config: BotConfig, executor: BotExecutor): Router {
  const router = Router()
  router.use(json())

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
