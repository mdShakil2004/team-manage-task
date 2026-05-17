export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly errorCode: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const createNotFoundError = (message: string) =>
  new AppError(404, message, "NOT_FOUND");
