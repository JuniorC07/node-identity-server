import { Router } from 'express';

import { usersRoutes } from '@/routes/users/routes.js';
import { sessionRoutes } from '@/routes/sessions/routes.js';
import { adminOAuthRoutes } from '@/routes/admin/oauth/routes.js';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/sessions', sessionRoutes);
routes.use('/admin/oauth', adminOAuthRoutes);

export { routes };
