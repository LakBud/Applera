import { type requestSchemaName, requestSchemas } from './validateRequest.schemas.js';

import type { NextFunction, Request, Response } from 'express';

export function validateRequest<T extends requestSchemaName>(schemaName: T) {
  const schema = requestSchemas[schemaName];

  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.parse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    req.body = result.body;
    req.params = result.params;

    Object.keys(req.query).forEach((key) => {
      delete req.query[key];
    });

    Object.assign(req.query, result.query);

    next();
  };
}
