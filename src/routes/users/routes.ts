import { Router } from 'express';

import { makeCreateUserController } from '@/main/factories/controllers/makeCreateUser.js';

const usersRoutes = Router();

const createUserController = makeCreateUserController();

usersRoutes.post('/', createUserController.handle);

export { usersRoutes };
