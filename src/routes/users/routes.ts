import { Router } from 'express';

import { makeCreateUserController } from '@/main/factories/controllers/users/makeCreateUserController.js';
import { makeGetAuthenticateUserController } from '@/main/factories/controllers/users/makeGetAuthenticateUserController.js';

import { makeAuthenticateMiddleware } from '@/main/factories/middlewares/makeAuthenticateMiddleware.js';

const usersRoutes = Router();

const createUserController = makeCreateUserController();
const authenticatedUserController = makeGetAuthenticateUserController();

const authenticateMiddleware = makeAuthenticateMiddleware();

usersRoutes.post('/', createUserController.handle);
usersRoutes.get('/me', authenticateMiddleware.handle(), authenticatedUserController.handle);

export { usersRoutes };
