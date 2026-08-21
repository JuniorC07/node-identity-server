import { getPositiveIntegerEnv } from '@/utils/environment/environmentVariables.js';

const fifteenDaysInMilliseconds = 60 * 60 * 24 * 15 * 1000;

export const sessionExpirationInMilliSeconds = getPositiveIntegerEnv(
  'EXPIRATION_IN_MILLISECONDS',
  fifteenDaysInMilliseconds
);
