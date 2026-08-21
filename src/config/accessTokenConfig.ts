import {
  getPositiveIntegerEnv,
  getRequiredBase64Env,
  getRequiredEnv,
} from '@/utils/environment/environmentVariables.js';

export const accessTokenConfig = {
  algorithm: 'RS256' as const,
  issuer: getRequiredEnv('ACCESS_TOKEN_ISSUER'),
  lifetimeInSeconds: getPositiveIntegerEnv('ACCESS_TOKEN_LIFETIME_SECONDS', 600),
  signingKey: {
    id: getRequiredEnv('ACCESS_TOKEN_KEY_ID'),
    privateKey: getRequiredBase64Env('ACCESS_TOKEN_PRIVATE_KEY'),
    publicKey: getRequiredBase64Env('ACCESS_TOKEN_PUBLIC_KEY'),
  },
};
