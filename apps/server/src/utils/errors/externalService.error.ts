import { AppError } from './app.error.js';

export class ExternalServiceError extends AppError {
  constructor(message = 'An external service failed. Please try again later.') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}
