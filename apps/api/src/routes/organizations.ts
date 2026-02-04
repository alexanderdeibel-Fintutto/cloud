import { Hono } from 'hono';
import { z } from 'zod';
import { prisma, LegalForm, ChartOfAccountsType, VatPeriod } from '@fintutto/database';
import { NotFoundError, ForbiddenError, AppError } from '../middleware/error';
import { seedChartOfAccounts, seedDefaultTaxSettings } from '@fintutto/database/src/seed';

const organizationsRouter = new Hono();

// Schemas
const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  legalForm: z.nativeEnum(LegalForm),
  taxId: z.string().optional(),
  vatId: z.string().optional(),
  tradeRegisterNumber: z.string().optional(),
  tradeRegisterCourt: z.string().optional(),
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('DE'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  chartOfAccounts: z.nativeEnum(ChartOfAccountsType).default(ChartOfAccountsType.SKR03),
  vatPeriod: z.nativeEnum(VatPeriod).default(VatPeriod.MONTHLY),
  smallBusiness: z.boolean().default(false),
  fiscalYearStart: z.number().min(1).max(12).default(1),
});

const updateOrganizationSchema = createOrganizationSchema.partial();

// Helper: Slug generieren
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /organizations - Alle Organisationen des Benutzers
organizationsRouter.get('/', async (c) => {
  const auth = c.get('auth');

  const memberships = await prisma.organizationMember.findMany({
    where: {
      userId: auth.userId,
      status: 'ACTIVE',
    },
    include: {
      organization: {
        include: {
          _count: {
            select: {
              members: true,
              invoices: true,
              receipts: true,
              bookings: true,
            },
          },
          subscriptions: {
            where: { status: { in: ['ACTIVE', 'TRIAL'] } },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      organization: { name: 'asc' },
    },
  });

  const organizations = memberships.map(m => ({
    ...m.organization,
    role: m.role,
    subscription: m.organization.subscriptions[0] || null,
    stats: m.organization._count,
  }));

  return c.json({
    success: true,
    data: organizations,
  });
});

// POST /organizations - Neue Organisation erstellen
organizationsRouter.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const data = createOrganizationSchema.parse(body);

  // Slug generieren
  let slug = generateSlug(data.name);
  let slugSuffix = 0;

  // Einzigartigen Slug sicherstellen
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slugSuffix++;
    slug = `${generateSlug(data.name)}-${slugSuffix}`;
  }

  // Organisation erstellen
  const organization = await prisma.organization.create({
    data: {
      ...data,
      slug,
      members: {
        create: {
          userId: auth.userId,
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      },
    },
  });

  // Kontenrahmen initialisieren
  await seedChartOfAccounts(organization.id, data.chartOfAccounts);

  // Steuereinstellungen initialisieren
  await seedDefaultTaxSettings(organization.id);

  // Aktuelles Geschäftsjahr erstellen
  const currentYear = new Date().getFullYear();
  const startMonth = data.fiscalYearStart - 1; // 0-basiert

  await prisma.fiscalYear.create({
    data: {
      organizationId: organization.id,
      year: currentYear,
      startDate: new Date(currentYear, startMonth, 1),
      endDate: new Date(currentYear + (startMonth > 0 ? 1 : 0), startMonth > 0 ? startMonth - 1 : 11,
        new Date(currentYear + (startMonth > 0 ? 1 : 0), startMonth > 0 ? startMonth : 12, 0).getDate()),
      status: 'OPEN',
    },
  });

  // Trial-Subscription erstellen
  await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      plan: 'FREE',
      status: 'TRIAL',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage Trial
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId: organization.id,
      userId: auth.userId,
      action: 'ORGANIZATION_CREATED',
      entityType: 'Organization',
      entityId: organization.id,
      newData: organization as any,
    },
  });

  return c.json({
    success: true,
    message: 'Organisation erfolgreich erstellt',
    data: organization,
  }, 201);
});

