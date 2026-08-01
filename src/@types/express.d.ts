import type { AuthContext } from '@/@types/AuthContext.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
