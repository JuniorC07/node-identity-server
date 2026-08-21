import {
  getAbsoluteUrlEnv,
  getPositiveIntegerEnv,
} from '@/utils/environment/environmentVariables.js';

export const authorizationRequestConfig = {
  lifetimeInSeconds: getPositiveIntegerEnv('AUTHORIZATION_REQUEST_LIFETIME_SECONDS', 600),
  loginPageUrl: getAbsoluteUrlEnv('IDENTITY_LOGIN_PAGE_URL', 'http://localhost:3001/login'),
  consentPageUrl: getAbsoluteUrlEnv(
    'IDENTITY_CONSENT_PAGE_URL',
    'http://localhost:3001/consent'
  ),
};
