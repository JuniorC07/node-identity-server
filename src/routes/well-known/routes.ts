import { Router } from 'express';

import { makeGetJsonWebKeySetController } from '@/main/factories/controllers/well-known/makeGetJsonWebKeySetController.js';
import { makeGetOpenIdConfigurationController } from '@/main/factories/controllers/well-known/makeGetOpenIdConfigurationController.js';

const wellKnowRoutes = Router();

const getJsonWebKeySetController = makeGetJsonWebKeySetController();
const getOpenIdConfigurationController = makeGetOpenIdConfigurationController();

wellKnowRoutes.get('/jwks.json', getJsonWebKeySetController.handle);
wellKnowRoutes.get('/openid-configuration', getOpenIdConfigurationController.handle);

export { wellKnowRoutes };
