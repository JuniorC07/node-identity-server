import { HttpError } from '@/errors/AppError.js';

export class BadRequestError extends HttpError {
  statusCode = 400;
  name = 'bad_request';
}
