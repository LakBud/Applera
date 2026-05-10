import { z } from "zod";

// Request body validation using Zod.
// Runs before controllers — rejects malformed input with a clean 400
// instead of letting bad data propagate into services or the DB.
//
// Without this, type coercion attacks are possible:
//   { "cvText": ["array", "instead", "of", "string"] }
// would pass the `if (!cvText)` check but break downstream string operations.

const textField = (label, max = 20_000) =>
  z
    .string({ required_error: `${label} is required.` })
    .trim()
    .min(50, { message: `${label} is too short to be valid.` })
    .max(max, { message: `${label} exceeds the ${max} character limit.` });

const schemas = {
  createApplication: z.object({
    cvText: textField("cvText"),
    jobText: textField("jobText"),
  }),

  analyzeJob: z.object({
    jobText: textField("jobText").optional(), // optional — may use PDF upload instead
  }),

  uploadCV: z.object({
    cvText: textField("cvText").optional(), // optional — may use PDF upload instead
  }),
};

// ── Middleware factory ────────────────────────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against a named schema.
 *
 * Usage:
 *   router.post("/create", validate("createApplication"), createApplication);
 */

export function validate(schemaName) {
  const schema = schemas[schemaName];
  if (!schema) throw new Error(`[validate] Unknown schema: "${schemaName}"`);

  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message);
      return res.status(400).json({ error: errors[0], details: errors });
    }

    // Replace req.body with the parsed (trimmed, coerced) version
    req.body = result.data;
    next();
  };
}
