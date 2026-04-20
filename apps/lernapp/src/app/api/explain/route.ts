import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const difficultyPrompts: Record<string, string> = {
  leicht: `Du bist ein freundlicher Nachhilfelehrer. Erkläre die Aufgabe auf dem Bild auf eine verständliche Art und Weise.
- Verwende einfache Sprache
- Erkläre Schritt für Schritt den Lösungsweg und die Konzepte
- Gib KEINE Lösung, nur die Erklärung wie man an die Aufgabe herangeht
- Verwende Beispiele wenn hilfreich
- Antworte auf Deutsch`,

  superleicht: `Du bist ein super geduldiger Nachhilfelehrer der Dinge extra einfach erklärt. Erkläre die Aufgabe auf dem Bild so einfach wie möglich.
- Verwende sehr einfache Wörter und kurze Sätze
- Erkläre jedes Konzept mit einem Alltagsbeispiel
- Gib KEINE Lösung, nur die Erklärung wie man an die Aufgabe herangeht
- Teile alles in ganz kleine Schritte auf
- Antworte auf Deutsch`,

  kinderleicht: `Du bist ein großer Bruder/eine große Schwester, der/die einem 12-Jährigen etwas erklärt. Erkläre die Aufgabe auf dem Bild so, dass es ein 12-Jähriger versteht.
- Verwende die einfachste Sprache die möglich ist
- Erkläre alles mit Beispielen aus dem Alltag eines Jugendlichen (Gaming, Social Media, Sport, etc.)
- Gib KEINE Lösung, nur die Erklärung wie man an die Aufgabe herangeht
- Sei locker und motivierend im Ton
- Verwende kurze Absätze
- Antworte auf Deutsch`,
};

export async function POST(request: NextRequest) {
  try {
    const { image, difficulty } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Kein Bild hochgeladen." },
        { status: 400 }
      );
    }

    const prompt = difficultyPrompts[difficulty] || difficultyPrompts.leicht;

    // Extract base64 data and media type from data URL
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Ungültiges Bildformat." },
        { status: 400 }
      );
    }

    const mediaType = matches[1] as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp";
    const base64Data = matches[2];

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    const explanation = textContent && "text" in textContent ? textContent.text : "";

    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      {
        error:
          "Die Erklärung konnte nicht erstellt werden. Bitte versuche es später noch einmal.",
      },
      { status: 500 }
    );
  }
}
