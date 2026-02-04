import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, InvoiceType, InvoiceStatus } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';
import { generateInvoicePdf } from '../services/pdf';

const invoicesRouter = new Hono();

// Schemas
const createInvoiceSchema = z.object({
  contactId: z.string(),
  invoiceDate: z.string().transform(s => new Date(s)),
  dueDate: z.string().transform(s => new Date(s)).optional(),
  deliveryDate: z.string().transform(s => new Date(s)).optional(),
  type: z.nativeEnum(InvoiceType).default(InvoiceType.INVOICE),
  paymentTermDays: z.number().default(14),
  discountPercent: z.number().optional(),
  discountDays: z.number().optional(),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  internalNotes: z.string().optional(),
  templateId: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit: z.string().optional(),
    unitPrice: z.number(),
    discount: z.number().optional(),
    taxRate: z.number().default(19),
    accountNumber: z.string().optional(),
    costCenterId: z.string().optional(),
  })),
});

const updateInvoiceSchema = createInvoiceSchema.partial();

const listInvoicesSchema = z.object({
  type: z.nativeEnum(InvoiceType).optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  contactId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

// Helper: Beträge berechnen
function calculateAmounts(lineItems: any[]) {
  let netAmount = 0;
  let taxAmount = 0;

  const calculatedItems = lineItems.map((item, index) => {
    const itemNet = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
    const itemTax = itemNet * (item.taxRate / 100);
    const itemGross = itemNet + itemTax;

    netAmount += itemNet;
    taxAmount += itemTax;

    return {
      ...item,
      position: index + 1,
      netAmount: Math.round(itemNet * 100) / 100,
      taxAmount: Math.round(itemTax * 100) / 100,
      grossAmount: Math.round(itemGross * 100) / 100,
    };
  });

  return {
    lineItems: calculatedItems,
    netAmount: Math.round(netAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    grossAmount: Math.round((netAmount + taxAmount) * 100) / 100,
  };
}

// GET /invoices - Rechnungen auflisten
invoicesRouter.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  const query = listInvoicesSchema.parse(c.req.query());

  const where: any = { organizationId };

  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (query.contactId) where.contactId = query.contactId;

  if (query.dateFrom || query.dateTo) {
    where.invoiceDate = {};
    if (query.dateFrom) where.invoiceDate.gte = new Date(query.dateFrom);
    if (query.dateTo) where.invoiceDate.lte = new Date(query.dateTo);
  }

  if (query.search) {
    where.OR = [
      { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
      { contact: { companyName: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { invoiceDate: 'desc' },
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
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      invoices,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
});

// POST /invoices - Rechnung erstellen
invoicesRouter.post('/', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();
  const data = createInvoiceSchema.parse(body);

  // Rechnungsnummer generieren
  const year = new Date().getFullYear();
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      organizationId,
      invoiceNumber: { startsWith: `R-${year}` },
    },
    orderBy: { invoiceNumber: 'desc' },
  });

  const lastNum = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.split('-')[2] || '0', 10)
    : 0;
  const invoiceNumber = `R-${year}-${String(lastNum + 1).padStart(5, '0')}`;

  // Beträge berechnen
  const { lineItems, netAmount, taxAmount, grossAmount } = calculateAmounts(data.lineItems);

  // Fälligkeitsdatum berechnen
  const dueDate = data.dueDate || new Date(
    data.invoiceDate.getTime() + data.paymentTermDays * 24 * 60 * 60 * 1000
  );

  const invoice = await prisma.invoice.create({
    data: {
      organizationId,
      contactId: data.contactId,
      createdById: auth.userId,
      invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate,
      deliveryDate: data.deliveryDate,
      type: data.type,
      netAmount,
      taxAmount,
      grossAmount,
      paymentTermDays: data.paymentTermDays,
      discountPercent: data.discountPercent,
      discountDays: data.discountDays,
      headerText: data.headerText,
      footerText: data.footerText,
      internalNotes: data.internalNotes,
      templateId: data.templateId,
      status: 'DRAFT',
      lineItems: {
        create: lineItems,
      },
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
      action: 'INVOICE_CREATED',
      entityType: 'Invoice',
      entityId: invoice.id,
      newData: invoice as any,
    },
  });

  return c.json({
    success: true,
    message: 'Rechnung erstellt',
    data: invoice,
  }, 201);
});

// GET /invoices/:id - Rechnung abrufen
invoicesRouter.get('/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId },
    include: {
      contact: true,
      lineItems: { orderBy: { position: 'asc' } },
      payments: { orderBy: { date: 'desc' } },
      booking: true,
      template: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!invoice) {
    throw new NotFoundError('Rechnung');
  }

  return c.json({
    success: true,
    data: invoice,
  });
});

