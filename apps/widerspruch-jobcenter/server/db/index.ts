// ══════════════════════════════════════════════════════════════
// Lokale JSON-Datenbank für Personas, Schedule & Activity Log
// Atomic Writes: schreibt erst in .tmp, dann atomares rename
// ══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Persona, ScheduledAction, ActivityLogEntry } from '../personas/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = join(__dirname, '../../data')

function readJson<T>(filename: string, fallback: T): T {
  const path = join(DATA_DIR, filename)
  if (!existsSync(path)) return fallback
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch (err) {
    // Korrupte Datei? Backup versuchen
    const backupPath = path + '.backup'
    if (existsSync(backupPath)) {
      console.warn(`[DB] ${filename} korrupt, lade Backup...`)
      try {
        return JSON.parse(readFileSync(backupPath, 'utf-8'))
      } catch { /* Backup auch kaputt */ }
    }
    console.error(`[DB] ${filename} konnte nicht gelesen werden:`, err)
    return fallback
  }
}

function writeJson(filename: string, data: unknown): void {
  const path = join(DATA_DIR, filename)
  const tmpPath = path + '.tmp'
  const backupPath = path + '.backup'

  // 1. In temp-Datei schreiben
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')

  // 2. Bestehende Datei als Backup behalten
  if (existsSync(path)) {
    try { renameSync(path, backupPath) } catch { /* ok, überschreiben */ }
  }

  // 3. Temp → finale Datei (atomar auf gleichem Filesystem)
  renameSync(tmpPath, path)
}

// ── Personas ──

export function loadPersonas(): Persona[] {
  return readJson<Persona[]>('personas.json', [])
}

export function savePersonas(personas: Persona[]): void {
  // Sicherheits-Check: Warnen wenn wp_user_ids verloren gehen würden
  const existing = readJson<Persona[]>('personas.json', [])
  const existingWithWp = existing.filter(p => p.wp_user_id).length
  const newWithWp = personas.filter(p => p.wp_user_id).length

  if (existingWithWp > 0 && newWithWp === 0 && personas.length > 0) {
    console.error(`[DB] ⚠️ WARNUNG: savePersonas würde ${existingWithWp} wp_user_ids löschen! Schreibe trotzdem (Backup vorhanden).`)
  }
  if (existingWithWp > 10 && newWithWp < existingWithWp * 0.5) {
    console.error(`[DB] ⚠️ WARNUNG: wp_user_ids sinken von ${existingWithWp} auf ${newWithWp}!`)
  }

  writeJson('personas.json', personas)
}

export function getPersonaById(id: string): Persona | undefined {
  return loadPersonas().find(p => p.id === id)
}

export function updatePersona(id: string, updates: Partial<Persona>): void {
  const personas = loadPersonas()
  const idx = personas.findIndex(p => p.id === id)
  if (idx === -1) return
  personas[idx] = { ...personas[idx], ...updates }
  savePersonas(personas)
}

// ── Schedule ──

export function loadSchedule(): ScheduledAction[] {
  return readJson<ScheduledAction[]>('schedule-state.json', [])
}

export function saveSchedule(schedule: ScheduledAction[]): void {
  writeJson('schedule-state.json', schedule)
}

export function addScheduledAction(action: ScheduledAction): void {
  const schedule = loadSchedule()
  schedule.push(action)
  saveSchedule(schedule)
}

export function updateScheduledAction(
  id: string,
  updates: Partial<ScheduledAction>
): void {
  const schedule = loadSchedule()
  const idx = schedule.findIndex(a => a.id === id)
  if (idx === -1) return
  schedule[idx] = { ...schedule[idx], ...updates }
  saveSchedule(schedule)
}

export function getPendingActions(): ScheduledAction[] {
  const now = new Date().toISOString()
  return loadSchedule()
    .filter(a => a.status === 'pending' && a.scheduled_at <= now)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
}

export function getTodaysActions(): ScheduledAction[] {
  const today = new Date().toISOString().slice(0, 10)
  return loadSchedule().filter(a => a.scheduled_at.startsWith(today))
}

// ── Schedule History ──

export function loadScheduleHistory(): Record<string, ScheduledAction[]> {
  return readJson<Record<string, ScheduledAction[]>>('schedule-history.json', {})
}

export function archiveSchedule(dateStr: string, actions: ScheduledAction[]): void {
  if (actions.length === 0) return
  const history = loadScheduleHistory()
  history[dateStr] = actions

  // Max 30 Tage aufbewahren
  const dates = Object.keys(history).sort()
  while (dates.length > 30) {
    delete history[dates.shift()!]
  }

  writeJson('schedule-history.json', history)
}

export function getScheduleByDate(dateStr: string): ScheduledAction[] {
  const today = new Date().toISOString().slice(0, 10)
  if (dateStr === today) return getTodaysActions()
  const history = loadScheduleHistory()
  return history[dateStr] || []
}

export function getScheduleDates(): string[] {
  const today = new Date().toISOString().slice(0, 10)
  const history = loadScheduleHistory()
  const dates = Object.keys(history)
  if (!dates.includes(today)) {
    const todaysActions = getTodaysActions()
    if (todaysActions.length > 0) dates.push(today)
  }
  return dates.sort()
}

// ── Activity Log ──

export function loadActivityLog(): ActivityLogEntry[] {
  return readJson<ActivityLogEntry[]>('activity-log.json', [])
}

export function logActivity(entry: ActivityLogEntry): void {
  const log = loadActivityLog()
  log.push(entry)
  // Keep last 50000 entries
  if (log.length > 50000) log.splice(0, log.length - 50000)
  writeJson('activity-log.json', log)
}

export function getTodaysActivityCount(): { posts: number; comments: number } {
  const today = new Date().toISOString().slice(0, 10)
  const log = loadActivityLog().filter(e => e.timestamp.startsWith(today) && e.success)
  return {
    posts: log.filter(e => e.action_type === 'blog_post' || e.action_type === 'forum_topic').length,
    comments: log.filter(e =>
      e.action_type === 'blog_comment' ||
      e.action_type === 'blog_comment_reply' ||
      e.action_type === 'forum_reply'
    ).length,
  }
}
