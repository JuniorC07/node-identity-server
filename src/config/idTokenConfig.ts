import { getPositiveIntegerEnv } from '@/utils/environment/environmentVariables.js';

export const idTokenConfig = {
  lifetimeInSeconds: getPositiveIntegerEnv('ID_TOKEN_LIFETIME_SECONDS', 600),
};
