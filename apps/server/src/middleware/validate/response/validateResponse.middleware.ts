import { responseSchemas, type responseSchemaName } from './validateResponse.schemas.js';

import type { NextFunction, Request, Response } from 'express';

export function validateResponse<T extends responseSchemaName>(schemaName: T) {
  const schema = responseSchemas[schemaName];

  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      const result = schema.safeParse(body);

      if (!result.success) {
        console.error(`[validateResponse] ${schemaName} failed:`, result.error.issues);

        if (process.env.NODE_ENV !== 'production') {
          throw new Error(
            `Response validation failed for ${schemaName}: ${result.error.issues[0]?.message ?? 'Invalid response'}`,
          );
        }
      }

      return originalJson(body);
    };

    next();
  };
}
