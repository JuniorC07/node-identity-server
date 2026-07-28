import { AppError } from '@/errors/AppError.js';

export class UserAlreadyExistsError extends AppError {
  constructor() {
    super({
      statusCode: 409,
      code: 'user_already_exists',
      message: 'A user with the provided credentials already exists',
    });
  }
}
