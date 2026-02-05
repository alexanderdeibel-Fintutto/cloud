import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '@fintutto/database';
import { AppError, NotFoundError } from '../middleware/error';
import { finapi, convertFinAPITransaction } from '../services/finapi';

const finapiRouter = new Hono();

// FinAPI Token in User-Daten speichern
async function saveUserTokens(userId: string, tokens: any) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      finapiAccessToken: tokens.access_token,
      finapiRefreshToken: tokens.refresh_token,
      finapiTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
    },
  });
}

// User Token laden und ggf. erneuern
async function getUserToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      finapiAccessToken: true,
      finapiRefreshToken: true,
      finapiTokenExpiry: true,
    },
  });

  if (!user?.finapiAccessToken) {
    throw new AppError('FinAPI nicht verbunden', 401, 'FINAPI_NOT_CONNECTED');
  }

  // Token prüfen und ggf. erneuern
  if (user.finapiTokenExpiry && user.finapiTokenExpiry < new Date()) {
    if (!user.finapiRefreshToken) {
      throw new AppError('FinAPI Token abgelaufen', 401, 'FINAPI_TOKEN_EXPIRED');
    }

    const newTokens = await finapi.refreshUserToken(user.finapiRefreshToken);
    await saveUserTokens(userId, newTokens);
    return newTokens.access_token;
  }

  return user.finapiAccessToken;
}

// GET /finapi/status - Verbindungsstatus prüfen
finapiRouter.get('/status', async (c) => {
  const auth = c.get('auth');

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      finapiAccessToken: true,
      finapiTokenExpiry: true,
    },
  });

  const isConnected = !!user?.finapiAccessToken;
  const isExpired = user?.finapiTokenExpiry
    ? user.finapiTokenExpiry < new Date()
    : true;

  return c.json({
    success: true,
    data: {
      connected: isConnected && !isExpired,
      tokenExpiry: user?.finapiTokenExpiry,
    },
  });
});

// POST /finapi/authorize - Authorization URL generieren
finapiRouter.post('/authorize', async (c) => {
  // Für FinAPI v2 mit Web Form
  const clientToken = await finapi.getClientToken();

  // URL für die Bank-Verbindung generieren
  const authUrl = `${process.env.FINAPI_SANDBOX === 'true' ? 'https://sandbox.finapi.io' : 'https://live.finapi.io'}/oauth/authorize?` +
    new URLSearchParams({
      client_id: process.env.FINAPI_CLIENT_ID || '',
      redirect_uri: process.env.FINAPI_REDIRECT_URI || '',
      response_type: 'code',
      scope: 'all',
    }).toString();

  return c.json({
    success: true,
    data: {
      authorizationUrl: authUrl,
    },
  });
});

// POST /finapi/callback - OAuth Callback verarbeiten
finapiRouter.post('/callback', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  const schema = z.object({
    code: z.string(),
  });

  const { code } = schema.parse(body);

  try {
    const tokens = await finapi.getUserToken(code);
    await saveUserTokens(auth.userId, tokens);

    return c.json({
      success: true,
      message: 'FinAPI erfolgreich verbunden',
    });
  } catch (error) {
    console.error('FinAPI Callback Error:', error);
    throw new AppError('FinAPI Autorisierung fehlgeschlagen', 400, 'FINAPI_AUTH_FAILED');
  }
});

// POST /finapi/disconnect - Verbindung trennen
finapiRouter.post('/disconnect', async (c) => {
  const auth = c.get('auth');

  await prisma.user.update({
    where: { id: auth.userId },
    data: {
      finapiAccessToken: null,
      finapiRefreshToken: null,
      finapiTokenExpiry: null,
    },
  });

  return c.json({
    success: true,
    message: 'FinAPI Verbindung getrennt',
  });
});

// GET /finapi/banks - Banken suchen
finapiRouter.get('/banks', async (c) => {
  const auth = c.get('auth');
  const query = c.req.query('search') || '';

  if (query.length < 2) {
    return c.json({
      success: true,
      data: { banks: [] },
    });
  }

  const userToken = await getUserToken(auth.userId);
  const banks = await finapi.searchBanks(query, userToken);

  return c.json({
    success: true,
    data: { banks },
  });
});

// POST /finapi/connections - Bank-Verbindung starten
finapiRouter.post('/connections', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  const schema = z.object({
    bankId: z.number(),
  });

  const { bankId } = schema.parse(body);
  const userToken = await getUserToken(auth.userId);

  try {
    const webFormUrl = await finapi.getBankConnectionUrl(bankId, userToken);

    return c.json({
      success: true,
      data: {
        webFormUrl,
      },
    });
  } catch (error) {
    console.error('FinAPI Connection Error:', error);
    throw new AppError('Bank-Verbindung konnte nicht gestartet werden', 400, 'FINAPI_CONNECTION_FAILED');
  }
});

// GET /finapi/connections - Alle Bank-Verbindungen abrufen
finapiRouter.get('/connections', async (c) => {
  const auth = c.get('auth');
  const userToken = await getUserToken(auth.userId);

  const connections = await finapi.getBankConnections(userToken);

  return c.json({
    success: true,
    data: { connections },
  });
});

