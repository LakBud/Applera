import { AppError } from './app.error.js';

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class MulterUploadError extends AppError {
  constructor(message: string, code = 'UPLOAD_ERROR') {
    super(message, 400, code);
  }
}
