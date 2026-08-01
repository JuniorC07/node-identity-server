import { AppError } from '@/errors/AppError.js';

export class UnauthorizedError extends AppError {
  constructor() {
    super({
      statusCode: 401,
      code: 'unauthorized',
      message: 'Valid authentication are required to access this resource.',
    });
  }
}
