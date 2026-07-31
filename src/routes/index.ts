import { Router } from 'express';

import { usersRoutes } from '@/routes/users/routes.js';
import { sessionRoutes } from '@/routes/sessions/routes.js';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/sessions', sessionRoutes);

export { routes };
