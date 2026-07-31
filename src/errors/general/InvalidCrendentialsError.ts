import { AppError } from '@/errors/AppError.js';

export class InvalidCrendentialsError extends AppError {
  constructor() {
    super({
      statusCode: 401,
      code: 'invalid_credentials',
      message: 'The provided credentials are invalid',
    });
  }
}
