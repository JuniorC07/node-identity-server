import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { CorsMiddleware } from '@/middlewares/CorsMiddleware.js';

const config = {
  allowedOrigin: 'http://localhost:3001',
  allowedHeaders: ['Content-Type', 'Authorization'],
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
  maxAgeInSeconds: 600,
};

function makeSut(origin: string | undefined, method = 'GET') {
  const middleware = new CorsMiddleware(config);
  const next = vi.fn() as NextFunction;
  const setHeader = vi.fn();
  const vary = vi.fn();
  const sendStatus = vi.fn();
  const request = {
    method,
    get: vi.fn().mockReturnValue(origin),
  } as unknown as Request;
  const response = {
    setHeader,
    vary,
    sendStatus,
  } as unknown as Response;

  return { middleware, next, request, response, sendStatus, setHeader, vary };
}

describe('CorsMiddleware', () => {
  it('should allow the configured frontend origin with credentials', () => {
    const { middleware, next, request, response, setHeader, vary } = makeSut(
      config.allowedOrigin
    );

    middleware.handle()(request, response, next);

    expect(vary).toHaveBeenCalledWith('Origin');
    expect(setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', config.allowedOrigin);
    expect(setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
    expect(setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    expect(setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS'
    );
    expect(setHeader).toHaveBeenCalledWith('Access-Control-Max-Age', '600');
    expect(next).toHaveBeenCalledOnce();
  });

  it('should not add CORS permission headers for another origin', () => {
    const { middleware, next, request, response, setHeader } = makeSut(
      'https://untrusted.example.com'
    );

    middleware.handle()(request, response, next);

    expect(setHeader).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it('should finish an allowed preflight request', () => {
    const { middleware, next, request, response, sendStatus } = makeSut(
      config.allowedOrigin,
      'OPTIONS'
    );

    middleware.handle()(request, response, next);

    expect(sendStatus).toHaveBeenCalledWith(204);
    expect(next).not.toHaveBeenCalled();
  });
});
