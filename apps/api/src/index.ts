import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';

import { authRouter } from './routes/auth';
import { organizationsRouter } from './routes/organizations';
import { accountsRouter } from './routes/accounts';
import { contactsRouter } from './routes/contacts';
import { receiptsRouter } from './routes/receipts';
import { invoicesRouter } from './routes/invoices';
import { bookingsRouter } from './routes/bookings';
import { bankAccountsRouter } from './routes/bank-accounts';
import { reportsRouter } from './routes/reports';
import { exportsRouter } from './routes/exports';
import { aiRouter } from './routes/ai';
import { emailRouter } from './routes/email';
import { uploadsRouter } from './routes/uploads';
import { wizardRouter } from './routes/wizard';
import { dashboardRouter } from './routes/dashboard';
import { finapiRouter } from './routes/finapi';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { rateLimiter } from './middleware/rate-limit';

// App initialisieren
const app = new Hono();

// Globale Middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://*.fintutto.cloud',
    'https://fintutto.cloud',
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Organization-ID'],
}));

// Rate Limiting
app.use('*', rateLimiter);

// Error Handler
app.onError(errorHandler);

// Health Check
app.get('/', (c) => {
  return c.json({
    name: 'Fintutto API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Öffentliche Routen
app.route('/api/v1/auth', authRouter);

// Geschützte Routen (mit Auth-Middleware)
const protectedApp = new Hono();
protectedApp.use('*', authMiddleware);

protectedApp.route('/organizations', organizationsRouter);
protectedApp.route('/accounts', accountsRouter);
protectedApp.route('/contacts', contactsRouter);
protectedApp.route('/receipts', receiptsRouter);
protectedApp.route('/invoices', invoicesRouter);
protectedApp.route('/bookings', bookingsRouter);
protectedApp.route('/bank-accounts', bankAccountsRouter);
protectedApp.route('/reports', reportsRouter);
protectedApp.route('/exports', exportsRouter);
protectedApp.route('/ai', aiRouter);
protectedApp.route('/email', emailRouter);
protectedApp.route('/uploads', uploadsRouter);
protectedApp.route('/wizard', wizardRouter);
protectedApp.route('/dashboard', dashboardRouter);
protectedApp.route('/finapi', finapiRouter);

app.route('/api/v1', protectedApp);

// 404 Handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.method} ${c.req.path} not found`,
  }, 404);
});

// Server starten
const port = parseInt(process.env.PORT || '3001', 10);

console.log(`
🚀 Fintutto API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${port}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Docs: http://localhost:${port}/api/v1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

export default {
  port,
  fetch: app.fetch,
};

export { app };
