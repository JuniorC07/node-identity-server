function positiveIntegerFromEnv(name: string, defaultValue: number): number {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

export const authorizationRequestConfig = {
  lifetimeInSeconds: positiveIntegerFromEnv('AUTHORIZATION_REQUEST_LIFETIME_SECONDS', 600),
  loginPageUrl: process.env.IDENTITY_LOGIN_PAGE_URL ?? '/login',
  consentPageUrl: process.env.IDENTITY_CONSENT_PAGE_URL ?? '/consent',
};
