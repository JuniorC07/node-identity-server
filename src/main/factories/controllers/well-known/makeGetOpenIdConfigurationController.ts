import { openIdProviderConfiguration } from '@/config/oidcConfig.js';
import { GetOpenIdConfigurationController } from '@/controllers/well-known/GetOpenIdConfigurationController.js';

export function makeGetOpenIdConfigurationController(): GetOpenIdConfigurationController {
  return new GetOpenIdConfigurationController(openIdProviderConfiguration);
}
