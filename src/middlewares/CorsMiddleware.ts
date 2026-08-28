import type { RequestHandler } from 'express';

interface CorsMiddlewareConfig {
  allowedOrigin: string;
  allowedHeaders: readonly string[];
  allowedMethods: readonly string[];
  maxAgeInSeconds: number;
}

export class CorsMiddleware {
  constructor(private readonly config: CorsMiddlewareConfig) {}

  handle(): RequestHandler {
    return (req, res, next) => {
      const origin = req.get('origin');
      const originAllowed = origin === this.config.allowedOrigin;

      res.vary('Origin');

      if (originAllowed) {
        res.setHeader('Access-Control-Allow-Origin', this.config.allowedOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', this.config.allowedHeaders.join(', '));
        res.setHeader('Access-Control-Allow-Methods', this.config.allowedMethods.join(', '));
        res.setHeader('Access-Control-Max-Age', String(this.config.maxAgeInSeconds));
      }

      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }

      next();
    };
  }
}
