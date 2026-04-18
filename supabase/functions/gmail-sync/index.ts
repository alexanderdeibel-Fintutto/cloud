/**
 * Supabase Edge Function: gmail-sync
 * Automatischer Gmail → Supabase Storage Sync für SecondBrain
 *
 * SETUP:
 * 1. Deploy: supabase functions deploy gmail-sync
 * 2. Secrets setzen:
 *    supabase secrets set GMAIL_OAUTH_TOKEN=<token>
 *    supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>
 *
 * CRON (täglich um 06:00 Uhr):
 * supabase functions deploy gmail-sync --schedule "0 6 * * *"
 *
 * MANUELL aufrufen:
 * curl -X POST https://<project>.supabase.co/functions/v1/gmail-sync \
 *   -H "Authorization: Bearer <anon-key>" \
 *   -H "Content-Type: application/json" \
 *   -d '{"user_id": "<uuid>", "query": "has:attachment filename:pdf"}'
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

// Standard-Suchanfrage für Rechnungen und wichtige Dokumente
const DEFAULT_QUERY = [
  "has:attachment",
  "filename:pdf",
  "-in:spam",
  "-in:trash",
  "newer_than:30d",
].join(" ");

interface GmailMessage {
  id: string;
  threadId: string;
}

interface GmailAttachment {
  filename: string;
  mimeType: string;
  attachmentId: string;
  size: number;
}

interface SyncResult {
  processed: number;
  skipped: number;
  errors: number;
  documents: string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      user_id,
      query = DEFAULT_QUERY,
      max_results = 50,
      gmail_token,
    } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id ist erforderlich" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // OAuth-Token aus Secrets oder Request
    const oauthToken = gmail_token ||
      Deno.env.get("GMAIL_OAUTH_TOKEN") ||
      req.headers.get("X-Gmail-Token");

    if (!oauthToken) {
      return new Response(
        JSON.stringify({
          error: "Kein Gmail OAuth-Token. Bitte als Secret GMAIL_OAUTH_TOKEN setzen oder im Request übergeben.",
        }),
        {
          status: 401,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Supabase Admin Client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const result: SyncResult = {
      processed: 0,
      skipped: 0,
      errors: 0,
      documents: [],
    };

    // 1. Gmail-Nachrichten suchen
    const searchUrl = `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${max_results}`;
    const searchResp = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${oauthToken}` },
    });

    if (!searchResp.ok) {
      const errText = await searchResp.text();
      throw new Error(`Gmail API Fehler: ${searchResp.status} ${errText}`);
    }

    const searchData = await searchResp.json();
    const messages: GmailMessage[] = searchData.messages || [];

    console.log(`[gmail-sync] ${messages.length} Nachrichten gefunden für Query: ${query}`);

    // 2. Bereits verarbeitete Nachrichten abrufen (Duplikat-Schutz)
    const { data: existingLogs } = await supabase
      .from("sb_email_scan_log")
      .select("gmail_message_id")
      .eq("user_id", user_id)
      .in(
        "gmail_message_id",
        messages.map((m) => m.id)
      );

    const processedIds = new Set(
      (existingLogs || []).map((l: { gmail_message_id: string }) => l.gmail_message_id)
    );

    // 3. Neue Nachrichten verarbeiten
    for (const msg of messages) {
      if (processedIds.has(msg.id)) {
        result.skipped++;
        continue;
      }

      try {
        // Nachricht vollständig abrufen
        const msgUrl = `${GMAIL_API_BASE}/messages/${msg.id}?format=full`;
        const msgResp = await fetch(msgUrl, {
          headers: { Authorization: `Bearer ${oauthToken}` },
        });

        if (!msgResp.ok) {
          result.errors++;
          continue;
        }

        const msgData = await msgResp.json();

        // Metadaten extrahieren
        const headers = msgData.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h: { name: string; value: string }) =>
            h.name.toLowerCase() === name.toLowerCase()
          )?.value || "";

        const subject = getHeader("Subject");
        const from = getHeader("From");
        const dateStr = getHeader("Date");
        const emailDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

        // PDF-Anhänge finden
        const attachments: GmailAttachment[] = [];
        const findAttachments = (parts: unknown[]) => {
          for (const part of parts) {
            const p = part as {
              mimeType?: string;
              filename?: string;
              body?: { attachmentId?: string; size?: number };
              parts?: unknown[];
            };
            if (p.mimeType === "application/pdf" && p.filename && p.body?.attachmentId) {
              attachments.push({
                filename: p.filename,
                mimeType: p.mimeType,
                attachmentId: p.body.attachmentId,
                size: p.body.size || 0,
              });
            }
            if (p.parts) findAttachments(p.parts);
          }
        };

        if (msgData.payload?.parts) {
          findAttachments(msgData.payload.parts);
        }

        let documentsCreated = 0;

        // 4. Anhänge herunterladen und in Supabase Storage hochladen
        for (const attachment of attachments) {
          try {
            // Anhang-Daten abrufen
            const attUrl = `${GMAIL_API_BASE}/messages/${msg.id}/attachments/${attachment.attachmentId}`;
            const attResp = await fetch(attUrl, {
              headers: { Authorization: `Bearer ${oauthToken}` },
            });

            if (!attResp.ok) continue;

            const attData = await attResp.json();
            const base64Data = attData.data.replace(/-/g, "+").replace(/_/g, "/");
            const binaryStr = atob(base64Data);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }

            // Eindeutiger Dateiname
            const timestamp = Date.now();
            const safeFilename = attachment.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
            const storagePath = `${user_id}/email/${msg.id}_${timestamp}_${safeFilename}`;

            // In Supabase Storage hochladen
            const { error: uploadError } = await supabase.storage
              .from("documents")
              .upload(storagePath, bytes, {
                contentType: "application/pdf",
                upsert: false,
              });

            if (uploadError) {
              console.error(`[gmail-sync] Upload-Fehler für ${safeFilename}:`, uploadError);
              continue;
            }

            // Kategorie automatisch bestimmen
            const category = detectCategory(subject, from);

            // Dokument in sb_documents eintragen
            const { error: insertError } = await supabase
              .from("sb_documents")
              .insert({
                user_id,
                title: `${subject} — ${safeFilename}`,
                file_name: safeFilename,
                file_type: "application/pdf",
                file_size: attachment.size,
                storage_path: storagePath,
                category,
                source: "email",
                email_message_id: msg.id,
                email_thread_id: msg.threadId,
                email_from: from,
                email_subject: subject,
                email_date: emailDate,
                email_labels: msgData.labelIds || [],
              });

            if (insertError) {
              console.error(`[gmail-sync] Insert-Fehler:`, insertError);
              continue;
            }

            documentsCreated++;
            result.documents.push(safeFilename);
          } catch (attErr) {
            console.error(`[gmail-sync] Fehler bei Anhang ${attachment.filename}:`, attErr);
          }
        }

        // 5. Verarbeitungs-Log eintragen
        await supabase.from("sb_email_scan_log").insert({
          user_id,
          gmail_message_id: msg.id,
          gmail_thread_id: msg.threadId,
          subject,
          sender: from,
          received_at: emailDate,
          documents_created: documentsCreated,
          status: "processed",
        });

        result.processed++;
      } catch (msgErr) {
        console.error(`[gmail-sync] Fehler bei Nachricht ${msg.id}:`, msgErr);

        // Fehler im Log eintragen
        await supabase.from("sb_email_scan_log").insert({
          user_id,
          gmail_message_id: msg.id,
          gmail_thread_id: msg.threadId,
          documents_created: 0,
          status: "error",
          error_message: String(msgErr),
        });

        result.errors++;
      }
    }

    console.log(`[gmail-sync] Fertig: ${result.processed} verarbeitet, ${result.skipped} übersprungen, ${result.errors} Fehler`);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message: `${result.processed} neue E-Mails verarbeitet, ${result.documents.length} Dokumente hochgeladen`,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[gmail-sync] Kritischer Fehler:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Automatische Kategorie-Erkennung basierend auf Betreff und Absender
 */
function detectCategory(subject: string, from: string): string {
  const text = `${subject} ${from}`.toLowerCase();

  if (text.match(/rechnung|invoice|billing|zahlung|payment|quittung|beleg/)) {
    return "Rechnung";
  }
  if (text.match(/versicherung|insurance|police|beitrag/)) {
    return "Versicherung";
  }
  if (text.match(/steuer|finanzamt|steuerbescheid|einkommensteuer/)) {
    return "Steuer";
  }
  if (text.match(/vertrag|contract|vereinbarung|kündigung/)) {
    return "Vertrag";
  }
  if (text.match(/miete|mietvertrag|nebenkosten|betriebskosten|vermieter/)) {
    return "Miete";
  }
  if (text.match(/bank|konto|überweisung|kontoauszug|sparkasse|volksbank/)) {
    return "Bank";
  }
  if (text.match(/arzt|krankenhaus|rezept|krankenkasse|gesundheit|apotheke/)) {
    return "Gesundheit";
  }
  if (text.match(/behörde|amt|bescheid|antrag|formular|finanzamt|jobcenter/)) {
    return "Behörde";
  }

  return "Sonstiges";
}
