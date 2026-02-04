import { Context, Next } from 'hono';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const WINDOW_MS = 60 * 1000; // 1 Minute
const MAX_REQUESTS = 100; // Max Requests pro Fenster

export async function rateLimiter(c: Context, next: Next) {
  // Rate Limiting für API-Routen
  if (!c.req.path.startsWith('/api/')) {
    return next();
  }

  const ip = c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
    c.req.header('X-Real-IP') ||
    'unknown';

  const key = `${ip}:${c.req.path}`;
  const now = Date.now();

  // Aufräumen alter Einträge
  if (store[key] && store[key].resetTime < now) {
    delete store[key];
  }

  // Neuen Eintrag erstellen oder erhöhen
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
  } else {
    store[key].count++;
  }

  // Rate Limit Headers setzen
  c.header('X-RateLimit-Limit', MAX_REQUESTS.toString());
  c.header('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - store[key].count).toString());
  c.header('X-RateLimit-Reset', store[key].resetTime.toString());

  // Rate Limit überschritten
  if (store[key].count > MAX_REQUESTS) {
    c.header('Retry-After', Math.ceil((store[key].resetTime - now) / 1000).toString());
    return c.json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
    }, 429);
  }

  return next();
}
