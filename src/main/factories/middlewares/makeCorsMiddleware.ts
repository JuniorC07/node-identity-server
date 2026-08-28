import type { RequestHandler } from 'express';

import { corsConfig } from '@/config/corsConfig.js';
import { CorsMiddleware } from '@/middlewares/CorsMiddleware.js';

export function makeCorsMiddleware(): RequestHandler {
  return new CorsMiddleware(corsConfig).handle();
}
