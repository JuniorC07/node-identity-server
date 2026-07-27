interface HttpErrorParams {
  statusCode?: number;
  message?: string;
  details?: Record<string, unknown>;
  messageToken?: string;
}

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly messageToken: string;
  public readonly details: Record<string, unknown>;

  constructor({
    statusCode = 500,
    message = 'An error occurred',
    messageToken = 'generic_error',
    details = {},
  }: HttpErrorParams = {}) {
    super(message);

    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.messageToken = messageToken;
    this.details = details;

    Error.captureStackTrace(this, HttpError);
  }
}
