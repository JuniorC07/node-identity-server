import { authorizationRequestConfig } from '@/config/authorizationRequestConfig.js';
import { getOriginEnv } from '@/utils/environment/environmentVariables.js';

const defaultFrontendOrigin = new URL(authorizationRequestConfig.loginPageUrl).origin;

export const corsConfig = {
  allowedOrigin: getOriginEnv('IDENTITY_FRONTEND_ORIGIN', defaultFrontendOrigin),
  allowedHeaders: ['Content-Type', 'Authorization'] as const,
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const,
  maxAgeInSeconds: 600,
};
