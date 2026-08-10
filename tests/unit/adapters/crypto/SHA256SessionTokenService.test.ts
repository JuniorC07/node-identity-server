import { describe, expect, it } from 'vitest';

import { SHA256SessionTokenService } from '@/adapters/crypto/sha256/SHA256SessionTokenService.js';

describe('SHA256SessionTokenService', () => {
  it('should generate an opaque token and expose only its SHA-256 hash for persistence', () => {
    const service = new SHA256SessionTokenService();
    const first = service.generate();
    const second = service.generate();

    expect(first.rawToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(service.hash(first.rawToken)).toBe(first.tokenHash);
    expect(second.rawToken).not.toBe(first.rawToken);
  });
});
