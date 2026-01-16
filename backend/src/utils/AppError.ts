export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(
    message: string,
    statusCode = 400,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;

    // Restore prototype chain (important for instanceof)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}