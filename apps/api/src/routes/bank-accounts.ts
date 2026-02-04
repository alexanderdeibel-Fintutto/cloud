import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, TransactionStatus } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';

const bankAccountsRouter = new Hono();

// Schemas
const createBankAccountSchema = z.object({
  name: z.string().min(1),
  iban: z.string().min(15).max(34),
  bic: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string(), // Verknüpftes Buchhaltungskonto
  isDefault: z.boolean().default(false),
});

const updateBankAccountSchema = createBankAccountSchema.partial();

// GET /bank-accounts - Bankkonten auflisten
bankAccountsRouter.get('/', async (c) => {
  const organizationId = c.get('organizationId');

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { organizationId, isActive: true },
    include: {
      account: { select: { id: true, accountNumber: true, name: true } },
      _count: { select: { transactions: true } },
    },
    orderBy: { isDefault: 'desc' },
  });

  return c.json({
    success: true,
    data: bankAccounts,
  });
});

// POST /bank-accounts - Bankkonto erstellen
bankAccountsRouter.post('/', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();
  const data = createBankAccountSchema.parse(body);

  // Buchhaltungskonto finden
  const account = await prisma.account.findFirst({
    where: {
      organizationId,
      accountNumber: data.accountNumber,
      category: 'BANK',
    },
  });

  if (!account) {
    throw new AppError('Buchhaltungskonto nicht gefunden oder kein Bankkonto', 400, 'INVALID_ACCOUNT');
  }

  // Prüfen ob Konto bereits verknüpft
  const existingLink = await prisma.bankAccount.findUnique({
    where: { accountId: account.id },
  });

  if (existingLink) {
    throw new AppError('Buchhaltungskonto bereits mit Bankkonto verknüpft', 409, 'ALREADY_LINKED');
  }

  // Wenn default, andere zurücksetzen
  if (data.isDefault) {
    await prisma.bankAccount.updateMany({
      where: { organizationId },
      data: { isDefault: false },
    });
  }

  const bankAccount = await prisma.bankAccount.create({
    data: {
      organizationId,
      accountId: account.id,
      name: data.name,
      iban: data.iban.replace(/\s/g, '').toUpperCase(),
      bic: data.bic,
      bankName: data.bankName,
      isDefault: data.isDefault,
    },
    include: { account: true },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'BANK_ACCOUNT_CREATED',
      entityType: 'BankAccount',
      entityId: bankAccount.id,
      newData: bankAccount as any,
    },
  });

  return c.json({
    success: true,
    message: 'Bankkonto erstellt',
    data: bankAccount,
  }, 201);
});

// GET /bank-accounts/:id - Bankkonto abrufen
bankAccountsRouter.get('/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
    include: {
      account: true,
      transactions: {
        orderBy: { date: 'desc' },
        take: 50,
        include: {
          contact: { select: { id: true, companyName: true, lastName: true } },
          booking: { select: { id: true, bookingNumber: true } },
        },
      },
    },
  });

  if (!bankAccount) {
    throw new NotFoundError('Bankkonto');
  }

  return c.json({
    success: true,
    data: bankAccount,
  });
});

// PATCH /bank-accounts/:id - Bankkonto aktualisieren
bankAccountsRouter.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateBankAccountSchema.parse(body);

  const oldBankAccount = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!oldBankAccount) {
    throw new NotFoundError('Bankkonto');
  }

  // Wenn default, andere zurücksetzen
  if (data.isDefault) {
    await prisma.bankAccount.updateMany({
      where: { organizationId, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const bankAccount = await prisma.bankAccount.update({
    where: { id },
    data: {
      name: data.name,
      bic: data.bic,
      bankName: data.bankName,
      isDefault: data.isDefault,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'BANK_ACCOUNT_UPDATED',
      entityType: 'BankAccount',
      entityId: id,
      oldData: oldBankAccount as any,
      newData: bankAccount as any,
    },
  });

  return c.json({
    success: true,
    message: 'Bankkonto aktualisiert',
    data: bankAccount,
  });
});

// DELETE /bank-accounts/:id - Bankkonto deaktivieren
bankAccountsRouter.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!bankAccount) {
    throw new NotFoundError('Bankkonto');
  }

  await prisma.bankAccount.update({
    where: { id },
    data: { isActive: false },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'BANK_ACCOUNT_DELETED',
      entityType: 'BankAccount',
      entityId: id,
    },
  });

  return c.json({
    success: true,
    message: 'Bankkonto deaktiviert',
  });
});

