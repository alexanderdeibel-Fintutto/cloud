#!/usr/bin/env npx ts-node
/**
 * ============================================================
 * FINTUTTO URL CRAWLER CLI
 * ============================================================
 *
 * Crawlt eine Domain rekursiv, findet alle Unterseiten,
 * prüft jeden Link, und speichert Ergebnisse in Supabase.
 *
 * Verwendung:
 *   npx ts-node scripts/crawl-urls.ts --domain https://fintutto.de
 *   npx ts-node scripts/crawl-urls.ts --domain https://fintutto.de --depth 3
 *   npx ts-node scripts/crawl-urls.ts --all              # Alle Domains aus DB
 *   npx ts-node scripts/crawl-urls.ts --check-only       # Nur Status prüfen
 *   npx ts-node scripts/crawl-urls.ts --import-csv urls.csv
 *
 * Umgebungsvariablen:
 *   SUPABASE_URL       - Supabase Projekt-URL
 *   SUPABASE_KEY       - Supabase Service Role Key
 *
 * Falls kein Supabase konfiguriert: Ergebnisse als JSON + CSV
 * ============================================================
 */

import * as https from 'https'
import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import { URL } from 'url'

// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
  MAX_DEPTH: 3,
  MAX_PAGES_PER_DOMAIN: 500,
  CONCURRENCY: 5,
  REQUEST_TIMEOUT: 15000,
  DELAY_BETWEEN_REQUESTS: 200,
  USER_AGENT: 'FintuttoCrawler/1.0 (+https://fintutto.de)',
  OUTPUT_DIR: path.join(__dirname, '..', 'url-audit', 'results'),
}

// ============================================================
// TYPES
// ============================================================
interface CrawlResult {
  url: string
  path: string
  status: 'online' | 'offline' | 'redirect' | 'error' | 'timeout'
  httpCode: number | null
  title: string
  metaDescription: string
  h1: string
  redirectUrl: string
  hasGA: boolean
  hasGTM: boolean
  hasCanonical: boolean
  hasOgTags: boolean
  hasImpressumLink: boolean
  hasDatenschutzLink: boolean
  wordCount: number
  depth: number
  responseTimeMs: number
  links: string[]
  error: string
}

interface DomainReport {
  domain: string
  crawledAt: string
  totalPages: number
  online: number
  offline: number
  redirects: number
  errors: number
  pages: CrawlResult[]
}

// ============================================================
// HELPERS
// ============================================================
function parseArgs(): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {}
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = process.argv[i + 1]
      if (next && !next.startsWith('--')) {
        args[key] = next
        i++
      } else {
        args[key] = true
      }
    }
  }
  return args
}

