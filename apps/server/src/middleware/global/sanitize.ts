import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * ─────────────────────────────────────────────
 * SECURITY MIDDLEWARE
 * ─────────────────────────────────────────────
 * Applied globally BEFORE all routes.
 *
 * Protects against:
 * - NoSQL injection ($gt, $ne, etc.)
 * - HTTP parameter pollution (?a=1&a=2)
 * ─────────────────────────────────────────────
 */

// ── NoSQL injection protection ─────────────────────────────
export const sanitizeMongo = mongoSanitize({
  allowDots: false,
  // intentionally removing replaceWith:
  // default behavior deletes dangerous keys completely
});

// ── HTTP Parameter Pollution protection ────────────────────
// whitelist allows multi-value query params when needed
export const sanitizeHpp = hpp({
  whitelist: ['tags', 'skills', 'sort', 'filter'],
});
