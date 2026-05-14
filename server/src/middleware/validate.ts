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
  createApplication: z
    .object({
      cvText: textField("cvText").optional(),
      cvId: z.string().min(1).optional(),
      jobText: textField("jobText"),
    })
    .superRefine((data, ctx) => {
      if (!data.cvText && !data.cvId) {
        ctx.addIssue({
          code: "custom",
          message: "Either cvText or cvId is required.",
          path: ["cvText"],
        });
      }
    }),

  createJob: z.object({
    jobText: textField("jobText").optional(),
  }),

  uploadCV: z.object({
    cvText: textField("cvText").optional(),
  }),
} as const;

type SchemaName = keyof typeof schemas;

export function validate<T extends SchemaName>(schemaName: T) {
  const schema = schemas[schemaName];

  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

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
