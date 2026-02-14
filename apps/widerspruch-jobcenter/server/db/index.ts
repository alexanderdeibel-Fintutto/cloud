// ══════════════════════════════════════════════════════════════
// Lokale JSON-Datenbank für Personas, Schedule & Activity Log
// ══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync } from 'fs'
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
  } catch {
    return fallback
  }
}

function writeJson(filename: string, data: unknown): void {
  const path = join(DATA_DIR, filename)
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
}

// ── Personas ──

export function loadPersonas(): Persona[] {
  return readJson<Persona[]>('personas.json', [])
}

export function savePersonas(personas: Persona[]): void {
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

// ── Activity Log ──

export function loadActivityLog(): ActivityLogEntry[] {
  return readJson<ActivityLogEntry[]>('activity-log.json', [])
}

export function logActivity(entry: ActivityLogEntry): void {
  const log = loadActivityLog()
  log.push(entry)
  // Keep last 10000 entries
  if (log.length > 10000) log.splice(0, log.length - 10000)
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
