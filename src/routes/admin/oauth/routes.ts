import { Router } from 'express';

import { makeCreateOAuthClientController } from '@/main/factories/controllers/oauth/CreateOAuthClientController.js';
import { makeAuthenticateMiddleware } from '@/main/factories/middlewares/makeAuthenticateMiddleware.js';

const authenticateMiddleware = makeAuthenticateMiddleware();

const adminOAuthRoutes = Router();

const createOAuthClientController = makeCreateOAuthClientController();

adminOAuthRoutes.post(
  '/clients',
  authenticateMiddleware.handle(),
  createOAuthClientController.handle
);

export { adminOAuthRoutes };
