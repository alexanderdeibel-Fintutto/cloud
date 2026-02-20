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
import type { GenerateOptions } from './personas/generator'
import type { TimeProfile, PostingFrequency, EngagementStyle, Situation, Persona } from './personas/types'
import { savePersonas, loadPersonas } from './db'
import { BotExecutor } from './bot/executor'
import { summarizeSchedule } from './bot/scheduler'

const command = process.argv[2]
const config = loadConfig()

// ── Arg Parser ──
function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}
function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

function printPersonaStats(personas: Persona[], label: string) {
  const bySituation: Record<string, number> = {}
  const byEngagement: Record<string, number> = {}
  const byTimeProfile: Record<string, number> = {}
  const byFrequency: Record<string, number> = {}
  const byWave: Record<string, number> = {}
  let bbSum = 0

  for (const p of personas) {
    bySituation[p.profile.situation] = (bySituation[p.profile.situation] || 0) + 1
    byEngagement[p.activity.engagement_style] = (byEngagement[p.activity.engagement_style] || 0) + 1
    byTimeProfile[p.activity.time_profile] = (byTimeProfile[p.activity.time_profile] || 0) + 1
    byFrequency[p.activity.posting_frequency] = (byFrequency[p.activity.posting_frequency] || 0) + 1
    bbSum += p.activity.bescheidboxer_affinity
    const w = p.wave || '(ohne)'
    byWave[w] = (byWave[w] || 0) + 1
  }

  console.log(`\n✓ ${label}\n`)
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
  if (Object.keys(byWave).length > 1 || !byWave['(ohne)']) {
    console.log('\nWellen:')
    for (const [k, v] of Object.entries(byWave).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${k.padEnd(25)} ${v} (${Math.round(v / personas.length * 100)}%)`)
    }
  }
  console.log(`\nDurchschnittliche BescheidBoxer-Affinität: ${(bbSum / personas.length).toFixed(3)}`)
}

async function main() {
  switch (command) {
    case 'generate-personas': {
      // Positional args (legacy support): count seed
      const positionalCount = process.argv[3] && !process.argv[3].startsWith('--')
        ? parseInt(process.argv[3], 10) : undefined
      const positionalSeed = process.argv[4] && !process.argv[4].startsWith('--')
        ? parseInt(process.argv[4], 10) : undefined

      const count = positionalCount ?? parseInt(getArg('count') || '500', 10)
      const seed = positionalSeed ?? parseInt(getArg('seed') || '42', 10)
      const append = hasFlag('append')
      const wave = getArg('wave')
      const timeProfile = getArg('time-profile')?.split(',') as TimeProfile[] | undefined
      const frequency = getArg('frequency')?.split(',') as PostingFrequency[] | undefined
      const engagement = getArg('engagement')?.split(',') as EngagementStyle[] | undefined
      const situation = getArg('situation')?.split(',') as Situation[] | undefined
      const bbAffinity = getArg('bb-affinity')
      const joinFrom = getArg('join-from')
      const joinTo = getArg('join-to')

      // Determine start ID for append mode
      let startId = 1
      let existing: Persona[] = []
      if (append) {
        existing = loadPersonas()
        if (existing.length > 0) {
          const maxId = Math.max(...existing.map(p => parseInt(p.id.replace('p_', ''), 10)))
          startId = maxId + 1
        }
      }

      const opts: GenerateOptions = {
        count,
        seed,
        startId,
        wave,
        timeProfile,
        frequency,
        engagement,
        situation,
        bbAffinity,
        joinFrom,
        joinTo,
      }

      // Show what we're doing
      const filters: string[] = []
      if (wave) filters.push(`Welle: "${wave}"`)
      if (timeProfile) filters.push(`Zeitprofil: ${timeProfile.join(', ')}`)
      if (frequency) filters.push(`Frequenz: ${frequency.join(', ')}`)
      if (engagement) filters.push(`Engagement: ${engagement.join(', ')}`)
      if (situation) filters.push(`Situation: ${situation.join(', ')}`)
      if (bbAffinity) filters.push(`BB-Affinität: ${bbAffinity}`)
      if (joinFrom || joinTo) filters.push(`Beitrittszeitraum: ${joinFrom || '...'} bis ${joinTo || '...'}`)

      console.log(`\nGeneriere ${count} Personas (Seed: ${seed})${append ? ' [APPEND-Modus]' : ''}...`)
      if (filters.length > 0) {
        console.log('Filter:')
        for (const f of filters) console.log(`  → ${f}`)
      }
      console.log()

      const newPersonas = generatePersonas(opts)

      if (append && existing.length > 0) {
        const combined = [...existing, ...newPersonas]
        savePersonas(combined)
        console.log(`✓ ${newPersonas.length} neue Personas hinzugefügt (gesamt: ${combined.length})`)
        printPersonaStats(combined, `${combined.length} Personas gespeichert in data/personas.json`)
      } else {
        savePersonas(newPersonas)
        printPersonaStats(newPersonas, `${newPersonas.length} Personas gespeichert in data/personas.json`)
      }
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
      let personas = loadPersonas()
      if (personas.length === 0) {
        console.log('\nKeine Personas vorhanden – generiere 500 Personas (Seed: 42)...\n')
        const newPersonas = generatePersonas({ count: 500, seed: 42, startId: 1 })
        savePersonas(newPersonas)
        printPersonaStats(newPersonas, `${newPersonas.length} Personas generiert und gespeichert in data/personas.json`)
        personas = newPersonas
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

    case 'setup-wp-categories': {
      console.log('\nErstelle Blog-Kategorien auf WordPress...\n')
      try {
        const { WordPressClient } = await import('./wordpress/client')
        const wp = new WordPressClient(config)

        await wp.testConnection()
        console.log('✓ Verbunden\n')

        const categoriesToCreate = [
          { name: 'Aktuelles & News', slug: 'aktuelles', description: 'Aktuelle Nachrichten und Neuigkeiten rund um Bürgergeld und Jobcenter', envKey: 'CAT_AKTUELLES' },
          { name: 'Widerspruch & Einspruch', slug: 'widerspruch', description: 'Tipps und Erfahrungen zum Widerspruch gegen Jobcenter-Bescheide', envKey: 'CAT_WIDERSPRUCH' },
          { name: 'Mehrbedarf', slug: 'mehrbedarf', description: 'Informationen zu Mehrbedarfen und wie man sie beantragt', envKey: 'CAT_MEHRBEDARF' },
          { name: 'Sanktionen', slug: 'sanktionen', description: 'Alles zum Thema Sanktionen, Kürzungen und Widerspruch dagegen', envKey: 'CAT_SANKTIONEN' },
          { name: 'KdU & Miete', slug: 'kdu-miete', description: 'Kosten der Unterkunft, Mietobergrenzen und Heizkosten', envKey: 'CAT_KDU_MIETE' },
          { name: 'Einkommen & Zuverdienst', slug: 'einkommen-zuverdienst', description: 'Freibeträge, Anrechnung und Zuverdienst neben Bürgergeld', envKey: 'CAT_EINKOMMEN' },
          { name: 'Rechte & Tipps', slug: 'rechte-tipps', description: 'Deine Rechte gegenüber dem Jobcenter und praktische Tipps', envKey: 'CAT_RECHTE_TIPPS' },
          { name: 'Erfahrungsberichte', slug: 'erfahrungen', description: 'Persönliche Erfahrungen und Berichte aus der Community', envKey: 'CAT_ERFAHRUNGEN' },
        ]

        // Vorhandene Kategorien prüfen
        const existing = await wp.getCategories({ per_page: 100 })
        const existingSlugs = new Set(existing.map(c => c.slug))

        const envLines: string[] = []
        let created = 0
        let skipped = 0

        for (const cat of categoriesToCreate) {
          if (existingSlugs.has(cat.slug)) {
            const match = existing.find(c => c.slug === cat.slug)!
            console.log(`  ○ ${cat.name.padEnd(28)} existiert bereits (ID: ${match.id})`)
            envLines.push(`${cat.envKey}=${match.id}`)
            skipped++
          } else {
            try {
              const result = await wp.createCategory({ name: cat.name, slug: cat.slug, description: cat.description })
              console.log(`  ✓ ${cat.name.padEnd(28)} erstellt (ID: ${result.id})`)
              envLines.push(`${cat.envKey}=${result.id}`)
              created++
            } catch (err) {
              console.log(`  ✗ ${cat.name.padEnd(28)} Fehler: ${err instanceof Error ? err.message : err}`)
              envLines.push(`${cat.envKey}=0  # FEHLER`)
            }
            // Rate limiting
            await new Promise(r => setTimeout(r, 500))
          }
        }

        console.log(`\n✓ ${created} erstellt, ${skipped} übersprungen\n`)
        console.log('── Für .env eintragen: ──')
        for (const line of envLines) {
          console.log(`${line}`)
        }
        console.log('')
      } catch (err) {
        console.error(`✗ Fehler: ${err instanceof Error ? err.message : err}`)
      }
      break
    }

    case 'setup-wp-forums': {
      console.log('\nErstelle bbPress-Forums auf WordPress...\n')
      try {
        const { WordPressClient } = await import('./wordpress/client')
        const wp = new WordPressClient(config)

        await wp.testConnection()
        console.log('✓ Verbunden\n')

        // Prüfe ob bbPress REST API verfügbar ist
        console.log('  Prüfe bbPress REST API...')
        const check = await wp.checkBbpressRest()

        if (!check.available) {
          console.log(`  ✗ bbPress REST API nicht erreichbar: ${check.error}\n`)
          console.log('  bbPress ist installiert, aber die REST API ist nicht aktiv.')
          console.log('  Das ist bei vielen bbPress-Versionen Standard.\n')
          console.log('  ── Lösung: mu-plugin installieren ──\n')
          console.log('  1. Erstelle die Datei: wp-content/mu-plugins/bbpress-rest-forums.php')
          console.log('  2. Inhalt (per FTP/SSH/Dateimanager hochladen):\n')
          // Generiere mu-plugin PHP Code
          const forumsPhp = [
            { title: 'Hilfe zum Bescheid', slug: 'hilfe-bescheid', content: 'Du hast einen Bescheid bekommen und verstehst ihn nicht? Hier helfen wir dir, ihn zu verstehen.' },
            { title: 'Widerspruch', slug: 'widerspruch', content: 'Alles rund um Widersprüche gegen Jobcenter-Bescheide. Tipps, Vorlagen und Erfahrungen.' },
            { title: 'Sanktionen', slug: 'sanktionen', content: 'Sanktioniert worden? Hier tauschen wir uns über Sanktionen und Gegenmaßnahmen aus.' },
            { title: 'KdU & Miete', slug: 'kdu-miete', content: 'Kosten der Unterkunft, Mietobergrenzen, Umzug – alles zum Thema Wohnen mit Bürgergeld.' },
            { title: 'Zuverdienst & Einkommen', slug: 'zuverdienst-einkommen', content: 'Minijob, Nebenverdienst, Freibeträge – was wird angerechnet, was darf man behalten?' },
            { title: 'Erfolge', slug: 'erfolge', content: 'Widerspruch gewonnen? Nachzahlung bekommen? Teile deine Erfolge mit der Community!' },
            { title: 'Dampf ablassen', slug: 'auskotzen', content: 'Manchmal muss man einfach mal Frust loswerden. Hier ist Platz dafür.' },
            { title: 'Allgemeines', slug: 'allgemeines', content: 'Allgemeine Diskussionen rund um Bürgergeld, Jobcenter und alles was sonst noch wichtig ist.' },
          ]

          const phpCode = `<?php
/**
 * Plugin Name: bbPress Forum Setup + REST API
 * Description: Erstellt Forums und aktiviert bbPress REST API Endpoints
 */

// bbPress REST API für Forums, Topics, Replies aktivieren
add_filter('bbp_register_forum_post_type', function($args) {
    $args['show_in_rest'] = true;
    $args['rest_base'] = 'forums';
    return $args;
});
add_filter('bbp_register_topic_post_type', function($args) {
    $args['show_in_rest'] = true;
    $args['rest_base'] = 'topics';
    return $args;
});
add_filter('bbp_register_reply_post_type', function($args) {
    $args['show_in_rest'] = true;
    $args['rest_base'] = 'replies';
    return $args;
});

// Forums einmalig erstellen (nur beim ersten Laden)
add_action('init', function() {
    if (!function_exists('bbp_get_forum_post_type') || get_option('bbpress_forums_created')) return;

    $forums = [
${forumsPhp.map(f => `        ['title' => '${f.title}', 'slug' => '${f.slug}', 'content' => '${f.content}'],`).join('\n')}
    ];

    $ids = [];
    foreach ($forums as $forum) {
        $existing = get_page_by_path($forum['slug'], OBJECT, bbp_get_forum_post_type());
        if ($existing) {
            $ids[$forum['slug']] = $existing->ID;
            continue;
        }
        $id = bbp_insert_forum([
            'post_title'   => $forum['title'],
            'post_name'    => $forum['slug'],
            'post_content' => $forum['content'],
            'post_status'  => 'publish',
        ]);
        if ($id && !is_wp_error($id)) {
            $ids[$forum['slug']] = $id;
        }
    }

    if (count($ids) > 0) {
        update_option('bbpress_forums_created', $ids);
    }
}, 20);

// Admin-Hinweis mit Forum-IDs anzeigen
add_action('admin_notices', function() {
    $ids = get_option('bbpress_forums_created');
    if (!$ids || !is_array($ids)) return;
    $lines = [];
    $envMap = [
        'hilfe-bescheid' => 'FORUM_ID_HILFE_BESCHEID',
        'widerspruch' => 'FORUM_ID_WIDERSPRUCH',
        'sanktionen' => 'FORUM_ID_SANKTIONEN',
        'kdu-miete' => 'FORUM_ID_KDU_MIETE',
        'zuverdienst-einkommen' => 'FORUM_ID_ZUVERDIENST',
        'erfolge' => 'FORUM_ID_ERFOLGE',
        'auskotzen' => 'FORUM_ID_AUSKOTZEN',
        'allgemeines' => 'FORUM_ID_ALLGEMEINES',
    ];
    foreach ($ids as $slug => $id) {
        $key = isset($envMap[$slug]) ? $envMap[$slug] : strtoupper($slug);
        $lines[] = "$key=$id";
    }
    echo '<div class="notice notice-success"><p><strong>bbPress Forums erstellt!</strong><br><pre>' . implode("\\n", $lines) . '</pre></p></div>';
});`

          console.log('────────────────────────────────────────────')
          console.log(phpCode)
          console.log('────────────────────────────────────────────')
          console.log('')
          console.log('  3. Besuche danach ' + config.wp_base_url + '/wp-admin/')
          console.log('     → Die Forum-IDs werden als Admin-Hinweis angezeigt')
          console.log('  4. Trage die IDs in .env ein')
          console.log('  5. Führe dann nochmal aus: npx tsx server/cli.ts discover-wp')
          console.log('')
          break
        }

        console.log('  ✓ bbPress REST API ist aktiv!\n')

        const forumsToCreate = [
          { title: 'Hilfe zum Bescheid', slug: 'hilfe-bescheid', content: 'Du hast einen Bescheid bekommen und verstehst ihn nicht? Hier helfen wir dir, ihn zu verstehen.', envKey: 'FORUM_ID_HILFE_BESCHEID' },
          { title: 'Widerspruch', slug: 'widerspruch', content: 'Alles rund um Widersprüche gegen Jobcenter-Bescheide. Tipps, Vorlagen und Erfahrungen.', envKey: 'FORUM_ID_WIDERSPRUCH' },
          { title: 'Sanktionen', slug: 'sanktionen', content: 'Sanktioniert worden? Hier tauschen wir uns über Sanktionen und Gegenmaßnahmen aus.', envKey: 'FORUM_ID_SANKTIONEN' },
          { title: 'KdU & Miete', slug: 'kdu-miete', content: 'Kosten der Unterkunft, Mietobergrenzen, Umzug – alles zum Thema Wohnen mit Bürgergeld.', envKey: 'FORUM_ID_KDU_MIETE' },
          { title: 'Zuverdienst & Einkommen', slug: 'zuverdienst-einkommen', content: 'Minijob, Nebenverdienst, Freibeträge – was wird angerechnet, was darf man behalten?', envKey: 'FORUM_ID_ZUVERDIENST' },
          { title: 'Erfolge', slug: 'erfolge', content: 'Widerspruch gewonnen? Nachzahlung bekommen? Teile deine Erfolge mit der Community!', envKey: 'FORUM_ID_ERFOLGE' },
          { title: 'Dampf ablassen', slug: 'auskotzen', content: 'Manchmal muss man einfach mal Frust loswerden. Hier ist Platz dafür.', envKey: 'FORUM_ID_AUSKOTZEN' },
          { title: 'Allgemeines', slug: 'allgemeines', content: 'Allgemeine Diskussionen rund um Bürgergeld, Jobcenter und alles was sonst noch wichtig ist.', envKey: 'FORUM_ID_ALLGEMEINES' },
        ]

        // Vorhandene Forums prüfen
        let existingForums: Array<{ id: number; title: string; slug: string }> = []
        try {
          existingForums = await wp.getForums()
        } catch { /* leer */ }
        const existingSlugs = new Set(existingForums.map(f => f.slug))

        const envLines: string[] = []
        let created = 0
        let skipped = 0

        for (const forum of forumsToCreate) {
          if (existingSlugs.has(forum.slug)) {
            const match = existingForums.find(f => f.slug === forum.slug)!
            console.log(`  ○ ${forum.title.padEnd(28)} existiert bereits (ID: ${match.id})`)
            envLines.push(`${forum.envKey}=${match.id}`)
            skipped++
          } else {
            try {
              const result = await wp.createForum({ title: forum.title, slug: forum.slug, content: forum.content })
              console.log(`  ✓ ${forum.title.padEnd(28)} erstellt (ID: ${result.id})`)
              envLines.push(`${forum.envKey}=${result.id}`)
              created++
            } catch (err) {
              console.log(`  ✗ ${forum.title.padEnd(28)} Fehler: ${err instanceof Error ? err.message : err}`)
              envLines.push(`${forum.envKey}=0  # FEHLER`)
            }
            await new Promise(r => setTimeout(r, 500))
          }
        }

        console.log(`\n✓ ${created} erstellt, ${skipped} übersprungen\n`)
        console.log('── Für .env eintragen: ──')
        for (const line of envLines) {
          console.log(`${line}`)
        }
        console.log('')
      } catch (err) {
        console.error(`✗ Fehler: ${err instanceof Error ? err.message : err}`)
      }
      break
    }

    case 'discover-wp': {
      console.log('\nWordPress-Konfiguration abrufen...\n')
      try {
        const { WordPressClient } = await import('./wordpress/client')
        const wp = new WordPressClient(config)

        // Verbindung testen
        const user = await wp.testConnection()
        console.log(`✓ Verbunden als: ${user.name} (ID: ${user.id})\n`)

        // Kategorien abrufen
        console.log('── Kategorien ──')
        try {
          const categories = await wp.getCategories({ per_page: 100 })
          if (categories.length === 0) {
            console.log('  Keine Kategorien gefunden.')
          } else {
            for (const cat of categories) {
              console.log(`  ID: ${String(cat.id).padStart(3)}  ${cat.name.padEnd(30)} (slug: ${cat.slug}, ${cat.count} Beiträge)`)
            }
            console.log(`\n  → .env Vorschlag:`)
            const catMapping: Record<string, string[]> = {
              CAT_AKTUELLES: ['aktuelles', 'news', 'neuigkeiten', 'allgemein'],
              CAT_WIDERSPRUCH: ['widerspruch', 'einspruch'],
              CAT_MEHRBEDARF: ['mehrbedarf'],
              CAT_SANKTIONEN: ['sanktionen', 'sanktion'],
              CAT_KDU_MIETE: ['kdu', 'miete', 'wohnung', 'unterkunft'],
              CAT_EINKOMMEN: ['einkommen', 'zuverdienst', 'minijob'],
              CAT_RECHTE_TIPPS: ['rechte', 'tipps', 'recht'],
              CAT_ERFAHRUNGEN: ['erfahrungen', 'erfahrung', 'berichte'],
            }
            for (const [envKey, slugs] of Object.entries(catMapping)) {
              const match = categories.find(c => slugs.some(s => c.slug.includes(s) || c.name.toLowerCase().includes(s)))
              console.log(`  ${envKey}=${match ? match.id : 0}${match ? `  # ${match.name}` : '  # nicht gefunden'}`)
            }
          }
        } catch (err) {
          console.log(`  ✗ Fehler beim Abrufen: ${err instanceof Error ? err.message : err}`)
        }

        // Forums abrufen (bbPress)
        console.log('\n── bbPress Forums ──')
        try {
          const forums = await wp.getForums()
          if (Array.isArray(forums) && forums.length > 0) {
            for (const forum of forums) {
              const title = typeof forum.title === 'object' ? (forum.title as any).rendered : forum.title
              console.log(`  ID: ${String(forum.id).padStart(3)}  ${title.padEnd(30)} (slug: ${forum.slug})`)
            }
            console.log(`\n  → .env Vorschlag:`)
            const forumMapping: Record<string, string[]> = {
              FORUM_ID_HILFE_BESCHEID: ['hilfe-bescheid', 'bescheid', 'hilfe'],
              FORUM_ID_WIDERSPRUCH: ['widerspruch'],
              FORUM_ID_SANKTIONEN: ['sanktionen', 'sanktion'],
              FORUM_ID_KDU_MIETE: ['kdu', 'miete', 'wohnung'],
              FORUM_ID_ZUVERDIENST: ['zuverdienst', 'einkommen'],
              FORUM_ID_ERFOLGE: ['erfolge', 'erfolg'],
              FORUM_ID_AUSKOTZEN: ['auskotzen', 'frust', 'dampf'],
              FORUM_ID_ALLGEMEINES: ['allgemein', 'allgemeines', 'general'],
            }
            for (const [envKey, slugs] of Object.entries(forumMapping)) {
              const match = forums.find((f: any) => {
                const title = typeof f.title === 'object' ? (f.title as any).rendered : f.title
                return slugs.some(s => (f.slug || '').includes(s) || title.toLowerCase().includes(s))
              })
              console.log(`  ${envKey}=${match ? match.id : 0}${match ? '' : '  # nicht gefunden'}`)
            }
          } else {
            console.log('  Keine bbPress-Forums gefunden. bbPress evtl. nicht installiert.')
          }
        } catch (err) {
          console.log(`  bbPress nicht verfügbar: ${err instanceof Error ? err.message : err}`)
        }

        // Vorhandene Posts zählen
        console.log('\n── Vorhandene Inhalte ──')
        try {
          const posts = await wp.getRecentPosts(5)
          console.log(`  Blog-Posts: ${posts.length}+ vorhanden`)
          if (posts.length > 0) {
            for (const p of posts.slice(0, 5)) {
              const title = typeof p.title === 'object' ? p.title.rendered : p.title
              console.log(`    → #${p.id}: ${title}`)
            }
          }
        } catch {
          console.log('  Blog-Posts: Abruf fehlgeschlagen')
        }

        try {
          const topics = await wp.getForumTopics()
          console.log(`  Forum-Topics: ${topics.length}+ vorhanden`)
        } catch {
          console.log('  Forum-Topics: Abruf fehlgeschlagen oder bbPress nicht aktiv')
        }

        // Vorhandene User zählen
        try {
          const users = await wp.getUsers({ per_page: 1 })
          console.log(`  WP-User: Abruf OK`)
        } catch {
          console.log('  WP-User: Abruf fehlgeschlagen')
        }

        console.log('')
      } catch (err) {
        console.error(`✗ Verbindung fehlgeschlagen: ${err instanceof Error ? err.message : err}`)
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
  setup-wp-categories               Blog-Kategorien auf WP anlegen
  setup-wp-forums                   bbPress-Forums auf WP anlegen
  start-bot                         Bot starten (läuft im Vordergrund)
  status                            Aktuellen Status anzeigen
  test-wp                           WordPress-Verbindung testen
  discover-wp                       WordPress-Kategorien/Forums abrufen

generate-personas Optionen:
  --count <n>              Anzahl (Standard: 500)
  --seed <n>               Zufallsseed (Standard: 42)
  --append                 An bestehende Personas anhängen statt überschreiben
  --wave <name>            Wellen-Label (z.B. "gruender", "welle2", "spaet")
  --time-profile <tp>      Zeitprofil: fruehaufsteher,berufstaetig,nachtaktiv,ganztags
  --frequency <f>          Häufigkeit: taeglich,3_4_pro_woche,...,selten
  --engagement <e>         Engagement: schreiber,kommentierer,liker,lurker_gelegentlich,mixed
  --situation <s>          Situation: alleinerziehend,single,langzeitbezieher,...
  --bb-affinity <range>    BescheidBoxer-Affinität: none,low,medium,high oder "0.2-0.5"
  --join-from <YYYY-MM>    Beitritt frühestens (z.B. 2024-03)
  --join-to <YYYY-MM>      Beitritt spätestens (z.B. 2025-06)

Beispiele – organisches Wachstum:

  # Gründer-Kern (aktive Power-User, frühe Beitrittsdate)
  pnpm bot:generate-personas -- --count 30 --seed 1 --wave gruender \\
    --engagement schreiber,mixed --frequency taeglich,3_4_pro_woche \\
    --bb-affinity high --join-from 2024-01 --join-to 2024-06

  # Welle 2: Erste Community (gemischt, mittlere Aktivität)
  pnpm bot:generate-personas -- --count 80 --seed 2 --wave welle2 --append \\
    --join-from 2024-06 --join-to 2025-01

  # Welle 3: Wachstum (mehr Lurker, weniger aktiv)
  pnpm bot:generate-personas -- --count 200 --seed 3 --wave welle3 --append \\
    --engagement liker,lurker_gelegentlich,kommentierer \\
    --frequency gelegentlich,1_2_pro_woche \\
    --join-from 2025-01 --join-to 2025-12

  # Welle 4: Neuzugänge (Neubezieher-lastig, unsicher)
  pnpm bot:generate-personas -- --count 100 --seed 4 --wave neuzugang --append \\
    --situation neubezieher,single,trennung --bb-affinity low \\
    --join-from 2025-10 --join-to 2026-02

  # Alle neu generieren (überschreibt)
  pnpm bot:generate-personas -- --count 500 --seed 42
`)
  }
}

main().catch(err => {
  console.error('Fehler:', err)
  process.exit(1)
})
