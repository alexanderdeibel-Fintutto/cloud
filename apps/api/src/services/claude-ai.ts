/**
 * Claude AI Service für intelligente Beleganalyse
 * Nutzt die Anthropic API für Vision-basierte Dokumentenanalyse
 */

import Anthropic from '@anthropic-ai/sdk';

// Anthropic Client initialisieren
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface ReceiptAnalysisResult {
  vendor: string;
  vendorAddress?: string;
  vatId?: string;
  receiptNumber?: string;
  date: string;
  dueDate?: string;
  grossAmount: number;
  netAmount?: number;
  vatRate: number;
  vatAmount: number;
  currency: string;
  category: string;
  suggestedAccount: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    vatRate?: number;
  }>;
  paymentMethod?: string;
  iban?: string;
  confidence: number;
  rawText?: string;
}

export interface InvoiceAnalysisResult extends ReceiptAnalysisResult {
  customerName?: string;
  customerAddress?: string;
  customerVatId?: string;
  paymentTerms?: string;
  bankDetails?: {
    iban: string;
    bic?: string;
    bankName?: string;
  };
}

// Media Type Mapping
type SupportedMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

function getSupportedMediaType(mimeType: string): SupportedMediaType {
  const typeMap: Record<string, SupportedMediaType> = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/gif': 'image/gif',
    'image/webp': 'image/webp',
  };
  return typeMap[mimeType] || 'image/jpeg';
}

