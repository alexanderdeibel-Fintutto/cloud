import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '@fintutto/database';
import { subDays, startOfMonth, endOfMonth, startOfYear, format } from 'date-fns';

const dashboardRouter = new Hono();

// GET /dashboard - Dashboard-Übersicht
dashboardRouter.get('/', async (c) => {
  const organizationId = c.get('organizationId');

  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const yearStart = startOfYear(today);

  // Parallele Abfragen für bessere Performance
  const [
    organization,
    openInvoices,
    overdueInvoices,
    pendingReceipts,
    recentBookings,
    bankBalance,
    monthlyRevenue,
    monthlyExpenses,
    recentActivity,
  ] = await Promise.all([
    // Organisation
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
        legalForm: true,
        onboardingCompleted: true,
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'TRIAL'] } },
          take: 1,
        },
      },
    }),

    // Offene Rechnungen
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL_PAID'] },
      },
      _count: { id: true },
      _sum: { grossAmount: true, paidAmount: true },
    }),

    // Überfällige Rechnungen
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL_PAID'] },
        dueDate: { lt: today },
      },
      _count: { id: true },
      _sum: { grossAmount: true, paidAmount: true },
    }),

    // Ausstehende Belege
    prisma.receipt.count({
      where: {
        organizationId,
        status: { in: ['PENDING', 'RECOGNIZED'] },
      },
    }),

    // Letzte Buchungen
    prisma.booking.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        bookingNumber: true,
        bookingDate: true,
        description: true,
        amount: true,
        type: true,
      },
    }),

    // Bankkonten-Saldo
    prisma.bankTransaction.aggregate({
      where: {
        bankAccount: { organizationId },
      },
      _sum: { amount: true },
    }),

    // Monatlicher Umsatz
    prisma.bookingLine.aggregate({
      where: {
        booking: {
          organizationId,
          status: 'POSTED',
          bookingDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        creditAccount: {
          type: 'REVENUE',
        },
      },
      _sum: { amount: true },
    }),

    // Monatliche Ausgaben
    prisma.bookingLine.aggregate({
      where: {
        booking: {
          organizationId,
          status: 'POSTED',
          bookingDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        debitAccount: {
          type: 'EXPENSE',
        },
      },
      _sum: { amount: true },
    }),

    // Letzte Aktivitäten
    prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        entityType: true,
        createdAt: true,
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
  ]);

  const openAmount = Number(openInvoices._sum.grossAmount || 0) - Number(openInvoices._sum.paidAmount || 0);
  const overdueAmount = Number(overdueInvoices._sum.grossAmount || 0) - Number(overdueInvoices._sum.paidAmount || 0);

  return c.json({
    success: true,
    data: {
      organization: {
        name: organization?.name,
        legalForm: organization?.legalForm,
        onboardingCompleted: organization?.onboardingCompleted,
        subscription: organization?.subscriptions[0] || null,
      },
      kpis: {
        openInvoices: {
          count: openInvoices._count.id,
          amount: openAmount,
        },
        overdueInvoices: {
          count: overdueInvoices._count.id,
          amount: overdueAmount,
        },
        pendingReceipts: pendingReceipts,
        bankBalance: Number(bankBalance._sum.amount || 0),
        monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
        monthlyExpenses: Number(monthlyExpenses._sum.amount || 0),
        monthlyProfit: Number(monthlyRevenue._sum.amount || 0) - Number(monthlyExpenses._sum.amount || 0),
      },
      recentBookings,
      recentActivity: recentActivity.map(a => ({
        ...a,
        userName: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System',
      })),
    },
  });
});

// GET /dashboard/cashflow - Cashflow-Übersicht
dashboardRouter.get('/cashflow', async (c) => {
  const organizationId = c.get('organizationId');
  const query = z.object({
    months: z.coerce.number().default(6),
  }).parse(c.req.query());

  const today = new Date();
  const monthlyData: any[] = [];

  for (let i = query.months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const [income, expenses] = await Promise.all([
      prisma.bookingLine.aggregate({
        where: {
          booking: {
            organizationId,
            status: 'POSTED',
            bookingDate: { gte: monthStart, lte: monthEnd },
          },
          creditAccount: { type: 'REVENUE' },
        },
        _sum: { amount: true },
      }),
      prisma.bookingLine.aggregate({
        where: {
          booking: {
            organizationId,
            status: 'POSTED',
            bookingDate: { gte: monthStart, lte: monthEnd },
          },
          debitAccount: { type: 'EXPENSE' },
        },
        _sum: { amount: true },
      }),
    ]);

    monthlyData.push({
      month: format(date, 'yyyy-MM'),
      label: format(date, 'MMM yyyy'),
      income: Number(income._sum.amount || 0),
      expenses: Number(expenses._sum.amount || 0),
      profit: Number(income._sum.amount || 0) - Number(expenses._sum.amount || 0),
    });
  }

  return c.json({
    success: true,
    data: monthlyData,
  });
});

