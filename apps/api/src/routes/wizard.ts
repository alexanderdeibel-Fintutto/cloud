import { Hono } from 'hono';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { prisma, LegalForm, ChartOfAccountsType, VatPeriod } from '@fintutto/database';
import { AppError } from '../middleware/error';

const wizardRouter = new Hono();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// ========================================
// ONBOARDING WIZARD
// ========================================

// POST /wizard/onboarding/start - Onboarding starten
wizardRouter.post('/onboarding/start', async (c) => {
  const auth = c.get('auth');

  // Prüfen ob User bereits Organisationen hat
  const existingOrgs = await prisma.organizationMember.count({
    where: { userId: auth.userId },
  });

  return c.json({
    success: true,
    data: {
      hasExistingOrganizations: existingOrgs > 0,
      steps: [
        { id: 'company-type', title: 'Unternehmensform', description: 'Wählen Sie Ihre Rechtsform' },
        { id: 'company-info', title: 'Firmendaten', description: 'Grundlegende Informationen' },
        { id: 'tax-settings', title: 'Steuereinstellungen', description: 'USt, Kleinunternehmer, etc.' },
        { id: 'bank-accounts', title: 'Bankverbindungen', description: 'Konten einrichten' },
        { id: 'finish', title: 'Fertigstellen', description: 'Zusammenfassung & Start' },
      ],
      legalForms: Object.values(LegalForm).map(form => ({
        value: form,
        label: getLegalFormLabel(form),
        description: getLegalFormDescription(form),
        isCapitalCompany: isCapitalCompany(form),
      })),
    },
  });
});

