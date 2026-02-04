import { Hono } from 'hono';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';

const aiRouter = new Hono();

// Claude Client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// System Prompts
const RECEIPT_RECOGNITION_PROMPT = `Du bist ein Experte für deutsche Buchhaltung und Belegerkennung.
Analysiere den folgenden Beleg und extrahiere alle relevanten Informationen im JSON-Format.

Extrahiere folgende Felder (sofern vorhanden):
- vendor_name: Name des Lieferanten/Verkäufers
- vendor_address: Vollständige Adresse
- vendor_vat_id: USt-IdNr. des Lieferanten
- receipt_number: Rechnungs-/Belegnummer
- receipt_date: Datum (Format: YYYY-MM-DD)
- due_date: Fälligkeitsdatum (Format: YYYY-MM-DD)
- payment_terms: Zahlungsbedingungen
- line_items: Array mit einzelnen Positionen
  - description: Beschreibung
  - quantity: Menge
  - unit_price: Einzelpreis (netto)
  - tax_rate: Steuersatz (7 oder 19)
- net_amount: Nettobetrag gesamt
- tax_amount: Steuerbetrag gesamt
- gross_amount: Bruttobetrag gesamt
- tax_breakdown: Aufschlüsselung nach Steuersätzen
- iban: Bankverbindung IBAN
- bic: BIC
- category: Kategorie (z.B. "Büromaterial", "Telekommunikation", "Reisekosten", etc.)
- suggested_account: Empfohlenes Buchungskonto nach SKR03
- confidence: Konfidenz der Erkennung (0-1)

Antworte NUR mit validem JSON, keine weiteren Erklärungen.`;

const BOOKING_SUGGESTION_PROMPT = `Du bist ein erfahrener deutscher Buchhalter und Steuerberater.
Basierend auf dem folgenden Beleg, schlage eine korrekte Buchung nach SKR03 vor.

Berücksichtige dabei:
- Korrekte Zuordnung zu Aufwands-/Ertragskonten
- Vorsteuer bei Eingangsrechnungen
- Umsatzsteuer bei Ausgangsrechnungen
- Ggf. Kostenstellen
- GoBD-Konformität

Antworte mit einem JSON-Objekt:
{
  "description": "Buchungsbeschreibung",
  "lines": [
    {
      "debit_account": "Kontonummer Soll",
      "debit_account_name": "Kontoname Soll",
      "credit_account": "Kontonummer Haben",
      "credit_account_name": "Kontoname Haben",
      "amount": Betrag,
      "tax_rate": Steuersatz,
      "tax_amount": Steuerbetrag
    }
  ],
  "explanation": "Kurze Erklärung der Buchung für den Nutzer",
  "tax_hint": "Steuerlicher Hinweis (falls relevant)",
  "confidence": 0-1
}`;

const CHAT_ASSISTANT_PROMPT = `Du bist der KI-Assistent von Fintutto, einer deutschen Finanzbuchhaltungssoftware.
Du hilfst Nutzern bei allen Fragen rund um Buchhaltung, Steuern und die Nutzung der Software.

Dein Wissen umfasst:
- Deutsche Buchhaltungsstandards (HGB, GoBD)
- Steuerrecht (UStG, EStG, KStG)
- Kontenrahmen SKR03 und SKR04
- Praktische Buchhaltung für KMU

Antworte freundlich, präzise und verständlich - auch für Nutzer ohne Buchhaltungskenntnisse.
Bei komplexen Steuerfragen weise darauf hin, dass ein Steuerberater konsultiert werden sollte.

Aktueller Kontext:
- Organisation: {{organizationName}}
- Rechtsform: {{legalForm}}
- Kontenrahmen: {{chartOfAccounts}}
- Kleinunternehmer: {{smallBusiness}}`;

