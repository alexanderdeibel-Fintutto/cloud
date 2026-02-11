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
  console.log('Befehle:')
  console.log('  POST /api/personas/generate     → 500 Personas generieren')
  console.log('  POST /api/bot/setup-wp-users     → Personas in WP anlegen')
  console.log('  POST /api/bot/generate-schedule  → Tagesplan erstellen')
  console.log('  POST /api/bot/start              → Bot starten')
  console.log('  POST /api/bot/stop               → Bot stoppen')
  console.log('  GET  /api/status                 → Bot-Status')
  console.log('  GET  /api/personas               → Alle Personas')
  console.log('  GET  /api/schedule/today          → Heutiger Plan')
  console.log('  GET  /api/activity               → Aktivitäts-Log')
  console.log('')
})
