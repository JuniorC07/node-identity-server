import { AuthorizeAccessTokenMiddleware } from '@/middlewares/AuthorizeAccessTokenMiddleware.js';

export function makeAuthorizeAccessTokenMiddleware(): AuthorizeAccessTokenMiddleware {
  return new AuthorizeAccessTokenMiddleware();
}
