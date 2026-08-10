import { Router } from 'express';

import { makeStartAuthorizationController } from '@/main/factories/controllers/oauth/makeStartAuthorizationController.js';
import { makeResolveSessionMiddleware } from '@/main/factories/middlewares/makeResolveSessionMiddleware.js';
import { makeAuthenticateMiddleware } from '@/main/factories/middlewares/makeAuthenticateMiddleware.js';
import { makeGetAuthorizationConsentController } from '@/main/factories/controllers/oauth/makeGetAuthorizationConsentController.js';
import { makeAuthorizationDecisionController } from '@/main/factories/controllers/oauth/makeAuthorizationDecisionController.js';
import { makeTokenController } from '@/main/factories/controllers/oauth/makeTokenController.js';

const oauthRoutes = Router();

const resolveSessionMiddleware = makeResolveSessionMiddleware();
const startAuthorizationController = makeStartAuthorizationController();
const authenticateMiddleware = makeAuthenticateMiddleware();
const getAuthorizationConsentController = makeGetAuthorizationConsentController();
const authorizationDecisionController = makeAuthorizationDecisionController();
const tokenController = makeTokenController();

oauthRoutes.get(
  '/authorize',
  resolveSessionMiddleware.handle(),
  startAuthorizationController.handle
);

oauthRoutes.post(
  '/authorize/decision',
  authenticateMiddleware.handle(),
  authorizationDecisionController.handle
);

oauthRoutes.post('/token', tokenController.handle);

oauthRoutes.get(
  '/authorization-requests/:authorizationRequestToken',
  authenticateMiddleware.handle(),
  getAuthorizationConsentController.handle
);

export { oauthRoutes };