// GET /organizations/:id - Organisation abrufen
organizationsRouter.get('/:id', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId: auth.userId,
      },
    },
    include: {
      organization: {
        include: {
          bankAccounts: true,
          taxSettings: { where: { isActive: true } },
          fiscalYears: { orderBy: { year: 'desc' }, take: 3 },
          _count: {
            select: {
              members: true,
              contacts: true,
              invoices: true,
              receipts: true,
              bookings: true,
              accounts: true,
            },
          },
          subscriptions: {
            where: { status: { in: ['ACTIVE', 'TRIAL'] } },
            take: 1,
          },
        },
      },
    },
  });

  if (!membership) {
    throw new NotFoundError('Organisation');
  }

  return c.json({
    success: true,
    data: {
      ...membership.organization,
      role: membership.role,
      subscription: membership.organization.subscriptions[0] || null,
    },
  });
});

// PATCH /organizations/:id - Organisation aktualisieren
organizationsRouter.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateOrganizationSchema.parse(body);

  // Berechtigung prüfen
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId: auth.userId,
      },
    },
  });

  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    throw new ForbiddenError('Keine Berechtigung zum Bearbeiten');
  }

  const oldOrg = await prisma.organization.findUnique({ where: { id } });

  const organization = await prisma.organization.update({
    where: { id },
    data,
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId: id,
      userId: auth.userId,
      action: 'ORGANIZATION_UPDATED',
      entityType: 'Organization',
      entityId: id,
      oldData: oldOrg as any,
      newData: organization as any,
    },
  });

  return c.json({
    success: true,
    message: 'Organisation aktualisiert',
    data: organization,
  });
});

// GET /organizations/:id/members - Mitglieder abrufen
organizationsRouter.get('/:id/members', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');

  // Zugriff prüfen
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId: auth.userId,
      },
    },
  });

  if (!membership) {
    throw new NotFoundError('Organisation');
  }

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          lastLoginAt: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return c.json({
    success: true,
    data: members,
  });
});

// POST /organizations/:id/members - Mitglied einladen
organizationsRouter.post('/:id/members', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');
  const body = await c.req.json();

  const inviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'ACCOUNTANT', 'MEMBER', 'VIEWER']).default('MEMBER'),
  });

  const data = inviteSchema.parse(body);

  // Berechtigung prüfen
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId: auth.userId,
      },
    },
  });

  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    throw new ForbiddenError('Keine Berechtigung zum Einladen');
  }

  // Benutzer finden oder erstellen
  let user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user) {
    // Benutzer mit Einladung erstellen
    user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        status: 'INACTIVE',
      },
    });
  }

  // Prüfen ob bereits Mitglied
  const existingMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId: user.id,
      },
    },
  });

  if (existingMembership) {
    throw new AppError('Benutzer ist bereits Mitglied', 409, 'ALREADY_MEMBER');
  }

  // Mitgliedschaft erstellen
  const newMembership = await prisma.organizationMember.create({
    data: {
      organizationId: id,
      userId: user.id,
      role: data.role as any,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // TODO: Einladungs-E-Mail senden

  return c.json({
    success: true,
    message: 'Einladung gesendet',
    data: newMembership,
  }, 201);
});

// DELETE /organizations/:id/members/:userId - Mitglied entfernen
organizationsRouter.delete('/:id/members/:userId', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');
  const userId = c.req.param('userId');

  // Berechtigung prüfen
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId: auth.userId,
      },
    },
  });

  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    throw new ForbiddenError('Keine Berechtigung');
  }

  // Nicht sich selbst entfernen wenn Owner
  const targetMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId,
      },
    },
  });

  if (!targetMembership) {
    throw new NotFoundError('Mitglied');
  }

  if (targetMembership.role === 'OWNER') {
    throw new ForbiddenError('Owner kann nicht entfernt werden');
  }

  await prisma.organizationMember.delete({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId,
      },
    },
  });

  return c.json({
    success: true,
    message: 'Mitglied entfernt',
  });
});

// PATCH /organizations/:id/onboarding - Onboarding abschließen
organizationsRouter.patch('/:id/onboarding', async (c) => {
  const auth = c.get('auth');
  const id = c.req.param('id');

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: id,
        userId: auth.userId,
      },
    },
  });

  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    throw new ForbiddenError('Keine Berechtigung');
  }

  await prisma.organization.update({
    where: { id },
    data: { onboardingCompleted: true },
  });

  return c.json({
    success: true,
    message: 'Onboarding abgeschlossen',
  });
});

export { organizationsRouter };
