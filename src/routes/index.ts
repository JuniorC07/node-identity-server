import { Router } from 'express';

import { usersRoutes } from '@/routes/users/routes.js';

const routes = Router();

routes.use('/users', usersRoutes);

export { routes };
