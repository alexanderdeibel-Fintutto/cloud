// ══════════════════════════════════════════════════════════════
// Board-Bot Server – Haupteintrittspunkt
// Express API + Bot Engine
// ══════════════════════════════════════════════════════════════

import express from 'express'
import cors from 'cors'
import { config as dotenvConfig } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'

import { loadConfig } from './config'
import { BotExecutor } from './bot/executor'
import { createApiRouter } from './api/routes'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env laden
dotenvConfig({ path: resolve(__dirname, '../.env') })

// Data-Verzeichnis sicherstellen
const dataDir = resolve(__dirname, '../data')
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

const config = loadConfig()
const executor = new BotExecutor(config)
const app = express()

app.use(cors())

// API Routes unter /api
app.use('/api', createApiRouter(config, executor))

// Root – Hinweis auf Frontend
app.get('/', (_req, res) => {
  res.json({
    service: 'widerspruchjobcenter.de Board-Bot',
    dashboard: 'http://localhost:5175',
    api: '/api',
    health: '/health',
  })
})

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const port = parseInt(process.env.SERVER_PORT || '3001', 10)

app.listen(port, () => {
  console.log('')
  console.log('══════════════════════════════════════════════════')
  console.log('  widerspruchjobcenter.de – Board-Bot Server')
  console.log('══════════════════════════════════════════════════')
  console.log(`  API:      http://localhost:${port}/api`)
  console.log(`  Health:   http://localhost:${port}/health`)
  console.log(`  WP-Ziel:  ${config.wp_base_url}`)
  console.log('══════════════════════════════════════════════════')
  console.log('')

  // Auto-Start: Bot automatisch starten wenn BOT_AUTOSTART=true
  if (process.env.BOT_AUTOSTART === 'true') {
    console.log('[AUTOSTART] Bot wird automatisch gestartet...')
    executor.start().catch(err => {
      console.error('[AUTOSTART] Bot-Start fehlgeschlagen:', err)
    })
  }
})

// Graceful Shutdown: Timer aufräumen bei SIGTERM/SIGINT
function gracefulShutdown(signal: string) {
  console.log(`\n[SERVER] ${signal} empfangen, fahre herunter...`)
  executor.stop()
  process.exit(0)
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
