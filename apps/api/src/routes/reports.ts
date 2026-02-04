import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, ReportType, AccountType } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';
import { generateReportPdf } from '../services/pdf';

const reportsRouter = new Hono();

// GET /reports - Berichte auflisten
reportsRouter.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  const query = z.object({
    type: z.nativeEnum(ReportType).optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
  }).parse(c.req.query());

  const where: any = { organizationId };
  if (query.type) where.type = query.type;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.report.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      reports,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
});

// POST /reports/bwa - BWA generieren
reportsRouter.post('/bwa', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    periodStart: z.string().transform(s => new Date(s)),
    periodEnd: z.string().transform(s => new Date(s)),
    compareWithPreviousPeriod: z.boolean().default(false),
    comparePeriodStart: z.string().transform(s => new Date(s)).optional(),
    comparePeriodEnd: z.string().transform(s => new Date(s)).optional(),
  });

  const data = schema.parse(body);

  // Buchungszeilen für den Zeitraum aggregieren
  const bookingLines = await prisma.bookingLine.findMany({
    where: {
      booking: {
        organizationId,
        status: { in: ['POSTED', 'REVERSED'] },
        bookingDate: {
          gte: data.periodStart,
          lte: data.periodEnd,
        },
      },
    },
    include: {
      debitAccount: true,
      creditAccount: true,
    },
  });

  // BWA-Struktur berechnen
  const bwaData = calculateBWA(bookingLines);

  // Vergleichsperiode
  let compareData = null;
  if (data.compareWithPreviousPeriod && data.comparePeriodStart && data.comparePeriodEnd) {
    const compareLines = await prisma.bookingLine.findMany({
      where: {
        booking: {
          organizationId,
          status: { in: ['POSTED', 'REVERSED'] },
          bookingDate: {
            gte: data.comparePeriodStart,
            lte: data.comparePeriodEnd,
          },
        },
      },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    });
    compareData = calculateBWA(compareLines);
  }

  // Bericht speichern
  const report = await prisma.report.create({
    data: {
      organizationId,
      name: `BWA ${data.periodStart.toLocaleDateString('de-DE')} - ${data.periodEnd.toLocaleDateString('de-DE')}`,
      type: 'BWA',
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      data: { current: bwaData, compare: compareData } as any,
    },
  });

  return c.json({
    success: true,
    data: {
      reportId: report.id,
      bwa: bwaData,
      compare: compareData,
    },
  });
});

