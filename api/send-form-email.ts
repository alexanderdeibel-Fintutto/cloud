import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Email sending using Resend API (or fallback to console logging in development)
async function sendEmailWithResend(
  to: string,
  subject: string,
  message: string,
  documentInfo: { documentId: string; versionId: string }
) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    // Development fallback - log email instead of sending
    console.log('Email would be sent (no RESEND_API_KEY configured):')
    console.log({ to, subject, message, documentInfo })
    return { success: true, development: true }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Fintutto <noreply@fintutto.de>',
      to: [to],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0073e6; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Fintutto</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <div style="white-space: pre-wrap; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>
          </div>
          <div style="padding: 15px; background-color: #e9e9e9; text-align: center; font-size: 12px; color: #666;">
            <p>Diese E-Mail wurde ueber Fintutto gesendet.</p>
            <p>Dokument-ID: ${documentInfo.documentId}</p>
          </div>
        </div>
      `,
      text: message,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Email sending failed: ${error}`)
  }

  return await response.json()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { to, subject, message, documentId, versionId } = req.body

    // Validate required fields
    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing required fields: to, subject' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    // Send the email
    const result = await sendEmailWithResend(to, subject, message || '', {
      documentId: documentId || 'unknown',
      versionId: versionId || 'unknown',
    })

    // Log email send event
    if (documentId && versionId) {
      try {
        await supabase.from('email_logs').insert({
          document_id: documentId,
          version_id: versionId,
          recipient: to,
          subject,
          sent_at: new Date().toISOString(),
          status: 'sent',
        })
      } catch (logError) {
        // Don't fail the request if logging fails
        console.error('Failed to log email send:', logError)
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      ...result,
    })
  } catch (error) {
    console.error('Email send error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
