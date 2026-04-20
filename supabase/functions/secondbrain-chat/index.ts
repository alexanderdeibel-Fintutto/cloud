/**
 * Supabase Edge Function: secondbrain-chat
 *
 * KI-Chatbot für die SecondBrain-App.
 * Nutzt den Kontext aus den gespeicherten Dokumenten des Nutzers
 * und beantwortet Fragen mit OpenAI GPT-4.
 *
 * Request Body:
 *   { sessionId: string, message: string, userId: string }
 *
 * Response:
 *   { reply: string }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Du bist ein persönlicher KI-Assistent für die SecondBrain-App.
Du hilfst dem Nutzer, seine gespeicherten Dokumente, Notizen und Informationen zu verstehen und zu nutzen.
Antworte präzise, hilfreich und auf Deutsch. Beziehe dich auf den bereitgestellten Dokumentenkontext.`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId, message } = await req.json();

    // Lade Kontext: letzte 5 Dokumente des Nutzers mit OCR-Text
    const { data: docs } = await supabase
      .from("sb_documents")
      .select("title, ocr_text, summary")
      .eq("user_id", user.id)
      .eq("ocr_status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);

    const contextText = docs
      ?.filter((d: any) => d.ocr_text || d.summary)
      .map((d: any) => `[${d.title}]: ${d.summary || d.ocr_text?.slice(0, 500)}`)
      .join("\n\n") || "";

    // Lade Chat-Verlauf der Session
    const { data: history } = await supabase
      .from("sb_chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(10);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + (contextText ? `\n\nDokumenten-Kontext:\n${contextText}` : "") },
      ...(history || []).map((h: any) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    // OpenAI API aufrufen
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const openaiData = await openaiRes.json();
    const reply = openaiData.choices[0]?.message?.content || "Keine Antwort erhalten.";

    // Nachrichten in DB speichern
    await supabase.from("sb_chat_messages").insert([
      { session_id: sessionId, user_id: user.id, role: "user", content: message },
      { session_id: sessionId, user_id: user.id, role: "assistant", content: reply },
    ]);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("secondbrain-chat error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