// PATCH /invoices/:id - Rechnung aktualisieren
invoicesRouter.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateInvoiceSchema.parse(body);

  const oldInvoice = await prisma.invoice.findFirst({
    where: { id, organizationId },
  });

  if (!oldInvoice) {
    throw new NotFoundError('Rechnung');
  }

  if (oldInvoice.status !== 'DRAFT') {
    throw new AppError('Nur Entwürfe können bearbeitet werden', 400, 'INVOICE_NOT_DRAFT');
  }

  const updateData: any = { ...data };

  // Wenn Positionen geändert wurden, neu berechnen
  if (data.lineItems) {
    const { lineItems, netAmount, taxAmount, grossAmount } = calculateAmounts(data.lineItems);
    updateData.netAmount = netAmount;
    updateData.taxAmount = taxAmount;
    updateData.grossAmount = grossAmount;

    // Alte Positionen löschen
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: id } });

    // Neue Positionen erstellen
    await prisma.invoiceLineItem.createMany({
      data: lineItems.map(item => ({ ...item, invoiceId: id })),
    });

    delete updateData.lineItems;
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
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
      action: 'INVOICE_UPDATED',
      entityType: 'Invoice',
      entityId: id,
      oldData: oldInvoice as any,
      newData: invoice as any,
    },
  });

  return c.json({
    success: true,
    message: 'Rechnung aktualisiert',
    data: invoice,
  });
});

// DELETE /invoices/:id - Rechnung löschen
invoicesRouter.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId },
  });

  if (!invoice) {
    throw new NotFoundError('Rechnung');
  }

  if (invoice.status !== 'DRAFT') {
    throw new AppError('Nur Entwürfe können gelöscht werden', 400, 'INVOICE_NOT_DRAFT');
  }

  await prisma.invoice.delete({ where: { id } });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'INVOICE_DELETED',
      entityType: 'Invoice',
      entityId: id,
    },
  });

  return c.json({
    success: true,
    message: 'Rechnung gelöscht',
  });
});

// POST /invoices/:id/finalize - Rechnung finalisieren
invoicesRouter.post('/:id/finalize', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId },
    include: {
      contact: true,
      lineItems: true,
      organization: true,
    },
  });

  if (!invoice) {
    throw new NotFoundError('Rechnung');
  }

  if (invoice.status !== 'DRAFT') {
    throw new AppError('Rechnung ist bereits finalisiert', 400, 'ALREADY_FINALIZED');
  }

  // PDF generieren
  const pdfUrl = await generateInvoicePdf(invoice);

  await prisma.invoice.update({
    where: { id },
    data: {
      status: 'SENT',
      pdfUrl,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'INVOICE_FINALIZED',
      entityType: 'Invoice',
      entityId: id,
    },
  });

  return c.json({
    success: true,
    message: 'Rechnung finalisiert',
    data: { pdfUrl },
  });
});

