import { generateKeyPair, jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';

import { JoseIdTokenSignerService } from '@/adapters/idTokens/JoseIdTokenSignerService.js';
import type { ITokenKeyStoreService } from '@/services/accessTokens/ITokenKeyStoreService.js';

describe('JoseIdTokenSignerService', () => {
  it('should sign an ID token for the client with OIDC and session claims', async () => {
    const keyPair = await generateKeyPair('RS256');
    const keyStore = {
      async getSigningKey() {
        return { id: 'key-id', algorithm: 'RS256' as const, privateKey: keyPair.privateKey };
      },
      async findVerificationKey() {
        return { id: 'key-id', algorithm: 'RS256' as const, publicKey: keyPair.publicKey };
      },
    } satisfies ITokenKeyStoreService;
    const signer = new JoseIdTokenSignerService(keyStore, {
      issuer: 'https://identity.example.com',
      algorithm: 'RS256',
    });

    const result = await signer.sign({
      subject: 'user-id',
      audience: 'client-id',
      sessionId: 'session-id',
      nonce: 'nonce-value',
      claims: { preferred_username: 'junior', email: 'junior@example.com' },
      expiresInSeconds: 600,
    });
    const { payload, protectedHeader } = await jwtVerify(result.token, keyPair.publicKey, {
      issuer: 'https://identity.example.com',
      audience: 'client-id',
      algorithms: ['RS256'],
      typ: 'JWT',
    });

    expect(protectedHeader.kid).toBe('key-id');
    expect(payload.sub).toBe('user-id');
    expect(payload.sid).toBe('session-id');
    expect(payload.nonce).toBe('nonce-value');
    expect(payload.preferred_username).toBe('junior');
    expect(payload.email).toBe('junior@example.com');
    expect(result.expiresAt.getTime() - result.issuedAt.getTime()).toBe(600_000);
  });
});
