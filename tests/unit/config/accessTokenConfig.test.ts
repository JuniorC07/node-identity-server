import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const PRIVATE_KEY = 'private-key-pem';
const PUBLIC_KEY = 'public-key-pem';

function stubValidEnvironment(): void {
  vi.stubEnv('ACCESS_TOKEN_ISSUER', 'https://identity.example.com');
  vi.stubEnv('ACCESS_TOKEN_LIFETIME_SECONDS', '900');
  vi.stubEnv('ACCESS_TOKEN_KEY_ID', 'test-key-id');
  vi.stubEnv('ACCESS_TOKEN_PRIVATE_KEY', Buffer.from(PRIVATE_KEY).toString('base64'));
  vi.stubEnv('ACCESS_TOKEN_PUBLIC_KEY', Buffer.from(PUBLIC_KEY).toString('base64'));
}

async function loadConfig() {
  const module = await import('@/config/accessTokenConfig.js');
  return module.accessTokenConfig;
}

describe('accessTokenConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    stubValidEnvironment();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('should load and decode the access token configuration', async () => {
    const config = await loadConfig();

    expect(config).toEqual({
      algorithm: 'RS256',
      issuer: 'https://identity.example.com',
      lifetimeInSeconds: 900,
      signingKey: {
        id: 'test-key-id',
        privateKey: PRIVATE_KEY,
        publicKey: PUBLIC_KEY,
      },
    });
  });

  it('should use the default access token lifetime when it is not configured', async () => {
    vi.stubEnv('ACCESS_TOKEN_LIFETIME_SECONDS', '');

    const config = await loadConfig();

    expect(config.lifetimeInSeconds).toBe(600);
  });

  it.each([
    'ACCESS_TOKEN_ISSUER',
    'ACCESS_TOKEN_KEY_ID',
    'ACCESS_TOKEN_PRIVATE_KEY',
    'ACCESS_TOKEN_PUBLIC_KEY',
  ])('should reject a missing %s variable', async (name) => {
    vi.stubEnv(name, '');

    await expect(loadConfig()).rejects.toThrow(`${name} is required`);
  });

  it.each(['invalid', '0', '-1', '1.5'])(
    'should reject an invalid token lifetime: %s',
    async (value) => {
      vi.stubEnv('ACCESS_TOKEN_LIFETIME_SECONDS', value);

      await expect(loadConfig()).rejects.toThrow(
        'ACCESS_TOKEN_LIFETIME_SECONDS must be a positive integer'
      );
    }
  );
});
