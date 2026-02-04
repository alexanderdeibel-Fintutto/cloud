import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, AccountType, AccountCategory } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';

const accountsRouter = new Hono();

// Schemas
const createAccountSchema = z.object({
  accountNumber: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(AccountType),
  category: z.nativeEnum(AccountCategory),
  parentId: z.string().optional(),
  taxRate: z.number().optional(),
  autoBooking: z.boolean().default(false),
  defaultCostCenter: z.string().optional(),
});

const updateAccountSchema = createAccountSchema.partial();

// GET /accounts - Konten auflisten
accountsRouter.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  const query = z.object({
    type: z.nativeEnum(AccountType).optional(),
    category: z.nativeEnum(AccountCategory).optional(),
    search: z.string().optional(),
    includeInactive: z.coerce.boolean().default(false),
  }).parse(c.req.query());

  const where: any = { organizationId };

  if (!query.includeInactive) {
    where.isActive = true;
  }

  if (query.type) where.type = query.type;
  if (query.category) where.category = query.category;

  if (query.search) {
    where.OR = [
      { accountNumber: { contains: query.search } },
      { name: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const accounts = await prisma.account.findMany({
    where,
    orderBy: { accountNumber: 'asc' },
    include: {
      parent: { select: { id: true, accountNumber: true, name: true } },
      _count: {
        select: {
          debitBookings: true,
          creditBookings: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    data: accounts,
  });
});

// GET /accounts/tree - Kontenplan als Baum
accountsRouter.get('/tree', async (c) => {
  const organizationId = c.get('organizationId');

  const accounts = await prisma.account.findMany({
    where: { organizationId, isActive: true },
    orderBy: { accountNumber: 'asc' },
  });

  // Baum aufbauen
  const buildTree = (parentId: string | null): any[] => {
    return accounts
      .filter(a => a.parentId === parentId)
      .map(account => ({
        ...account,
        children: buildTree(account.id),
      }));
  };

  const tree = buildTree(null);

  // Nach Kontenklassen gruppieren
  const grouped = {
    assets: tree.filter(a => a.type === 'ASSET'),
    liabilities: tree.filter(a => a.type === 'LIABILITY'),
    equity: tree.filter(a => a.type === 'EQUITY'),
    revenue: tree.filter(a => a.type === 'REVENUE'),
    expense: tree.filter(a => a.type === 'EXPENSE'),
  };

  return c.json({
    success: true,
    data: grouped,
  });
});

// POST /accounts - Konto erstellen
accountsRouter.post('/', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();
  const data = createAccountSchema.parse(body);

  // Prüfen ob Kontonummer bereits existiert
  const existing = await prisma.account.findUnique({
    where: {
      organizationId_accountNumber: {
        organizationId,
        accountNumber: data.accountNumber,
      },
    },
  });

  if (existing) {
    throw new AppError('Kontonummer bereits vergeben', 409, 'ACCOUNT_EXISTS');
  }

  const account = await prisma.account.create({
    data: {
      ...data,
      organizationId,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'ACCOUNT_CREATED',
      entityType: 'Account',
      entityId: account.id,
      newData: account as any,
    },
  });

  return c.json({
    success: true,
    message: 'Konto erstellt',
    data: account,
  }, 201);
});

// GET /accounts/:id - Konto abrufen
accountsRouter.get('/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const account = await prisma.account.findFirst({
    where: { id, organizationId },
    include: {
      parent: true,
      children: { orderBy: { accountNumber: 'asc' } },
      bankAccount: true,
    },
  });

  if (!account) {
    throw new NotFoundError('Konto');
  }

  return c.json({
    success: true,
    data: account,
  });
});

// PATCH /accounts/:id - Konto aktualisieren
accountsRouter.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateAccountSchema.parse(body);

  const oldAccount = await prisma.account.findFirst({
    where: { id, organizationId },
  });

  if (!oldAccount) {
    throw new NotFoundError('Konto');
  }

  if (oldAccount.isSystem) {
    throw new AppError('Systemkonten können nicht geändert werden', 400, 'SYSTEM_ACCOUNT');
  }

  const account = await prisma.account.update({
    where: { id },
    data,
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'ACCOUNT_UPDATED',
      entityType: 'Account',
      entityId: id,
      oldData: oldAccount as any,
      newData: account as any,
    },
  });

  return c.json({
    success: true,
    message: 'Konto aktualisiert',
    data: account,
  });
});

// DELETE /accounts/:id - Konto deaktivieren
accountsRouter.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const account = await prisma.account.findFirst({
    where: { id, organizationId },
    include: {
      _count: {
        select: { debitBookings: true, creditBookings: true },
      },
    },
  });

  if (!account) {
    throw new NotFoundError('Konto');
  }

  if (account.isSystem) {
    throw new AppError('Systemkonten können nicht gelöscht werden', 400, 'SYSTEM_ACCOUNT');
  }

  if (account._count.debitBookings > 0 || account._count.creditBookings > 0) {
    // Soft Delete
    await prisma.account.update({
      where: { id },
      data: { isActive: false },
    });
  } else {
    // Hard Delete wenn keine Buchungen
    await prisma.account.delete({ where: { id } });
  }

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'ACCOUNT_DELETED',
      entityType: 'Account',
      entityId: id,
    },
  });

  return c.json({
    success: true,
    message: 'Konto gelöscht',
  });
});

// GET /accounts/:id/balance - Kontosaldo
accountsRouter.get('/:id/balance', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const query = z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }).parse(c.req.query());

  const account = await prisma.account.findFirst({
    where: { id, organizationId },
  });

  if (!account) {
    throw new NotFoundError('Konto');
  }

  const dateFilter: any = {};
  if (query.dateFrom) dateFilter.gte = new Date(query.dateFrom);
  if (query.dateTo) dateFilter.lte = new Date(query.dateTo);

  const where: any = {
    booking: {
      organizationId,
      status: { in: ['POSTED', 'REVERSED'] },
      ...(Object.keys(dateFilter).length > 0 && { bookingDate: dateFilter }),
    },
  };

  const [debitSum, creditSum] = await Promise.all([
    prisma.bookingLine.aggregate({
      where: { ...where, debitAccountId: id },
      _sum: { amount: true },
    }),
    prisma.bookingLine.aggregate({
      where: { ...where, creditAccountId: id },
      _sum: { amount: true },
    }),
  ]);

  const debit = Number(debitSum._sum.amount || 0);
  const credit = Number(creditSum._sum.amount || 0);

  // Saldo berechnen je nach Kontentyp
  const isActiveAccount = ['ASSET', 'EXPENSE'].includes(account.type);
  const balance = isActiveAccount ? debit - credit : credit - debit;

  return c.json({
    success: true,
    data: {
      account,
      debit,
      credit,
      balance,
    },
  });
});

export { accountsRouter };