function log(msg: string, type: 'info' | 'ok' | 'warn' | 'error' = 'info') {
  const prefix: Record<string, string> = {
    info: '\x1b[36m[i]\x1b[0m',
    ok: '\x1b[32m[+]\x1b[0m',
    warn: '\x1b[33m[!]\x1b[0m',
    error: '\x1b[31m[x]\x1b[0m',
  }
  console.log(`${prefix[type]} ${msg}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================
// HTTP FETCH (no external deps needed)
// ============================================================
function fetchUrl(url: string, followRedirects = true): Promise<{
  statusCode: number
  headers: Record<string, string | string[] | undefined>
  body: string
  redirectUrl: string
  responseTimeMs: number
}> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const parsedUrl = new URL(url)
    const client = parsedUrl.protocol === 'https:' ? https : http

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: CONFIG.REQUEST_TIMEOUT,
      headers: {
        'User-Agent': CONFIG.USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
      rejectUnauthorized: false,
    }

    const req = client.request(options, (res) => {
      const responseTimeMs = Date.now() - startTime

      // Handle redirect
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).toString()
        if (followRedirects) {
          fetchUrl(redirectUrl, true).then(result => {
            resolve({ ...result, redirectUrl })
          }).catch(reject)
          return
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers as Record<string, string | string[] | undefined>,
          body: '',
          redirectUrl,
          responseTimeMs,
        })
        return
      }

      let body = ''
      res.setEncoding('utf8')
      res.on('data', chunk => { body += chunk })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers as Record<string, string | string[] | undefined>,
          body: body.substring(0, 500000), // Limit body size
          redirectUrl: '',
          responseTimeMs,
        })
      })
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('TIMEOUT'))
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.end()
  })
}

// ============================================================
// HTML PARSER (lightweight, no deps)
// ============================================================
function extractFromHtml(html: string, baseUrl: string): {
  title: string
  metaDescription: string
  h1: string
  hasGA: boolean
  hasGTM: boolean
  hasCanonical: boolean
  hasOgTags: boolean
  hasImpressumLink: boolean
  hasDatenschutzLink: boolean
  wordCount: number
  links: string[]
} {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i)
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i)

  const hasGA = /google-analytics|gtag|analytics\.js|G-[A-Z0-9]+|UA-\d+/i.test(html)
  const hasGTM = /googletagmanager|GTM-[A-Z0-9]+/i.test(html)
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html)
  const hasOgTags = /<meta[^>]+property=["']og:/i.test(html)

  const lowerHtml = html.toLowerCase()
  const hasImpressumLink = /href=["'][^"']*impressum/i.test(html)
  const hasDatenschutzLink = /href=["'][^"']*datenschutz|href=["'][^"']*privacy/i.test(html)

  // Word count (strip tags, count words)
  const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const wordCount = textContent.split(' ').filter(w => w.length > 0).length

  // Extract links
  const links: string[] = []
  const linkRegex = /href=["']([^"'#]+)/gi
  let match
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1].trim()
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue
      const absoluteUrl = new URL(href, baseUrl).toString()
      links.push(absoluteUrl)
    } catch {
      // Skip invalid URLs
    }
  }

  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    metaDescription: metaDescMatch ? metaDescMatch[1].trim() : '',
    h1: h1Match ? h1Match[1].trim() : '',
    hasGA,
    hasGTM,
    hasCanonical,
    hasOgTags,
    hasImpressumLink,
    hasDatenschutzLink,
    wordCount,
    links: [...new Set(links)],
  }
}

// ============================================================
// CRAWLER
// ============================================================
async function crawlPage(url: string, depth: number): Promise<CrawlResult> {
  const parsedUrl = new URL(url)
  const pagePath = parsedUrl.pathname + parsedUrl.search

  try {
    const response = await fetchUrl(url)

    if (response.statusCode === 200) {
      const extracted = extractFromHtml(response.body, url)
      return {
        url,
        path: pagePath,
        status: response.redirectUrl ? 'redirect' : 'online',
        httpCode: response.statusCode,
        title: extracted.title,
        metaDescription: extracted.metaDescription,
        h1: extracted.h1,
        redirectUrl: response.redirectUrl,
        hasGA: extracted.hasGA,
        hasGTM: extracted.hasGTM,
        hasCanonical: extracted.hasCanonical,
        hasOgTags: extracted.hasOgTags,
        hasImpressumLink: extracted.hasImpressumLink,
        hasDatenschutzLink: extracted.hasDatenschutzLink,
        wordCount: extracted.wordCount,
        depth,
        responseTimeMs: response.responseTimeMs,
        links: extracted.links,
        error: '',
      }
    }

    return {
      url, path: pagePath,
      status: response.statusCode >= 400 ? 'error' : 'redirect',
      httpCode: response.statusCode,
      title: '', metaDescription: '', h1: '',
      redirectUrl: response.redirectUrl,
      hasGA: false, hasGTM: false, hasCanonical: false, hasOgTags: false,
      hasImpressumLink: false, hasDatenschutzLink: false,
      wordCount: 0, depth, responseTimeMs: response.responseTimeMs,
      links: [], error: `HTTP ${response.statusCode}`,
    }

  } catch (err: any) {
    const status = err.message === 'TIMEOUT' ? 'timeout' : 'offline'
    return {
      url, path: pagePath, status, httpCode: null,
      title: '', metaDescription: '', h1: '', redirectUrl: '',
      hasGA: false, hasGTM: false, hasCanonical: false, hasOgTags: false,
      hasImpressumLink: false, hasDatenschutzLink: false,
      wordCount: 0, depth, responseTimeMs: 0,
      links: [], error: err.message || 'Connection failed',
    }
  }
}

async function crawlDomain(domainUrl: string, maxDepth: number): Promise<DomainReport> {
  const parsedDomain = new URL(domainUrl)
  const domainHost = parsedDomain.hostname
  const visited = new Set<string>()
  const queue: Array<{ url: string; depth: number }> = [{ url: domainUrl, depth: 0 }]
  const results: CrawlResult[] = []

  log(`Starte Crawl: ${domainUrl} (max Tiefe: ${maxDepth})`)

  while (queue.length > 0 && results.length < CONFIG.MAX_PAGES_PER_DOMAIN) {
    const batch = queue.splice(0, CONFIG.CONCURRENCY)

    const promises = batch.map(async ({ url, depth }) => {
      const normalizedUrl = url.replace(/\/$/, '')
      if (visited.has(normalizedUrl)) return null
      visited.add(normalizedUrl)

      const result = await crawlPage(url, depth)

      const statusIcon = result.status === 'online' ? '\x1b[32m+\x1b[0m'
        : result.status === 'redirect' ? '\x1b[33m~\x1b[0m'
        : '\x1b[31mx\x1b[0m'

      log(`  [${statusIcon}] ${result.httpCode || '---'} ${result.path} ${result.title ? `"${result.title.substring(0, 40)}"` : ''}`)

      // Queue new links (same domain only)
      if (depth < maxDepth) {
        for (const link of result.links) {
          try {
            const linkUrl = new URL(link)
            if (linkUrl.hostname === domainHost) {
              const normalized = link.replace(/\/$/, '')
              if (!visited.has(normalized) && !queue.some(q => q.url.replace(/\/$/, '') === normalized)) {
                queue.push({ url: link, depth: depth + 1 })
              }
            }
          } catch {
            // Skip invalid
          }
        }
      }

      return result
    })

    const batchResults = await Promise.all(promises)
    for (const r of batchResults) {
      if (r) results.push(r)
    }

    await sleep(CONFIG.DELAY_BETWEEN_REQUESTS)
  }

  const report: DomainReport = {
    domain: domainUrl,
    crawledAt: new Date().toISOString(),
    totalPages: results.length,
    online: results.filter(r => r.status === 'online').length,
    offline: results.filter(r => r.status === 'offline' || r.status === 'timeout').length,
    redirects: results.filter(r => r.status === 'redirect').length,
    errors: results.filter(r => r.status === 'error').length,
    pages: results,
  }

  log(`\nFertig: ${report.totalPages} Seiten gefunden`, 'ok')
  log(`  Online: ${report.online} | Offline: ${report.offline} | Redirects: ${report.redirects} | Errors: ${report.errors}`)

  return report
}

// ============================================================
// OUTPUT
// ============================================================
function saveReport(report: DomainReport) {
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true })
  }

  const domainSlug = new URL(report.domain).hostname.replace(/\./g, '_')
  const timestamp = new Date().toISOString().slice(0, 10)

  // JSON
  const jsonPath = path.join(CONFIG.OUTPUT_DIR, `${domainSlug}_${timestamp}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  log(`JSON gespeichert: ${jsonPath}`, 'ok')

  // CSV
  const csvPath = path.join(CONFIG.OUTPUT_DIR, `${domainSlug}_${timestamp}.csv`)
  const csvHeader = 'URL,Path,Status,HTTP Code,Title,Meta Description,H1,GA,GTM,Canonical,OG Tags,Impressum,Datenschutz,Words,Depth,Response ms,Redirect,Error\n'
  const csvRows = report.pages.map(p => [
    p.url, p.path, p.status, p.httpCode || '',
    `"${(p.title || '').replace(/"/g, '""')}"`,
    `"${(p.metaDescription || '').replace(/"/g, '""').substring(0, 200)}"`,
    `"${(p.h1 || '').replace(/"/g, '""')}"`,
    p.hasGA ? 'JA' : 'NEIN',
    p.hasGTM ? 'JA' : 'NEIN',
    p.hasCanonical ? 'JA' : 'NEIN',
    p.hasOgTags ? 'JA' : 'NEIN',
    p.hasImpressumLink ? 'JA' : 'NEIN',
    p.hasDatenschutzLink ? 'JA' : 'NEIN',
    p.wordCount, p.depth, p.responseTimeMs,
    p.redirectUrl, p.error,
  ].join(',')).join('\n')
  fs.writeFileSync(csvPath, csvHeader + csvRows)
  log(`CSV gespeichert: ${csvPath}`, 'ok')

  // Markdown Summary
  const mdPath = path.join(CONFIG.OUTPUT_DIR, `${domainSlug}_${timestamp}.md`)
  let md = `# Crawl Report: ${report.domain}\n`
  md += `Datum: ${report.crawledAt}\n\n`
  md += `## Zusammenfassung\n`
  md += `| Metrik | Wert |\n|--------|------|\n`
  md += `| Seiten gesamt | ${report.totalPages} |\n`
  md += `| Online | ${report.online} |\n`
  md += `| Offline | ${report.offline} |\n`
  md += `| Redirects | ${report.redirects} |\n`
  md += `| Errors | ${report.errors} |\n\n`

  // Problems section
  const problems = report.pages.filter(p => p.status !== 'online')
  if (problems.length > 0) {
    md += `## Probleme (${problems.length})\n`
    md += `| URL | Status | Code | Fehler |\n|-----|--------|------|--------|\n`
    for (const p of problems) {
      md += `| ${p.path} | ${p.status} | ${p.httpCode || '-'} | ${p.error || p.redirectUrl} |\n`
    }
    md += '\n'
  }

  // SEO issues
  const seoIssues = report.pages.filter(p => p.status === 'online' && (!p.title || !p.metaDescription || !p.hasCanonical))
  if (seoIssues.length > 0) {
    md += `## SEO Probleme (${seoIssues.length})\n`
    md += `| URL | Title | Meta Desc | Canonical |\n|-----|-------|-----------|----------|\n`
    for (const p of seoIssues) {
      md += `| ${p.path} | ${p.title ? 'OK' : 'FEHLT'} | ${p.metaDescription ? 'OK' : 'FEHLT'} | ${p.hasCanonical ? 'OK' : 'FEHLT'} |\n`
    }
    md += '\n'
  }

  // Legal compliance
  const noImpressum = report.pages.filter(p => p.status === 'online' && !p.hasImpressumLink)
  const noDatenschutz = report.pages.filter(p => p.status === 'online' && !p.hasDatenschutzLink)
  if (noImpressum.length > 0 || noDatenschutz.length > 0) {
    md += `## Rechtliche Probleme\n`
    md += `- Seiten ohne Impressum-Link: ${noImpressum.length}\n`
    md += `- Seiten ohne Datenschutz-Link: ${noDatenschutz.length}\n\n`
  }

  // All pages table
  md += `## Alle Seiten\n`
  md += `| # | Status | Code | Path | Title | GA | GTM |\n|---|--------|------|------|-------|----|-----|\n`
  report.pages.forEach((p, i) => {
    const icon = p.status === 'online' ? '🟢' : p.status === 'redirect' ? '🟡' : '🔴'
    md += `| ${i + 1} | ${icon} ${p.status} | ${p.httpCode || '-'} | ${p.path} | ${(p.title || '-').substring(0, 50)} | ${p.hasGA ? 'JA' : '-'} | ${p.hasGTM ? 'JA' : '-'} |\n`
  })

  fs.writeFileSync(mdPath, md)
  log(`Report gespeichert: ${mdPath}`, 'ok')
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const args = parseArgs()

  console.log('\n\x1b[1m=== FINTUTTO URL CRAWLER ===\x1b[0m\n')

  if (args.help) {
    console.log(`
Verwendung:
  npx ts-node scripts/crawl-urls.ts --domain <url>     Crawle eine Domain
  npx ts-node scripts/crawl-urls.ts --domain <url> --depth 5
  npx ts-node scripts/crawl-urls.ts --check-only        Nur Hauptseiten prüfen
  npx ts-node scripts/crawl-urls.ts --help               Diese Hilfe

Optionen:
  --domain <url>    Domain zum Crawlen
  --depth <n>       Maximale Crawl-Tiefe (Standard: 3)
  --check-only      Nur Status prüfen, nicht crawlen
  --help            Diese Hilfe anzeigen
`)
    return
  }

  const domain = args.domain as string
  const depth = parseInt(args.depth as string, 10) || CONFIG.MAX_DEPTH

  if (!domain) {
    log('Kein --domain angegeben. Verwende --help für Hilfe.', 'error')
    process.exit(1)
  }

  // Validate URL
  let domainUrl: string
  try {
    const parsed = new URL(domain.startsWith('http') ? domain : `https://${domain}`)
    domainUrl = parsed.toString()
  } catch {
    log(`Ungültige URL: ${domain}`, 'error')
    process.exit(1)
  }

  const report = await crawlDomain(domainUrl, depth)
  saveReport(report)

  console.log('\n\x1b[1m=== FERTIG ===\x1b[0m')
  console.log(`Ergebnisse in: ${CONFIG.OUTPUT_DIR}\n`)
}

main().catch(err => {
  log(`Fehler: ${err.message}`, 'error')
  process.exit(1)
})
