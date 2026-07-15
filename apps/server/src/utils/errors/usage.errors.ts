import { AppError } from './app.error.js';

export class UsageLimitError extends AppError {
  constructor() {
    super('LLM usage limit reached', 402, 'USAGE_LIMIT_REACHED');
  }
}