// POST /wizard/onboarding/ai-assist - KI-Unterstützung im Onboarding
wizardRouter.post('/onboarding/ai-assist', async (c) => {
  const body = await c.req.json();

  const schema = z.object({
    step: z.string(),
    question: z.string().optional(),
    currentData: z.record(z.any()).optional(),
  });

  const data = schema.parse(body);

  const prompts: Record<string, string> = {
    'company-type': `
Der Nutzer richtet ein neues Unternehmen in einer Buchhaltungssoftware ein.
Er befindet sich im Schritt "Unternehmensform auswählen".

${data.question ? `Seine Frage: ${data.question}` : 'Erkläre kurz die wichtigsten Unterschiede zwischen Kapital- und Personengesellschaften für die Buchhaltung.'}

${data.currentData ? `Aktuelle Auswahl: ${JSON.stringify(data.currentData)}` : ''}

Antworte prägnant und hilfreIch.`,

    'tax-settings': `
Der Nutzer richtet Steuereinstellungen für sein Unternehmen ein.

${data.question ? `Seine Frage: ${data.question}` : ''}

Aktuelle Daten:
${JSON.stringify(data.currentData, null, 2)}

Gib praktische Hinweise zu:
- USt-Voranmeldung (monatlich/quartalsweise)
- Kleinunternehmerregelung (§19 UStG)
- Istversteuerung vs. Sollversteuerung

Antworte prägnant.`,

    'bank-accounts': `
Der Nutzer richtet Bankverbindungen ein.

${data.question ? `Seine Frage: ${data.question}` : 'Gib Tipps zur Organisation von Geschäftskonten.'}

Antworte prägnant mit praktischen Tipps.`,
  };

  const prompt = prompts[data.step] || `
Der Nutzer hat eine Frage im Onboarding-Schritt "${data.step}":
${data.question || 'Keine spezifische Frage'}

Kontext: ${JSON.stringify(data.currentData)}

Hilf dem Nutzer weiter.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'Du bist ein freundlicher Assistent für Fintutto, eine deutsche Buchhaltungssoftware. Hilf Nutzern beim Einrichten ihrer Firma. Antworte immer auf Deutsch, prägnant und verständlich.',
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    const message = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return c.json({
      success: true,
      data: { message },
    });
  } catch (error) {
    console.error('Wizard AI Error:', error);
    return c.json({
      success: true,
      data: {
        message: 'Entschuldigung, der KI-Assistent ist gerade nicht verfügbar. Bitte fahren Sie fort oder kontaktieren Sie unseren Support.',
      },
    });
  }
});

// POST /wizard/onboarding/validate - Schritt validieren
wizardRouter.post('/onboarding/validate', async (c) => {
  const body = await c.req.json();

  const schema = z.object({
    step: z.string(),
    data: z.record(z.any()),
  });

  const { step, data } = schema.parse(body);

  const validations: Record<string, () => { valid: boolean; errors: string[]; warnings: string[] }> = {
    'company-type': () => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!data.legalForm) {
        errors.push('Bitte wählen Sie eine Rechtsform aus.');
      }

      if (data.legalForm === 'EINZELUNTERNEHMEN' && data.employees > 50) {
        warnings.push('Bei dieser Mitarbeiterzahl sollten Sie eine haftungsbeschränkte Rechtsform in Betracht ziehen.');
      }

      return { valid: errors.length === 0, errors, warnings };
    },

    'company-info': () => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!data.name || data.name.length < 2) {
        errors.push('Bitte geben Sie einen Firmennamen ein.');
      }

      if (isCapitalCompany(data.legalForm)) {
        if (!data.tradeRegisterNumber) {
          warnings.push('Die Handelsregisternummer sollte nach der Eintragung ergänzt werden.');
        }
      }

      if (!data.street || !data.postalCode || !data.city) {
        errors.push('Bitte geben Sie eine vollständige Adresse an.');
      }

      return { valid: errors.length === 0, errors, warnings };
    },

    'tax-settings': () => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (data.smallBusiness && isCapitalCompany(data.legalForm)) {
        warnings.push('Kapitalgesellschaften können die Kleinunternehmerregelung nur eingeschränkt nutzen.');
      }

      if (!data.taxId && !data.smallBusiness) {
        warnings.push('Die Steuernummer sollte nach Erhalt vom Finanzamt ergänzt werden.');
      }

      return { valid: errors.length === 0, errors, warnings };
    },

    'bank-accounts': () => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!data.bankAccounts || data.bankAccounts.length === 0) {
        warnings.push('Es wird empfohlen, mindestens ein Geschäftskonto anzulegen.');
      }

      return { valid: errors.length === 0, errors, warnings };
    },
  };

  const validator = validations[step];
  if (!validator) {
    return c.json({
      success: true,
      data: { valid: true, errors: [], warnings: [] },
    });
  }

  return c.json({
    success: true,
    data: validator(),
  });
});

// ========================================
// BUCHUNGS-WIZARD
// ========================================

// POST /wizard/booking/start - Buchungsassistent starten
wizardRouter.post('/booking/start', async (c) => {
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    type: z.enum(['receipt', 'invoice', 'bank-transaction', 'manual']),
    sourceId: z.string().optional(),
  });

  const data = schema.parse(body);

  // Kontext laden
  const [accounts, costCenters, contacts, taxSettings] = await Promise.all([
    prisma.account.findMany({
      where: { organizationId, isActive: true },
      orderBy: { accountNumber: 'asc' },
    }),
    prisma.costCenter.findMany({
      where: { organizationId, isActive: true },
    }),
    prisma.contact.findMany({
      where: { organizationId, isActive: true },
      take: 100,
      orderBy: { companyName: 'asc' },
    }),
    prisma.taxSetting.findMany({
      where: { organizationId, isActive: true },
    }),
  ]);

  // Quelldaten laden wenn vorhanden
  let sourceData: any = null;
  if (data.sourceId) {
    switch (data.type) {
      case 'receipt':
        sourceData = await prisma.receipt.findUnique({
          where: { id: data.sourceId },
          include: { contact: true, lineItems: true },
        });
        break;
      case 'invoice':
        sourceData = await prisma.invoice.findUnique({
          where: { id: data.sourceId },
          include: { contact: true, lineItems: true },
        });
        break;
      case 'bank-transaction':
        sourceData = await prisma.bankTransaction.findUnique({
          where: { id: data.sourceId },
          include: { contact: true },
        });
        break;
    }
  }

  // Häufig verwendete Buchungen laden
  const frequentBookings = await prisma.booking.findMany({
    where: {
      organizationId,
      status: 'POSTED',
      createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    include: {
      lines: {
        include: {
          debitAccount: true,
          creditAccount: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Häufige Konten-Kombinationen ermitteln
  const accountCombinations = frequentBookings.reduce((acc: any[], booking) => {
    booking.lines.forEach(line => {
      const key = `${line.debitAccountId}-${line.creditAccountId}`;
      const existing = acc.find(c => c.key === key);
      if (existing) {
        existing.count++;
      } else {
        acc.push({
          key,
          debitAccount: line.debitAccount,
          creditAccount: line.creditAccount,
          count: 1,
        });
      }
    });
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 5);

  return c.json({
    success: true,
    data: {
      type: data.type,
      sourceData,
      context: {
        accounts,
        costCenters,
        contacts: contacts.slice(0, 50),
        taxSettings,
        frequentCombinations: accountCombinations,
      },
      steps: getBookingWizardSteps(data.type),
    },
  });
});

// POST /wizard/booking/ai-suggest - KI-Buchungsvorschlag im Wizard
wizardRouter.post('/booking/ai-suggest', async (c) => {
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    description: z.string(),
    amount: z.number(),
    type: z.enum(['expense', 'income', 'transfer']),
    taxRate: z.number().optional(),
    contactId: z.string().optional(),
    additionalInfo: z.string().optional(),
  });

  const data = schema.parse(body);

  // Konten laden
  const accounts = await prisma.account.findMany({
    where: { organizationId, isActive: true },
    select: { accountNumber: true, name: true, type: true, category: true },
  });

  // Organisation laden
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { chartOfAccounts: true, smallBusiness: true },
  });

  const prompt = `
Du bist ein erfahrener deutscher Buchhalter. Schlage die passenden Buchungskonten vor.

Buchungsanlass:
- Beschreibung: ${data.description}
- Betrag: ${data.amount} EUR
- Typ: ${data.type === 'expense' ? 'Ausgabe' : data.type === 'income' ? 'Einnahme' : 'Umbuchung'}
- Steuersatz: ${data.taxRate !== undefined ? `${data.taxRate}%` : 'nicht angegeben'}
${data.additionalInfo ? `- Zusatzinfo: ${data.additionalInfo}` : ''}

Kontenrahmen: ${organization?.chartOfAccounts || 'SKR03'}
Kleinunternehmer: ${organization?.smallBusiness ? 'Ja (keine USt)' : 'Nein'}

Antworte mit JSON:
{
  "debit_account": "Kontonummer",
  "credit_account": "Kontonummer",
  "tax_handling": "Erklärung zur Steuer",
  "confidence": 0-1,
  "alternatives": [
    {"debit": "...", "credit": "...", "reason": "..."}
  ],
  "tip": "Praktischer Hinweis für den Nutzer"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const suggestion = JSON.parse(jsonMatch[0]);

    // Konten-Details anreichern
    const accountMap = new Map(accounts.map(a => [a.accountNumber, a]));

    return c.json({
      success: true,
      data: {
        suggestion: {
          ...suggestion,
          debitAccountDetails: accountMap.get(suggestion.debit_account),
          creditAccountDetails: accountMap.get(suggestion.credit_account),
        },
      },
    });
  } catch (error) {
    console.error('Booking AI Error:', error);
    return c.json({
      success: true,
      data: {
        suggestion: null,
        error: 'KI-Vorschlag nicht verfügbar',
      },
    });
  }
});

