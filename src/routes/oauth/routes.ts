import { Router } from 'express';

import { makeDecideOAuthConsentController } from '@/main/factories/controllers/oauth/makeDecideOAuthConsentController.js';
import { makeStartAuthorizationController } from '@/main/factories/controllers/oauth/makeStartAuthorizationController.js';
import { makeGetPendingConsentDetailsController } from '@/main/factories/controllers/oauth/makeGetPendingConsentDetailsController.js';
import { makeResolveSessionMiddleware } from '@/main/factories/middlewares/makeResolveSessionMiddleware.js';

import { makeAuthenticateMiddleware } from '@/main/factories/middlewares/makeAuthenticateMiddleware.js';

const authenticateMiddleware = makeAuthenticateMiddleware();

const oauthRoutes = Router();

const resolveSessionMiddleware = makeResolveSessionMiddleware();
const startAuthorizationController = makeStartAuthorizationController();
const getPendingConsentDetailsController = makeGetPendingConsentDetailsController();
const decideOAuthConsentController = makeDecideOAuthConsentController();

oauthRoutes.get(
  '/authorize',
  resolveSessionMiddleware.handle(),
  startAuthorizationController.handle
);

oauthRoutes.get(
  '/authorization-requests/:authorizationRequestToken/consent',
  authenticateMiddleware.handle(),
  getPendingConsentDetailsController.handle
);

oauthRoutes.post(
  '/authorization-requests/:authorizationRequestToken/consent',
  authenticateMiddleware.handle(),
  decideOAuthConsentController.handle
);

export { oauthRoutes };
