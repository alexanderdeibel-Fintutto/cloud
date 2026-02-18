import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@fintutto.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'leads@fintutto.com'

interface LeadRequest {
  name: string
  email: string
  phone?: string
  plz: string
  leadType: string
  checkerType: string
  checkerResultId?: string
  userId?: string
  context?: Record<string, unknown>
}

const LEAD_TYPE_LABELS: Record<string, string> = {
  anwalt: 'Anwalt (Mietrecht)',
  makler: 'Immobilienmakler',
  handwerker: 'Handwerker',
  finanzberater: 'Finanzberater',
}

function buildAdminNotificationHtml(lead: LeadRequest): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
      <div style="background:linear-gradient(135deg,#2563eb,#1e40af);padding:24px;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">Neuer Lead eingegangen</h1>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">Typ:</td><td style="padding:8px 12px;color:#374151;border-bottom:1px solid #e5e7eb">${LEAD_TYPE_LABELS[lead.leadType] || lead.leadType}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">Name:</td><td style="padding:8px 12px;color:#374151;border-bottom:1px solid #e5e7eb">${lead.name}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">E-Mail:</td><td style="padding:8px 12px;color:#374151;border-bottom:1px solid #e5e7eb"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">Telefon:</td><td style="padding:8px 12px;color:#374151;border-bottom:1px solid #e5e7eb">${lead.phone || '–'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">PLZ:</td><td style="padding:8px 12px;color:#374151;border-bottom:1px solid #e5e7eb">${lead.plz}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">Checker:</td><td style="padding:8px 12px;color:#374151;border-bottom:1px solid #e5e7eb">${lead.checkerType}</td></tr>
        </table>
      </div>
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px;margin:0">Fintutto Portal · Lead-Vermittlung</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

function buildUserConfirmationHtml(lead: LeadRequest): string {
  const typeLabel = LEAD_TYPE_LABELS[lead.leadType] || lead.leadType

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
      <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">Ihre Anfrage ist eingegangen!</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px">
          Hallo ${lead.name},
        </p>
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px">
          vielen Dank für Ihre Anfrage zur Vermittlung eines <strong>${typeLabel}</strong>.
          Wir suchen gerade den passenden Experten in Ihrer Region (PLZ: ${lead.plz}) und melden uns
          innerhalb von 24 Stunden bei Ihnen.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 24px">
          <p style="color:#166534;font-size:14px;margin:0;font-weight:600">Was passiert als Nächstes?</p>
          <ul style="color:#166534;font-size:14px;padding-left:20px;margin:8px 0 0">
            <li>Wir prüfen Ihre Anfrage</li>
            <li>Ein passender ${typeLabel} wird kontaktiert</li>
            <li>Sie erhalten eine Rückmeldung per E-Mail oder Telefon</li>
          </ul>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0">
          Diese E-Mail wurde automatisch von Fintutto Portal gesendet.
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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body as LeadRequest

    if (!body.name || !body.email || !body.plz || !body.leadType) {
      return res.status(400).json({ error: 'Name, E-Mail, PLZ und Lead-Typ sind erforderlich' })
    }

    // 1. Save lead to database
    const { data: lead, error: insertError } = await supabase
      .from('lead_requests')
      .insert({
        user_id: body.userId || null,
        lead_type: body.leadType,
        name: body.name,
        email: body.email.toLowerCase().trim(),
        phone: body.phone || null,
        plz: body.plz,
        checker_type: body.checkerType,
        checker_result_id: body.checkerResultId || null,
        context: body.context || {},
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Lead insert error:', insertError)
      return res.status(500).json({ error: 'Lead konnte nicht gespeichert werden' })
    }

    // 2. Log monetization event
    await supabase.from('monetization_events').insert({
      event_type: 'lead_created',
      user_id: body.userId || null,
      source: body.checkerType?.includes('rechner') ? 'rechner' : 'checker',
      source_detail: body.checkerType,
      metadata: {
        lead_id: lead.id,
        lead_type: body.leadType,
        plz: body.plz,
      },
    })

    // 3. Send emails via Resend
    if (RESEND_API_KEY) {
      // Admin notification
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Fintutto Leads <${FROM_EMAIL}>`,
          to: ADMIN_EMAIL,
          subject: `Neuer Lead: ${LEAD_TYPE_LABELS[body.leadType] || body.leadType} – PLZ ${body.plz}`,
          html: buildAdminNotificationHtml(body),
        }),
      }).catch(err => console.error('Admin notification error:', err))

      // User confirmation
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Fintutto Portal <${FROM_EMAIL}>`,
          to: body.email.toLowerCase().trim(),
          subject: 'Ihre Anfrage bei Fintutto – Wir kümmern uns darum!',
          html: buildUserConfirmationHtml(body),
        }),
      }).catch(err => console.error('User confirmation error:', err))
    } else {
      console.log('No RESEND_API_KEY. Emails would be sent for lead:', lead.id)
    }

    return res.status(200).json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('Submit lead error:', error)
    return res.status(500).json({ error: 'Ein Fehler ist aufgetreten' })
  }
}
