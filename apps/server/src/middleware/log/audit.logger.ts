import { redis } from '../../integrations/redis.js';

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

const STREAM_KEY = 'audit:stream';

/**
 * Writes audit event into Redis Stream
 */
export async function auditLog(log: AuditLog) {
  try {
    await redis.xadd(STREAM_KEY, '*', {
      event: log.event,
      userId: log.userId,
      userType: log.userType,
      requestId: log.requestId ?? '',
      resourceId: log.resourceId ?? '',
      ip: log.ip ?? '',
      userAgent: log.userAgent ?? '',
      metadata: log.metadata ? JSON.stringify(log.metadata) : '',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // audit logging must NEVER break production flow
    console.error('[audit logger failed]', err);
  }
}
