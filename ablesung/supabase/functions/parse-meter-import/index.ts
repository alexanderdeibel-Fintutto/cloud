import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Keine Datei hochgeladen" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileName = file.name.toLowerCase();
    const fileType = fileName.split(".").pop();

    let data: Record<string, string>[] = [];
    let columns: string[] = [];

    if (fileType === "pdf") {
      // Use AI to extract table data from PDF
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a document parser specialized in extracting meter reading data from utility documents.
Extract all meter readings from the document. Return a JSON array of objects with these fields:
- date: The reading date in format YYYY-MM-DD
- value: The meter reading value as a number

Only return the JSON array, no other text. If you cannot find any data, return an empty array [].
Example output: [{"date": "2024-01-15", "value": 12345.67}, {"date": "2024-02-15", "value": 12456.78}]`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all meter reading dates and values from this document. Return only a JSON array.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${base64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        throw new Error("Fehler bei der PDF-Verarbeitung");
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || "[]";

      // Parse the AI response
      try {
        // Extract JSON from response (may be wrapped in markdown code blocks)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            columns = ["date", "value"];
            data = parsed.map((row: { date: string; value: number }) => ({
              date: row.date || "",
              value: String(row.value || ""),
            }));
          }
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError, content);
        throw new Error("Konnte keine Daten aus der PDF extrahieren");
      }
    } else if (fileType === "xlsx" || fileType === "xls") {
      // For Excel files, we use a simple approach with AI
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      // Read file as text (will be binary, so we base64 encode)
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // For Excel, we'll try to use the AI with the file
      // Note: This may not work perfectly for all Excel files
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a document parser. Extract meter reading data from Excel files.
Return a JSON object with:
- columns: array of column names found in the spreadsheet
- data: array of row objects where keys are column names
- suggestedDateColumn: the column name that likely contains dates
- suggestedValueColumn: the column name that likely contains meter values

Only return valid JSON, no other text.`,
            },
            {
              role: "user",
              content: `This is an Excel file (${fileType}) with meter reading data. The base64 content is: ${base64.substring(0, 10000)}...
              
Please extract the tabular data and return it as JSON.`,
            },
          ],
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        throw new Error("Excel-Dateien werden derzeit nur eingeschränkt unterstützt. Bitte als CSV exportieren.");
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || "{}";

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          columns = parsed.columns || [];
          data = parsed.data || [];
        }
      } catch {
        throw new Error("Excel-Dateien werden derzeit nur eingeschränkt unterstützt. Bitte als CSV exportieren.");
      }
    }

    // Detect suggested columns
    let suggestedDateColumn = "";
    let suggestedValueColumn = "";

    for (const col of columns) {
      const colLower = col.toLowerCase();
      if (!suggestedDateColumn && /datum|date|zeit|time|tag|monat/i.test(colLower)) {
        suggestedDateColumn = col;
      }
      if (!suggestedValueColumn && /stand|wert|value|reading|verbrauch|kwh|m³|cbm|zähler/i.test(colLower)) {
        suggestedValueColumn = col;
      }
    }

    return new Response(
      JSON.stringify({
        columns,
        data,
        suggestedDateColumn,
        suggestedValueColumn,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unbekannter Fehler" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
