import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadSessionExpiration(): Promise<number> {
  const module = await import('@/config/sessionExpirationInMilliSeconds.js');
  return module.sessionExpirationInMilliSeconds;
}

describe('sessionExpirationInMilliSeconds', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('should use fifteen days by default', async () => {
    vi.stubEnv('EXPIRATION_IN_MILLISECONDS', '');

    await expect(loadSessionExpiration()).resolves.toBe(1_296_000_000);
  });

  it('should load a positive integer expiration', async () => {
    vi.stubEnv('EXPIRATION_IN_MILLISECONDS', '3600000');

    await expect(loadSessionExpiration()).resolves.toBe(3_600_000);
  });

  it.each(['invalid', '0', '-1', '1.5'])(
    'should reject an invalid session expiration: %s',
    async (value) => {
      vi.stubEnv('EXPIRATION_IN_MILLISECONDS', value);

      await expect(loadSessionExpiration()).rejects.toThrow(
        'EXPIRATION_IN_MILLISECONDS must be a positive integer'
      );
    }
  );
});

