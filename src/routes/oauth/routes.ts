import { Router } from 'express';

import { makeStartAuthorizationController } from '@/main/factories/controllers/oauth/makeStartAuthorizationController.js';
import { makeResolveSessionMiddleware } from '@/main/factories/middlewares/makeResolveSessionMiddleware.js';
import { makeAuthenticateMiddleware } from '@/main/factories/middlewares/makeAuthenticateMiddleware.js';
import { makeGetAuthorizationConsentController } from '@/main/factories/controllers/oauth/makeGetAuthorizationConsentController.js';

const oauthRoutes = Router();

const resolveSessionMiddleware = makeResolveSessionMiddleware();
const startAuthorizationController = makeStartAuthorizationController();
const authenticateMiddleware = makeAuthenticateMiddleware();
const getAuthorizationConsentController = makeGetAuthorizationConsentController();

oauthRoutes.get(
  '/authorize',
  resolveSessionMiddleware.handle(),
  startAuthorizationController.handle
);

oauthRoutes.get(
  '/authorization-requests/:authorizationRequestToken',
  authenticateMiddleware.handle(),
  getAuthorizationConsentController.handle
);

export { oauthRoutes };
