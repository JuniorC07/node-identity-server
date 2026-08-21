import { generateKeyPair, jwtVerify } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';

import { JoseTokenSignerService } from '@/adapters/jwt/jose/JoseTokenSignerService.js';
import type { ITokenKeyStoreService } from '@/services/jwt/ITokenKeyStoreService.js';

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

  it('should sign a token with generic custom claims', async () => {
    const signer = new JoseTokenSignerService(keyStore, {
      issuer: ISSUER,
      algorithm: 'RS256',
    });

    const result = await signer.sign({
      subject: 'user-id',
      audience: AUDIENCE,
      expiresInSeconds: 600,
      typ: 'JWT',
      claims: {
        sid: 'session-id',
        client_id: 'client-id',
        scope: 'openid profile',
      },
    });

    const { payload, protectedHeader } = await jwtVerify(result.token, publicKey, {
      algorithms: ['RS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
      typ: 'JWT',
    });

    expect(protectedHeader.kid).toBe(KEY_ID);
    expect(payload.sub).toBe('user-id');
    expect(payload.sid).toBe('session-id');
    expect(payload.client_id).toBe('client-id');
    expect(payload.scope).toBe('openid profile');
    expect(result.expiresAt.getTime() - result.issuedAt.getTime()).toBe(600_000);
  });
});
