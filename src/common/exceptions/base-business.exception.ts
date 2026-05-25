export type ErrorDetails = Record<string, unknown>;

export class BaseBusinessException extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details: ErrorDetails | null;
  public readonly timestamp: string;

  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
    details: ErrorDetails | null = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}
