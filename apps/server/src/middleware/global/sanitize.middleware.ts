import hpp from 'hpp';

// ── HTTP Parameter Pollution protection ────────────────────
// whitelist allows multi-value query params when needed
export const sanitizeHpp = hpp({
  whitelist: ['tags', 'skills', 'sort', 'filter'],
});
