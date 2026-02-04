import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { nanoid } from 'nanoid';

// S3 Client konfigurieren
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'eu-central-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: process.env.S3_ACCESS_KEY_ID ? {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  } : undefined,
  forcePathStyle: !!process.env.S3_ENDPOINT, // Für MinIO/LocalStack
});

const BUCKET = process.env.S3_BUCKET || 'fintutto-uploads';
const PUBLIC_URL = process.env.S3_PUBLIC_URL || `https://${BUCKET}.s3.eu-central-1.amazonaws.com`;

interface UploadOptions {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  userId: string;
}

interface PresignedOptions {
  filename: string;
  mimeType: string;
  userId: string;
}

// Datei zu S3 hochladen
export async function uploadToS3(options: UploadOptions): Promise<{
  key: string;
  url: string;
  thumbnailUrl?: string;
}> {
  const { buffer, filename, mimeType, userId } = options;

  // Einzigartigen Schlüssel generieren
  const ext = filename.split('.').pop() || '';
  const key = `uploads/${userId}/${nanoid()}${ext ? '.' + ext : ''}`;

  // Hauptdatei hochladen
  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    Metadata: {
      originalFilename: filename,
      userId,
    },
  }));

  const url = `${PUBLIC_URL}/${key}`;
  let thumbnailUrl: string | undefined;

  // Thumbnail für Bilder erstellen
  if (mimeType.startsWith('image/')) {
    try {
      const thumbnail = await sharp(buffer)
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailKey = key.replace(/\.[^.]+$/, '_thumb.jpg');

      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: 'image/jpeg',
      }));

      thumbnailUrl = `${PUBLIC_URL}/${thumbnailKey}`;
    } catch (error) {
      console.error('Thumbnail creation failed:', error);
    }
  }

  return { key, url, thumbnailUrl };
}

// Presigned URL für direkten Upload erhalten
export async function getPresignedUploadUrl(options: PresignedOptions): Promise<{
  url: string;
  key: string;
  fields?: Record<string, string>;
}> {
  const { filename, mimeType, userId } = options;

  const ext = filename.split('.').pop() || '';
  const key = `uploads/${userId}/${nanoid()}${ext ? '.' + ext : ''}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { url, key };
}

// Presigned URL für Download erhalten
export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// Datei aus S3 löschen
export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));

  // Auch Thumbnail löschen falls vorhanden
  const thumbnailKey = key.replace(/\.[^.]+$/, '_thumb.jpg');
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: thumbnailKey,
    }));
  } catch {
    // Ignorieren wenn kein Thumbnail existiert
  }
}

// Bild verarbeiten und optimieren
export async function processImage(buffer: Buffer, options?: {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}): Promise<Buffer> {
  const {
    maxWidth = 2000,
    maxHeight = 2000,
    quality = 85,
    format = 'jpeg',
  } = options || {};

  let pipeline = sharp(buffer)
    .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true });

  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
  }

  return pipeline.toBuffer();
}
