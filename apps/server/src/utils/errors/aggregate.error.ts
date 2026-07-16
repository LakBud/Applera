import { AppError } from './app.error.js';

export class AppAggregateError extends AppError {
  constructor(
    public errors: unknown[],
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
  ) {
    super(message, statusCode, code);
  }
}
