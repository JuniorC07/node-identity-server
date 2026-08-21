import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { InvalidOAuthClientError } from '@/errors/oauth/InvalidOAuthClientError.js';
import { InvalidOAuthGrantError } from '@/errors/oauth/InvalidOAuthGrantError.js';
import { ErrorHandlerMiddleware } from '@/middlewares/errorHandlerMiddleware.js';
import type { ILoggerService } from '@/services/ILoggerService.js';

function makeSut() {
  const logger = { error: vi.fn() } as unknown as ILoggerService;
  const middleware = new ErrorHandlerMiddleware(logger);
  const json = vi.fn();
  const setHeader = vi.fn();
  const response = {
    locals: {},
    json,
    setHeader,
  } as unknown as Response;
  const status = vi.fn().mockReturnValue(response);
  response.status = status;
  const request = {
    method: 'POST',
    path: '/oauth/token',
  } as Request;

  return { json, middleware, request, response, setHeader, status };
}

describe('ErrorHandlerMiddleware OAuth errors', () => {
  it('should format an OAuth error according to the OAuth response format', () => {
    const { json, middleware, request, response, setHeader, status } = makeSut();

    middleware.handle(
      new InvalidOAuthGrantError(),
      request,
      response,
      vi.fn() as NextFunction
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: 'invalid_grant',
      error_description: 'The OAuth authorization code is invalid, expired, or already used',
    });
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
  });

  it('should include the client authentication challenge for invalid credentials', () => {
    const { json, middleware, request, response, setHeader, status } = makeSut();

    middleware.handle(
      new InvalidOAuthClientError(true),
      request,
      response,
      vi.fn() as NextFunction
    );

    expect(status).toHaveBeenCalledWith(401);
    expect(setHeader).toHaveBeenCalledWith('WWW-Authenticate', 'Basic realm="oauth/token"');
    expect(json).toHaveBeenCalledWith({
      error: 'invalid_client',
      error_description: 'The OAuth client is invalid or does not exist',
    });
  });
});