// POST /reports/balance-sheet - Bilanz generieren
reportsRouter.post('/balance-sheet', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    date: z.string().transform(s => new Date(s)),
  });

  const data = schema.parse(body);

  // Alle Buchungen bis zum Stichtag
  const bookingLines = await prisma.bookingLine.findMany({
    where: {
      booking: {
        organizationId,
        status: { in: ['POSTED', 'REVERSED'] },
        bookingDate: { lte: data.date },
      },
    },
    include: {
      debitAccount: true,
      creditAccount: true,
    },
  });

  // Kontosalden berechnen
  const accountBalances = new Map<string, { account: any; balance: number }>();

  for (const line of bookingLines) {
    const amount = Number(line.amount);

    // Soll-Konto
    if (!accountBalances.has(line.debitAccountId)) {
      accountBalances.set(line.debitAccountId, { account: line.debitAccount, balance: 0 });
    }
    const debitEntry = accountBalances.get(line.debitAccountId)!;
    debitEntry.balance += ['ASSET', 'EXPENSE'].includes(line.debitAccount.type) ? amount : -amount;

    // Haben-Konto
    if (!accountBalances.has(line.creditAccountId)) {
      accountBalances.set(line.creditAccountId, { account: line.creditAccount, balance: 0 });
    }
    const creditEntry = accountBalances.get(line.creditAccountId)!;
    creditEntry.balance += ['LIABILITY', 'EQUITY', 'REVENUE'].includes(line.creditAccount.type) ? amount : -amount;
  }

  // Nach Bilanzstruktur gruppieren
  const balanceSheet = {
    assets: {
      fixed: [] as any[],    // Anlagevermögen
      current: [] as any[],  // Umlaufvermögen
      total: 0,
    },
    liabilities: {
      equity: [] as any[],      // Eigenkapital
      provisions: [] as any[],  // Rückstellungen
      debts: [] as any[],       // Verbindlichkeiten
      total: 0,
    },
    balanced: false,
  };

  for (const [_, { account, balance }] of accountBalances) {
    if (Math.abs(balance) < 0.01) continue;

    const entry = { accountNumber: account.accountNumber, name: account.name, balance };

    if (account.type === 'ASSET') {
      if (['FIXED_ASSETS'].includes(account.category)) {
        balanceSheet.assets.fixed.push(entry);
      } else {
        balanceSheet.assets.current.push(entry);
      }
      balanceSheet.assets.total += balance;
    } else if (account.type === 'LIABILITY') {
      if (account.category === 'PROVISIONS') {
        balanceSheet.liabilities.provisions.push(entry);
      } else {
        balanceSheet.liabilities.debts.push(entry);
      }
      balanceSheet.liabilities.total += balance;
    } else if (account.type === 'EQUITY') {
      balanceSheet.liabilities.equity.push(entry);
      balanceSheet.liabilities.total += balance;
    }
  }

  balanceSheet.balanced = Math.abs(balanceSheet.assets.total - balanceSheet.liabilities.total) < 0.01;

  // Bericht speichern
  const report = await prisma.report.create({
    data: {
      organizationId,
      name: `Bilanz zum ${data.date.toLocaleDateString('de-DE')}`,
      type: 'BALANCE_SHEET',
      periodStart: new Date(data.date.getFullYear(), 0, 1),
      periodEnd: data.date,
      data: balanceSheet as any,
    },
  });

  return c.json({
    success: true,
    data: {
      reportId: report.id,
      balanceSheet,
    },
  });
});

// POST /reports/income-statement - GuV generieren
reportsRouter.post('/income-statement', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    periodStart: z.string().transform(s => new Date(s)),
    periodEnd: z.string().transform(s => new Date(s)),
  });

  const data = schema.parse(body);

  const bookingLines = await prisma.bookingLine.findMany({
    where: {
      booking: {
        organizationId,
        status: { in: ['POSTED', 'REVERSED'] },
        bookingDate: {
          gte: data.periodStart,
          lte: data.periodEnd,
        },
      },
    },
    include: {
      debitAccount: true,
      creditAccount: true,
    },
  });

  // GuV-Struktur
  const incomeStatement = {
    revenue: [] as any[],
    expenses: [] as any[],
    totalRevenue: 0,
    totalExpenses: 0,
    operatingResult: 0,
    financialResult: 0,
    extraordinaryResult: 0,
    taxExpense: 0,
    netIncome: 0,
  };

  const accountTotals = new Map<string, { account: any; total: number }>();

  for (const line of bookingLines) {
    const amount = Number(line.amount);

    // Ertragskonten (Haben-Seite)
    if (line.creditAccount.type === 'REVENUE') {
      const key = line.creditAccountId;
      if (!accountTotals.has(key)) {
        accountTotals.set(key, { account: line.creditAccount, total: 0 });
      }
      accountTotals.get(key)!.total += amount;
    }

    // Aufwandskonten (Soll-Seite)
    if (line.debitAccount.type === 'EXPENSE') {
      const key = line.debitAccountId;
      if (!accountTotals.has(key)) {
        accountTotals.set(key, { account: line.debitAccount, total: 0 });
      }
      accountTotals.get(key)!.total += amount;
    }
  }

  for (const [_, { account, total }] of accountTotals) {
    if (Math.abs(total) < 0.01) continue;

    const entry = { accountNumber: account.accountNumber, name: account.name, amount: total };

    if (account.type === 'REVENUE') {
      incomeStatement.revenue.push(entry);
      incomeStatement.totalRevenue += total;
    } else {
      incomeStatement.expenses.push(entry);
      incomeStatement.totalExpenses += total;

      if (account.category === 'TAXES') {
        incomeStatement.taxExpense += total;
      } else if (account.category === 'INTEREST') {
        incomeStatement.financialResult -= total;
      }
    }
  }

  incomeStatement.operatingResult = incomeStatement.totalRevenue - incomeStatement.totalExpenses + incomeStatement.taxExpense;
  incomeStatement.netIncome = incomeStatement.totalRevenue - incomeStatement.totalExpenses;

  // Bericht speichern
  const report = await prisma.report.create({
    data: {
      organizationId,
      name: `GuV ${data.periodStart.toLocaleDateString('de-DE')} - ${data.periodEnd.toLocaleDateString('de-DE')}`,
      type: 'INCOME_STATEMENT',
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      data: incomeStatement as any,
    },
  });

  return c.json({
    success: true,
    data: {
      reportId: report.id,
      incomeStatement,
    },
  });
});

