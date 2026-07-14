import { responseSchemas, type responseSchemaName } from './validateResponse.schemas.js';

import type { NextFunction, Request, Response } from 'express';

export function validateResponse<T extends responseSchemaName>(schemaName: T) {
  const schema = responseSchemas[schemaName];

  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return originalJson(body);
      }

      const validationEnabled = process.env.NODE_ENV !== 'production';

      if (!validationEnabled) {
        return originalJson(body);
      }

      // Force Mongoose documents (and anything with a toJSON) to serialize
      // before validating, so schema checks run against the real wire shape.
      const serialized = JSON.parse(JSON.stringify(body));

      const result = schema.safeParse(serialized);

      if (!result.success) {
        console.error(
          `[validateResponse] ${schemaName} failed:`,
          result.error.issues.map(({ code, path, message }) => ({
            code,
            path,
            message,
          })),
        );

        const error = new Error(`Response validation failed for ${schemaName}`);
        error.name = 'ResponseValidationError';

        Object.assign(error, {
          schemaName,
          issues: result.error.issues,
        });

        next(error);

        return res;
      }

      return originalJson(body);
    };

    next();
  };
}
