import { AppError } from '@/errors/AppError.js';

export class InvalidCrendentialsError extends AppError {
  constructor(message?: string) {
    super({
      statusCode: 401,
      code: 'invalid_credentials',
      message: message ?? 'The provided credentials are invalid',
    });
  }
}
