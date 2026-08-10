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

export const authorizationCodeConfig = {
  lifetimeInSeconds: positiveIntegerFromEnv('AUTHORIZATION_CODE_LIFETIME_SECONDS', 300),
};
