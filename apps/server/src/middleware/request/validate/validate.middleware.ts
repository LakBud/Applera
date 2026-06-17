import type { NextFunction, Request, Response } from 'express';

import { requestSchemaName, requestSchemas } from './validate.schemas.js';

export function validate<T extends requestSchemaName>(schemaName: T) {
  const schema = requestSchemas[schemaName];
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        message: result.error.issues[0].message,
        issues: result.error.issues,
      });
    }
    req.validated = result.data;
    next();
  };
}
