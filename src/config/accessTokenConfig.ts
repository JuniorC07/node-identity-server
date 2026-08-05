function requiredNumber(name: string, defaultValue: number): number {
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

function required(name: string, decodeBase64 = false): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }
  if (decodeBase64) {
    try {
      return Buffer.from(value, 'base64').toString('utf8');
    } catch (error) {
      throw new Error(
        `Failed to decode ${name}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error }
      );
    }
  }
  return value;
}

export const accessTokenConfig = {
  algorithm: 'RS256' as const,
  issuer: required('ACCESS_TOKEN_ISSUER'),
  lifetimeInSeconds: requiredNumber('ACCESS_TOKEN_LIFETIME_SECONDS', 600),
  signingKey: {
    id: required('ACCESS_TOKEN_KEY_ID'),
    privateKey: required('ACCESS_TOKEN_PRIVATE_KEY', true),
    publicKey: required('ACCESS_TOKEN_PUBLIC_KEY', true),
  },
};