// POST /ai/recognize-receipt - Beleg erkennen
aiRouter.post('/recognize-receipt', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    imageUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    ocrText: z.string().optional(),
    receiptId: z.string().optional(),
  });

  const data = schema.parse(body);

  if (!data.imageUrl && !data.imageBase64 && !data.ocrText) {
    throw new AppError('Bild oder OCR-Text erforderlich', 400, 'MISSING_INPUT');
  }

  try {
    let messageContent: any[] = [
      { type: 'text', text: RECEIPT_RECOGNITION_PROMPT },
    ];

    // Bild hinzufügen wenn vorhanden
    if (data.imageBase64) {
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: data.imageBase64,
        },
      });
    } else if (data.imageUrl) {
      messageContent.push({
        type: 'image',
        source: {
          type: 'url',
          url: data.imageUrl,
        },
      });
    }

    // OCR-Text hinzufügen
    if (data.ocrText) {
      messageContent.push({
        type: 'text',
        text: `\n\nOCR-Text des Belegs:\n${data.ocrText}`,
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: messageContent },
      ],
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // JSON aus der Antwort extrahieren
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError('KI konnte keine strukturierten Daten extrahieren', 500, 'AI_PARSE_ERROR');
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    // Kontakt suchen/vorschlagen
    let suggestedContact = null;
    if (extractedData.vendor_name) {
      suggestedContact = await prisma.contact.findFirst({
        where: {
          organizationId,
          OR: [
            { companyName: { contains: extractedData.vendor_name, mode: 'insensitive' } },
            { vatId: extractedData.vendor_vat_id },
          ],
        },
        select: { id: true, companyName: true, type: true },
      });
    }

    // Wenn Beleg-ID angegeben, aktualisieren
    if (data.receiptId) {
      await prisma.receipt.update({
        where: { id: data.receiptId },
        data: {
          aiExtractedData: extractedData as any,
          aiConfidence: extractedData.confidence,
          aiProcessedAt: new Date(),
          status: 'RECOGNIZED',
        },
      });
    }

    return c.json({
      success: true,
      data: {
        extracted: extractedData,
        suggestedContact,
        suggestedAccount: extractedData.suggested_account,
      },
    });
  } catch (error) {
    console.error('AI Receipt Recognition Error:', error);
    throw new AppError('Belegerkennung fehlgeschlagen', 500, 'AI_ERROR');
  }
});

// POST /ai/suggest-booking - Buchungsvorschlag
aiRouter.post('/suggest-booking', async (c) => {
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    receiptId: z.string().optional(),
    description: z.string().optional(),
    amount: z.number().optional(),
    taxRate: z.number().optional(),
    category: z.string().optional(),
    contactId: z.string().optional(),
    isIncoming: z.boolean().default(true), // Eingangsrechnung = true
  });

  const data = schema.parse(body);

  // Organisation laden für Kontext
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      name: true,
      legalForm: true,
      chartOfAccounts: true,
      smallBusiness: true,
    },
  });

  // Beleg laden wenn ID angegeben
  let receiptData = null;
  if (data.receiptId) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: data.receiptId },
      include: { contact: true, lineItems: true },
    });
    if (receipt) {
      receiptData = {
        ...receipt,
        aiExtracted: receipt.aiExtractedData,
      };
    }
  }

  // Verfügbare Konten laden
  const accounts = await prisma.account.findMany({
    where: {
      organizationId,
      isActive: true,
      type: { in: ['EXPENSE', 'ASSET', 'LIABILITY'] },
    },
    select: { accountNumber: true, name: true, type: true, category: true },
    orderBy: { accountNumber: 'asc' },
  });

  const prompt = `
${BOOKING_SUGGESTION_PROMPT}

Organisationskontext:
- Name: ${organization?.name}
- Rechtsform: ${organization?.legalForm}
- Kontenrahmen: ${organization?.chartOfAccounts}
- Kleinunternehmer: ${organization?.smallBusiness ? 'Ja' : 'Nein'}

Belegdaten:
${JSON.stringify(receiptData || data, null, 2)}

Verfügbare Konten:
${accounts.slice(0, 100).map(a => `${a.accountNumber}: ${a.name} (${a.category})`).join('\n')}

Erstelle einen korrekten Buchungsvorschlag.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError('KI konnte keinen Buchungsvorschlag erstellen', 500, 'AI_PARSE_ERROR');
    }

    const suggestion = JSON.parse(jsonMatch[0]);

    // Account IDs für die Kontonummern ermitteln
    const accountMap = new Map(accounts.map(a => [a.accountNumber, a]));

    const enrichedLines = suggestion.lines?.map((line: any) => ({
      ...line,
      debitAccount: accountMap.get(line.debit_account),
      creditAccount: accountMap.get(line.credit_account),
    })) || [];

    return c.json({
      success: true,
      data: {
        suggestion: {
          ...suggestion,
          lines: enrichedLines,
        },
      },
    });
  } catch (error) {
    console.error('AI Booking Suggestion Error:', error);
    throw new AppError('Buchungsvorschlag fehlgeschlagen', 500, 'AI_ERROR');
  }
});

// POST /ai/chat - KI-Assistent Chat
aiRouter.post('/chat', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    message: z.string().min(1),
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).optional(),
    context: z.object({
      currentPage: z.string().optional(),
      selectedEntity: z.string().optional(),
      selectedEntityType: z.string().optional(),
    }).optional(),
  });

  const data = schema.parse(body);

  // Organisation laden
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  const systemPrompt = CHAT_ASSISTANT_PROMPT
    .replace('{{organizationName}}', organization?.name || 'Unbekannt')
    .replace('{{legalForm}}', organization?.legalForm || 'Unbekannt')
    .replace('{{chartOfAccounts}}', organization?.chartOfAccounts || 'SKR03')
    .replace('{{smallBusiness}}', organization?.smallBusiness ? 'Ja' : 'Nein');

  // Konversationshistorie aufbauen
  const messages: any[] = data.conversationHistory?.map(msg => ({
    role: msg.role,
    content: msg.content,
  })) || [];

  messages.push({ role: 'user', content: data.message });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return c.json({
      success: true,
      data: {
        message: responseText,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    throw new AppError('KI-Assistent nicht verfügbar', 500, 'AI_ERROR');
  }
});

// POST /ai/categorize-transaction - Bankumsatz kategorisieren
aiRouter.post('/categorize-transaction', async (c) => {
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    transactionId: z.string().optional(),
    amount: z.number(),
    reference: z.string(),
    counterpartyName: z.string().optional(),
    counterpartyIban: z.string().optional(),
    date: z.string(),
  });

  const data = schema.parse(body);

  // Ähnliche Transaktionen finden für Lerneffekt
  const similarTransactions = await prisma.bankTransaction.findMany({
    where: {
      bankAccount: { organizationId },
      status: 'BOOKED',
      OR: [
        { counterpartyName: { contains: data.counterpartyName || '', mode: 'insensitive' } },
        { reference: { contains: data.reference.substring(0, 20), mode: 'insensitive' } },
      ],
    },
    include: {
      booking: {
        include: {
          lines: {
            include: {
              debitAccount: true,
              creditAccount: true,
            },
          },
        },
      },
      contact: true,
    },
    take: 5,
    orderBy: { date: 'desc' },
  });

  const prompt = `