// ========================================
// BELEG-WIZARD
// ========================================

// POST /wizard/receipt/process - Beleg-Assistent
wizardRouter.post('/receipt/process', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    uploadId: z.string(),
  });

  const data = schema.parse(body);

  // Upload laden
  const upload = await prisma.upload.findUnique({
    where: { id: data.uploadId },
  });

  if (!upload) {
    throw new AppError('Upload nicht gefunden', 404, 'NOT_FOUND');
  }

  // Schritte für den Beleg-Wizard
  const steps = [
    { id: 'scan', title: 'Beleg scannen', status: 'completed' },
    { id: 'recognize', title: 'KI-Erkennung', status: 'in_progress' },
    { id: 'verify', title: 'Daten prüfen', status: 'pending' },
    { id: 'assign', title: 'Zuordnen', status: 'pending' },
    { id: 'book', title: 'Buchen', status: 'pending' },
  ];

  return c.json({
    success: true,
    data: {
      uploadId: upload.id,
      fileUrl: upload.url,
      thumbnailUrl: upload.thumbnailUrl,
      ocrStatus: upload.ocrStatus,
      ocrText: upload.ocrText,
      steps,
    },
  });
});

// ========================================
// HELPER FUNCTIONS
// ========================================

function getLegalFormLabel(form: LegalForm): string {
  const labels: Record<LegalForm, string> = {
    EINZELUNTERNEHMEN: 'Einzelunternehmen',
    GBR: 'GbR (Gesellschaft bürgerlichen Rechts)',
    OHG: 'OHG (Offene Handelsgesellschaft)',
    KG: 'KG (Kommanditgesellschaft)',
    PARTG: 'Partnerschaftsgesellschaft',
    PARTG_MBB: 'PartG mbB',
    GMBH: 'GmbH',
    UG: 'UG (haftungsbeschränkt)',
    AG: 'Aktiengesellschaft',
    KGAA: 'KGaA',
    SE: 'SE (Societas Europaea)',
    GMBH_CO_KG: 'GmbH & Co. KG',
    UG_CO_KG: 'UG & Co. KG',
    AG_CO_KG: 'AG & Co. KG',
    VEREIN: 'Eingetragener Verein (e.V.)',
    STIFTUNG: 'Stiftung',
    GENOSSENSCHAFT: 'Genossenschaft (eG)',
    FREIBERUFLER: 'Freiberufler',
  };
  return labels[form] || form;
}

