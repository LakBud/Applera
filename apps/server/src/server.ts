import { clerkMiddleware } from '@clerk/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { connectDB } from './config/db.js';
import { CLIENT_URL } from './config/env.js';
import { attachIdentity, requireUser } from './middleware/global/identity.middleware.js';
import { sanitizeHpp } from './middleware/global/sanitize.middleware.js';
import { requestLogger } from './middleware/log/request.logger.js';
import {
  earlyLimiter,
  globalLimiter,
  webhookLimiter,
} from './middleware/rate/rateLimiter.middleware.js';
import applicationRoutes from './routes/application.routes.js';
import cvRoutes from './routes/cv.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import interviewRoutes from './routes/interviewPrep.routes.js';
import jobRoutes from './routes/job.routes.js';
import trackerRoutes from './routes/tracker.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import { stripObject } from './utils/shared/sanitize.utils.js';
import './workers/audit.boot.js';

const app: express.Application = express();

const PORT: number = Number(process.env.PORT) || 5005;
const IS_PROD: boolean = process.env.NODE_ENV === 'production';

// Core security middleware
if (IS_PROD) app.set('trust proxy', 1);

// Strict CSP via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // tighten if you control styles
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", CLIENT_URL, 'http://localhost:5173'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: IS_PROD ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // only enable if you need COEP isolation
  }),
);

// Request ID FIRST
// Also writes X-Request-ID to the response
app.use((req: Request, res: Response, next: NextFunction) => {
  const id = crypto.randomUUID();
  req.requestId = id;
  res.locals.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
});

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        CLIENT_URL || 'http://localhost:5173',
        'https://www.applera.site',
        'https://applera.site',
      ];
      if (!origin || origin === 'null') {
        return callback(null, true);
      }
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  }),
);

// 3. Webhooks (must be before body parsing)
app.use('/api/webhooks', webhookLimiter, webhookRoutes);

// 4. Body parsing
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

app.use(earlyLimiter);

// ─────────────────────────────────────────────
// Health check (public)
// ─────────────────────────────────────────────

const publicRouter = express.Router();

publicRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(publicRouter);

app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));

// ─────────────────────────────────────────────
// Clerk middleware (ATTACHES req.auth)
// ─────────────────────────────────────────────

app.use(clerkMiddleware());
app.use(attachIdentity);

// ─────────────────────────────────────────────
// CSRF protection (double-submit cookie pattern)
// Clerk sends auth as a Bearer token in the Authorization header,
// so pure JWT API routes are CSRF-safe by default. This guard
// covers any route that may fall back to cookie-based sessions.
// ─────────────────────────────────────────────

const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (CSRF_SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  const tokenFromCookie = req.cookies['csrf-token'];
  const tokenFromHeader = req.headers['x-csrf-token'];

  if (!tokenFromCookie || tokenFromCookie !== tokenFromHeader) {
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }

  next();
});

// Endpoint the client can call to get a fresh CSRF token
publicRouter.get('/api/csrf-token', (req: Request, res: Response) => {
  const token = crypto.randomUUID();
  res.cookie('csrf-token', token, {
    httpOnly: false, // client JS needs to read this
    sameSite: IS_PROD ? 'none' : 'strict',
    secure: IS_PROD,
  });
  res.json({ csrfToken: token });
});

// ─────────────────────────────────────────────
// Input sanitisation
// ─────────────────────────────────────────────

app.use((req, _res, next) => {
  stripObject(req.body);
  stripObject(req.params);
  stripObject(req.query);

  next();
});

app.use(sanitizeHpp);
app.use(globalLimiter);
app.use(requestLogger);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.use('/api/cv', requireUser, cvRoutes);
app.use('/api/job', requireUser, jobRoutes);
app.use('/api/application', requireUser, applicationRoutes);
app.use('/api/interview', requireUser, interviewRoutes);
app.use('/api/tracker', requireUser, trackerRoutes);
app.use('/api/dashboard', requireUser, dashboardRoutes);

// ─────────────────────────────────────────────
// 404 catch-all (must come after all routes)
// ─────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ─────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error('[server]', {
    requestId: res.locals.requestId,
    error: err,
  });

  const message = err instanceof Error ? err.message : 'Unknown server error';

  res.status(500).json({
    error: IS_PROD ? 'An unexpected error occurred.' : message,
    requestId: res.locals.requestId,
  });
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────

async function start(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start();
