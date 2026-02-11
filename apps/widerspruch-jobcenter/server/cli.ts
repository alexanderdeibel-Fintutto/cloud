#!/usr/bin/env tsx
// ══════════════════════════════════════════════════════════════
// Board-Bot CLI – Kommandozeilentool für Bot-Steuerung
// ══════════════════════════════════════════════════════════════

import { config as dotenvConfig } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenvConfig({ path: resolve(__dirname, '../.env') })

const dataDir = resolve(__dirname, '../data')
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

import { loadConfig } from './config'
import { generatePersonas } from './personas/generator'
import { savePersonas, loadPersonas } from './db'
import { BotExecutor } from './bot/executor'
import { summarizeSchedule } from './bot/scheduler'

const command = process.argv[2]
const config = loadConfig()

async function main() {
  switch (command) {
    case 'generate-personas': {
      const count = parseInt(process.argv[3] || '500', 10)
      const seed = parseInt(process.argv[4] || '42', 10)

      console.log(`\nGeneriere ${count} Personas (Seed: ${seed})...\n`)
      const personas = generatePersonas(count, seed)
      savePersonas(personas)

      // Statistiken
      const bySituation: Record<string, number> = {}
      const byEngagement: Record<string, number> = {}
      const byTimeProfile: Record<string, number> = {}
      const byFrequency: Record<string, number> = {}
      let bbSum = 0

      for (const p of personas) {
        bySituation[p.profile.situation] = (bySituation[p.profile.situation] || 0) + 1
        byEngagement[p.activity.engagement_style] = (byEngagement[p.activity.engagement_style] || 0) + 1
        byTimeProfile[p.activity.time_profile] = (byTimeProfile[p.activity.time_profile] || 0) + 1
        byFrequency[p.activity.posting_frequency] = (byFrequency[p.activity.posting_frequency] || 0) + 1
        bbSum += p.activity.bescheidboxer_affinity
      }

      console.log(`✓ ${personas.length} Personas gespeichert in data/personas.json\n`)
      console.log('Verteilung nach Situation:')
      for (const [k, v] of Object.entries(bySituation).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${k.padEnd(25)} ${v} (${Math.round(v / personas.length * 100)}%)`)
      }
      console.log('\nEngagement-Stile:')
      for (const [k, v] of Object.entries(byEngagement).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${k.padEnd(25)} ${v} (${Math.round(v / personas.length * 100)}%)`)
      }
      console.log('\nZeitprofile:')
      for (const [k, v] of Object.entries(byTimeProfile).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${k.padEnd(25)} ${v} (${Math.round(v / personas.length * 100)}%)`)
      }
      console.log('\nPosting-Häufigkeit:')
      for (const [k, v] of Object.entries(byFrequency).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${k.padEnd(25)} ${v} (${Math.round(v / personas.length * 100)}%)`)
      }
      console.log(`\nDurchschnittliche BescheidBoxer-Affinität: ${(bbSum / personas.length).toFixed(3)}`)
      break
    }

    case 'generate-schedule': {
      const executor = new BotExecutor(config)
      const result = executor.generateTodaysSchedule()
      console.log(`\nTagesplan generiert: ${result.actions} Aktionen\n`)
      console.log('Zusammenfassung:')
      console.log(`  Beteiligte Personas: ${result.summary.personas}`)
      console.log(`  Gesamt-Aktionen:     ${result.summary.total}`)
      console.log('\n  Nach Typ:')
      for (const [type, count] of Object.entries(result.summary.byType)) {
        console.log(`    ${type.padEnd(25)} ${count}`)
      }
      console.log('\n  Nach Stunde:')
      for (const hour of Object.keys(result.summary.byHour).sort((a, b) => +a - +b)) {
        const count = result.summary.byHour[+hour]
        const bar = '█'.repeat(Math.min(count, 50))
        console.log(`    ${String(hour).padStart(2, '0')}:00  ${bar} ${count}`)
      }
      break
    }

    case 'setup-wp-users': {
      const personas = loadPersonas()
      if (personas.length === 0) {
        console.error('\nKeine Personas vorhanden. Führe zuerst "generate-personas" aus.\n')
        process.exit(1)
      }
      if (!config.wp_admin_app_password) {
        console.error('\nWP_ADMIN_APP_PASSWORD nicht in .env gesetzt.\n')
        process.exit(1)
      }

      console.log(`\nErstelle ${personas.length} WordPress-User...\n`)
      const executor = new BotExecutor(config)
      const result = await executor.setupPersonasInWordPress()
      console.log(`\n✓ Erstellt: ${result.created}`)
      console.log(`  Übersprungen: ${result.skipped}`)
      if (result.errors.length > 0) {
        console.log(`  Fehler: ${result.errors.length}`)
        for (const err of result.errors.slice(0, 10)) {
          console.log(`    - ${err}`)
        }
        if (result.errors.length > 10) {
          console.log(`    ... und ${result.errors.length - 10} weitere`)
        }
      }
      break
    }

    case 'start-bot': {
      console.log('\nStarte Board-Bot...\n')
      const executor = new BotExecutor(config)

      // Zuerst Tagesplan generieren
      const result = executor.generateTodaysSchedule()
      console.log(`Tagesplan: ${result.actions} Aktionen geplant.\n`)

      await executor.start()

      // Graceful shutdown
      process.on('SIGINT', () => {
        console.log('\nStoppe Bot...')
        executor.stop()
        process.exit(0)
      })

      // Endlosschleife verhindern, dass der Prozess beendet wird
      await new Promise(() => {})
      break
    }

    case 'status': {
      const personas = loadPersonas()
      const withWpId = personas.filter(p => p.wp_user_id !== null).length

      console.log('\n══════════════════════════════════════')
      console.log('  Board-Bot Status')
      console.log('══════════════════════════════════════')
      console.log(`  Personas:       ${personas.length} (${withWpId} mit WP-ID)`)
      console.log(`  WP-Ziel:        ${config.wp_base_url}`)
      console.log(`  Max Posts/Tag:  ${config.bot_max_posts_per_day}`)
      console.log(`  Max Komm./Tag:  ${config.bot_max_comments_per_day}`)
      console.log(`  Aktive Std.:    ${config.bot_active_hours_start}:00 - ${config.bot_active_hours_end}:00`)
      console.log(`  BB-Mention:     ${(config.bescheidboxer_mention_rate * 100).toFixed(0)}%`)
      console.log('══════════════════════════════════════\n')
      break
    }

    case 'test-wp': {
      console.log('\nTeste WordPress-Verbindung...\n')
      try {
        const { WordPressClient } = await import('./wordpress/client')
        const wp = new WordPressClient(config)
        const user = await wp.testConnection()
        console.log(`✓ Verbunden als: ${user.name} (ID: ${user.id})`)
      } catch (err) {
        console.error(`✗ Fehler: ${err instanceof Error ? err.message : err}`)
      }
      break
    }

    default:
      console.log(`
Board-Bot CLI – widerspruchjobcenter.de

Befehle:
  generate-personas [count] [seed]  Personas generieren (Standard: 500, Seed: 42)
  generate-schedule                 Tagesplan für heute erstellen
  setup-wp-users                    Personas als WordPress-User anlegen
  start-bot                         Bot starten (läuft im Vordergrund)
  status                            Aktuellen Status anzeigen
  test-wp                           WordPress-Verbindung testen

Beispiele:
  tsx server/cli.ts generate-personas 500 42
  tsx server/cli.ts generate-schedule
  tsx server/cli.ts start-bot
`)
  }
}

main().catch(err => {
  console.error('Fehler:', err)
  process.exit(1)
})
