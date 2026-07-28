interface HttpErrorParams {
  statusCode?: number;
  message?: string;
  details?: Record<string, unknown>;
  name?: string;
}

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly name: string;
  public readonly details: Record<string, unknown>;

  constructor({
    statusCode = 500,
    message = 'An error occurred',
    name = 'generic_error',
    details = {},
  }: HttpErrorParams = {}) {
    super(message);

    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.name = name;
    this.details = details;

    Error.captureStackTrace(this, HttpError);
  }
}
