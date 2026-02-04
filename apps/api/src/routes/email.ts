import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, EmailStatus, ReceiptType } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';
import { processEmailAttachment } from '../services/email';

const emailRouter = new Hono();

// Schemas
const createInboxSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  imapHost: z.string(),
  imapPort: z.number().default(993),
  imapUser: z.string(),
  imapPassword: z.string(),
  imapSsl: z.boolean().default(true),
  processIncoming: z.boolean().default(true),
  autoCategories: z.array(z.string()).default([]),
});

const updateInboxSchema = createInboxSchema.partial();

// GET /email/inboxes - Postfächer auflisten
emailRouter.get('/inboxes', async (c) => {
  const organizationId = c.get('organizationId');

  const inboxes = await prisma.emailInbox.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: {
          emails: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Passwörter nicht zurückgeben
  const safeInboxes = inboxes.map(inbox => ({
    ...inbox,
    imapPassword: '********',
  }));

  return c.json({
    success: true,
    data: safeInboxes,
  });
});

// POST /email/inboxes - Postfach erstellen
emailRouter.post('/inboxes', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();
  const data = createInboxSchema.parse(body);

  // TODO: Verbindung testen
  // await testImapConnection(data);

  const inbox = await prisma.emailInbox.create({
    data: {
      organizationId,
      ...data,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'EMAIL_INBOX_CREATED',
      entityType: 'EmailInbox',
      entityId: inbox.id,
    },
  });

  return c.json({
    success: true,
    message: 'Postfach erstellt',
    data: {
      ...inbox,
      imapPassword: '********',
    },
  }, 201);
});

// GET /email/inboxes/:id - Postfach abrufen
emailRouter.get('/inboxes/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const inbox = await prisma.emailInbox.findFirst({
    where: { id, organizationId },
    include: {
      emails: {
        orderBy: { receivedAt: 'desc' },
        take: 50,
        include: {
          attachments: true,
        },
      },
    },
  });

  if (!inbox) {
    throw new NotFoundError('Postfach');
  }

  return c.json({
    success: true,
    data: {
      ...inbox,
      imapPassword: '********',
    },
  });
});

// PATCH /email/inboxes/:id - Postfach aktualisieren
emailRouter.patch('/inboxes/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateInboxSchema.parse(body);

  const inbox = await prisma.emailInbox.findFirst({
    where: { id, organizationId },
  });

  if (!inbox) {
    throw new NotFoundError('Postfach');
  }

  // Passwort nur aktualisieren wenn explizit angegeben
  const updateData = { ...data };
  if (!data.imapPassword) {
    delete updateData.imapPassword;
  }

  const updated = await prisma.emailInbox.update({
    where: { id },
    data: updateData,
  });

  return c.json({
    success: true,
    message: 'Postfach aktualisiert',
    data: {
      ...updated,
      imapPassword: '********',
    },
  });
});

// DELETE /email/inboxes/:id - Postfach löschen
emailRouter.delete('/inboxes/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const inbox = await prisma.emailInbox.findFirst({
    where: { id, organizationId },
  });

  if (!inbox) {
    throw new NotFoundError('Postfach');
  }

  await prisma.emailInbox.update({
    where: { id },
    data: { isActive: false },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId: auth.userId,
      action: 'EMAIL_INBOX_DELETED',
      entityType: 'EmailInbox',
      entityId: id,
    },
  });

  return c.json({
    success: true,
    message: 'Postfach deaktiviert',
  });
});

// POST /email/inboxes/:id/sync - Postfach synchronisieren
emailRouter.post('/inboxes/:id/sync', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const inbox = await prisma.emailInbox.findFirst({
    where: { id, organizationId },
  });

  if (!inbox) {
    throw new NotFoundError('Postfach');
  }

  // Status aktualisieren
  await prisma.emailInbox.update({
    where: { id },
    data: { syncStatus: 'SYNCING' },
  });

  // TODO: IMAP-Synchronisation implementieren
  // Die eigentliche Synchronisation würde hier stattfinden
  // Für Demo: Simulierte Antwort

  await prisma.emailInbox.update({
    where: { id },
    data: {
      syncStatus: 'SUCCESS',
      lastSyncAt: new Date(),
    },
  });

  return c.json({
    success: true,
    message: 'Synchronisation gestartet',
    data: {
      lastSyncAt: new Date(),
      newEmails: 0, // Würde echte Zahl sein
    },
  });
});