// POST /finapi/connections/:id/update - Bank-Verbindung aktualisieren
finapiRouter.post('/connections/:id/update', async (c) => {
  const auth = c.get('auth');
  const connectionId = parseInt(c.req.param('id'));
  const userToken = await getUserToken(auth.userId);

  try {
    const connection = await finapi.updateBankConnection(connectionId, userToken);

    return c.json({
      success: true,
      data: { connection },
    });
  } catch (error) {
    console.error('FinAPI Update Error:', error);
    throw new AppError('Aktualisierung fehlgeschlagen', 400, 'FINAPI_UPDATE_FAILED');
  }
});

// DELETE /finapi/connections/:id - Bank-Verbindung löschen
finapiRouter.delete('/connections/:id', async (c) => {
  const auth = c.get('auth');
  const connectionId = parseInt(c.req.param('id'));
  const userToken = await getUserToken(auth.userId);

  await finapi.deleteBankConnection(connectionId, userToken);

  return c.json({
    success: true,
    message: 'Bank-Verbindung gelöscht',
  });
});

// GET /finapi/accounts - Konten abrufen
finapiRouter.get('/accounts', async (c) => {
  const auth = c.get('auth');
  const userToken = await getUserToken(auth.userId);

  const accounts = await finapi.getAccounts(userToken);

  return c.json({
    success: true,
    data: { accounts },
  });
});

// GET /finapi/accounts/:id/balance - Kontostand abrufen
finapiRouter.get('/accounts/:id/balance', async (c) => {
  const auth = c.get('auth');
  const accountId = parseInt(c.req.param('id'));
  const userToken = await getUserToken(auth.userId);

  const balance = await finapi.getAccountBalance(accountId, userToken);

  return c.json({
    success: true,
    data: { balance },
  });
});

// GET /finapi/transactions - Transaktionen abrufen
finapiRouter.get('/transactions', async (c) => {
  const auth = c.get('auth');
  const userToken = await getUserToken(auth.userId);

  const query = z.object({
    accountIds: z.string().optional(),
    minDate: z.string().optional(),
    maxDate: z.string().optional(),
    page: z.coerce.number().default(1),
    perPage: z.coerce.number().default(100),
  }).parse(c.req.query());

  const transactions = await finapi.getTransactions(userToken, {
    accountIds: query.accountIds ? query.accountIds.split(',').map(Number) : undefined,
    minDate: query.minDate,
    maxDate: query.maxDate,
    page: query.page,
    perPage: query.perPage,
  });

  return c.json({
    success: true,
    data: transactions,
  });
});

// POST /finapi/import - Transaktionen in Fintutto importieren
finapiRouter.post('/import', async (c) => {
  const auth = c.get('auth');
  const organizationId = c.get('organizationId');
  const body = await c.req.json();

  const schema = z.object({
    finapiAccountId: z.number(),
    bankAccountId: z.string(), // Fintutto Bank Account ID
    minDate: z.string().optional(),
    maxDate: z.string().optional(),
  });

  const data = schema.parse(body);
  const userToken = await getUserToken(auth.userId);

  // Fintutto Bank Account prüfen
  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id: data.bankAccountId, organizationId },
  });

  if (!bankAccount) {
    throw new NotFoundError('Bankkonto');
  }

  // Transaktionen von FinAPI holen
  const { transactions } = await finapi.getTransactions(userToken, {
    accountIds: [data.finapiAccountId],
    minDate: data.minDate,
    maxDate: data.maxDate,
    perPage: 500,
  });

  // Existierende External IDs finden um Duplikate zu vermeiden
  const existingIds = await prisma.bankTransaction.findMany({
    where: {
      bankAccountId: data.bankAccountId,
      externalId: { startsWith: 'finapi_' },
    },
    select: { externalId: true },
  });

  const existingIdSet = new Set(existingIds.map((t: { externalId: string | null }) => t.externalId));

  // Neue Transaktionen filtern und konvertieren
  const newTransactions = transactions
    .filter(tx => !existingIdSet.has(`finapi_${tx.id}`))
    .map(tx => ({
      bankAccountId: data.bankAccountId,
      externalId: `finapi_${tx.id}`,
      date: new Date(tx.valueDate),
      valueDate: new Date(tx.bankBookingDate),
      amount: tx.amount,
      currency: tx.currency,
      counterpartyName: tx.counterpartName,
      counterpartyIban: tx.counterpartIban,
      counterpartyBic: tx.counterpartBic,
      reference: tx.purpose || '',
      type: tx.type,
      status: 'UNPROCESSED' as const,
      aiCategory: tx.category?.name,
    }));

  // Transaktionen in Datenbank speichern
  if (newTransactions.length > 0) {
    await prisma.bankTransaction.createMany({
      data: newTransactions,
      skipDuplicates: true,
    });
  }

  // Bank Account Sync-Status aktualisieren
  await prisma.bankAccount.update({
    where: { id: data.bankAccountId },
    data: {
      lastSyncAt: new Date(),
      syncStatus: 'SUCCESS',
    },
  });

  return c.json({
    success: true,
    message: `${newTransactions.length} Transaktionen importiert`,
    data: {
      imported: newTransactions.length,
      total: transactions.length,
      duplicatesSkipped: transactions.length - newTransactions.length,
    },
  });
});

export { finapiRouter };
