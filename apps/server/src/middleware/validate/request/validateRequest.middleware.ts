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
      });
    }

    req.body = result.data.body;
    req.params = result.data.params;
    req.query = result.data.query;

    next();
  };
}
