import { generateKeyPair, jwtVerify } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';

import { JoseTokenSignerService } from '@/adapters/accessTokens/JoseTokenSignerService.js';
import type { ITokenKeyStoreService } from '@/services/accessTokens/ITokenKeyStoreService.js';

const KEY_ID = 'test-key-id';
const ISSUER = 'https://identity.example.com';
const AUDIENCE = 'example-service';

let keyStore: ITokenKeyStoreService;
let publicKey: CryptoKey;

describe('JoseTokenSignerService', () => {
  beforeAll(async () => {
    const keyPair = await generateKeyPair('RS256');
    publicKey = keyPair.publicKey;

    keyStore = {
      async getSigningKey() {
        return {
          id: KEY_ID,
          algorithm: 'RS256',
          privateKey: keyPair.privateKey,
        };
      },
      async findVerificationKey() {
        return {
          id: KEY_ID,
          algorithm: 'RS256',
          publicKey: keyPair.publicKey,
        };
      },
    };
  });

  it('should sign an access token with its session id and explicit type', async () => {
    const signer = new JoseTokenSignerService(keyStore, {
      issuer: ISSUER,
      algorithm: 'RS256',
    });

    const result = await signer.sign({
      subject: 'user-id',
      sessionId: 'session-id',
      audience: AUDIENCE,
      expiresInSeconds: 600,
    });

    const { payload, protectedHeader } = await jwtVerify(result.token, publicKey, {
      algorithms: ['RS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
      typ: 'at+jwt',
    });

    expect(protectedHeader.kid).toBe(KEY_ID);
    expect(payload.sub).toBe('user-id');
    expect(payload.sid).toBe('session-id');
    expect(result.expiresAt.getTime() - result.issuedAt.getTime()).toBe(600_000);
  });
});
