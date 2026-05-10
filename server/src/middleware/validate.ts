import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Request body validation using Zod.
// Runs before controllers — rejects malformed input with a clean 400
// instead of letting bad data propagate into services or the DB.
//
// Without this, type coercion attacks are possible:
//   { "cvText": ["array", "instead", "of", "string"] }
// would pass the `if (!cvText)` check but break downstream string operations.

const textField = (label: string, max: number = 20_000) =>
  z
    .string()
    .trim()
    .nonempty({ message: `${label} is required.` })
    .min(50, { message: `${label} is too short to be valid.` })
    .max(max, { message: `${label} exceeds the ${max} character limit.` });

// ── Schemas ────────────────────────────────────────────────────────────────

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
} as const;

// derive valid schema names from object keys
type SchemaName = keyof typeof schemas;

// ── Middleware factory ────────────────────────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against a named schema.
 *
 * Usage:
 *   router.post("/create", validate("createApplication"), createApplication);
 */

export function validate(schemaName: SchemaName) {
  const schema = schemas[schemaName];

  if (!schema) {
    throw new Error(`[validate] Unknown schema: "${schemaName}"`);
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message);

      res.status(400).json({
        error: errors[0],
        details: errors,
      });

      return;
    }

    // Replace req.body with the parsed (trimmed, coerced) version
    req.body = result.data;

    next();
  };
}
