/**
 * Cloudflare Email Worker for Fintutto
 *
 * Receives emails via Cloudflare Email Routing and forwards the raw MIME
 * as base64 to our Vercel API endpoint for processing.
 *
 * NO external dependencies - can be pasted directly into Cloudflare Dashboard.
 *
 * Setup via Dashboard:
 * 1. Workers & Pages → Create Worker → name: "fintutto-email-worker"
 * 2. Quick Edit → paste this code → Save & Deploy
 * 3. Settings → Variables → add WEBHOOK_URL and WEBHOOK_SECRET
 * 4. Email Routing → Catch-all → Send to Worker → fintutto-email-worker
 */

export default {
  async email(message, env, ctx) {
    console.log("Email received: from=" + message.from + " to=" + message.to);

    try {
      // Read the raw email as ArrayBuffer
      const rawEmail = await new Response(message.raw).arrayBuffer();

      // Convert to base64 in chunks (Workers have stack limits)
      const bytes = new Uint8Array(rawEmail);
      const chunkSize = 8192;
      let base64Chunks = [];
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        let binary = "";
        for (let j = 0; j < chunk.length; j++) {
          binary += String.fromCharCode(chunk[j]);
        }
        base64Chunks.push(binary);
      }
      const rawBase64 = btoa(base64Chunks.join(""));

      // Build minimal payload - parsing happens on Vercel side
      const payload = JSON.stringify({
        from: message.from,
        to: message.to,
        raw_mime: rawBase64,
      });

      // HMAC-SHA256 signature
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(env.WEBHOOK_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sigBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload)
      );
      const sigBytes = new Uint8Array(sigBuffer);
      let sigBinary = "";
      for (let i = 0; i < sigBytes.length; i++) {
        sigBinary += String.fromCharCode(sigBytes[i]);
      }
      const signature = btoa(sigBinary);

      // Forward to Vercel API
      const response = await fetch(env.WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
        },
        body: payload,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Webhook failed: " + response.status + " - " + errorText);
        message.setReject("Webhook error: " + response.status);
      } else {
        console.log("Email forwarded successfully: " + message.from + " -> " + message.to);
      }
    } catch (error) {
      console.error("Email processing error:", error);
      message.setReject("Processing error");
    }
  },
};
