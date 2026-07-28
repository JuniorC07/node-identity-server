export interface AppErrorParams {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: Record<string, unknown>;

  constructor({ statusCode, code, message, details = {} }: AppErrorParams) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
