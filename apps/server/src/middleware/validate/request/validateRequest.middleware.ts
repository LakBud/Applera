import { type requestSchemaName, requestSchemas } from './validateRequest.schemas.js';

import type { NextFunction, Request, Response } from 'express';

export function validateRequest<T extends requestSchemaName>(schemaName: T) {
  const schema = requestSchemas[schemaName];

  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        message: result.error.issues[0]?.message ?? 'Invalid request',
        issues: result.error.issues,
      });
    }

    req.validated = result.data;
    next();
  };
}
