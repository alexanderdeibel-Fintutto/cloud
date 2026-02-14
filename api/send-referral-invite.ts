import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Resend API for sending emails (or swap for any ESP)
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@fintutto.com'

interface InviteRequest {
  referralCode: string
  referrerName: string
  recipientEmail: string
  appId: string
  appName: string
  registerUrl: string
}

function buildInviteHtml(data: InviteRequest): string {
  const referralLink = `${data.registerUrl}?ref=${encodeURIComponent(data.referralCode)}&email=${encodeURIComponent(data.recipientEmail)}`

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">🎉 Du wurdest eingeladen!</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">
          ${data.referrerName} möchte ${data.appName} mit dir teilen
        </p>
      </div>

      <!-- Content -->
      <div style="padding:32px">
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px">
          Hallo,
        </p>
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px">
          <strong>${data.referrerName}</strong> nutzt <strong>${data.appName}</strong> und denkt,
          dass es auch für dich nützlich sein könnte.
        </p>

        <!-- Benefits Box -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0">
          <h3 style="color:#166534;margin:0 0 12px;font-size:16px">🎁 Dein Willkommens-Bonus:</h3>
          <ul style="color:#166534;margin:0;padding:0 0 0 20px;font-size:14px;line-height:1.8">
            <li><strong>+5 Bonus-Credits</strong> (statt 3) zum Start</li>
            <li><strong>20% Rabatt</strong> auf den ersten Monat bei Upgrade</li>
            <li>Alle Basis-Funktionen <strong>kostenlos</strong></li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center;margin:32px 0">
          <a href="${referralLink}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600">
            Kostenlos starten →
          </a>
        </div>

        <p style="color:#6b7280;font-size:13px;text-align:center;margin:0 0 16px">
          Dein persönlicher Einladungscode: <strong>${data.referralCode}</strong>
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">

        <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0">
          Du erhältst diese E-Mail, weil ${data.referrerName} dich über das
          Fintutto Referral-Programm eingeladen hat. Wenn du diese E-Mail nicht
          erwartet hast, kannst du sie einfach ignorieren.
        </p>
      </div>

      <!-- Footer -->
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

function buildInviteText(data: InviteRequest): string {
  const referralLink = `${data.registerUrl}?ref=${encodeURIComponent(data.referralCode)}&email=${encodeURIComponent(data.recipientEmail)}`

  return `Hallo,

${data.referrerName} nutzt ${data.appName} und möchte es mit dir teilen!

Dein Willkommens-Bonus:
- +5 Bonus-Credits (statt 3) zum Start
- 20% Rabatt auf den ersten Monat bei Upgrade
- Alle Basis-Funktionen kostenlos

Jetzt kostenlos starten: ${referralLink}

Dein Einladungscode: ${data.referralCode}

---
Du erhältst diese E-Mail, weil ${data.referrerName} dich über das Fintutto Referral-Programm eingeladen hat.

© ${new Date().getFullYear()} Fintutto`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { referralCode, referrerName, recipientEmail, appId, appName, registerUrl } = req.body as InviteRequest

    if (!referralCode || !recipientEmail || !appName || !registerUrl) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const inviteData: InviteRequest = { referralCode, referrerName, recipientEmail, appId, appName, registerUrl }

    // Send email via Resend (or log if no API key for development)
    if (RESEND_API_KEY) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Fintutto <${FROM_EMAIL}>`,
          to: recipientEmail,
          subject: `${referrerName} lädt dich zu ${appName} ein – Sichere dir 5 Bonus-Credits!`,
          html: buildInviteHtml(inviteData),
          text: buildInviteText(inviteData),
        }),
      })

      if (!emailRes.ok) {
        const errBody = await emailRes.text()
        console.error('Resend API error:', errBody)
        return res.status(500).json({ error: 'Failed to send email' })
      }
    } else {
      console.log('No RESEND_API_KEY set. Email would be sent to:', recipientEmail)
      console.log('Subject:', `${referrerName} lädt dich zu ${appName} ein`)
    }

    // Track the referral invitation in Supabase
    // Find the referrer's user_id from their referral code
    const { data: codeRow } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', referralCode)
      .single()

    if (codeRow) {
      await supabase
        .from('referrals')
        .insert({
          referrer_user_id: codeRow.user_id,
          referral_code: referralCode,
          referred_email: recipientEmail,
          app_id: appId || 'portal',
          status: 'pending',
        })
    }

    return res.status(200).json({ success: true, message: 'Einladung gesendet' })
  } catch (error) {
    console.error('Send invite error:', error)
    return res.status(500).json({ error: 'Failed to send invite' })
  }
}
