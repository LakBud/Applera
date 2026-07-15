import { AppError } from './app.error.js';

export class UnauthorizedError extends AppError {
  constructor(message = 'You need to sign in to access this feature', code = 'UNAUTHORIZED') {
    super(message, 401, code);
    this.name = this.constructor.name;
  }
}
