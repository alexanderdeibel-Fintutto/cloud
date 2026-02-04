import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, ReceiptType, ReceiptStatus } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';

const receiptsRouter = new Hono();

// Schemas
const createReceiptSchema = z.object({
  contactId: z.string().optional(),
  receiptNumber: z.string().optional(),
  receiptDate: z.string().transform(s => new Date(s)),
  dueDate: z.string().transform(s => new Date(s)).optional(),
  netAmount: z.number(),
  taxAmount: z.number(),
  grossAmount: z.number(),
  currency: z.string().default('EUR'),
  type: z.nativeEnum(ReceiptType),
  category: z.string().optional(),
  costCenterId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit: z.string().optional(),
    unitPrice: z.number(),
    netAmount: z.number(),
    taxRate: z.number(),
    taxAmount: z.number(),
    grossAmount: z.number(),
    accountNumber: z.string().optional(),
  })).optional(),
});

const updateReceiptSchema = createReceiptSchema.partial();

const listReceiptsSchema = z.object({
  type: z.nativeEnum(ReceiptType).optional(),
  status: z.nativeEnum(ReceiptStatus).optional(),
  contactId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

// GET /receipts - Belege auflisten
receiptsRouter.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  const query = listReceiptsSchema.parse(c.req.query());

  const where: any = { organizationId };

  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (query.contactId) where.contactId = query.contactId;

  if (query.dateFrom || query.dateTo) {
    where.receiptDate = {};
    if (query.dateFrom) where.receiptDate.gte = new Date(query.dateFrom);
    if (query.dateTo) where.receiptDate.lte = new Date(query.dateTo);
  }

  if (query.search) {
    where.OR = [
      { receiptNumber: { contains: query.search, mode: 'insensitive' } },
      { contact: { companyName: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  const [receipts, total] = await Promise.all([
    prisma.receipt.findMany({
      where,
      orderBy: { receiptDate: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        contact: {
          select: {
            id: true,
            companyName: true,
            firstName: true,
            lastName: true,
          },
        },
        costCenter: {
          select: { id: true, number: true, name: true },
        },
        booking: {
          select: { id: true, bookingNumber: true, status: true },
        },
      },
    }),
    prisma.receipt.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      receipts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
});

// POST /receipts - Beleg erstellen
receiptsRouter.post('/', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();
  const data = createReceiptSchema.parse(body);

  const { lineItems, ...receiptData } = data;

  const receipt = await prisma.receipt.create({
    data: {
      ...receiptData,
      organizationId,
      status: 'PENDING',
      lineItems: lineItems ? {
        create: lineItems,
      } : undefined,
    },
    include: {
      lineItems: true,
      contact: true,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'RECEIPT_CREATED',
      entityType: 'Receipt',
      entityId: receipt.id,
      newData: receipt as any,
    },
  });

  return c.json({
    success: true,
    message: 'Beleg erstellt',
    data: receipt,
  }, 201);
});

// GET /receipts/:id - Beleg abrufen
receiptsRouter.get('/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const receipt = await prisma.receipt.findFirst({
    where: { id, organizationId },
    include: {
      contact: true,
      costCenter: true,
      lineItems: true,
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
      uploads: true,
      transactions: {
        take: 5,
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!receipt) {
    throw new NotFoundError('Beleg');
  }

  return c.json({
    success: true,
    data: receipt,
  });
});

// PATCH /receipts/:id - Beleg aktualisieren
receiptsRouter.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateReceiptSchema.parse(body);

  const oldReceipt = await prisma.receipt.findFirst({
    where: { id, organizationId },
  });

  if (!oldReceipt) {
    throw new NotFoundError('Beleg');
  }

  // Nicht änderbar wenn bereits gebucht
  if (oldReceipt.status === 'BOOKED') {
    throw new AppError('Gebuchte Belege können nicht geändert werden', 400, 'RECEIPT_LOCKED');
  }

  const { lineItems, ...receiptData } = data;

  const receipt = await prisma.receipt.update({
    where: { id },
    data: receiptData,
    include: {
      lineItems: true,
      contact: true,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'RECEIPT_UPDATED',
      entityType: 'Receipt',
      entityId: id,
      oldData: oldReceipt as any,
      newData: receipt as any,
    },
  });

  return c.json({
    success: true,
    message: 'Beleg aktualisiert',
    data: receipt,
  });
});

// DELETE /receipts/:id - Beleg löschen
receiptsRouter.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const receipt = await prisma.receipt.findFirst({
    where: { id, organizationId },
  });

  if (!receipt) {
    throw new NotFoundError('Beleg');
  }

  if (receipt.status === 'BOOKED') {
    throw new AppError('Gebuchte Belege können nicht gelöscht werden', 400, 'RECEIPT_LOCKED');
  }

  await prisma.receipt.delete({
    where: { id },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'RECEIPT_DELETED',
      entityType: 'Receipt',
      entityId: id,
    },
  });

  return c.json({
    success: true,
    message: 'Beleg gelöscht',
  });
});