// POST /reports/vat - UStVA generieren
reportsRouter.post('/vat', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    year: z.number(),
    month: z.number().min(1).max(12).optional(),
    quarter: z.number().min(1).max(4).optional(),
  });

  const data = schema.parse(body);

  let periodStart: Date;
  let periodEnd: Date;

  if (data.month) {
    periodStart = new Date(data.year, data.month - 1, 1);
    periodEnd = new Date(data.year, data.month, 0);
  } else if (data.quarter) {
    periodStart = new Date(data.year, (data.quarter - 1) * 3, 1);
    periodEnd = new Date(data.year, data.quarter * 3, 0);
  } else {
    periodStart = new Date(data.year, 0, 1);
    periodEnd = new Date(data.year, 11, 31);
  }

  // Buchungen mit Steuer laden
  const bookingLines = await prisma.bookingLine.findMany({
    where: {
      booking: {
        organizationId,
        status: { in: ['POSTED', 'REVERSED'] },
        bookingDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      OR: [
        { taxRate: { not: null } },
        { taxAmount: { not: null } },
      ],
    },
    include: {
      debitAccount: true,
      creditAccount: true,
      booking: { select: { bookingDate: true } },
    },
  });

  // UStVA-Kennzahlen berechnen
  const vatReport = {
    period: {
      year: data.year,
      month: data.month,
      quarter: data.quarter,
      start: periodStart,
      end: periodEnd,
    },
    // Umsätze
    kz81: 0, // Steuerpflichtige Umsätze 19%
    kz86: 0, // Steuerpflichtige Umsätze 7%
    kz35: 0, // Steuerfreie Umsätze
    kz21: 0, // Innergemeinschaftliche Lieferungen
    // Vorsteuer
    kz66: 0, // Vorsteuer 19%
    kz67: 0, // Vorsteuer 7%
    // Berechnet
    outputVat19: 0,
    outputVat7: 0,
    inputVat: 0,
    vatPayable: 0,
  };

  for (const line of bookingLines) {
    const amount = Number(line.amount);
    const taxAmount = Number(line.taxAmount || 0);
    const taxRate = Number(line.taxRate || 0);

    // Erlöskonten -> Umsatzsteuer
    if (line.creditAccount.type === 'REVENUE') {
      if (taxRate === 19) {
        vatReport.kz81 += amount;
        vatReport.outputVat19 += taxAmount;
      } else if (taxRate === 7) {
        vatReport.kz86 += amount;
        vatReport.outputVat7 += taxAmount;
      } else if (taxRate === 0) {
        vatReport.kz35 += amount;
      }
    }

    // Aufwandskonten -> Vorsteuer
    if (line.debitAccount.type === 'EXPENSE' && taxAmount > 0) {
      vatReport.inputVat += taxAmount;
      if (taxRate === 19) {
        vatReport.kz66 += taxAmount;
      } else if (taxRate === 7) {
        vatReport.kz67 += taxAmount;
      }
    }
  }

  vatReport.vatPayable = vatReport.outputVat19 + vatReport.outputVat7 - vatReport.inputVat;

  // Bericht speichern
  const report = await prisma.report.create({
    data: {
      organizationId,
      name: `UStVA ${data.month ? `${data.month}/${data.year}` : data.quarter ? `Q${data.quarter}/${data.year}` : data.year}`,
      type: 'VAT_REPORT',
      periodStart,
      periodEnd,
      data: vatReport as any,
    },
  });

  return c.json({
    success: true,
    data: {
      reportId: report.id,
      vatReport,
    },
  });
});

