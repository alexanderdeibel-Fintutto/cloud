import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Verify Sender - Email verification flow for whitelisted senders
 *
 * Two modes:
 * 1. POST /api/verify-sender - Send verification email to a sender address
 * 2. GET /api/verify-sender?token=xxx - Verify the token from the email link
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return handleSendVerification(req, res)
  }
  if (req.method === 'GET') {
    return handleConfirmVerification(req, res)
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}

// POST: Trigger verification email
async function handleSendVerification(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { sender_id } = req.body
  if (!sender_id) {
    return res.status(400).json({ error: 'sender_id is required' })
  }

  // Get the sender record
  const { data: sender } = await supabase
    .from('verified_senders')
    .select('*')
    .eq('id', sender_id)
    .eq('user_id', user.id)
    .single()

  if (!sender) {
    return res.status(404).json({ error: 'Sender not found' })
  }

  if (sender.is_verified) {
    return res.status(400).json({ error: 'Sender is already verified' })
  }

  // Generate a verification token (simple HMAC-based)
  const verificationToken = generateToken(sender.id, sender.email)

  const verifyUrl = `${process.env.APP_URL || 'https://vermietify.fintutto.cloud'}/api/verify-sender?token=${verificationToken}&id=${sender.id}`

  // Send verification email via SendGrid
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  if (!sendgridApiKey) {
    // In development: auto-verify
    console.log('No SENDGRID_API_KEY - auto-verifying sender in dev mode')
    await supabase
      .from('verified_senders')
      .update({ is_verified: true, verified_at: new Date().toISOString() })
      .eq('id', sender.id)

    return res.status(200).json({ status: 'verified', dev_mode: true })
  }

  const emailPayload = {
    personalizations: [{ to: [{ email: sender.email }] }],
    from: { email: 'noreply@vermietify.de', name: 'Vermietify' },
    subject: 'Vermietify - Absenderadresse bestätigen',
    content: [
      {
        type: 'text/html',
        value: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">Vermietify</h1>
  </div>
  <h2>Absenderadresse bestätigen</h2>
  <p>Sie haben die E-Mail-Adresse <strong>${sender.email}</strong> als verifizierte Absenderadresse in Vermietify hinterlegt.</p>
  <p>Um Belege von dieser Adresse an Ihren persönlichen Posteingang senden zu können, bestätigen Sie bitte diese Adresse:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Adresse bestätigen</a>
  </div>
  <p style="color: #6b7280; font-size: 14px;">Wenn Sie diese Aktion nicht angefordert haben, können Sie diese E-Mail ignorieren.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">Vermietify - Immobilienverwaltung einfach gemacht</p>
</body>
</html>`,
      },
    ],
  }

  try {
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sendgridApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    })

    if (!sgResponse.ok) {
      console.error('SendGrid error:', sgResponse.status, await sgResponse.text())
      return res.status(500).json({ error: 'Failed to send verification email' })
    }

    return res.status(200).json({ status: 'verification_sent' })
  } catch (error) {
    console.error('Email send error:', error)
    return res.status(500).json({ error: 'Failed to send verification email' })
  }
}

// GET: Confirm verification via link
async function handleConfirmVerification(req: VercelRequest, res: VercelResponse) {
  const { token, id } = req.query

  if (!token || !id || typeof token !== 'string' || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid verification link' })
  }

  // Get the sender record
  const { data: sender } = await supabase
    .from('verified_senders')
    .select('*')
    .eq('id', id)
    .single()

  if (!sender) {
    return res.status(404).json({ error: 'Sender not found' })
  }

  if (sender.is_verified) {
    return redirectWithMessage(res, 'Diese Adresse ist bereits verifiziert.')
  }

  // Verify token (timing-safe comparison)
  if (!verifyToken(token, sender.id, sender.email)) {
    return res.status(400).json({ error: 'Invalid verification token' })
  }

  // Mark as verified
  const { error } = await supabase
    .from('verified_senders')
    .update({ is_verified: true, verified_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error verifying sender:', error)
    return res.status(500).json({ error: 'Verification failed' })
  }

  return redirectWithMessage(res, 'Ihre Absenderadresse wurde erfolgreich verifiziert! Sie können dieses Fenster schließen.')
}

function redirectWithMessage(res: VercelResponse, message: string) {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb;">
  <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 400px;">
    <div style="font-size: 48px; margin-bottom: 16px;">&#10003;</div>
    <h2 style="color: #111827; margin: 0 0 12px 0;">Verifizierung abgeschlossen</h2>
    <p style="color: #6b7280;">${message}</p>
  </div>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html')
  return res.status(200).send(html)
}

function generateToken(senderId: string, email: string): string {
  const secret = process.env.VERIFICATION_SECRET || 'dev-secret-change-in-production'
  return createHmac('sha256', secret)
    .update(`${senderId}:${email}`)
    .digest('base64url')
}

function verifyToken(token: string, senderId: string, email: string): boolean {
  const expected = generateToken(senderId, email)
  if (token.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}
