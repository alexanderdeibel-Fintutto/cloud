import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Firebase Cloud Messaging (FCM) - Send push notifications.
 *
 * Use cases:
 * - Notify tenants about meter reading deadlines (Vermietify -> Mieter-App)
 * - Notify about new documents/contracts
 * - Payment reminders
 * - Maintenance notifications
 *
 * Requires:
 * - FCM_SERVER_KEY env var (Firebase Cloud Messaging Server Key)
 *   OR
 * - GOOGLE_FCM_SERVICE_ACCOUNT env var (JSON service account for FCM v1 API)
 *
 * The function uses FCM HTTP v1 API (preferred) with fallback to legacy API.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      to, // FCM token (single device) or topic
      title,
      body,
      data: messageData,
      topic,
      imageUrl,
    } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!to && !topic) {
      return new Response(
        JSON.stringify({ error: "Either 'to' (FCM token) or 'topic' is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try FCM v1 API with service account first
    const serviceAccountJson = Deno.env.get("GOOGLE_FCM_SERVICE_ACCOUNT");
    if (serviceAccountJson) {
      return await sendViaV1Api(serviceAccountJson, { to, title, body, data: messageData, topic, imageUrl });
    }

    // Fallback to legacy FCM API
    const serverKey = Deno.env.get("FCM_SERVER_KEY");
    if (!serverKey) {
      return new Response(
        JSON.stringify({ error: "FCM not configured. Set FCM_SERVER_KEY or GOOGLE_FCM_SERVICE_ACCOUNT." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return await sendViaLegacyApi(serverKey, { to, title, body, data: messageData, topic, imageUrl });
  } catch (error) {
    console.error("send-push-notification error:", error);
    return new Response(
      JSON.stringify({ error: "Interner Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface NotificationPayload {
  to?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  topic?: string;
  imageUrl?: string;
}

async function sendViaV1Api(serviceAccountJson: string, payload: NotificationPayload) {
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    const projectId = serviceAccount.project_id;

    // Get access token via JWT
    const accessToken = await getAccessToken(serviceAccount);

    const message: Record<string, any> = {
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl ? { image: payload.imageUrl } : {}),
      },
      data: payload.data || {},
    };

    if (payload.to) {
      message.token = payload.to;
    } else if (payload.topic) {
      message.topic = payload.topic;
    }

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("FCM v1 API error:", data);
      return new Response(
        JSON.stringify({ error: data.error?.message || "FCM send failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data.name }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("FCM v1 API error:", error);
    return new Response(
      JSON.stringify({ error: "FCM v1 API request failed" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function sendViaLegacyApi(serverKey: string, payload: NotificationPayload) {
  const fcmPayload: Record<string, any> = {
    notification: {
      title: payload.title,
      body: payload.body,
      ...(payload.imageUrl ? { image: payload.imageUrl } : {}),
    },
    data: payload.data || {},
  };

  if (payload.to) {
    fcmPayload.to = payload.to;
  } else if (payload.topic) {
    fcmPayload.to = `/topics/${payload.topic}`;
  }

  const response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${serverKey}`,
    },
    body: JSON.stringify(fcmPayload),
  });

  const data = await response.json();

  if (data.failure > 0) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Einige Nachrichten konnten nicht zugestellt werden",
        results: data.results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, messageId: data.message_id || data.multicast_id }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Get OAuth2 access token from service account credentials.
 * Uses JWT assertion grant for Google APIs.
 */
async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;

  // Create JWT header and payload
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: expiry,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  // Encode JWT
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Sign with RSA private key
  const privateKey = serviceAccount.private_key;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64url(
    String.fromCharCode(...new Uint8Array(signature))
  );
  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function base64url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
