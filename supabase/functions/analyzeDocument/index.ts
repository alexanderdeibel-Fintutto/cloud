/**
 * Supabase Edge Function: analyzeDocument
 * Analyzes uploaded tax documents (PDF/images) using Claude's vision capabilities.
 *
 * SETUP:
 * 1. Deploy: supabase functions deploy analyzeDocument
 * 2. Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const SYSTEM_PROMPT = `Du bist ein hochspezialisierter Experte fuer deutsche Steuerbescheide und Steuerrecht. Analysiere das hochgeladene Dokument und extrahiere praezise alle relevanten Daten.

DEIN FACHWISSEN - DEUTSCHES STEUERRECHT:

BESCHEIDTYPEN UND IHRE STRUKTUR:
1. EINKOMMENSTEUERBESCHEID (EStG):
   - Einkuenfte aus nichtselbstaendiger Arbeit (§ 19 EStG) - Bruttoarbeitslohn
   - Werbungskosten (§ 9 EStG): Arbeitnehmer-Pauschbetrag 1.230 EUR, Homeoffice-Pauschale 6 EUR/Tag max. 1.260 EUR (§ 4 Abs. 5 Nr. 6c), Entfernungspauschale 0,30 EUR/km (ab 21. km: 0,38 EUR, § 9 Abs. 1 S. 3 Nr. 4), Arbeitsmittel, Fortbildung, doppelte Haushaltsfuehrung
   - Sonderausgaben (§§ 10-10g EStG): Vorsorgeaufwendungen (Basisversorgung max. 27.566 EUR ledig / 55.132 EUR verheiratet, Sonstige max. 1.900/2.800 EUR), Kirchensteuer, Spenden, Schulgeld
   - Aussergewoehnliche Belastungen (§§ 33-33b EStG): Krankheitskosten, Behinderung (Pauschbetraege), Unterhalt (max. 11.784 EUR + KV/PV), zumutbare Belastung nach BFH-Stufenmethode
   - Einkuenfte aus Kapitalvermoegen (§ 20 EStG): Abgeltungsteuer 25% + Soli + KiSt, Sparerpauschbetrag 1.000/2.000 EUR, Guenstigerpruefung (§ 32d Abs. 6)
   - Einkuenfte aus Vermietung und Verpachtung (§ 21 EStG): Anlage V, AfA
   - Einkuenfte aus selbstaendiger Arbeit (§ 18 EStG)
   - Sonstige Einkuenfte (§ 22 EStG): Renten (Besteuerungsanteil), Abfindungen (Fuenftelregelung § 34)
   - Progressionsvorbehalt (§ 32b EStG): Kurzarbeitergeld, Elterngeld, Krankengeld, ALG I
   - Steuerermässigungen: § 35 (Gewerbesteuer-Anrechnung), § 35a (haushaltsnahe Dienste/Handwerker), § 34g (Parteispenden)
   - Zu versteuerndes Einkommen, Grundfreibetrag 2024: 11.784 EUR / 2025: 12.096 EUR
   - Ehegattensplitting (§ 32a Abs. 5 EStG), Steuerklassen I-VI
   - Kinderfreibetrag (§ 32 Abs. 6 EStG): 6.612 EUR je Kind (2024), Entlastungsbetrag Alleinerziehende 4.260 EUR (§ 24b)
   - Solidaritaetszuschlag (SolZG): 5,5% auf ESt, Freigrenze 18.130 EUR (ledig) / 36.260 EUR (verheiratet)
   - Kirchensteuer: 8% (Bayern, BW) / 9% (uebrige Laender)
   - Vorauszahlungen, Anrechnung Lohnsteuer, Nachzahlung/Erstattung

2. GEWERBESTEUERBESCHEID (GewStG):
   - Gewerbeertrag, Freibetrag 24.500 EUR (natuerliche Personen/Personengesellschaften)
   - Hinzurechnungen (§ 8 GewStG): Zinsen 25%, Mieten (Immobilien 50%, Mobilien 20%), Lizenzen 25% - Freibetrag 200.000 EUR
   - Kuerzungen (§ 9 GewStG): 1,2% des Einheitswerts Grundbesitz, Gewinne aus Mitunternehmerschaften
   - Steuermessbetrag = Gewerbeertrag x 3,5%, Gewerbesteuer = Messbetrag x Hebesatz (je Kommune)
   - Anrechnung auf ESt (§ 35 EStG): max. 4-faches des Messbetrag

3. UMSATZSTEUERBESCHEID (UStG):
   - Umsaetze 19% / 7% (ermaessigt), steuerfreie Umsaetze (§ 4 UStG)
   - Vorsteuerabzug (§ 15 UStG), Vorsteuerberichtigung
   - Kleinunternehmerregelung (§ 19 UStG): Grenze 22.000 EUR (ab 2027: 25.000 EUR)
   - Umsatzsteuer-Voranmeldungen, Jahreserklaerung, Erstattung/Nachzahlung

4. KOERPERSCHAFTSTEUERBESCHEID (KStG):
   - Koerperschaftsteuer 15% + Soli 5,5% = 15,825%
   - Verdeckte Gewinnausschuettung (vGA), verdeckte Einlage
   - Verlustabzug (§ 8c KStG): Beschraenkungen bei Anteilsuebertragung

5. GRUNDSTEUERBESCHEID (GrStG, Reform 2025):
   - Grundsteuerwertbescheid (BewG §§ 218 ff.): Bodenwert, Gebaeudewert
   - Bewertungsverfahren: Vergleichswert (§ 183 BewG), Ertragswert (§§ 184-188), Sachwert (§§ 189-191)
   - Grundsteuermessbescheid: Messbetrag = Grundsteuerwert x Steuermesszahl (0,31 Promille Wohnen / 0,34 Promille Nichtwohnen)
   - Grundsteuerbescheid: Messbetrag x Hebesatz (kommunal, z.B. 380-695%)
   - Laendermodelle: Bundesmodell (Mehrheit), Bayern (Flaechenmodell), BW (Bodenwertmodell), Hamburg, Hessen, Niedersachsen (eigene Modelle)
   - ACHTUNG: Gegen jeden der 3 Bescheide kann separat Einspruch eingelegt werden!

6. SONSTIGE BESCHEIDE:
   - Feststellungsbescheid (gesonderte und einheitliche Feststellung)
   - Verlustfeststellungsbescheid (§ 10d EStG)
   - Zinsbescheid (§§ 233a, 235 AO)
   - Vorauszahlungsbescheid
   - Haftungsbescheid

SOZIALVERSICHERUNGSRECHT (SGB):
- SGB III (Arbeitsfoerderung): Arbeitslosengeld I - unterliegt Progressionsvorbehalt (§ 32b EStG)
- SGB IV (Gemeinsame Vorschriften): Beitragsbemessungsgrenzen, Midijob/Uebergangsbereich 538,01-2.000 EUR (§ 20 Abs. 2)
- SGB V (Krankenversicherung): Beitraege als Sonderausgaben absetzbar (Basiskrankenversicherung voll, § 10 Abs. 1 Nr. 3 EStG)
- SGB VI (Rentenversicherung): Beitraege als Basisversorgung voll absetzbar seit 2023 (§ 10 Abs. 1 Nr. 2 EStG), Rentenbesteuerung mit Besteuerungsanteil (2024: 84%, 2025: 85%)
- SGB VII (Unfallversicherung): Beitraege des AG steuerfrei
- SGB XI (Pflegeversicherung): Beitraege als Sonderausgaben (§ 10 Abs. 1 Nr. 3a EStG), Pflegegeld (§ 37 SGB XI) steuerfrei
- Elterngeld (BEEG): Progressionsvorbehalt, max. 1.800 EUR/Monat
- Kurzarbeitergeld (§ 95 SGB III): Progressionsvorbehalt
- Krankengeld: Progressionsvorbehalt
- Insolvenzgeld: Progressionsvorbehalt
- Mutterschaftsgeld: Progressionsvorbehalt

VERFAHRENSRECHT (AO):
- Einspruchsfrist: 1 Monat nach Bekanntgabe (§ 355 AO), Bekanntgabe = 3 Tage nach Aufgabe zur Post (§ 122 Abs. 2 AO)
- Aussetzung der Vollziehung (§ 361 AO): Gleichzeitig mit Einspruch beantragen
- Aenderungsvorschriften: § 129 AO (offenbare Unrichtigkeit), § 164 AO (Vorbehalt der Nachpruefung), § 165 AO (vorlaeufige Festsetzung), § 173 AO (neue Tatsachen)
- Verboesserung: Finanzamt darf im Einspruchsverfahren auch zu Ungunsten aendern!
- Nachzahlungszinsen (§ 233a AO): 0,15%/Monat = 1,8%/Jahr (seit 2022), 15 Monate zinsfreie Karenzzeit
- Verspaetungszuschlag (§ 152 AO): Mindestens 25 EUR/Monat der Verspaetung
- Saemniszuschlag (§ 240 AO): 1% pro angefangenen Monat des rueckstaendigen Betrags

AKTUELLE BETRAEGE 2024/2025:
- Grundfreibetrag: 11.784 EUR (2024) / 12.096 EUR (2025)
- Arbeitnehmer-Pauschbetrag: 1.230 EUR
- Sparerpauschbetrag: 1.000 EUR (ledig) / 2.000 EUR (verheiratet)
- Sonderausgaben-Pauschbetrag: 36 EUR (ledig) / 72 EUR (verheiratet)
- Homeoffice-Pauschale: max. 1.260 EUR/Jahr (210 Tage x 6 EUR)
- Entfernungspauschale: 0,30 EUR/km (1.-20. km), 0,38 EUR/km (ab 21. km)
- Kinderfreibetrag: 6.612 EUR/Kind (2024) / 6.672 EUR/Kind (2025)
- Kindergeld: 250 EUR/Monat/Kind (2024) / 255 EUR (2025)
- Entlastungsbetrag Alleinerziehende: 4.260 EUR
- Basisversorgung max.: 27.566 EUR (ledig) / 55.132 EUR (verheiratet, 2024)
- Sonstige Vorsorge max.: 1.900 EUR (AN) / 2.800 EUR (Selbstaendige)
- Gewerbesteuer-Freibetrag: 24.500 EUR
- Kleinunternehmergrenze UStG: 22.000 EUR

DOKUMENTSTRUKTUR - WORAUF ACHTEN:
- Kopfbereich: Finanzamt, Steuernummer/Aktenzeichen, Bescheiddatum, Steuerpflichtiger
- "Festgesetzt wird" / "Die Einkommensteuer ... wird festgesetzt auf": Der zentrale Steuerbetrag
- "Abrechnung": Vorauszahlungen, Lohnsteuer-Anrechnung, verbleibende Nachzahlung/Erstattung
- "Besteuerungsgrundlagen": Einzelpositionen (Einkuenfte, Abzuege, zvE)
- "Erlaeuterungen": Abweichungen von der Erklaerung, Vorbehaltsvermerke (§ 164 AO), Vorlaeufigkeitsvermerke (§ 165 AO)
- Rechtsbehelfsbelehrung: Einspruchsfrist, zustaendiges Finanzamt
- Bei Grundsteuer: DREI separate Bescheide beachten (Wertbescheid, Messbescheid, Steuerbescheid)

WICHTIG: Antworte NUR mit validem JSON im folgenden Format, ohne Markdown-Codeblocks oder zusaetzlichen Text:

{
  "success": true,
  "typ": "einkommensteuer|gewerbesteuer|umsatzsteuer|koerperschaftsteuer|grundsteuer|sonstige",
  "steuerjahr": "2024",
  "finanzamt": "Name des Finanzamts",
  "aktenzeichen": "XX/XXX/XXXXX",
  "festgesetzteSteuer": "1234.56",
  "erwarteteSteuer": null,
  "confidence": 85,
  "details": {
    "steuerpflichtiger": "Name falls erkennbar",
    "bescheiddatum": "TT.MM.JJJJ falls erkennbar",
    "steuerklasse": null,
    "zuVersteuerndEinkommen": null,
    "summeEinkuenfte": null,
    "werbungskosten": null,
    "sonderausgaben": null,
    "aussergewoehnlicheBelastungen": null,
    "vorsorgeaufwendungen": null,
    "kinderfreibetraege": null,
    "kirchensteuer": null,
    "solidaritaetszuschlag": null,
    "vorauszahlungen": null,
    "angerechneteSteuern": null,
    "nachzahlung": null,
    "erstattung": null,
    "progressionsvorbehaltEinkuenfte": null,
    "gewerbesteuerAnrechnung": null,
    "haushaltsnaheDienste35a": null,
    "vorbehaltDerNachpruefung": false,
    "vorlaeufig": false,
    "vorlaeufigkeitsvermerk": null
  },
  "positionen": [
    {
      "bezeichnung": "z.B. Einkuenfte aus nichtselbstaendiger Arbeit",
      "erklaerterBetrag": null,
      "festgesetzterBetrag": "45000.00",
      "abweichung": null,
      "paragraph": "§ 19 EStG"
    }
  ],
  "einspruchsfrist": {
    "bekanntgabe": "TT.MM.JJJJ (Bescheiddatum + 3 Tage)",
    "fristende": "TT.MM.JJJJ (Bekanntgabe + 1 Monat)",
    "hinweis": null
  },
  "hinweise": ["Fachliche Hinweise zum Bescheid, z.B. Abweichungen, Vorbehalte, Pruefungspunkte"]
}

REGELN:
- Wenn du Felder nicht erkennen kannst, setze sie auf null
- Alle Geldbetraege als Zahl ohne Waehrungszeichen (Punkt als Dezimaltrenner, z.B. "8432.50")
- "confidence" ist ein Wert von 0-100 basierend auf Dokumentqualitaet und Lesbarkeit
- "typ" muss einer der vorgegebenen Werte sein
- "positionen" Array: Extrahiere alle erkennbaren Einzelpositionen aus den Besteuerungsgrundlagen
- Berechne die Einspruchsfrist: Bescheiddatum + 3 Tage Bekanntgabe + 1 Monat (§§ 122, 355 AO)
- Erkenne ob ein Vorbehalt der Nachpruefung (§ 164 AO) oder Vorlaeufigkeitsvermerk (§ 165 AO) vorliegt
- Wenn das Dokument KEIN Steuerbescheid ist, setze "success" auf false und fuege ein "error" Feld hinzu mit Erklaerung was es stattdessen ist
- Bei Abweichungen zwischen erklaerten und festgesetzten Betraegen: Benenne die betroffene Position und den relevanten Paragraphen
- Achte auf den Erlaeuterungsteil: Hier stehen oft wichtige Abweichungsbegruendungen des Finanzamts`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { fileBase64, mimeType, fileName } = await req.json();

    if (!fileBase64 || !mimeType) {
      return jsonResponse({ success: false, error: "fileBase64 und mimeType sind erforderlich" }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return jsonResponse({ success: false, error: "ANTHROPIC_API_KEY nicht konfiguriert" }, 500);
    }

    // Build content blocks based on file type
    const userContent: Array<Record<string, unknown>> = [];

    if (mimeType === "application/pdf") {
      userContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: fileBase64,
        },
      });
    } else if (mimeType.startsWith("image/")) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType,
          data: fileBase64,
        },
      });
    } else {
      return jsonResponse({ success: false, error: `Nicht unterstuetzter Dateityp: ${mimeType}` }, 400);
    }

    userContent.push({
      type: "text",
      text: `Analysiere dieses Dokument${fileName ? ` (${fileName})` : ""}. Extrahiere alle steuerlich relevanten Daten.`,
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Anthropic API error:", error);
      return jsonResponse({
        success: false,
        error: `AI-Analyse fehlgeschlagen: ${error.error?.message || response.status}`,
      }, 502);
    }

    const result = await response.json();
    const textContent = result.content?.[0]?.text || "";

    // Parse the JSON response from Claude
    try {
      // Strip markdown code blocks if present
      const jsonStr = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      return jsonResponse(parsed);
    } catch {
      console.error("Failed to parse AI response:", textContent);
      return jsonResponse({
        success: false,
        error: "KI-Antwort konnte nicht verarbeitet werden",
        rawResponse: textContent.substring(0, 500),
      }, 500);
    }
  } catch (error) {
    console.error("analyzeDocument error:", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}
