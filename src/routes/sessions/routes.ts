import { Router } from 'express';

import { makeCreateLocalSessionController } from '@/main/factories/controllers/sessions/makeCreateSessionController.js';
import { makeRevokeSessionController } from '@/main/factories/controllers/sessions/makeRevokeSessionController.js';
import { makeAuthenticateMiddleware } from '@/main/factories/middlewares/makeAuthenticateMiddleware.js';

const authenticateMiddleware = makeAuthenticateMiddleware();

const sessionRoutes = Router();

const createUserController = makeCreateLocalSessionController();
const revokeSessionController = makeRevokeSessionController();

sessionRoutes.post('/', createUserController.handle);
sessionRoutes.delete('/current', authenticateMiddleware.handle(), revokeSessionController.handle);

export { sessionRoutes };
