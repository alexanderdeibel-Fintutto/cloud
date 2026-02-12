/**
 * Cloudflare Email Worker for Fintutto
 *
 * Receives emails via Cloudflare Email Routing and forwards them
 * as JSON to our Vercel API endpoint for processing.
 *
 * Setup:
 * 1. Deploy: cd cloudflare-email-worker && npx wrangler deploy
 * 2. Set secret: npx wrangler secret put WEBHOOK_SECRET
 * 3. In Cloudflare Dashboard > Email Routing > Routes:
 *    - Add catch-all rule → Send to Worker → fintutto-email-worker
 */

import PostalMime from 'postal-mime'

interface Env {
  WEBHOOK_URL: string
  WEBHOOK_SECRET: string
}

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Create HMAC-SHA256 signature
async function createSignature(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return arrayBufferToBase64(signature)
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
    console.log(`Email received: from=${message.from} to=${message.to}`)

    try {
      // Read the raw email
      const rawEmail = await new Response(message.raw).arrayBuffer()

      // Parse MIME message
      const parser = new PostalMime()
      const parsed = await parser.parse(rawEmail)

      // Extract attachments (base64 encoded)
      const attachments = (parsed.attachments || []).map((att) => ({
        filename: att.filename || 'attachment',
        mimeType: att.mimeType || 'application/octet-stream',
        size: att.content.byteLength,
        content: arrayBufferToBase64(att.content),
      }))

      // Build the payload
      const payload = {
        from: message.from,
        to: message.to,
        subject: parsed.subject || '',
        text: parsed.text || '',
        html: parsed.html || '',
        headers: Object.fromEntries(
          (parsed.headers || []).map((h) => [h.key, h.value])
        ),
        attachments,
        receivedAt: new Date().toISOString(),
      }

      const payloadJson = JSON.stringify(payload)

      // Sign the payload with HMAC-SHA256
      const signature = await createSignature(env.WEBHOOK_SECRET, payloadJson)

      // Forward to Vercel API
      const response = await fetch(env.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': Date.now().toString(),
        },
        body: payloadJson,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Webhook failed: ${response.status} - ${errorText}`)
        // Don't reject the email - store it and retry later
        message.setReject(`Webhook error: ${response.status}`)
      } else {
        console.log(`Email processed successfully: ${message.from} → ${message.to}`)
      }
    } catch (error) {
      console.error('Email processing error:', error)
      message.setReject('Processing error')
    }
  },
}
