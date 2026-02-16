import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@fintutto.com'
const PORTAL_URL = process.env.PORTAL_URL || 'https://portal.fintutto.cloud'

interface SubscribeRequest {
  email: string
  segment?: string
  source?: string
}

function buildConfirmHtml(email: string, token: string): string {
  const confirmUrl = `${PORTAL_URL}/api/newsletter-confirm?token=${token}&email=${encodeURIComponent(email)}`

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
      <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">Mietrecht-Newsletter</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">
          Bitte bestätigen Sie Ihre Anmeldung
        </p>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px">
          Hallo,
        </p>
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px">
          vielen Dank für Ihr Interesse am Fintutto Mietrecht-Newsletter!
          Bitte klicken Sie auf den folgenden Button, um Ihre Anmeldung zu bestätigen:
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${confirmUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600">
            Anmeldung bestätigen
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:0 0 16px">
          Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br>
          <a href="${confirmUrl}" style="color:#7c3aed;word-break:break-all">${confirmUrl}</a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0">
          Wenn Sie sich nicht angemeldet haben, können Sie diese E-Mail ignorieren.
        </p>
      </div>
      <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px;margin:0">
          © ${new Date().getFullYear()} Fintutto · Alle Rechte vorbehalten
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle confirmation (GET request with token)
  if (req.method === 'GET' && req.query.token) {
    return handleConfirm(req, res)
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, segment, source } = req.body as SubscribeRequest

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Gültige E-Mail-Adresse erforderlich' })
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, confirmed, active')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing?.confirmed && existing?.active) {
      return res.status(200).json({ success: true, message: 'Bereits angemeldet' })
    }

    let confirmToken: string

    if (existing) {
      // Re-activate or re-send confirmation
      const { data: updated } = await supabase
        .from('newsletter_subscribers')
        .update({
          active: true,
          segment: segment || existing.id ? undefined : 'general',
          source: source || undefined,
          confirm_token: crypto.randomUUID(),
        })
        .eq('id', existing.id)
        .select('confirm_token')
        .single()

      confirmToken = updated?.confirm_token
    } else {
      // New subscriber
      const token = crypto.randomUUID()
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase().trim(),
          segment: segment || 'general',
          source: source || 'unknown',
          confirm_token: token,
        })

      if (error) {
        console.error('Newsletter subscribe error:', error)
        return res.status(500).json({ error: 'Anmeldung fehlgeschlagen' })
      }

      confirmToken = token
    }

    // Send Double-Opt-In confirmation email
    if (RESEND_API_KEY) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Fintutto Newsletter <${FROM_EMAIL}>`,
          to: email.toLowerCase().trim(),
          subject: 'Bitte bestätigen Sie Ihre Newsletter-Anmeldung',
          html: buildConfirmHtml(email, confirmToken),
        }),
      })

      if (!emailRes.ok) {
        console.error('Resend error:', await emailRes.text())
      }
    } else {
      console.log('No RESEND_API_KEY. Confirmation email would be sent to:', email)
    }

    return res.status(200).json({
      success: true,
      message: 'Bestätigungs-E-Mail gesendet. Bitte prüfen Sie Ihr Postfach.',
    })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return res.status(500).json({ error: 'Anmeldung fehlgeschlagen' })
  }
}

async function handleConfirm(req: VercelRequest, res: VercelResponse) {
  const { token, email } = req.query as { token: string; email: string }

  if (!token || !email) {
    return res.status(400).json({ error: 'Ungültiger Bestätigungslink' })
  }

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({
      confirmed: true,
      confirmed_at: new Date().toISOString(),
    })
    .eq('email', decodeURIComponent(email).toLowerCase().trim())
    .eq('confirm_token', token)
    .select('id')
    .single()

  if (error || !data) {
    return res.redirect(302, `${PORTAL_URL}/?newsletter=error`)
  }

  return res.redirect(302, `${PORTAL_URL}/?newsletter=confirmed`)
}
