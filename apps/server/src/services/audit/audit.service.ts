import { redis } from '../../config/redis.js';
import { maskIp } from '../../utils/shared/sanitize.utils.js';

export type AuditEvent =
  | 'APPLICATION_CREATED'
  | 'APPLICATION_UPDATED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'CV_UPLOADED'
  | 'JOB_ANALYZED'
  | 'INTERVIEW_PREP_GENERATED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'RATE_LIMIT_HIT'
  | 'GUEST_SESSION_CREATED'
  | 'CV_DELETED'
  | 'CV_CREATED'
  | 'APPLICATION_STATUS_UPDATED'
  | 'APPLICATION_DELETED'
  | 'JOB_DELETED'
  | 'JOB_CREATED'
  | 'CV_PINNED'
  | 'RATE_LIMIT_HIT_IP';

export interface AuditLog {
  event: AuditEvent;

  userId: string;
  userType: 'user' | 'guest';

  requestId?: string;

  resourceId?: string;

  ip?: string;
  userAgent?: string;

  metadata?: Record<string, unknown>;
}

const QUEUE_KEY = 'audit:queue';

export async function auditLog(log: AuditLog): Promise<void> {
  const entry = {
    event: log.event,
    userId: log.userId,
    userType: log.userType,
    requestId: log.requestId ?? '',
    resourceId: log.resourceId ?? '',
    ip: log.ip ? maskIp(log.ip) : '',
    userAgent: log.userAgent ?? '',
    metadata: log.metadata ?? null,
    timestamp: new Date().toISOString(),
  };

  try {
    await redis.lpush(QUEUE_KEY, JSON.stringify(entry));
  } catch (err) {
    console.error('[auditLog] failed', { event: log.event, userId: log.userId, err });
  }
}
