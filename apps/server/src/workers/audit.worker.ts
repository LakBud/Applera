import { redis } from '../config/redis.js';
import AuditEvent from '../models/AuditEvent.js';

interface AuditEventPayload {
  event: string;
  userId: string;
  userType: 'user' | 'guest';
  requestId?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

const QUEUE_KEY = 'audit:queue';
const DEAD_LETTER_KEY = 'audit:queue:dead';
const POLL_INTERVAL = 2000;

// -----------------------------
// Safe JSON parse helper
// -----------------------------
function safeParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// -----------------------------
// Process valid entry
// -----------------------------
async function processEntry(raw: unknown): Promise<void> {
  if (typeof raw !== 'string') {
    console.error('[audit worker] invalid raw type:', raw);

    // push to dead letter queue
    await redis.lpush(DEAD_LETTER_KEY, JSON.stringify({ raw, reason: 'not-string' }));
    return;
  }

  const data = safeParse<AuditEventPayload>(raw);

  if (!data) {
    console.error('[audit worker] invalid JSON:', raw);

    await redis.lpush(DEAD_LETTER_KEY, JSON.stringify({ raw, reason: 'invalid-json' }));
    return;
  }

  // -----------------------------
  // Normalize metadata safely
  // -----------------------------
  let metadata = data.metadata;

  if (typeof metadata === 'string') {
    const parsed = safeParse<Record<string, unknown>>(metadata);
    metadata = parsed ?? undefined;
  }

  // -----------------------------
  // Validate required fields (basic guard)
  // -----------------------------
  if (!data.event || !data.userId || !data.userType) {
    console.error('[audit worker] missing required fields:', data);

    await redis.lpush(DEAD_LETTER_KEY, JSON.stringify({ data, reason: 'missing-fields' }));
    return;
  }

  if (!['user', 'guest'].includes(data.userType)) {
    console.error('[audit worker] invalid userType:', data.userType);
    await redis.lpush(DEAD_LETTER_KEY, JSON.stringify({ data, reason: 'invalid-userType' }));
    return;
  }

  // -----------------------------
  // Write to DB
  // -----------------------------
  try {
    await AuditEvent.create({
      event: data.event,
      userId: data.userId,
      userType: data.userType,
      requestId: data.requestId || undefined,
      resourceId: data.resourceId || undefined,
      ip: data.ip || undefined,
      userAgent: data.userAgent || undefined,
      metadata,
    });
  } catch (err) {
    console.error('[audit worker] DB error:', err);

    await redis.lpush(DEAD_LETTER_KEY, JSON.stringify({ data, reason: 'db-error' }));
  }
}

// -----------------------------
// Worker loop
// -----------------------------
export async function startAuditWorker(): Promise<void> {
  console.log('[audit worker] started');

  while (true) {
    try {
      const raw = await redis.rpop(QUEUE_KEY);

      if (!raw) {
        await new Promise((res) => setTimeout(res, POLL_INTERVAL));
        continue;
      }

      await processEntry(raw);
    } catch (err) {
      console.error('[audit worker] error', err);

      await new Promise((res) => setTimeout(res, POLL_INTERVAL));
    }
  }
}