// POST /receipts/:id/verify - Beleg verifizieren
receiptsRouter.post('/:id/verify', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const receipt = await prisma.receipt.findFirst({
    where: { id, organizationId },
  });

  if (!receipt) {
    throw new NotFoundError('Beleg');
  }

  await prisma.receipt.update({
    where: { id },
    data: {
      status: 'VERIFIED',
      verifiedAt: new Date(),
      verifiedBy: auth.userId,
    },
  });

  return c.json({
    success: true,
    message: 'Beleg verifiziert',
  });
});

// POST /receipts/:id/book - Beleg buchen
receiptsRouter.post('/:id/book', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const bookingSchema = z.object({
    debitAccountId: z.string(),
    creditAccountId: z.string(),
    costCenterId: z.string().optional(),
    description: z.string().optional(),
  });

  const data = bookingSchema.parse(body);

  const receipt = await prisma.receipt.findFirst({
    where: { id, organizationId },
    include: { lineItems: true },
  });

  if (!receipt) {
    throw new NotFoundError('Beleg');
  }

  if (receipt.status === 'BOOKED') {
    throw new AppError('Beleg bereits gebucht', 400, 'ALREADY_BOOKED');
  }

  // Aktuelles Geschäftsjahr finden
  const fiscalYear = await prisma.fiscalYear.findFirst({
    where: {
      organizationId,
      status: 'OPEN',
      startDate: { lte: receipt.receiptDate },
      endDate: { gte: receipt.receiptDate },
    },
  });

  if (!fiscalYear) {
    throw new AppError('Kein offenes Geschäftsjahr für dieses Datum', 400, 'NO_FISCAL_YEAR');
  }

  // Buchungsnummer generieren
  const lastBooking = await prisma.booking.findFirst({
    where: { organizationId },
    orderBy: { bookingNumber: 'desc' },
  });
  const lastNum = parseInt(lastBooking?.bookingNumber?.replace('B-', '') || '0', 10);
  const bookingNumber = `B-${String(lastNum + 1).padStart(6, '0')}`;

  // Buchung erstellen
  const booking = await prisma.booking.create({
    data: {
      organizationId,
      fiscalYearId: fiscalYear.id,
      createdById: auth.userId,
      contactId: receipt.contactId,
      bookingNumber,
      bookingDate: new Date(),
      documentDate: receipt.receiptDate,
      description: data.description || `Beleg ${receipt.receiptNumber || id}`,
      amount: receipt.grossAmount,
      type: 'STANDARD',
      status: 'POSTED',
      lines: {
        create: {
          debitAccountId: data.debitAccountId,
          creditAccountId: data.creditAccountId,
          amount: receipt.grossAmount,
          taxRate: receipt.lineItems[0]?.taxRate || 19,
          taxAmount: receipt.taxAmount,
          costCenterId: data.costCenterId,
          description: data.description,
        },
      },
    },
  });

  // Beleg aktualisieren
  await prisma.receipt.update({
    where: { id },
    data: {
      status: 'BOOKED',
      bookingId: booking.id,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'RECEIPT_BOOKED',
      entityType: 'Receipt',
      entityId: id,
      newData: { bookingId: booking.id } as any,
    },
  });

  return c.json({
    success: true,
    message: 'Beleg gebucht',
    data: { bookingId: booking.id, bookingNumber },
  });
});

// GET /receipts/stats - Beleg-Statistiken
receiptsRouter.get('/stats/overview', async (c) => {
  const organizationId = c.get('organizationId');

  const stats = await prisma.receipt.groupBy({
    by: ['status'],
    where: { organizationId },
    _count: { id: true },
    _sum: { grossAmount: true },
  });

  const byType = await prisma.receipt.groupBy({
    by: ['type'],
    where: { organizationId },
    _count: { id: true },
    _sum: { grossAmount: true },
  });

  return c.json({
    success: true,
    data: {
      byStatus: stats.reduce((acc, s) => ({
        ...acc,
        [s.status]: { count: s._count.id, amount: s._sum.grossAmount },
      }), {}),
      byType: byType.reduce((acc, t) => ({
        ...acc,
        [t.type]: { count: t._count.id, amount: t._sum.grossAmount },
      }), {}),
    },
  });
});

export { receiptsRouter };
