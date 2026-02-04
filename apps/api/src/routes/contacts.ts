import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, ContactType } from '@fintutto/database';
import { NotFoundError } from '../middleware/error';

const contactsRouter = new Hono();

// Schemas
const createContactSchema = z.object({
  type: z.nativeEnum(ContactType),
  companyName: z.string().optional(),
  salutation: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  taxId: z.string().optional(),
  vatId: z.string().optional(),
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('DE'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  iban: z.string().optional(),
  bic: z.string().optional(),
  bankName: z.string().optional(),
  paymentTermDays: z.number().default(14),
  discountPercent: z.number().optional(),
  discountDays: z.number().optional(),
  creditLimit: z.number().optional(),
  customerNumber: z.string().optional(),
  supplierNumber: z.string().optional(),
  debtorAccount: z.string().optional(),
  creditorAccount: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const updateContactSchema = createContactSchema.partial();

const listContactsSchema = z.object({
  type: z.nativeEnum(ContactType).optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
  sortBy: z.enum(['companyName', 'lastName', 'createdAt', 'customerNumber', 'supplierNumber']).default('companyName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// GET /contacts - Kontakte auflisten
contactsRouter.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  const query = listContactsSchema.parse(c.req.query());

  const where: any = {
    organizationId,
    isActive: true,
  };

  if (query.type) {
    where.type = query.type;
  }

  if (query.search) {
    where.OR = [
      { companyName: { contains: query.search, mode: 'insensitive' } },
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { customerNumber: { contains: query.search, mode: 'insensitive' } },
      { supplierNumber: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        _count: {
          select: {
            invoices: true,
            receipts: true,
          },
        },
      },
    }),
    prisma.contact.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      contacts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
});

// POST /contacts - Kontakt erstellen
contactsRouter.post('/', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();
  const data = createContactSchema.parse(body);

  // Automatische Kunden-/Lieferantennummer generieren
  if ((data.type === 'CUSTOMER' || data.type === 'BOTH') && !data.customerNumber) {
    const lastCustomer = await prisma.contact.findFirst({
      where: { organizationId, customerNumber: { not: null } },
      orderBy: { customerNumber: 'desc' },
    });
    const lastNum = parseInt(lastCustomer?.customerNumber?.replace('K-', '') || '10000', 10);
    data.customerNumber = `K-${lastNum + 1}`;
  }

  if ((data.type === 'SUPPLIER' || data.type === 'BOTH') && !data.supplierNumber) {
    const lastSupplier = await prisma.contact.findFirst({
      where: { organizationId, supplierNumber: { not: null } },
      orderBy: { supplierNumber: 'desc' },
    });
    const lastNum = parseInt(lastSupplier?.supplierNumber?.replace('L-', '') || '20000', 10);
    data.supplierNumber = `L-${lastNum + 1}`;
  }

  const contact = await prisma.contact.create({
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
      action: 'CONTACT_CREATED',
      entityType: 'Contact',
      entityId: contact.id,
      newData: contact as any,
    },
  });

  return c.json({
    success: true,
    message: 'Kontakt erstellt',
    data: contact,
  }, 201);
});

// GET /contacts/:id - Kontakt abrufen
contactsRouter.get('/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const contact = await prisma.contact.findFirst({
    where: { id, organizationId },
    include: {
      invoices: {
        orderBy: { invoiceDate: 'desc' },
        take: 10,
        select: {
          id: true,
          invoiceNumber: true,
          invoiceDate: true,
          grossAmount: true,
          paidAmount: true,
          status: true,
        },
      },
      receipts: {
        orderBy: { receiptDate: 'desc' },
        take: 10,
        select: {
          id: true,
          receiptNumber: true,
          receiptDate: true,
          grossAmount: true,
          status: true,
        },
      },
      _count: {
        select: {
          invoices: true,
          receipts: true,
          transactions: true,
        },
      },
    },
  });

  if (!contact) {
    throw new NotFoundError('Kontakt');
  }

  return c.json({
    success: true,
    data: contact,
  });
});

// PATCH /contacts/:id - Kontakt aktualisieren
contactsRouter.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateContactSchema.parse(body);

  const oldContact = await prisma.contact.findFirst({
    where: { id, organizationId },
  });

  if (!oldContact) {
    throw new NotFoundError('Kontakt');
  }

  const contact = await prisma.contact.update({
    where: { id },
    data,
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'CONTACT_UPDATED',
      entityType: 'Contact',
      entityId: id,
      oldData: oldContact as any,
      newData: contact as any,
    },
  });

  return c.json({
    success: true,
    message: 'Kontakt aktualisiert',
    data: contact,
  });
});

// DELETE /contacts/:id - Kontakt deaktivieren
contactsRouter.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const contact = await prisma.contact.findFirst({
    where: { id, organizationId },
  });

  if (!contact) {
    throw new NotFoundError('Kontakt');
  }

  // Soft Delete
  await prisma.contact.update({
    where: { id },
    data: { isActive: false },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'CONTACT_DELETED',
      entityType: 'Contact',
      entityId: id,
    },
  });

  return c.json({
    success: true,
    message: 'Kontakt gelöscht',
  });
});

// GET /contacts/:id/balance - Kontostand des Kontakts
contactsRouter.get('/:id/balance', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const contact = await prisma.contact.findFirst({
    where: { id, organizationId },
  });

  if (!contact) {
    throw new NotFoundError('Kontakt');
  }

  // Offene Rechnungen berechnen
  const openInvoices = await prisma.invoice.aggregate({
    where: {
      contactId: id,
      status: { in: ['SENT', 'PARTIAL_PAID', 'OVERDUE'] },
    },
    _sum: {
      grossAmount: true,
      paidAmount: true,
    },
  });

  // Offene Belege (Lieferantenrechnungen)
  const openReceipts = await prisma.receipt.aggregate({
    where: {
      contactId: id,
      status: { in: ['PENDING', 'VERIFIED'] },
    },
    _sum: {
      grossAmount: true,
    },
  });

  const receivables = Number(openInvoices._sum.grossAmount || 0) - Number(openInvoices._sum.paidAmount || 0);
  const payables = Number(openReceipts._sum.grossAmount || 0);

  return c.json({
    success: true,
    data: {
      receivables, // Forderungen
      payables, // Verbindlichkeiten
      balance: receivables - payables,
    },
  });
});

export { contactsRouter };
