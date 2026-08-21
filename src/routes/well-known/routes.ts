import { Router } from 'express';

import { makeGetJsonWebKeySetController } from '@/main/factories/controllers/well-known/makeGetJsonWebKeySetController.js';

const wellKnowRoutes = Router();

const getJsonWebKeySetController = makeGetJsonWebKeySetController();

wellKnowRoutes.get('/jwks.json', getJsonWebKeySetController.handle);

export { wellKnowRoutes };
