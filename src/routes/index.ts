import { Router } from 'express';

import { usersRoutes } from '@/routes/users/routes.js';
import { sessionRoutes } from '@/routes/sessions/routes.js';
import { adminOAuthRoutes } from '@/routes/admin/oauth/routes.js';
import { oauthRoutes } from '@/routes/oauth/routes.js';
import { wellKnowRoutes } from '@/routes/well-known/routes.js';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/sessions', sessionRoutes);
routes.use('/admin/oauth', adminOAuthRoutes);
routes.use('/oauth', oauthRoutes);
routes.use('/.well-known', wellKnowRoutes);

export { routes };
