import {
  getPositiveIntegerEnv,
  getRequiredBase64Env,
  getRequiredEnv,
} from '@/utils/environment/environmentVariables.js';
import { oidcConfig } from '@/config/oidcConfig.js';

export const accessTokenConfig = {
  algorithm: oidcConfig.signingAlgorithm,
  issuer: oidcConfig.issuer,
  lifetimeInSeconds: getPositiveIntegerEnv('ACCESS_TOKEN_LIFETIME_SECONDS', 600),
  signingKey: {
    id: getRequiredEnv('ACCESS_TOKEN_KEY_ID'),
    privateKey: getRequiredBase64Env('ACCESS_TOKEN_PRIVATE_KEY'),
    publicKey: getRequiredBase64Env('ACCESS_TOKEN_PUBLIC_KEY'),
  },
};