// Beleg mit Claude Vision analysieren
export async function analyzeReceiptWithClaude(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<ReceiptAnalysisResult> {
  const systemPrompt = `Du bist ein Experte für deutsche Buchhaltung und Beleganalyse.
Analysiere den Beleg/die Rechnung im Bild und extrahiere alle relevanten Informationen.
Antworte AUSSCHLIESSLICH im JSON-Format ohne zusätzlichen Text.

Verwende das deutsche Datumsformat (TT.MM.JJJJ) für die Ausgabe und konvertiere in ISO-Format (YYYY-MM-DD) für das "date" Feld.
Beträge sollten als Zahlen ohne Währungssymbol angegeben werden.
Kategorisiere nach deutschen Buchhaltungsstandards (SKR03).`;

  const userPrompt = `Analysiere diesen deutschen Geschäftsbeleg und extrahiere folgende Informationen im JSON-Format:

{
  "vendor": "Firmenname des Lieferanten",
  "vendorAddress": "Vollständige Adresse",
  "vatId": "USt-IdNr. falls vorhanden",
  "receiptNumber": "Rechnungs-/Belegnummer",
  "date": "YYYY-MM-DD",
  "dueDate": "Fälligkeitsdatum falls angegeben (YYYY-MM-DD)",
  "grossAmount": 123.45,
  "netAmount": 103.74,
  "vatRate": 19,
  "vatAmount": 19.71,
  "currency": "EUR",
  "category": "Eine der Kategorien: Bürobedarf, Bewirtung, Fahrzeugkosten, Kommunikation, Miete, Reisekosten, Versicherungen, Marketing, Gehälter, Sonstiges",
  "suggestedAccount": "SKR03 Kontonummer und Name, z.B. '4930 - Bürobedarf'",
  "lineItems": [
    {
      "description": "Artikelbeschreibung",
      "quantity": 1,
      "unitPrice": 103.74,
      "totalPrice": 103.74,
      "vatRate": 19
    }
  ],
  "paymentMethod": "Bar/EC/Überweisung falls erkennbar",
  "iban": "IBAN falls angegeben",
  "confidence": 0.95
}

Wenn ein Wert nicht erkennbar ist, verwende null. Die confidence sollte zwischen 0 und 1 liegen und die Qualität der Erkennung widerspiegeln.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: getSupportedMediaType(mimeType),
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
      system: systemPrompt,
    });

    // Response Text extrahieren
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Keine Textantwort von Claude erhalten');
    }

    // JSON parsen (Claude gibt manchmal Markdown Code Blocks zurück)
    let jsonText = textContent.text;
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const result = JSON.parse(jsonText.trim()) as ReceiptAnalysisResult;

    // Standardwerte für fehlende Felder
    return {
      vendor: result.vendor || 'Unbekannt',
      vendorAddress: result.vendorAddress,
      vatId: result.vatId,
      receiptNumber: result.receiptNumber,
      date: result.date || new Date().toISOString().split('T')[0],
      dueDate: result.dueDate,
      grossAmount: result.grossAmount || 0,
      netAmount: result.netAmount,
      vatRate: result.vatRate || 19,
      vatAmount: result.vatAmount || 0,
      currency: result.currency || 'EUR',
      category: result.category || 'Sonstiges',
      suggestedAccount: result.suggestedAccount || '4900 - Sonstige betriebliche Aufwendungen',
      lineItems: result.lineItems,
      paymentMethod: result.paymentMethod,
      iban: result.iban,
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error('Claude AI Analysis Error:', error);
    throw new Error(`Beleganalyse fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}

// Rechnung analysieren (erweiterter Modus)
export async function analyzeInvoiceWithClaude(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<InvoiceAnalysisResult> {
  const systemPrompt = `Du bist ein Experte für deutsche Buchhaltung und Rechnungsanalyse.
Analysiere die Rechnung im Bild und extrahiere alle Details für die Buchhaltung.
Antworte AUSSCHLIESSLICH im JSON-Format ohne zusätzlichen Text.`;

  const userPrompt = `Analysiere diese deutsche Rechnung und extrahiere alle Informationen im JSON-Format:

{
  "vendor": "Rechnungssteller",
  "vendorAddress": "Vollständige Adresse",
  "vatId": "USt-IdNr. des Rechnungsstellers",
  "receiptNumber": "Rechnungsnummer",
  "date": "Rechnungsdatum (YYYY-MM-DD)",
  "dueDate": "Fälligkeitsdatum (YYYY-MM-DD)",
  "customerName": "Rechnungsempfänger",
  "customerAddress": "Adresse des Empfängers",
  "customerVatId": "USt-IdNr. des Empfängers falls B2B",
  "grossAmount": 1190.00,
  "netAmount": 1000.00,
  "vatRate": 19,
  "vatAmount": 190.00,
  "currency": "EUR",
  "category": "Buchhaltungskategorie",
  "suggestedAccount": "SKR03 Konto",
  "lineItems": [
    {
      "description": "Position",
      "quantity": 1,
      "unitPrice": 1000.00,
      "totalPrice": 1000.00,
      "vatRate": 19
    }
  ],
  "paymentTerms": "Zahlungsbedingungen",
  "bankDetails": {
    "iban": "DE...",
    "bic": "...",
    "bankName": "Bankname"
  },
  "confidence": 0.95
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: getSupportedMediaType(mimeType),
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
      system: systemPrompt,
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Keine Textantwort von Claude erhalten');
    }

    let jsonText = textContent.text;
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    return JSON.parse(jsonText.trim()) as InvoiceAnalysisResult;
  } catch (error) {
    console.error('Claude Invoice Analysis Error:', error);
    throw new Error(`Rechnungsanalyse fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}

// Buchungsvorschlag basierend auf Beschreibung generieren
export async function suggestBookingFromDescription(
  description: string,
  amount: number,
  isExpense: boolean
): Promise<{
  category: string;
  suggestedAccount: string;
  vatRate: number;
  confidence: number;
}> {
  const prompt = `Als deutscher Buchhalter, analysiere diese Transaktion und schlage die passende Buchung vor:

Beschreibung: "${description}"
Betrag: ${Math.abs(amount).toFixed(2)} EUR
Typ: ${isExpense ? 'Ausgabe' : 'Einnahme'}

Antworte im JSON-Format:
{
  "category": "Kategorie (Gehälter, Miete, Büromaterial, Marketing, Reisekosten, Versicherungen, Telekommunikation, Einnahmen, Sonstiges)",
  "suggestedAccount": "SKR03 Kontonummer - Kontoname",
  "vatRate": 19,
  "confidence": 0.85
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Keine Antwort');
    }

    let jsonText = textContent.text;
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    return JSON.parse(jsonText.trim());
  } catch (error) {
    // Fallback bei Fehler
    return {
      category: isExpense ? 'Sonstiges' : 'Einnahmen',
      suggestedAccount: isExpense ? '4900 - Sonstige betriebliche Aufwendungen' : '8400 - Erlöse 19%',
      vatRate: 19,
      confidence: 0.3,
    };
  }
}

// Batch-Analyse mehrerer Belege (kostengünstig)
export async function analyzeReceiptsBatch(
  receipts: Array<{ id: string; imageBase64: string; mimeType: string }>
): Promise<Map<string, ReceiptAnalysisResult | Error>> {
  const results = new Map<string, ReceiptAnalysisResult | Error>();

  // Parallel verarbeiten (max 5 gleichzeitig für Rate Limiting)
  const batchSize = 5;
  for (let i = 0; i < receipts.length; i += batchSize) {
    const batch = receipts.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map(async (receipt) => {
        const result = await analyzeReceiptWithClaude(receipt.imageBase64, receipt.mimeType);
        return { id: receipt.id, result };
      })
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.set(result.value.id, result.value.result);
      } else {
        // ID aus dem Fehler extrahieren ist schwierig, daher speichern wir den Fehler
        console.error('Batch analysis error:', result.reason);
      }
    }

    // Rate Limiting Pause zwischen Batches
    if (i + batchSize < receipts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// Prüfen ob API verfügbar ist
export async function checkClaudeAPIAvailable(): Promise<boolean> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return false;
  }

  try {
    await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Test' }],
    });
    return true;
  } catch {
    return false;
  }
}
