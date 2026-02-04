import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, OcrStatus } from '@fintutto/database';
import { NotFoundError, AppError } from '../middleware/error';
import { processOcr } from '../services/ocr';
import { uploadToS3, getPresignedUploadUrl } from '../services/storage';

const uploadsRouter = new Hono();

// GET /uploads - Uploads auflisten
uploadsRouter.get('/', async (c) => {
  const auth = c.get('auth');
  const query = z.object({
    receiptId: z.string().optional(),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(50),
  }).parse(c.req.query());

  const where: any = { userId: auth.userId };
  if (query.receiptId) where.receiptId = query.receiptId;

  const [uploads, total] = await Promise.all([
    prisma.upload.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.upload.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      uploads,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
});

// POST /uploads/presigned - Presigned URL für Upload erhalten
uploadsRouter.post('/presigned', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  const schema = z.object({
    filename: z.string(),
    mimeType: z.string(),
    size: z.number().max(50 * 1024 * 1024), // Max 50MB
  });

  const data = schema.parse(body);

  // Unterstützte Dateitypen prüfen
  const supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (!supportedTypes.includes(data.mimeType)) {
    throw new AppError('Dateityp nicht unterstützt', 400, 'UNSUPPORTED_FILE_TYPE');
  }

  const presigned = await getPresignedUploadUrl({
    filename: data.filename,
    mimeType: data.mimeType,
    userId: auth.userId,
  });

  return c.json({
    success: true,
    data: presigned,
  });
});

// POST /uploads - Direkter Upload (Base64)
uploadsRouter.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  const schema = z.object({
    filename: z.string(),
    mimeType: z.string(),
    data: z.string(), // Base64
    receiptId: z.string().optional(),
  });

  const data = schema.parse(body);

  // Base64 dekodieren
  const buffer = Buffer.from(data.data, 'base64');

  if (buffer.length > 50 * 1024 * 1024) {
    throw new AppError('Datei zu groß (max 50MB)', 400, 'FILE_TOO_LARGE');
  }

  // Zu S3 hochladen
  const uploadResult = await uploadToS3({
    buffer,
    filename: data.filename,
    mimeType: data.mimeType,
    userId: auth.userId,
  });

  // Upload in DB speichern
  const upload = await prisma.upload.create({
    data: {
      userId: auth.userId,
      filename: uploadResult.key,
      originalName: data.filename,
      mimeType: data.mimeType,
      size: buffer.length,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      receiptId: data.receiptId,
      ocrStatus: 'PENDING',
    },
  });

  // OCR im Hintergrund starten
  processOcrInBackground(upload.id);

  return c.json({
    success: true,
    message: 'Datei hochgeladen',
    data: upload,
  }, 201);
});

// POST /uploads/confirm - Upload bestätigen (nach Presigned URL)
uploadsRouter.post('/confirm', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  const schema = z.object({
    key: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
    receiptId: z.string().optional(),
  });

  const data = schema.parse(body);

  const url = `${process.env.S3_PUBLIC_URL || 'https://storage.fintutto.cloud'}/${data.key}`;

  // Upload in DB speichern
  const upload = await prisma.upload.create({
    data: {
      userId: auth.userId,
      filename: data.key,
      originalName: data.filename,
      mimeType: data.mimeType,
      size: data.size,
      url,
      receiptId: data.receiptId,
      ocrStatus: 'PENDING',
    },
  });

  // OCR im Hintergrund starten
  processOcrInBackground(upload.id);

  return c.json({
    success: true,
    message: 'Upload bestätigt',
    data: upload,
  }, 201);
});

// GET /uploads/:id - Upload abrufen
uploadsRouter.get('/:id', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');

  const upload = await prisma.upload.findFirst({
    where: { id, userId: auth.userId },
    include: {
      receipt: true,
    },
  });

  if (!upload) {
    throw new NotFoundError('Upload');
  }

  return c.json({
    success: true,
    data: upload,
  });
});

// DELETE /uploads/:id - Upload löschen
uploadsRouter.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');

  const upload = await prisma.upload.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!upload) {
    throw new NotFoundError('Upload');
  }

  // Aus S3 löschen
  // await deleteFromS3(upload.filename);

  await prisma.upload.delete({ where: { id } });

  return c.json({
    success: true,
    message: 'Upload gelöscht',
  });
});

// POST /uploads/:id/ocr - OCR manuell starten
uploadsRouter.post('/:id/ocr', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');

  const upload = await prisma.upload.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!upload) {
    throw new NotFoundError('Upload');
  }

  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(upload.mimeType)) {
    throw new AppError('OCR nur für Bilder und PDFs verfügbar', 400, 'OCR_NOT_SUPPORTED');
  }

  // OCR starten
  await prisma.upload.update({
    where: { id },
    data: { ocrStatus: 'PROCESSING' },
  });

  try {
    const ocrResult = await processOcr(upload.url, upload.mimeType);

    await prisma.upload.update({
      where: { id },
      data: {
        ocrText: ocrResult.text,
        ocrStatus: 'COMPLETED',
        ocrProcessedAt: new Date(),
      },
    });

    return c.json({
      success: true,
      message: 'OCR abgeschlossen',
      data: {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
      },
    });
  } catch (error) {
    await prisma.upload.update({
      where: { id },
      data: { ocrStatus: 'FAILED' },
    });
    throw new AppError('OCR fehlgeschlagen', 500, 'OCR_ERROR');
  }
});

// GET /uploads/:id/ocr - OCR-Ergebnis abrufen
uploadsRouter.get('/:id/ocr', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');

  const upload = await prisma.upload.findFirst({
    where: { id, userId: auth.userId },
    select: {
      id: true,
      ocrStatus: true,
      ocrText: true,
      ocrProcessedAt: true,
    },
  });

  if (!upload) {
    throw new NotFoundError('Upload');
  }

  return c.json({
    success: true,
    data: upload,
  });
});

// Helper: OCR im Hintergrund verarbeiten
async function processOcrInBackground(uploadId: string) {
  // In Produktion würde dies in eine Queue/Worker ausgelagert
  setTimeout(async () => {
    try {
      const upload = await prisma.upload.findUnique({ where: { id: uploadId } });
      if (!upload || upload.ocrStatus !== 'PENDING') return;

      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(upload.mimeType)) {
        return;
      }

      await prisma.upload.update({
        where: { id: uploadId },
        data: { ocrStatus: 'PROCESSING' },
      });

      const ocrResult = await processOcr(upload.url, upload.mimeType);

      await prisma.upload.update({
        where: { id: uploadId },
        data: {
          ocrText: ocrResult.text,
          ocrStatus: 'COMPLETED',
          ocrProcessedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`OCR Error for upload ${uploadId}:`, error);
      await prisma.upload.update({
        where: { id: uploadId },
        data: { ocrStatus: 'FAILED' },
      });
    }
  }, 1000);
}

export { uploadsRouter };
