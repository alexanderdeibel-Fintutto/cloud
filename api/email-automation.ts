import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@fintutto.com'
const PORTAL_URL = process.env.PORTAL_URL || 'https://portal.fintutto.cloud'

// Automation-Typen und ihre Delays (in Tagen nach Registrierung/Event)
const WELCOME_SERIES = [
  { type: 'welcome_1', delay: 0, subject: 'Willkommen bei Fintutto – Ihre Mietrecht-Tools' },
  { type: 'welcome_2', delay: 3, subject: '3 Dinge, die jeder Mieter wissen sollte' },
  { type: 'welcome_3', delay: 7, subject: 'Tipp: Haben Sie Ihre Nebenkosten geprüft?' },
]

function buildWelcomeEmail1(name?: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
      <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">Willkommen bei Fintutto!</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;font-size:16px;line-height:1.6">
          Hallo${name ? ` ${name}` : ''},
        </p>
        <p style="color:#374151;font-size:16px;line-height:1.6">
          schön, dass Sie dabei sind! Mit Fintutto haben Sie Zugriff auf <strong>28+ kostenlose Tools</strong>
          für alles rund um Mietrecht und Immobilien.
        </p>

        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin:24px 0">
          <h3 style="color:#0369a1;margin:0 0 12px;font-size:16px">Ihre Top-3 Tools zum Starten:</h3>
          <div style="margin:8px 0">
            <a href="${PORTAL_URL}/checker/mietpreisbremse" style="color:#2563eb;text-decoration:none;font-weight:600">
              1. Mietpreisbremse-Checker
            </a>
            <p style="color:#6b7280;font-size:14px;margin:4px 0 0">Prüfen Sie, ob Ihre Miete zu hoch ist</p>
          </div>
          <div style="margin:8px 0">
            <a href="${PORTAL_URL}/checker/nebenkosten" style="color:#2563eb;text-decoration:none;font-weight:600">
              2. Nebenkosten-Checker
            </a>
            <p style="color:#6b7280;font-size:14px;margin:4px 0 0">Finden Sie Fehler in Ihrer Abrechnung</p>
          </div>
          <div style="margin:8px 0">
            <a href="${PORTAL_URL}/rechner/rendite" style="color:#2563eb;text-decoration:none;font-weight:600">
              3. Rendite-Rechner
            </a>
            <p style="color:#6b7280;font-size:14px;margin:4px 0 0">Berechnen Sie Ihre Immobilienrendite</p>
          </div>
        </div>

        <div style="text-align:center;margin:24px 0">
          <a href="${PORTAL_URL}/checker" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600">
            Alle Tools entdecken
          </a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px;margin:0">
          © ${new Date().getFullYear()} Fintutto · <a href="${PORTAL_URL}" style="color:#9ca3af">portal.fintutto.cloud</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

function buildWelcomeEmail2(): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
      <div style="background:linear-gradient(135deg,#059669,#0d9488);padding:32px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">3 Dinge, die jeder Mieter wissen sollte</h1>
      </div>
      <div style="padding:32px">
        <div style="margin:20px 0;padding:16px;background:#f0fdf4;border-radius:8px;border-left:4px solid #22c55e">
          <h3 style="margin:0 0 8px;color:#166534">1. 34% aller Nebenkostenabrechnungen sind fehlerhaft</h3>
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">
            Im Durchschnitt erhalten Mieter 317 EUR zurück. Prüfen Sie Ihre Abrechnung mit unserem
            <a href="${PORTAL_URL}/checker/nebenkosten" style="color:#2563eb">Nebenkosten-Checker</a>.
          </p>
        </div>
        <div style="margin:20px 0;padding:16px;background:#eff6ff;border-radius:8px;border-left:4px solid #3b82f6">
          <h3 style="margin:0 0 8px;color:#1e3a5f">2. Mieterhöhungen sind oft unwirksam</h3>
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">
            Viele Mieterhöhungen entsprechen nicht den gesetzlichen Anforderungen. Nutzen Sie unseren
            <a href="${PORTAL_URL}/checker/mieterhoehung" style="color:#2563eb">Mieterhöhungs-Checker</a>.
          </p>
        </div>
        <div style="margin:20px 0;padding:16px;background:#fefce8;border-radius:8px;border-left:4px solid #eab308">
          <h3 style="margin:0 0 8px;color:#854d0e">3. Schönheitsreparaturen sind oft nicht verpflichtend</h3>
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">
            Viele Renovierungsklauseln im Mietvertrag sind unwirksam. Prüfen Sie es mit dem
            <a href="${PORTAL_URL}/checker/schoenheitsreparaturen" style="color:#2563eb">Schönheitsreparaturen-Checker</a>.
          </p>
        </div>
      </div>
      <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px;margin:0">
          © ${new Date().getFullYear()} Fintutto · <a href="${PORTAL_URL}" style="color:#9ca3af">portal.fintutto.cloud</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

function buildWelcomeEmail3(): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">Haben Sie Ihre Nebenkosten geprüft?</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;font-size:16px;line-height:1.6">
          Jede dritte Nebenkostenabrechnung enthält Fehler. Unser <strong>kostenloser Nebenkosten-Checker</strong>
          prüft Ihre Abrechnung in wenigen Minuten.
        </p>
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px;margin:24px 0;text-align:center">
          <p style="color:#7c3aed;font-size:36px;font-weight:800;margin:0">317 EUR</p>
          <p style="color:#6b7280;font-size:14px;margin:8px 0 0">durchschnittliche Rückerstattung</p>
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="${PORTAL_URL}/checker/nebenkosten" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600">
            Jetzt Nebenkosten prüfen
          </a>
        </div>
        <p style="color:#6b7280;font-size:14px;text-align:center">
          Kostenlos · 2 Minuten · Sofort Ergebnis
        </p>
      </div>
      <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px;margin:0">
          © ${new Date().getFullYear()} Fintutto · <a href="${PORTAL_URL}" style="color:#9ca3af">portal.fintutto.cloud</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

const EMAIL_BUILDERS: Record<string, (name?: string) => string> = {
  welcome_1: buildWelcomeEmail1,
  welcome_2: buildWelcomeEmail2,
  welcome_3: buildWelcomeEmail3,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Einfache Auth: API-Key oder Cron-Secret
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { action } = req.body as { action: string }

    switch (action) {
      case 'process_welcome_series':
        return await processWelcomeSeries(res)
      case 'send_segment_newsletter':
        return await sendSegmentNewsletter(req, res)
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` })
    }
  } catch (error) {
    console.error('Email automation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function processWelcomeSeries(res: VercelResponse) {
  // Finde alle bestätigten Subscriber, die noch nicht alle Welcome-Mails erhalten haben
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, confirmed_at')
    .eq('confirmed', true)
    .eq('active', true)
    .not('confirmed_at', 'is', null)

  if (error) {
    console.error('Error fetching subscribers:', error)
    return res.status(500).json({ error: 'Failed to fetch subscribers' })
  }

  let sentCount = 0

  for (const subscriber of subscribers || []) {
    const confirmedAt = new Date(subscriber.confirmed_at)
    const now = new Date()
    const daysSinceConfirm = Math.floor((now.getTime() - confirmedAt.getTime()) / (1000 * 60 * 60 * 24))

    for (const step of WELCOME_SERIES) {
      if (daysSinceConfirm < step.delay) continue

      // Prüfen ob diese Mail schon gesendet wurde
      const { data: existing } = await supabase
        .from('email_automations')
        .select('id')
        .eq('email', subscriber.email)
        .eq('automation_type', step.type)
        .single()

      if (existing) continue

      // Mail senden
      const emailBuilder = EMAIL_BUILDERS[step.type]
      if (!emailBuilder) continue

      if (RESEND_API_KEY) {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `Fintutto <${FROM_EMAIL}>`,
            to: subscriber.email,
            subject: step.subject,
            html: emailBuilder(),
          }),
        })

        if (!emailRes.ok) {
          console.error(`Failed to send ${step.type} to ${subscriber.email}:`, await emailRes.text())
          continue
        }
      }

      // Tracking
      await supabase.from('email_automations').insert({
        email: subscriber.email,
        automation_type: step.type,
        metadata: { step_delay: step.delay },
      })

      sentCount++
    }
  }

  return res.status(200).json({ success: true, sent: sentCount })
}

async function sendSegmentNewsletter(req: VercelRequest, res: VercelResponse) {
  const { segment, subject, html } = req.body as {
    segment: string
    subject: string
    html: string
  }

  if (!segment || !subject || !html) {
    return res.status(400).json({ error: 'segment, subject, and html are required' })
  }

  // Alle aktiven, bestätigten Subscriber des Segments
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('email')
    .eq('confirmed', true)
    .eq('active', true)
    .eq('segment', segment)

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch subscribers' })
  }

  if (!subscribers || subscribers.length === 0) {
    return res.status(200).json({ success: true, sent: 0, message: 'No subscribers in this segment' })
  }

  let sentCount = 0

  if (RESEND_API_KEY) {
    // Batch-Versand (max 100 pro Batch)
    const batchSize = 100
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      for (const sub of batch) {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `Fintutto Newsletter <${FROM_EMAIL}>`,
            to: sub.email,
            subject,
            html,
          }),
        })

        if (emailRes.ok) {
          sentCount++
          await supabase.from('email_automations').insert({
            email: sub.email,
            automation_type: 'segment_newsletter',
            metadata: { segment, subject },
          })
        }
      }
    }
  } else {
    console.log(`Would send segment newsletter to ${subscribers.length} subscribers in segment: ${segment}`)
    sentCount = subscribers.length
  }

  return res.status(200).json({ success: true, sent: sentCount })
}
