import { Router } from 'express';

import { makeStartAuthorizationController } from '@/main/factories/controllers/oauth/makeStartAuthorizationController.js';
import { makeResolveSessionMiddleware } from '@/main/factories/middlewares/makeResolveSessionMiddleware.js';

const oauthRoutes = Router();

const resolveSessionMiddleware = makeResolveSessionMiddleware();
const startAuthorizationController = makeStartAuthorizationController();

oauthRoutes.get(
  '/authorize',
  resolveSessionMiddleware.handle(),
  startAuthorizationController.handle
);

export { oauthRoutes };
