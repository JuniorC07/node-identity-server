import { type ErrorRequestHandler } from 'express';

import { HttpError } from '@/errors/AppError.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      name: error.name,
      details: error.details,
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    message: 'An error occurred',
    name: 'generic_error',
    details: {},
  });
};