// GET /bank-accounts/:id/transactions - Transaktionen abrufen
bankAccountsRouter.get('/:id/transactions', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const query = z.object({
    status: z.nativeEnum(TransactionStatus).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(50),
  }).parse(c.req.query());

  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!bankAccount) {
    throw new NotFoundError('Bankkonto');
  }

  const where: any = { bankAccountId: id };

  if (query.status) where.status = query.status;

  if (query.dateFrom || query.dateTo) {
    where.date = {};
    if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
    if (query.dateTo) where.date.lte = new Date(query.dateTo);
  }

  if (query.search) {
    where.OR = [
      { counterpartyName: { contains: query.search, mode: 'insensitive' } },
      { reference: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.bankTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        contact: { select: { id: true, companyName: true, lastName: true } },
        booking: { select: { id: true, bookingNumber: true, status: true } },
        receipt: { select: { id: true, receiptNumber: true } },
      },
    }),
    prisma.bankTransaction.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      transactions,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
});

// POST /bank-accounts/:id/transactions - Transaktion manuell hinzufügen
bankAccountsRouter.post('/:id/transactions', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const schema = z.object({
    date: z.string().transform(s => new Date(s)),
    valueDate: z.string().transform(s => new Date(s)).optional(),
    amount: z.number(),
    counterpartyName: z.string().optional(),
    counterpartyIban: z.string().optional(),
    reference: z.string(),
    type: z.string().optional(),
  });

  const data = schema.parse(body);

  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!bankAccount) {
    throw new NotFoundError('Bankkonto');
  }

  const transaction = await prisma.bankTransaction.create({
    data: {
      bankAccountId: id,
      ...data,
      status: 'UNPROCESSED',
    },
  });

  return c.json({
    success: true,
    message: 'Transaktion erstellt',
    data: transaction,
  }, 201);
});

// POST /bank-accounts/:id/transactions/:txId/match - Transaktion zuordnen
bankAccountsRouter.post('/:id/transactions/:txId/match', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const txId = c.req.param('txId');
  const body = await c.req.json();

  const schema = z.object({
    contactId: z.string().optional(),
    receiptId: z.string().optional(),
    bookingId: z.string().optional(),
  });

  const data = schema.parse(body);

  const transaction = await prisma.bankTransaction.findFirst({
    where: { id: txId, bankAccountId: id },
  });

  if (!transaction) {
    throw new NotFoundError('Transaktion');
  }

  await prisma.bankTransaction.update({
    where: { id: txId },
    data: {
      ...data,
      status: data.bookingId ? 'BOOKED' : 'MATCHED',
    },
  });

  return c.json({
    success: true,
    message: 'Transaktion zugeordnet',
  });
});

// POST /bank-accounts/:id/sync - Bankdaten synchronisieren (Platzhalter für FinTS)
bankAccountsRouter.post('/:id/sync', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!bankAccount) {
    throw new NotFoundError('Bankkonto');
  }

  if (!bankAccount.fintsEnabled) {
    throw new AppError('FinTS/HBCI nicht konfiguriert', 400, 'FINTS_NOT_CONFIGURED');
  }

  // TODO: FinTS-Synchronisation implementieren
  // Hier würde die Kommunikation mit der Bank stattfinden

  await prisma.bankAccount.update({
    where: { id },
    data: {
      lastSyncAt: new Date(),
      syncStatus: 'SUCCESS',
    },
  });

  return c.json({
    success: true,
    message: 'Synchronisation gestartet (Demo)',
    data: {
      lastSyncAt: new Date(),
      newTransactions: 0,
    },
  });
});

// GET /bank-accounts/:id/balance - Kontostand
bankAccountsRouter.get('/:id/balance', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id, organizationId },
  });

  if (!bankAccount) {
    throw new NotFoundError('Bankkonto');
  }

  // Summe aller Transaktionen
  const result = await prisma.bankTransaction.aggregate({
    where: { bankAccountId: id },
    _sum: { amount: true },
  });

  const balance = Number(result._sum.amount || 0);

  // Unverarbeitete Transaktionen
  const unprocessed = await prisma.bankTransaction.count({
    where: { bankAccountId: id, status: 'UNPROCESSED' },
  });

  return c.json({
    success: true,
    data: {
      bankAccount,
      balance,
      unprocessedCount: unprocessed,
      lastSyncAt: bankAccount.lastSyncAt,
    },
  });
});

export { bankAccountsRouter };
