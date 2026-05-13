import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const textField = (label: string, max: number = 20_000) =>
  z
    .string()
    .trim()
    .nonempty({ message: `${label} is required.` })
    .min(50, { message: `${label} is too short to be valid.` })
    .max(max, { message: `${label} exceeds the ${max} character limit.` });

// ── Schemas ───────────────────────────────────────────────────────

const schemas = {
  createApplication: z
    .object({
      // Either cvText (first call) or cvId (subsequent calls) must be present
      cvText: textField("cvText").optional(),
      cvId: z.string().trim().min(1, { message: "cvId must not be empty." }).optional(),
      jobText: textField("jobText"),
    })
    .refine((data) => data.cvText || data.cvId, {
      message: "Either cvText or cvId is required.",
      path: ["cvText"], // surface the error on cvText field
    }),

  analyzeJob: z.object({
    jobText: textField("jobText").optional(),
  }),

  uploadCV: z.object({
    cvText: textField("cvText").optional(),
  }),
} as const;

type SchemaName = keyof typeof schemas;

// ── Middleware factory ────────────────────────────────────────────

export function validate(schemaName: SchemaName) {
  const schema = schemas[schemaName];

  if (!schema) {
    throw new Error(`[validate] Unknown schema: "${schemaName}"`);
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message);
      res.status(400).json({ error: errors[0], details: errors });
      return;
    }

    req.body = result.data;
    next();
  };
}
