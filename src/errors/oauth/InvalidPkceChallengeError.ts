import { AppError } from '@/errors/AppError.js';

export class InvalidPkceChallengeError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_pkce_challenge',
      message: 'The PKCE code challenge is invalid',
    });
  }
}
