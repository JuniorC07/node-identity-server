import type { AuthContext } from '@/@types/AuthContext.js';
import type { AccessTokenContext } from '@/@types/AccessTokenContext.ts';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      accessTokenAuth?: AccessTokenContext;
    }
  }
}

export {};