// GET /reports/:id - Bericht abrufen
reportsRouter.get('/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const report = await prisma.report.findFirst({
    where: { id, organizationId },
  });

  if (!report) {
    throw new NotFoundError('Bericht');
  }

  return c.json({
    success: true,
    data: report,
  });
});

// POST /reports/:id/pdf - Bericht als PDF
reportsRouter.post('/:id/pdf', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const report = await prisma.report.findFirst({
    where: { id, organizationId },
    include: { organization: true },
  });

  if (!report) {
    throw new NotFoundError('Bericht');
  }

  const pdfUrl = await generateReportPdf(report);

  await prisma.report.update({
    where: { id },
    data: { pdfUrl },
  });

  return c.json({
    success: true,
    data: { pdfUrl },
  });
});

// Helper: BWA berechnen
function calculateBWA(bookingLines: any[]) {
  const bwa = {
    // Betriebsleistung
    revenue: 0,
    inventoryChanges: 0,
    ownWork: 0,
    totalOperatingPerformance: 0,

    // Materialaufwand
    materialCosts: 0,
    externalServices: 0,
    totalMaterialCosts: 0,

    grossProfit: 0,
    grossProfitMargin: 0,

    // Personalkosten
    personnelCosts: 0,

    // Sonstige betriebliche Aufwendungen
    otherOperatingExpenses: 0,
    depreciation: 0,
    interestExpense: 0,
    taxes: 0,

    operatingResult: 0,
    netIncome: 0,

    // Detailaufstellung
    details: [] as any[],
  };

  const categoryTotals = new Map<string, number>();

  for (const line of bookingLines) {
    const amount = Number(line.amount);
    const debitCat = line.debitAccount.category;
    const creditCat = line.creditAccount.category;

    // Erträge (Haben-Seite)
    if (line.creditAccount.type === 'REVENUE') {
      if (creditCat === 'SALES') {
        bwa.revenue += amount;
      }
      categoryTotals.set(creditCat, (categoryTotals.get(creditCat) || 0) + amount);
    }

    // Aufwendungen (Soll-Seite)
    if (line.debitAccount.type === 'EXPENSE') {
      switch (debitCat) {
        case 'MATERIAL_COSTS':
          bwa.materialCosts += amount;
          break;
        case 'PERSONNEL_COSTS':
          bwa.personnelCosts += amount;
          break;
        case 'DEPRECIATION':
          bwa.depreciation += amount;
          break;
        case 'INTEREST':
          bwa.interestExpense += amount;
          break;
        case 'TAXES':
          bwa.taxes += amount;
          break;
        default:
          bwa.otherOperatingExpenses += amount;
      }
      categoryTotals.set(debitCat, (categoryTotals.get(debitCat) || 0) + amount);
    }
  }

  bwa.totalOperatingPerformance = bwa.revenue + bwa.inventoryChanges + bwa.ownWork;
  bwa.totalMaterialCosts = bwa.materialCosts + bwa.externalServices;
  bwa.grossProfit = bwa.totalOperatingPerformance - bwa.totalMaterialCosts;
  bwa.grossProfitMargin = bwa.totalOperatingPerformance > 0
    ? (bwa.grossProfit / bwa.totalOperatingPerformance) * 100
    : 0;

  bwa.operatingResult = bwa.grossProfit - bwa.personnelCosts - bwa.otherOperatingExpenses - bwa.depreciation;
  bwa.netIncome = bwa.operatingResult - bwa.interestExpense - bwa.taxes;

  // Detailaufstellung
  for (const [category, total] of categoryTotals) {
    bwa.details.push({ category, total });
  }

  return bwa;
}

export { reportsRouter };
