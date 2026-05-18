import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

const textField = (label: string, max = 20_000, min = 10) =>
  z
    .string()
    .trim()
    .nonempty({ message: `${label} is required.` })
    .min(min, { message: `${label} is too short.` })
    .max(max, { message: `${label} exceeds limit.` });

const schemas = {
  createApplication: z.object({
    cvId: z.string().min(1),
    jobId: z.string().min(1),
  }),

  createJob: z.object({
    jobText: textField("jobText").optional(), // optional because file upload has no body
  }),

  uploadCV: z.object({
    cvText: textField("cvText").optional(), // optional because file upload has no body
  }),
} as const;

type SchemaName = keyof typeof schemas;

export function validate<T extends SchemaName>(schemaName: T) {
  const schema = schemas[schemaName];

  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        message: result.error.issues[0].message,
        issues: result.error.issues,
      });
    }

    req.validated = result.data;
    next();
  };
}
