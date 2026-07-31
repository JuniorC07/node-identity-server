const expirationFromEnv = process.env.EXPIRATION_IN_MILLISECONDS;

export const sessionExpirationInMilliSeconds = expirationFromEnv
  ? Number(expirationFromEnv)
  : 60 * 60 * 24 * 15 * 1000; //default is 15 days
