import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, ExportType, ExportFormat, ExportStatus } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';
import { generateDatevExport, generateCsvExport, generateGdpduExport } from '../services/export';

const exportsRouter = new Hono();

// GET /exports - Exporte auflisten
exportsRouter.get('/', async (c) => {
  const organizationId = c.get('organizationId');
  const query = z.object({
    type: z.nativeEnum(ExportType).optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
  }).parse(c.req.query());

  const where: any = { organizationId };
  if (query.type) where.type = query.type;

  const [exports, total] = await Promise.all([
    prisma.export.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.export.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      exports,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
});

// POST /exports/datev - DATEV-Export erstellen
exportsRouter.post('/datev', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    periodStart: z.string().transform(s => new Date(s)),
    periodEnd: z.string().transform(s => new Date(s)),
    format: z.enum(['DATEV_ASCII', 'DATEV_XML']).default('DATEV_ASCII'),
    includeReceipts: z.boolean().default(true),
    beraterNr: z.string().optional(),
    mandantenNr: z.string().optional(),
  });

  const data = schema.parse(body);

  // Organisation laden
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new NotFoundError('Organisation');
  }

  // Export-Eintrag erstellen
  const exportEntry = await prisma.export.create({
    data: {
      organizationId,
      type: 'DATEV',
      format: data.format as ExportFormat,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      filename: `DATEV_${organization.slug}_${data.periodStart.toISOString().split('T')[0]}_${data.periodEnd.toISOString().split('T')[0]}.zip`,
      status: 'PROCESSING',
    },
  });

  // Buchungen laden
  const bookings = await prisma.booking.findMany({
    where: {
      organizationId,
      status: { in: ['POSTED', 'REVERSED'] },
      bookingDate: {
        gte: data.periodStart,
        lte: data.periodEnd,
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
      receipts: true,
    },
    orderBy: { bookingDate: 'asc' },
  });

  try {
    // DATEV-Export generieren
    const result = await generateDatevExport({
      organization,
      bookings,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      format: data.format,
      beraterNr: data.beraterNr,
      mandantenNr: data.mandantenNr,
      includeReceipts: data.includeReceipts,
    });

    await prisma.export.update({
      where: { id: exportEntry.id },
      data: {
        status: 'COMPLETED',
        url: result.url,
        processedAt: new Date(),
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: auth.userId,
        action: 'DATEV_EXPORT_CREATED',
        entityType: 'Export',
        entityId: exportEntry.id,
        newData: { periodStart: data.periodStart, periodEnd: data.periodEnd } as any,
      },
    });

    return c.json({
      success: true,
      message: 'DATEV-Export erstellt',
      data: {
        exportId: exportEntry.id,
        url: result.url,
        bookingsCount: bookings.length,
        receiptsCount: result.receiptsCount,
      },
    });
  } catch (error) {
    await prisma.export.update({
      where: { id: exportEntry.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw new AppError('DATEV-Export fehlgeschlagen', 500, 'EXPORT_ERROR');
  }
});

// POST /exports/csv - CSV-Export erstellen
exportsRouter.post('/csv', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    type: z.enum(['bookings', 'invoices', 'receipts', 'contacts', 'accounts']),
    periodStart: z.string().transform(s => new Date(s)).optional(),
    periodEnd: z.string().transform(s => new Date(s)).optional(),
    delimiter: z.enum([',', ';', '\t']).default(';'),
    encoding: z.enum(['utf-8', 'iso-8859-1']).default('utf-8'),
  });

  const data = schema.parse(body);

  // Export-Eintrag erstellen
  const exportEntry = await prisma.export.create({
    data: {
      organizationId,
      type: 'CSV',
      format: 'CSV',
      periodStart: data.periodStart || new Date(2000, 0, 1),
      periodEnd: data.periodEnd || new Date(),
      filename: `${data.type}_export_${new Date().toISOString().split('T')[0]}.csv`,
      status: 'PROCESSING',
    },
  });

  try {
    const result = await generateCsvExport({
      organizationId,
      type: data.type,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      delimiter: data.delimiter,
      encoding: data.encoding,
    });

    await prisma.export.update({
      where: { id: exportEntry.id },
      data: {
        status: 'COMPLETED',
        url: result.url,
        processedAt: new Date(),
      },
    });

    return c.json({
      success: true,
      message: 'CSV-Export erstellt',
      data: {
        exportId: exportEntry.id,
        url: result.url,
        rowCount: result.rowCount,
      },
    });
  } catch (error) {
    await prisma.export.update({
      where: { id: exportEntry.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw new AppError('CSV-Export fehlgeschlagen', 500, 'EXPORT_ERROR');
  }
});

// POST /exports/gdpdu - GDPdU-Export für Betriebsprüfung
exportsRouter.post('/gdpdu', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    periodStart: z.string().transform(s => new Date(s)),
    periodEnd: z.string().transform(s => new Date(s)),
  });

  const data = schema.parse(body);

  // Export-Eintrag erstellen
  const exportEntry = await prisma.export.create({
    data: {
      organizationId,
      type: 'GDPdU',
      format: 'CSV',
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      filename: `GDPdU_${data.periodStart.toISOString().split('T')[0]}_${data.periodEnd.toISOString().split('T')[0]}.zip`,
      status: 'PROCESSING',
    },
  });

  try {
    const result = await generateGdpduExport({
      organizationId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
    });

    await prisma.export.update({
      where: { id: exportEntry.id },
      data: {
        status: 'COMPLETED',
        url: result.url,
        processedAt: new Date(),
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: auth.userId,
        action: 'GDPDU_EXPORT_CREATED',
        entityType: 'Export',
        entityId: exportEntry.id,
        newData: { periodStart: data.periodStart, periodEnd: data.periodEnd } as any,
      },
    });

    return c.json({
      success: true,
      message: 'GDPdU-Export erstellt',
      data: {
        exportId: exportEntry.id,
        url: result.url,
      },
    });
  } catch (error) {
    await prisma.export.update({
      where: { id: exportEntry.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw new AppError('GDPdU-Export fehlgeschlagen', 500, 'EXPORT_ERROR');
  }
});

// GET /exports/:id - Export abrufen
exportsRouter.get('/:id', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const exportEntry = await prisma.export.findFirst({
    where: { id, organizationId },
  });

  if (!exportEntry) {
    throw new NotFoundError('Export');
  }

  return c.json({
    success: true,
    data: exportEntry,
  });
});

// GET /exports/:id/download - Export herunterladen
exportsRouter.get('/:id/download', async (c) => {
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const exportEntry = await prisma.export.findFirst({
    where: { id, organizationId },
  });

  if (!exportEntry) {
    throw new NotFoundError('Export');
  }

  if (exportEntry.status !== 'COMPLETED' || !exportEntry.url) {
    throw new AppError('Export nicht verfügbar', 400, 'EXPORT_NOT_READY');
  }

  // Redirect zur Download-URL
  return c.redirect(exportEntry.url);
});

// DELETE /exports/:id - Export löschen
exportsRouter.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const id = c.req.param('id');

  const exportEntry = await prisma.export.findFirst({
    where: { id, organizationId },
  });

  if (!exportEntry) {
    throw new NotFoundError('Export');
  }

  await prisma.export.delete({ where: { id } });

  // TODO: Datei aus S3 löschen

  return c.json({
    success: true,
    message: 'Export gelöscht',
  });
});

export { exportsRouter };
