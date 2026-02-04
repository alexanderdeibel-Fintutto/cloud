import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, BookingType, BookingStatus } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';

const bookingsRouter = new Hono();

// Schemas
const createBookingSchema = z.object({
  bookingDate: z.string().transform(s => new Date(s)),
  documentDate: z.string().transform(s => new Date(s)).optional(),
  description: z.string(),
  contactId: z.string().optional(),
  type: z.nativeEnum(BookingType).default(BookingType.STANDARD),
  lines: z.array(z.object({
    debitAccountId: z.string(),
    creditAccountId: z.string(),
    amount: z.number().positive(),
    taxRate: z.number().optional(),
    taxAmount: z.number().optional(),
    costCenterId: z.string().optional(),
    description: z.string().optional(),
  })).min(1),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const updateBookingSchema = createBookingSchema.partial();

const listBookingsSchema = z.object({
  type: z.nativeEnum(BookingType).optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  contactId: z.string().optional(),
  accountId: z.string().optional(),
  fiscalYearId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

// GET /bookings - Buchungen auflisten
bookingsRouter.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  const query = listBookingsSchema.parse(c.req.query());

  const where: any = { organizationId };

  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (query.contactId) where.contactId = query.contactId;
  if (query.fiscalYearId) where.fiscalYearId = query.fiscalYearId;

  if (query.accountId) {
    where.lines = {
      some: {
        OR: [
          { debitAccountId: query.accountId },
          { creditAccountId: query.accountId },
        ],
      },
    };
  }

  if (query.dateFrom || query.dateTo) {
    where.bookingDate = {};
    if (query.dateFrom) where.bookingDate.gte = new Date(query.dateFrom);
    if (query.dateTo) where.bookingDate.lte = new Date(query.dateTo);
  }

  if (query.search) {
    where.OR = [
      { bookingNumber: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { bookingDate: 'desc' },
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
        lines: {
          include: {
            debitAccount: { select: { id: true, accountNumber: true, name: true } },
            creditAccount: { select: { id: true, accountNumber: true, name: true } },
            costCenter: { select: { id: true, number: true, name: true } },
          },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
});

// POST /bookings - Buchung erstellen
bookingsRouter.post('/', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();
  const data = createBookingSchema.parse(body);

  // Geschäftsjahr finden
  const fiscalYear = await prisma.fiscalYear.findFirst({
    where: {
      organizationId,
      status: 'OPEN',
      startDate: { lte: data.bookingDate },
      endDate: { gte: data.bookingDate },
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

  // Soll = Haben prüfen
  const totalAmount = data.lines.reduce((sum, line) => sum + line.amount, 0);

  const booking = await prisma.booking.create({
    data: {
      organizationId,
      fiscalYearId: fiscalYear.id,
      createdById: auth.userId,
      bookingNumber,
      bookingDate: data.bookingDate,
      documentDate: data.documentDate || data.bookingDate,
      description: data.description,
      amount: totalAmount,
      contactId: data.contactId,
      type: data.type,
      status: 'POSTED',
      notes: data.notes,
      tags: data.tags,
      lines: {
        create: data.lines,
      },
    },
    include: {
      lines: {
        include: {
          debitAccount: true,
          creditAccount: true,
          costCenter: true,
        },
      },
      contact: true,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: booking.id,
      newData: booking as any,
    },
  });

  return c.json({
    success: true,
    message: 'Buchung erstellt',
    data: booking,
  }, 201);
});

// GET /bookings/:id - Buchung abrufen
bookingsRouter.get('/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const booking = await prisma.booking.findFirst({
    where: { id, organizationId },
    include: {
      contact: true,
      fiscalYear: true,
      lines: {
        include: {
          debitAccount: true,
          creditAccount: true,
          costCenter: true,
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      receipts: {
        select: { id: true, receiptNumber: true, grossAmount: true },
      },
      invoices: {
        select: { id: true, invoiceNumber: true, grossAmount: true },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError('Buchung');
  }

  return c.json({
    success: true,
    data: booking,
  });
});

// PATCH /bookings/:id - Buchung aktualisieren (nur Entwürfe)
bookingsRouter.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateBookingSchema.parse(body);

  const oldBooking = await prisma.booking.findFirst({
    where: { id, organizationId },
  });

  if (!oldBooking) {
    throw new NotFoundError('Buchung');
  }

  if (oldBooking.status !== 'DRAFT') {
    throw new AppError('Nur Entwürfe können bearbeitet werden', 400, 'BOOKING_NOT_DRAFT');
  }

  const { lines, ...updateData } = data;

  const booking = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      lines: true,
      contact: true,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'BOOKING_UPDATED',
      entityType: 'Booking',
      entityId: id,
      oldData: oldBooking as any,
      newData: booking as any,
    },
  });

  return c.json({
    success: true,
    message: 'Buchung aktualisiert',
    data: booking,
  });
});

// POST /bookings/:id/reverse - Stornobuchung erstellen
bookingsRouter.post('/:id/reverse', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const reverseSchema = z.object({
    reason: z.string().min(1, 'Stornogrund erforderlich'),
    bookingDate: z.string().transform(s => new Date(s)).optional(),
  });

  const data = reverseSchema.parse(body);

  const originalBooking = await prisma.booking.findFirst({
    where: { id, organizationId },
    include: { lines: true },
  });

  if (!originalBooking) {
    throw new NotFoundError('Buchung');
  }

  if (originalBooking.status === 'REVERSED') {
    throw new AppError('Buchung bereits storniert', 400, 'ALREADY_REVERSED');
  }

  // Geschäftsjahr finden
  const bookingDate = data.bookingDate || new Date();
  const fiscalYear = await prisma.fiscalYear.findFirst({
    where: {
      organizationId,
      status: 'OPEN',
      startDate: { lte: bookingDate },
      endDate: { gte: bookingDate },
    },
  });

  if (!fiscalYear) {
    throw new AppError('Kein offenes Geschäftsjahr für dieses Datum', 400, 'NO_FISCAL_YEAR');
  }

  // Neue Buchungsnummer
  const lastBooking = await prisma.booking.findFirst({
    where: { organizationId },
    orderBy: { bookingNumber: 'desc' },
  });
  const lastNum = parseInt(lastBooking?.bookingNumber?.replace('B-', '') || '0', 10);
  const bookingNumber = `B-${String(lastNum + 1).padStart(6, '0')}`;

  // Stornobuchung erstellen (Soll/Haben vertauscht)
  const reversalBooking = await prisma.booking.create({
    data: {
      organizationId,
      fiscalYearId: fiscalYear.id,
      createdById: auth.userId,
      bookingNumber,
      bookingDate,
      documentDate: bookingDate,
      description: `Storno: ${originalBooking.description}`,
      amount: originalBooking.amount,
      contactId: originalBooking.contactId,
      type: 'REVERSAL',
      status: 'POSTED',
      isReversal: true,
      reversedBookingId: id,
      reversalReason: data.reason,
      lines: {
        create: originalBooking.lines.map(line => ({
          debitAccountId: line.creditAccountId, // Vertauscht!
          creditAccountId: line.debitAccountId, // Vertauscht!
          amount: line.amount,
          taxRate: line.taxRate,
          taxAmount: line.taxAmount,
          costCenterId: line.costCenterId,
          description: `Storno: ${line.description || ''}`,
        })),
      },
    },
  });

  // Original-Buchung als storniert markieren
  await prisma.booking.update({
    where: { id },
    data: { status: 'REVERSED' },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'BOOKING_REVERSED',
      entityType: 'Booking',
      entityId: id,
      newData: { reversalBookingId: reversalBooking.id, reason: data.reason } as any,
    },
  });

  return c.json({
    success: true,
    message: 'Buchung storniert',
    data: reversalBooking,
  });
});

// GET /bookings/journal - Buchungsjournal
bookingsRouter.get('/reports/journal', async (c) => {
  const organizationId = c.get('organizationId');
  const query = z.object({
    dateFrom: z.string(),
    dateTo: z.string(),
    accountId: z.string().optional(),
  }).parse(c.req.query());

  const where: any = {
    organizationId,
    status: { in: ['POSTED', 'REVERSED'] },
    bookingDate: {
      gte: new Date(query.dateFrom),
      lte: new Date(query.dateTo),
    },
  };

  if (query.accountId) {
    where.lines = {
      some: {
        OR: [
          { debitAccountId: query.accountId },
          { creditAccountId: query.accountId },
        ],
      },
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: [{ bookingDate: 'asc' }, { bookingNumber: 'asc' }],
    include: {
      lines: {
        include: {
          debitAccount: { select: { accountNumber: true, name: true } },
          creditAccount: { select: { accountNumber: true, name: true } },
        },
      },
      contact: { select: { companyName: true, lastName: true } },
    },
  });

  return c.json({
    success: true,
    data: bookings,
  });
});

// GET /bookings/account-statement/:accountId - Kontoauszug
bookingsRouter.get('/reports/account-statement/:accountId', async (c) => {
  const organizationId = c.get('organizationId');
  const accountId = c.req.param('accountId');
  const query = z.object({
    dateFrom: z.string(),
    dateTo: z.string(),
  }).parse(c.req.query());

  const account = await prisma.account.findFirst({
    where: { id: accountId, organizationId },
  });

  if (!account) {
    throw new NotFoundError('Konto');
  }

  const lines = await prisma.bookingLine.findMany({
    where: {
      booking: {
        organizationId,
        status: { in: ['POSTED', 'REVERSED'] },
        bookingDate: {
          gte: new Date(query.dateFrom),
          lte: new Date(query.dateTo),
        },
      },
      OR: [
        { debitAccountId: accountId },
        { creditAccountId: accountId },
      ],
    },
    include: {
      booking: {
        select: {
          bookingNumber: true,
          bookingDate: true,
          description: true,
          contact: { select: { companyName: true, lastName: true } },
        },
      },
      debitAccount: { select: { accountNumber: true, name: true } },
      creditAccount: { select: { accountNumber: true, name: true } },
    },
    orderBy: { booking: { bookingDate: 'asc' } },
  });

  // Saldo berechnen
  let balance = 0;
  const entries = lines.map(line => {
    const isDebit = line.debitAccountId === accountId;
    const amount = Number(line.amount);

    // Bei Aktivkonten: Soll = +, Haben = -
    // Bei Passivkonten: Soll = -, Haben = +
    const isActiveAccount = ['ASSET', 'EXPENSE'].includes(account.type);
    const change = isActiveAccount
      ? (isDebit ? amount : -amount)
      : (isDebit ? -amount : amount);

    balance += change;

    return {
      ...line,
      debit: isDebit ? amount : 0,
      credit: isDebit ? 0 : amount,
      balance,
      counterAccount: isDebit ? line.creditAccount : line.debitAccount,
    };
  });

  return c.json({
    success: true,
    data: {
      account,
      entries,
      totalDebit: entries.reduce((sum, e) => sum + e.debit, 0),
      totalCredit: entries.reduce((sum, e) => sum + e.credit, 0),
      closingBalance: balance,
    },
  });
});

export { bookingsRouter };
