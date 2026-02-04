import { prisma, ReceiptType } from '@fintutto/database';
import nodemailer from 'nodemailer';

interface ProcessAttachmentOptions {
  organizationId: string;
  userId: string;
  attachment: {
    id: string;
    filename: string;
    mimeType: string;
    url: string;
    size: number;
  };
  emailId: string;
}

// E-Mail-Anhang als Beleg verarbeiten
export async function processEmailAttachment(options: ProcessAttachmentOptions) {
  const { organizationId, userId, attachment, emailId } = options;

  // Unterstützte Dateitypen prüfen
  const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
  if (!supportedTypes.includes(attachment.mimeType)) {
    return null;
  }

  // Upload erstellen
  const upload = await prisma.upload.create({
    data: {
      userId,
      filename: attachment.url.split('/').pop() || attachment.filename,
      originalName: attachment.filename,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: attachment.url,
      ocrStatus: 'PENDING',
    },
  });

  // Beleg erstellen
  const receipt = await prisma.receipt.create({
    data: {
      organizationId,
      receiptDate: new Date(),
      netAmount: 0,
      taxAmount: 0,
      grossAmount: 0,
      type: ReceiptType.INCOMING_INVOICE,
      status: 'PENDING',
      originalFileName: attachment.filename,
      originalFileUrl: attachment.url,
      uploads: {
        connect: { id: upload.id },
      },
    },
  });

  return receipt;
}

// E-Mail senden
interface SendEmailOptions {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
    contentType?: string;
  }>;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@fintutto.cloud',
      to: options.to,
      cc: options.cc?.join(', '),
      bcc: options.bcc?.join(', '),
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
      replyTo: options.replyTo,
    });

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// Rechnung per E-Mail versenden
export async function sendInvoiceEmail(
  invoice: any,
  options: {
    to: string;
    cc?: string[];
    customSubject?: string;
    customMessage?: string;
  }
): Promise<boolean> {
  const subject = options.customSubject ||
    `Rechnung ${invoice.invoiceNumber} - ${invoice.organization?.name || 'Fintutto'}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Rechnung ${invoice.invoiceNumber}</h2>

      <p>Sehr geehrte Damen und Herren,</p>

      ${options.customMessage ? `<p>${options.customMessage}</p>` : `
        <p>anbei erhalten Sie unsere Rechnung ${invoice.invoiceNumber} vom
        ${new Date(invoice.invoiceDate).toLocaleDateString('de-DE')}.</p>
      `}

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Rechnungsnummer:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${invoice.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Rechnungsdatum:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(invoice.invoiceDate).toLocaleDateString('de-DE')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Fälligkeitsdatum:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(invoice.dueDate).toLocaleDateString('de-DE')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Gesamtbetrag:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(invoice.grossAmount))}</strong></td>
        </tr>
      </table>

      <p>Die Rechnung ist diesem E-Mail als PDF-Anhang beigefügt.</p>

      <p>Mit freundlichen Grüßen<br>
      ${invoice.organization?.name || 'Ihr Team'}</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

      <p style="font-size: 12px; color: #666;">
        Diese E-Mail wurde automatisch von Fintutto generiert.
      </p>
    </div>
  `;

  const attachments: any[] = [];

  // PDF-Anhang hinzufügen wenn vorhanden
  if (invoice.pdfUrl) {
    if (invoice.pdfUrl.startsWith('data:')) {
      // Base64 PDF
      const base64Data = invoice.pdfUrl.split(',')[1];
      attachments.push({
        filename: `Rechnung_${invoice.invoiceNumber}.pdf`,
        content: Buffer.from(base64Data, 'base64'),
        contentType: 'application/pdf',
      });
    } else {
      // URL
      attachments.push({
        filename: `Rechnung_${invoice.invoiceNumber}.pdf`,
        path: invoice.pdfUrl,
      });
    }
  }

  return sendEmail({
    to: options.to,
    cc: options.cc,
    subject,
    html,
    attachments,
    replyTo: invoice.organization?.email,
  });
}

// Zahlungserinnerung senden
export async function sendPaymentReminder(
  invoice: any,
  reminderLevel: number,
  options: { to: string }
): Promise<boolean> {
  const subjects = {
    1: `Zahlungserinnerung - Rechnung ${invoice.invoiceNumber}`,
    2: `2. Zahlungserinnerung - Rechnung ${invoice.invoiceNumber}`,
    3: `Letzte Mahnung - Rechnung ${invoice.invoiceNumber}`,
  };

  const subject = subjects[reminderLevel as keyof typeof subjects] || subjects[1];

  const openAmount = Number(invoice.grossAmount) - Number(invoice.paidAmount);
  const daysOverdue = Math.floor(
    (Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${reminderLevel >= 3 ? '⚠️ ' : ''}Zahlungserinnerung</h2>

      <p>Sehr geehrte Damen und Herren,</p>

      <p>wir möchten Sie darauf hinweisen, dass folgende Rechnung seit ${daysOverdue} Tagen offen ist:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9f9f9; padding: 15px;">
        <tr>
          <td style="padding: 8px;"><strong>Rechnungsnummer:</strong></td>
          <td style="padding: 8px;">${invoice.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px;"><strong>Rechnungsdatum:</strong></td>
          <td style="padding: 8px;">${new Date(invoice.invoiceDate).toLocaleDateString('de-DE')}</td>
        </tr>
        <tr>
          <td style="padding: 8px;"><strong>Fälligkeitsdatum:</strong></td>
          <td style="padding: 8px;">${new Date(invoice.dueDate).toLocaleDateString('de-DE')}</td>
        </tr>
        <tr>
          <td style="padding: 8px;"><strong>Offener Betrag:</strong></td>
          <td style="padding: 8px;"><strong style="color: #d32f2f;">${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(openAmount)}</strong></td>
        </tr>
      </table>

      ${reminderLevel >= 3 ? `
        <p style="color: #d32f2f;"><strong>Dies ist unsere letzte Zahlungsaufforderung.</strong>
        Sollte der Betrag nicht innerhalb von 7 Tagen auf unserem Konto eingehen,
        werden wir rechtliche Schritte einleiten.</p>
      ` : `
        <p>Bitte überweisen Sie den offenen Betrag schnellstmöglich.</p>
      `}

      <p>Sollte sich Ihre Zahlung mit diesem Schreiben überschnitten haben,
      betrachten Sie diese E-Mail bitte als gegenstandslos.</p>

      <p>Mit freundlichen Grüßen<br>
      ${invoice.organization?.name || 'Ihr Team'}</p>
    </div>
  `;

  return sendEmail({
    to: options.to,
    subject,
    html,
    replyTo: invoice.organization?.email,
  });
}
