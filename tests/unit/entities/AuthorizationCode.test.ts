import { describe, expect, it } from 'vitest';

import { AuthorizationCode } from '@/entities/AuthorizationCode.js';

function makeAuthorizationCode(expiresAt = new Date('2026-08-09T12:05:00.000Z')) {
  return new AuthorizationCode({
    id: 'code-id',
    codeHash: 'a'.repeat(64),
    oauthClientId: 'oauth-client-id',
    userId: 'user-id',
    sessionId: 'session-id',
    redirectUri: 'https://client.example.com/callback',
    grantedScopes: ['openid'],
    nonce: 'nonce',
    codeChallenge: 'A'.repeat(43),
    codeChallengeMethod: 'S256',
    createdAt: new Date('2026-08-09T12:00:00.000Z'),
    expiresAt,
    usedAt: null,
  });
}

describe('AuthorizationCode', () => {
  it('should be valid before expiration and unused', () => {
    const code = makeAuthorizationCode();

    expect(code.isExpired(new Date('2026-08-09T12:04:59.999Z'))).toBe(false);
    expect(code.isUsed()).toBe(false);
  });

  it('should expire exactly at expiresAt', () => {
    const code = makeAuthorizationCode();

    expect(code.isExpired(new Date('2026-08-09T12:05:00.000Z'))).toBe(true);
  });

  it('should report a used code', () => {
    const code = makeAuthorizationCode();
    code.usedAt = new Date('2026-08-09T12:01:00.000Z');

    expect(code.isUsed()).toBe(true);
  });
});