// GET /email/messages - E-Mails auflisten
emailRouter.get('/messages', async (c) => {
  const organizationId = c.get('organizationId');
  const query = z.object({
    inboxId: z.string().optional(),
    status: z.nativeEnum(EmailStatus).optional(),
    hasAttachments: z.coerce.boolean().optional(),
    search: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(50),
  }).parse(c.req.query());

  const where: any = {
    inbox: { organizationId },
  };

  if (query.inboxId) where.inboxId = query.inboxId;
  if (query.status) where.status = query.status;
  if (query.hasAttachments !== undefined) where.hasAttachments = query.hasAttachments;

  if (query.search) {
    where.OR = [
      { subject: { contains: query.search, mode: 'insensitive' } },
      { from: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [messages, total] = await Promise.all([
    prisma.emailMessage.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        inbox: { select: { id: true, name: true, email: true } },
        attachments: true,
      },
    }),
    prisma.emailMessage.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      messages,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
});

// GET /email/messages/:id - E-Mail abrufen
emailRouter.get('/messages/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const message = await prisma.emailMessage.findFirst({
    where: {
      id,
      inbox: { organizationId },
    },
    include: {
      inbox: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
  });

  if (!message) {
    throw new NotFoundError('E-Mail');
  }

  return c.json({
    success: true,
    data: message,
  });
});

// POST /email/messages/:id/process - E-Mail verarbeiten
emailRouter.post('/messages/:id/process', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const message = await prisma.emailMessage.findFirst({
    where: {
      id,
      inbox: { organizationId },
    },
    include: {
      attachments: true,
    },
  });

  if (!message) {
    throw new NotFoundError('E-Mail');
  }

  // Anhänge verarbeiten
  const processedReceipts: string[] = [];

  for (const attachment of message.attachments) {
    // Nur PDFs und Bilder verarbeiten
    if (!attachment.mimeType.startsWith('image/') &&
        attachment.mimeType !== 'application/pdf') {
      continue;
    }

    try {
      const receipt = await processEmailAttachment({
        organizationId,
        userId: auth.userId,
        attachment,
        emailId: message.id,
      });

      if (receipt) {
        processedReceipts.push(receipt.id);

        // Anhang als Beleg markieren
        await prisma.emailAttachment.update({
          where: { id: attachment.id },
          data: {
            isReceipt: true,
            receiptId: receipt.id,
          },
        });
      }
    } catch (error) {
      console.error(`Error processing attachment ${attachment.id}:`, error);
    }
  }

  // E-Mail als verarbeitet markieren
  await prisma.emailMessage.update({
    where: { id },
    data: {
      status: 'PROCESSED',
      processedAt: new Date(),
      receiptIds: processedReceipts,
    },
  });

  return c.json({
    success: true,
    message: 'E-Mail verarbeitet',
    data: {
      processedAttachments: message.attachments.length,
      createdReceipts: processedReceipts.length,
      receiptIds: processedReceipts,
    },
  });
});

// POST /email/messages/:id/ignore - E-Mail ignorieren
emailRouter.post('/messages/:id/ignore', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const message = await prisma.emailMessage.findFirst({
    where: {
      id,
      inbox: { organizationId },
    },
  });

  if (!message) {
    throw new NotFoundError('E-Mail');
  }

  await prisma.emailMessage.update({
    where: { id },
    data: { status: 'IGNORED' },
  });

  return c.json({
    success: true,
    message: 'E-Mail ignoriert',
  });
});

// GET /email/stats - E-Mail-Statistiken
emailRouter.get('/stats', async (c) => {
  const organizationId = c.get('organizationId');

  const [inboxCount, messageStats] = await Promise.all([
    prisma.emailInbox.count({
      where: { organizationId, isActive: true },
    }),
    prisma.emailMessage.groupBy({
      by: ['status'],
      where: {
        inbox: { organizationId },
      },
      _count: { id: true },
    }),
  ]);

  const stats = messageStats.reduce((acc, s) => ({
    ...acc,
    [s.status.toLowerCase()]: s._count.id,
  }), {
    unprocessed: 0,
    processing: 0,
    processed: 0,
    ignored: 0,
    error: 0,
  });

  return c.json({
    success: true,
    data: {
      inboxCount,
      messageStats: stats,
      totalMessages: Object.values(stats).reduce((a, b) => a + (b as number), 0),
    },
  });
});

export { emailRouter };
