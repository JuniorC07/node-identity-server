import { getEnvOrDefault } from '@/utils/environment/environmentVariables.js';

export const dummyPasswordHash = getEnvOrDefault(
  'DUMMY_PASSWORD_HASH',
  '$2b$14$9Rd5WGcLe4J4SQGz3AI4jusKYDW2fBA.p0d4JTEVbLtgq94n7hXDm'
);
