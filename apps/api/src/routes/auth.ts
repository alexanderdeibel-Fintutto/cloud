import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { prisma } from '@fintutto/database';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { AppError, ValidationError } from '../middleware/error';

const authRouter = new Hono();

// Schemas
const registerSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  firstName: z.string().min(1, 'Vorname erforderlich'),
  lastName: z.string().min(1, 'Nachname erforderlich'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort erforderlich'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token erforderlich'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
});

// POST /auth/register - Registrierung
authRouter.post('/register', async (c) => {
  const body = await c.req.json();
  const data = registerSchema.parse(body);

  // Prüfen ob E-Mail bereits existiert
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError('E-Mail-Adresse bereits registriert', 409, 'EMAIL_EXISTS');
  }

  // Passwort hashen
  const passwordHash = await bcrypt.hash(data.password, 12);

  // Benutzer erstellen
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      status: 'ACTIVE',
      role: 'USER',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  // Token generieren
  const accessToken = await generateToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  // Session erstellen
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      userAgent: c.req.header('User-Agent'),
      ipAddress: c.req.header('X-Forwarded-For')?.split(',')[0]?.trim(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage
    },
  });

  return c.json({
    success: true,
    message: 'Registrierung erfolgreich',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  }, 201);
});

// POST /auth/login - Anmeldung
authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const data = loginSchema.parse(body);

  // Benutzer finden
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      twoFactorEnabled: true,
      organizations: {
        where: { status: 'ACTIVE' },
        select: {
          organizationId: true,
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.passwordHash) {
    throw new AppError('Ungültige E-Mail oder Passwort', 401, 'INVALID_CREDENTIALS');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError('Konto ist deaktiviert', 403, 'ACCOUNT_DISABLED');
  }

  // Passwort prüfen
  const validPassword = await bcrypt.compare(data.password, user.passwordHash);
  if (!validPassword) {
    throw new AppError('Ungültige E-Mail oder Passwort', 401, 'INVALID_CREDENTIALS');
  }

  // Standard-Organisation ermitteln
  const defaultOrg = user.organizations[0]?.organization || null;

  // Token generieren
  const accessToken = await generateToken(user.id, defaultOrg?.id);
  const refreshToken = await generateRefreshToken(user.id);

  // Session erstellen
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      userAgent: c.req.header('User-Agent'),
      ipAddress: c.req.header('X-Forwarded-For')?.split(',')[0]?.trim(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Login-Zeit aktualisieren
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return c.json({
    success: true,
    message: 'Anmeldung erfolgreich',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      organizations: user.organizations.map(m => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        logo: m.organization.logo,
        role: m.role,
      })),
      currentOrganization: defaultOrg,
      accessToken,
      refreshToken,
    },
  });
});

// POST /auth/logout - Abmeldung
authRouter.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Session löschen
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  return c.json({
    success: true,
    message: 'Erfolgreich abgemeldet',
  });
});

// POST /auth/refresh - Token erneuern
authRouter.post('/refresh', async (c) => {
  const body = await c.req.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    throw new ValidationError('Refresh Token erforderlich');
  }

  // Session finden
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new AppError('Ungültiger oder abgelaufener Refresh Token', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (session.user.status !== 'ACTIVE') {
    throw new AppError('Konto ist deaktiviert', 403, 'ACCOUNT_DISABLED');
  }

  // Neue Tokens generieren
  const newAccessToken = await generateToken(session.userId);
  const newRefreshToken = await generateRefreshToken(session.userId);

  // Session aktualisieren
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return c.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
});

// POST /auth/forgot-password - Passwort vergessen
authRouter.post('/forgot-password', async (c) => {
  const body = await c.req.json();
  const data = forgotPasswordSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  // Immer gleiche Antwort (Sicherheit)
  if (user) {
    // TODO: E-Mail mit Reset-Link senden
    console.log(`Password reset requested for: ${user.email}`);
  }

  return c.json({
    success: true,
    message: 'Wenn ein Konto mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.',
  });
});

// POST /auth/reset-password - Passwort zurücksetzen
authRouter.post('/reset-password', async (c) => {
  const body = await c.req.json();
  const data = resetPasswordSchema.parse(body);

  // TODO: Token validieren und Passwort zurücksetzen

  return c.json({
    success: true,
    message: 'Passwort wurde erfolgreich zurückgesetzt.',
  });
});

// GET /auth/me - Aktueller Benutzer
authRouter.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Nicht authentifiziert', 401, 'UNAUTHORIZED');
  }

  // Token validieren und Benutzer abrufen würde hier passieren
  // Vereinfacht für dieses Beispiel

  return c.json({
    success: true,
    data: {
      message: 'Use the protected routes with proper auth middleware',
    },
  });
});

export { authRouter };