// GET /dashboard/revenue-breakdown - Umsatz nach Kategorien
dashboardRouter.get('/revenue-breakdown', async (c) => {
  const organizationId = c.get('organizationId');
  const query = z.object({
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
  }).parse(c.req.query());

  const periodStart = query.periodStart ? new Date(query.periodStart) : startOfYear(new Date());
  const periodEnd = query.periodEnd ? new Date(query.periodEnd) : new Date();

  const revenueByAccount = await prisma.bookingLine.groupBy({
    by: ['creditAccountId'],
    where: {
      booking: {
        organizationId,
        status: 'POSTED',
        bookingDate: { gte: periodStart, lte: periodEnd },
      },
      creditAccount: { type: 'REVENUE' },
    },
    _sum: { amount: true },
  });

  // Account-Details laden
  const accountIds = revenueByAccount.map(r => r.creditAccountId);
  const accounts = await prisma.account.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, accountNumber: true, name: true, category: true },
  });

  const accountMap = new Map(accounts.map(a => [a.id, a]));

  const breakdown = revenueByAccount
    .map(r => ({
      account: accountMap.get(r.creditAccountId),
      amount: Number(r._sum.amount || 0),
    }))
    .sort((a, b) => b.amount - a.amount);

  const total = breakdown.reduce((sum, b) => sum + b.amount, 0);

  return c.json({
    success: true,
    data: {
      breakdown: breakdown.map(b => ({
        ...b,
        percentage: total > 0 ? (b.amount / total) * 100 : 0,
      })),
      total,
    },
  });
});

// GET /dashboard/expense-breakdown - Ausgaben nach Kategorien
dashboardRouter.get('/expense-breakdown', async (c) => {
  const organizationId = c.get('organizationId');
  const query = z.object({
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
  }).parse(c.req.query());

  const periodStart = query.periodStart ? new Date(query.periodStart) : startOfYear(new Date());
  const periodEnd = query.periodEnd ? new Date(query.periodEnd) : new Date();

  const expensesByCategory = await prisma.bookingLine.groupBy({
    by: ['debitAccountId'],
    where: {
      booking: {
        organizationId,
        status: 'POSTED',
        bookingDate: { gte: periodStart, lte: periodEnd },
      },
      debitAccount: { type: 'EXPENSE' },
    },
    _sum: { amount: true },
  });

  const accountIds = expensesByCategory.map(e => e.debitAccountId);
  const accounts = await prisma.account.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, accountNumber: true, name: true, category: true },
  });

  const accountMap = new Map(accounts.map(a => [a.id, a]));

  // Nach Kategorie gruppieren
  const categoryTotals = new Map<string, { category: string; amount: number; accounts: any[] }>();

  for (const expense of expensesByCategory) {
    const account = accountMap.get(expense.debitAccountId);
    if (!account) continue;

    const cat = account.category;
    if (!categoryTotals.has(cat)) {
      categoryTotals.set(cat, { category: cat, amount: 0, accounts: [] });
    }

    const entry = categoryTotals.get(cat)!;
    entry.amount += Number(expense._sum.amount || 0);
    entry.accounts.push({
      ...account,
      amount: Number(expense._sum.amount || 0),
    });
  }

  const breakdown = Array.from(categoryTotals.values())
    .sort((a, b) => b.amount - a.amount);

  const total = breakdown.reduce((sum, b) => sum + b.amount, 0);

  return c.json({
    success: true,
    data: {
      breakdown: breakdown.map(b => ({
        ...b,
        percentage: total > 0 ? (b.amount / total) * 100 : 0,
      })),
      total,
    },
  });
});

