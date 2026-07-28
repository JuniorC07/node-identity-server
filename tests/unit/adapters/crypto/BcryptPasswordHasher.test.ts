import { describe, expect, it } from 'vitest';

import { BcryptPasswordHasher } from '@/adapters/crypto/bcrypt/BcryptPasswordHasher.js';

describe('BcryptPasswordHasher', () => {
  it('should hash and verify a password without a pepper', async () => {
    const hasher = new BcryptPasswordHasher('', 4);
    const hash = await hasher.hash('correct-password');

    await expect(hasher.verify('correct-password', hash)).resolves.toBe(true);
    await expect(hasher.verify('different-password', hash)).resolves.toBe(false);
  });

  it('should hash and verify a password with a pepper', async () => {
    const hasher = new BcryptPasswordHasher('test-pepper', 4);
    const hash = await hasher.hash('correct-password');

    await expect(hasher.verify('correct-password', hash)).resolves.toBe(true);
    await expect(hasher.verify('different-password', hash)).resolves.toBe(false);
  });
});