function getLegalFormDescription(form: LegalForm): string {
  const descriptions: Record<LegalForm, string> = {
    EINZELUNTERNEHMEN: 'Für Selbstständige ohne Partner. Volle Haftung mit Privatvermögen.',
    GBR: 'Einfache Partnerschaft, alle Partner haften voll.',
    OHG: 'Handelsgesellschaft mit voller Haftung aller Gesellschafter.',
    KG: 'Komplementär haftet voll, Kommanditisten nur mit Einlage.',
    PARTG: 'Für Freiberufler wie Anwälte, Ärzte, Steuerberater.',
    PARTG_MBB: 'Partnerschaft mit beschränkter Berufshaftung.',
    GMBH: 'Haftung auf Stammkapital beschränkt (mind. 25.000€).',
    UG: 'Mini-GmbH, ab 1€ Stammkapital möglich.',
    AG: 'Aktiengesellschaft für größere Unternehmen.',
    KGAA: 'Kombination aus KG und AG.',
    SE: 'Europäische Aktiengesellschaft.',
    GMBH_CO_KG: 'Kombiniert Vorteile von GmbH und KG.',
    UG_CO_KG: 'Günstigere Variante der GmbH & Co. KG.',
    AG_CO_KG: 'KG mit AG als Komplementär.',
    VEREIN: 'Für nicht-kommerzielle Zusammenschlüsse.',
    STIFTUNG: 'Vermögen für einen bestimmten Zweck.',
    GENOSSENSCHAFT: 'Gemeinschaftliche Wirtschaft der Mitglieder.',
    FREIBERUFLER: 'Selbstständige Tätigkeit ohne Gewerbeanmeldung.',
  };
  return descriptions[form] || '';
}

function isCapitalCompany(form: LegalForm): boolean {
  return ['GMBH', 'UG', 'AG', 'KGAA', 'SE'].includes(form);
}

function getBookingWizardSteps(type: string): any[] {
  const baseSteps = [
    { id: 'select-accounts', title: 'Konten wählen', description: 'Soll- und Habenkonto auswählen' },
    { id: 'enter-amount', title: 'Betrag eingeben', description: 'Buchungsbetrag und Steuer' },
    { id: 'add-details', title: 'Details', description: 'Beschreibung und Kostenstelle' },
    { id: 'review', title: 'Prüfen', description: 'Buchung überprüfen und bestätigen' },
  ];

  if (type === 'receipt' || type === 'invoice') {
    return [
      { id: 'verify-source', title: 'Beleg prüfen', description: 'Quelldaten verifizieren' },
      ...baseSteps,
    ];
  }

  if (type === 'bank-transaction') {
    return [
      { id: 'match-transaction', title: 'Zuordnen', description: 'Transaktion zuordnen' },
      ...baseSteps,
    ];
  }

  return baseSteps;
}

export { wizardRouter };
