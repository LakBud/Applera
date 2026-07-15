export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code = 'INTERNAL_SERVER_ERROR',
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
