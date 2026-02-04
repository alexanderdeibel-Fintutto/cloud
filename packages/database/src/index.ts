import { PrismaClient } from '@prisma/client';

// PrismaClient singleton für globale Nutzung
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-exportiere alle Prisma-Typen
export * from '@prisma/client';

// Export des PrismaClient-Typs
export type { PrismaClient };