// POST /invoices/:id/send - Rechnung per E-Mail senden
invoicesRouter.post('/:id/send', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const sendSchema = z.object({
    to: z.string().email(),
    cc: z.array(z.string().email()).optional(),
    subject: z.string().optional(),
    message: z.string().optional(),
  });

  const data = sendSchema.parse(body);

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId },
    include: { contact: true },
  });

  if (!invoice) {
    throw new NotFoundError('Rechnung');
  }

  if (!invoice.pdfUrl) {
    throw new AppError('Rechnung muss erst finalisiert werden', 400, 'NOT_FINALIZED');
  }

  // TODO: E-Mail senden
  console.log(`Sending invoice ${invoice.invoiceNumber} to ${data.to}`);

  await prisma.invoice.update({
    where: { id },
    data: {
      sentAt: new Date(),
      sentMethod: 'EMAIL',
      sentTo: data.to,
      status: invoice.status === 'DRAFT' ? 'SENT' : invoice.status,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'INVOICE_SENT',
      entityType: 'Invoice',
      entityId: id,
      newData: { sentTo: data.to } as any,
    },
  });

  return c.json({
    success: true,
    message: 'Rechnung gesendet',
  });
});

// POST /invoices/:id/payments - Zahlung erfassen
invoicesRouter.post('/:id/payments', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const paymentSchema = z.object({
    date: z.string().transform(s => new Date(s)),
    amount: z.number().positive(),
    method: z.enum(['BANK_TRANSFER', 'CASH', 'CREDIT_CARD', 'DIRECT_DEBIT', 'PAYPAL', 'OTHER']),
    reference: z.string().optional(),
  });

  const data = paymentSchema.parse(body);

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId },
  });

  if (!invoice) {
    throw new NotFoundError('Rechnung');
  }

  const newPaidAmount = Number(invoice.paidAmount) + data.amount;
  const grossAmount = Number(invoice.grossAmount);

  // Zahlung erstellen
  const payment = await prisma.payment.create({
    data: {
      invoiceId: id,
      ...data,
    },
  });

  // Status aktualisieren
  let newStatus: InvoiceStatus = invoice.status;
  if (newPaidAmount >= grossAmount) {
    newStatus = 'PAID';
  } else if (newPaidAmount > 0) {
    newStatus = 'PARTIAL_PAID';
  }

  await prisma.invoice.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount,
      status: newStatus,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'PAYMENT_RECEIVED',
      entityType: 'Invoice',
      entityId: id,
      newData: data as any,
    },
  });

  return c.json({
    success: true,
    message: 'Zahlung erfasst',
    data: payment,
  });
});

// POST /invoices/:id/cancel - Rechnung stornieren
invoicesRouter.post('/:id/cancel', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId },
  });

  if (!invoice) {
    throw new NotFoundError('Rechnung');
  }

  if (['CANCELLED', 'CREDITED'].includes(invoice.status)) {
    throw new AppError('Rechnung ist bereits storniert', 400, 'ALREADY_CANCELLED');
  }

  await prisma.invoice.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'INVOICE_CANCELLED',
      entityType: 'Invoice',
      entityId: id,
    },
  });

  return c.json({
    success: true,
    message: 'Rechnung storniert',
  });
});

// GET /invoices/stats - Rechnungs-Statistiken
invoicesRouter.get('/stats/overview', async (c) => {
  const organizationId = c.get('organizationId');

  const stats = await prisma.invoice.groupBy({
    by: ['status'],
    where: { organizationId },
    _count: { id: true },
    _sum: { grossAmount: true, paidAmount: true },
  });

  // Überfällige Rechnungen
  const overdueCount = await prisma.invoice.count({
    where: {
      organizationId,
      status: { in: ['SENT', 'PARTIAL_PAID'] },
      dueDate: { lt: new Date() },
    },
  });

  return c.json({
    success: true,
    data: {
      byStatus: stats.reduce((acc, s) => ({
        ...acc,
        [s.status]: {
          count: s._count.id,
          total: s._sum.grossAmount,
          paid: s._sum.paidAmount,
        },
      }), {}),
      overdueCount,
    },
  });
});

export { invoicesRouter };
