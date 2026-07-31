import { Router } from 'express';

import { makeCreateLocalSessionController } from '@/main/factories/sessions/makeCreateSessionController.js';

const sessionRoutes = Router();

const createUserController = makeCreateLocalSessionController();

sessionRoutes.post('/', createUserController.handle);

export { sessionRoutes };
