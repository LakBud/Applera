export class UsageLimitError extends Error {
  constructor() {
    super('USAGE_LIMIT_REACHED');
    this.name = 'UsageLimitError';
  }
}
