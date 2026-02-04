import { Context, Next } from 'hono';
import * as jose from 'jose';
import { prisma } from '@fintutto/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
    organizationId: string;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  try {
    // Token aus Header extrahieren
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' }, 401);
    }

    const token = authHeader.substring(7);

    // Token verifizieren
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // Benutzer validieren
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return c.json({ error: 'Unauthorized', message: 'User not found or inactive' }, 401);
    }

    // Organisation aus Header oder Token
    const organizationId = c.req.header('X-Organization-ID') || (payload.organizationId as string);

    // Prüfen ob Benutzer Zugriff auf die Organisation hat
    if (organizationId) {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: user.id,
          },
        },
        select: {
          role: true,
          status: true,
        },
      });

      if (!membership || membership.status !== 'ACTIVE') {
        return c.json({ error: 'Forbidden', message: 'No access to this organization' }, 403);
      }

      c.set('organizationId', organizationId);
    }

    // Auth-Kontext setzen
    c.set('auth', {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId,
    });

    await next();
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      return c.json({ error: 'Unauthorized', message: 'Token expired' }, 401);
    }
    if (error instanceof jose.errors.JWTInvalid) {
      return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
    }
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized', message: 'Authentication failed' }, 401);
  }
}

export async function generateToken(userId: string, organizationId?: string): Promise<string> {
  const token = await new jose.SignJWT({
    sub: userId,
    organizationId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = await new jose.SignJWT({
    sub: userId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  return token;
}
