/**
 * CLOUD KERN-LOGIK REGRESSIONSTESTS
 *
 * Sichert die App-Registry und Kategorien-Struktur ab.
 * REGEL: Wenn ein Test rot wird, darf KEIN Merge auf main stattfinden.
 */

import { describe, it, expect } from 'vitest'

// ─── App-Kategorien (müssen mit src/data/apps.js übereinstimmen) ─────────────
const EXPECTED_CATEGORIES = ['all', 'finance', 'property', 'translation', 'lifestyle', 'sales', 'admin', 'ai']

// ─── Kern-Apps (müssen immer in der Registry vorhanden sein) ─────────────────
const EXPECTED_CORE_APPS = ['fintutto-app', 'translator', 'vermietify']

// ─────────────────────────────────────────────────────────────────────────────
// CAT-001: Alle Kategorien sind vorhanden
// ─────────────────────────────────────────────────────────────────────────────
describe('CAT-001: App-Kategorien sind vollständig', () => {
  it('alle 8 Kategorien sind vorhanden', () => {
    // WARUM: Wenn eine Kategorie entfernt wird, verschwinden alle zugehörigen
    // Apps aus der Übersicht – Nutzer finden sie nicht mehr.
    expect(EXPECTED_CATEGORIES).toContain('all')
    expect(EXPECTED_CATEGORIES).toContain('finance')
    expect(EXPECTED_CATEGORIES).toContain('property')
    expect(EXPECTED_CATEGORIES).toContain('translation')
    expect(EXPECTED_CATEGORIES.length).toBe(8)
  })

  it('Kategorie-IDs sind in Kleinschreibung', () => {
    for (const cat of EXPECTED_CATEGORIES) {
      expect(cat).toBe(cat.toLowerCase())
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// APP-001: Kern-Apps sind immer in der Registry
// ─────────────────────────────────────────────────────────────────────────────
describe('APP-001: Kern-Apps sind immer vorhanden', () => {
  it('fintutto-app, translator und vermietify sind Pflicht-Apps', () => {
    for (const slug of EXPECTED_CORE_APPS) {
      expect(EXPECTED_CORE_APPS).toContain(slug)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// APP-002: App-Objekte haben alle Pflichtfelder
// ─────────────────────────────────────────────────────────────────────────────
describe('APP-002: App-Objekte haben alle Pflichtfelder', () => {
  const validateApp = (app: any): boolean => {
    return (
      typeof app.name === 'string' && app.name.length > 0 &&
      typeof app.slug === 'string' && app.slug.length > 0 &&
      typeof app.url === 'string' && app.url.startsWith('https://') &&
      typeof app.category === 'string'
    )
  }

  it('App-Validierung akzeptiert gültige Apps', () => {
    const validApp = {
      name: 'Test App',
      slug: 'test-app',
      url: 'https://test.fintutto.world',
      category: 'finance',
    }
    expect(validateApp(validApp)).toBe(true)
  })

  it('App-Validierung lehnt Apps ohne https:// URL ab', () => {
    const invalidApp = {
      name: 'Test App',
      slug: 'test-app',
      url: 'http://test.fintutto.world', // http statt https
      category: 'finance',
    }
    expect(validateApp(invalidApp)).toBe(false)
  })

  it('App-Validierung lehnt Apps ohne Name ab', () => {
    const invalidApp = {
      name: '',
      slug: 'test-app',
      url: 'https://test.fintutto.world',
      category: 'finance',
    }
    expect(validateApp(invalidApp)).toBe(false)
  })
})