Du bist ein Experte für die Kategorisierung von Bankumsätzen in der deutschen Buchhaltung.

Transaktion:
- Betrag: ${data.amount} EUR
- Verwendungszweck: ${data.reference}
- Gegenkonto: ${data.counterpartyName || 'Unbekannt'}
- IBAN: ${data.counterpartyIban || 'Unbekannt'}
- Datum: ${data.date}

${similarTransactions.length > 0 ? `
Ähnliche bereits gebuchte Transaktionen:
${similarTransactions.map(t => `- ${t.reference}: ${t.booking?.lines[0]?.debitAccount?.name} / ${t.booking?.lines[0]?.creditAccount?.name}`).join('\n')}
` : ''}

Kategorisiere die Transaktion und schlage Buchungskonten vor.

Antworte mit JSON:
{
  "category": "Kategorie (z.B. Miete, Gehalt, Wareneinkauf, etc.)",
  "suggested_debit_account": "Kontonummer Soll",
  "suggested_credit_account": "Kontonummer Haben",
  "suggested_contact_name": "Name des Geschäftspartners",
  "is_recurring": true/false,
  "confidence": 0-1,
  "explanation": "Kurze Erklärung"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError('Kategorisierung fehlgeschlagen', 500, 'AI_PARSE_ERROR');
    }

    const categorization = JSON.parse(jsonMatch[0]);

    // Transaktion aktualisieren wenn ID angegeben
    if (data.transactionId) {
      await prisma.bankTransaction.update({
        where: { id: data.transactionId },
        data: {
          aiCategory: categorization.category,
          aiConfidence: categorization.confidence,
          aiSuggestions: categorization as any,
        },
      });
    }

    return c.json({
      success: true,
      data: categorization,
    });
  } catch (error) {
    console.error('AI Categorization Error:', error);
    throw new AppError('Kategorisierung fehlgeschlagen', 500, 'AI_ERROR');
  }
});

// POST /ai/explain-account - Konto erklären
aiRouter.post('/explain-account', async (c) => {
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    accountNumber: z.string(),
  });

  const data = schema.parse(body);

  const account = await prisma.account.findFirst({
    where: { organizationId, accountNumber: data.accountNumber },
  });

  if (!account) {
    throw new NotFoundError('Konto');
  }

  const prompt = `
Erkläre das folgende Buchhaltungskonto aus dem SKR03 für einen Einsteiger:

Kontonummer: ${account.accountNumber}
Kontoname: ${account.name}
Typ: ${account.type}
Kategorie: ${account.category}

Gib eine verständliche Erklärung mit:
1. Wofür wird das Konto verwendet?
2. Typische Buchungen auf diesem Konto (Soll/Haben)
3. Ein praktisches Beispiel
4. Steuerliche Relevanz (falls zutreffend)

Antworte prägnant und verständlich.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    const explanation = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return c.json({
      success: true,
      data: {
        account,
        explanation,
      },
    });
  } catch (error) {
    console.error('AI Explain Error:', error);
    throw new AppError('Erklärung nicht verfügbar', 500, 'AI_ERROR');
  }
});

export { aiRouter };