// GET /dashboard/open-items - Offene Posten
dashboardRouter.get('/open-items', async (c) => {
  const organizationId = c.get('organizationId');

  const [receivables, payables] = await Promise.all([
    // Offene Forderungen (Ausgangsrechnungen)
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL_PAID', 'OVERDUE'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        grossAmount: true,
        paidAmount: true,
        status: true,
        contact: {
          select: { companyName: true, lastName: true },
        },
      },
    }),

    // Offene Verbindlichkeiten (Eingangsrechnungen)
    prisma.receipt.findMany({
      where: {
        organizationId,
        type: 'INCOMING_INVOICE',
        status: { in: ['VERIFIED'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
      select: {
        id: true,
        receiptNumber: true,
        receiptDate: true,
        dueDate: true,
        grossAmount: true,
        status: true,
        contact: {
          select: { companyName: true, lastName: true },
        },
      },
    }),
  ]);

  const today = new Date();

  return c.json({
    success: true,
    data: {
      receivables: receivables.map(r => ({
        ...r,
        openAmount: Number(r.grossAmount) - Number(r.paidAmount),
        isOverdue: r.dueDate < today,
        daysOverdue: r.dueDate < today
          ? Math.floor((today.getTime() - r.dueDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      })),
      payables: payables.map(p => ({
        ...p,
        isOverdue: p.dueDate && p.dueDate < today,
        daysOverdue: p.dueDate && p.dueDate < today
          ? Math.floor((today.getTime() - p.dueDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      })),
      totals: {
        receivables: receivables.reduce((sum, r) => sum + Number(r.grossAmount) - Number(r.paidAmount), 0),
        payables: payables.reduce((sum, p) => sum + Number(p.grossAmount), 0),
      },
    },
  });
});

// GET /dashboard/tax-preview - Steuer-Vorschau
dashboardRouter.get('/tax-preview', async (c) => {
  const organizationId = c.get('organizationId');

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // USt-Zahllast für aktuellen Monat schätzen
  const [outputVat, inputVat] = await Promise.all([
    prisma.bookingLine.aggregate({
      where: {
        booking: {
          organizationId,
          status: 'POSTED',
          bookingDate: { gte: monthStart, lte: monthEnd },
        },
        taxAmount: { not: null },
        creditAccount: { type: 'REVENUE' },
      },
      _sum: { taxAmount: true },
    }),
    prisma.bookingLine.aggregate({
      where: {
        booking: {
          organizationId,
          status: 'POSTED',
          bookingDate: { gte: monthStart, lte: monthEnd },
        },
        taxAmount: { not: null },
        debitAccount: { type: 'EXPENSE' },
      },
      _sum: { taxAmount: true },
    }),
  ]);

  const vatPayable = Number(outputVat._sum.taxAmount || 0) - Number(inputVat._sum.taxAmount || 0);

  return c.json({
    success: true,
    data: {
      period: {
        start: monthStart,
        end: monthEnd,
        label: format(today, 'MMMM yyyy'),
      },
      outputVat: Number(outputVat._sum.taxAmount || 0),
      inputVat: Number(inputVat._sum.taxAmount || 0),
      vatPayable,
      note: vatPayable > 0
        ? 'Voraussichtliche USt-Zahllast'
        : 'Voraussichtlicher Vorsteuer-Überhang',
    },
  });
});

// GET /dashboard/todos - Aufgaben/Erinnerungen
dashboardRouter.get('/todos', async (c) => {
  const organizationId = c.get('organizationId');

  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    pendingReceipts,
    dueInvoices,
    overdueInvoices,
    unprocessedTransactions,
  ] = await Promise.all([
    prisma.receipt.count({
      where: {
        organizationId,
        status: { in: ['PENDING', 'RECOGNIZED'] },
      },
    }),
    prisma.invoice.count({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL_PAID'] },
        dueDate: { gte: today, lte: sevenDaysFromNow },
      },
    }),
    prisma.invoice.count({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL_PAID'] },
        dueDate: { lt: today },
      },
    }),
    prisma.bankTransaction.count({
      where: {
        bankAccount: { organizationId },
        status: 'UNPROCESSED',
      },
    }),
  ]);

  const todos = [];

  if (pendingReceipts > 0) {
    todos.push({
      type: 'receipts',
      priority: 'medium',
      title: `${pendingReceipts} Beleg${pendingReceipts > 1 ? 'e' : ''} zu verarbeiten`,
      action: '/receipts?status=PENDING',
    });
  }

  if (overdueInvoices > 0) {
    todos.push({
      type: 'invoices',
      priority: 'high',
      title: `${overdueInvoices} überfällige Rechnung${overdueInvoices > 1 ? 'en' : ''}`,
      action: '/invoices?status=OVERDUE',
    });
  }

  if (dueInvoices > 0) {
    todos.push({
      type: 'invoices',
      priority: 'medium',
      title: `${dueInvoices} Rechnung${dueInvoices > 1 ? 'en' : ''} wird in 7 Tagen fällig`,
      action: '/invoices?dueSoon=true',
    });
  }

  if (unprocessedTransactions > 0) {
    todos.push({
      type: 'bank',
      priority: 'low',
      title: `${unprocessedTransactions} Bankumsätz${unprocessedTransactions > 1 ? 'e' : ''} zu verarbeiten`,
      action: '/bank-accounts',
    });
  }

  return c.json({
    success: true,
    data: todos,
  });
});

export { dashboardRouter };
