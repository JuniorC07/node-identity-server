import { describe, expect, it } from 'vitest';

import { BcryptPasswordHasherService } from '@/adapters/crypto/bcrypt/BcryptPasswordHasherService.js';

describe('BcryptPasswordHasherService', () => {
  it('should hash and verify a password without a pepper', async () => {
    const hasher = new BcryptPasswordHasherService('', 4);
    const hash = await hasher.hash('correct-password');

    await expect(hasher.verify('correct-password', hash)).resolves.toBe(true);
    await expect(hasher.verify('different-password', hash)).resolves.toBe(false);
  });

  it('should hash and verify a password with a pepper', async () => {
    const hasher = new BcryptPasswordHasherService('test-pepper', 4);
    const hash = await hasher.hash('correct-password');

    await expect(hasher.verify('correct-password', hash)).resolves.toBe(true);
    await expect(hasher.verify('different-password', hash)).resolves.toBe(false);
  });
});
