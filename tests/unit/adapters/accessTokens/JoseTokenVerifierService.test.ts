import { generateKeyPair, SignJWT } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';

import { JoseTokenVerifierService } from '@/adapters/jwt/jose/JoseTokenVerifierService.js';
import { TokenVerificationError } from '@/errors/jwt/TokenVerificationError.js';
import type { ITokenKeyStoreService } from '@/services/jwt/ITokenKeyStoreService.js';

const KEY_ID = 'test-key-id';
const ISSUER = 'https://identity.example.com';
const AUDIENCE = 'example-service';

let privateKey: CryptoKey;
let anotherPrivateKey: CryptoKey;
let verifier: JoseTokenVerifierService;

interface MakeTokenOptions {
  audience?: string | string[];
  expiresAt?: number | null;
  issuedAt?: number | null;
  issuer?: string;
  keyId?: string;
  omitKeyId?: boolean;
  signingKey?: CryptoKey;
  subject?: string | null;
  type?: string;
}

async function makeToken(
  payload: Record<string, unknown>,
  options: MakeTokenOptions = {}
): Promise<string> {
  const issuedAt =
    options.issuedAt === undefined ? Math.floor(Date.now() / 1000) : options.issuedAt;
  const expiresAt =
    options.expiresAt === undefined
      ? (issuedAt ?? Math.floor(Date.now() / 1000)) + 600
      : options.expiresAt;
  const protectedHeader = {
    alg: 'RS256',
    typ: options.type ?? 'JWT',
    ...(options.omitKeyId ? {} : { kid: options.keyId ?? KEY_ID }),
  };

  const token = new SignJWT(payload)
    .setProtectedHeader(protectedHeader)
    .setIssuer(options.issuer ?? ISSUER)
    .setAudience(options.audience ?? AUDIENCE);

  if (options.subject !== null) {
    token.setSubject(options.subject ?? 'user-id');
  }

  if (issuedAt !== null) {
    token.setIssuedAt(issuedAt);
  }

  if (expiresAt !== null) {
    token.setExpirationTime(expiresAt);
  }

  return token.sign(options.signingKey ?? privateKey);
}

describe('JoseTokenVerifierService', () => {
  beforeAll(async () => {
    const keyPair = await generateKeyPair('RS256');
    const anotherKeyPair = await generateKeyPair('RS256');
    privateKey = keyPair.privateKey;
    anotherPrivateKey = anotherKeyPair.privateKey;

    const keyStore: ITokenKeyStoreService = {
      async getSigningKey() {
        return {
          id: KEY_ID,
          algorithm: 'RS256',
          privateKey: keyPair.privateKey,
        };
      },
      async findVerificationKey(keyId: string) {
        if (keyId !== KEY_ID) {
          return null;
        }

        return {
          id: KEY_ID,
          algorithm: 'RS256',
          publicKey: keyPair.publicKey,
        };
      },
    };

    verifier = new JoseTokenVerifierService(keyStore, {
      issuer: ISSUER,
      algorithm: 'RS256',
    });
  });

  it('should return the standard and custom claims from a valid token', async () => {
    const token = await makeToken({ sid: 'session-id', nonce: 'nonce' });

    const claims = await verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' });

    expect(claims).toEqual({
      issuer: ISSUER,
      subject: 'user-id',
      audience: [AUDIENCE],
      issuedAt: expect.any(Date),
      expiresAt: expect.any(Date),
      claims: {
        sid: 'session-id',
        nonce: 'nonce',
      },
    });
    expect(claims.expiresAt.getTime()).toBeGreaterThan(claims.issuedAt.getTime());
  });

  it('should preserve every audience from a valid access token', async () => {
    const audiences = [AUDIENCE, 'another-service'];
    const token = await makeToken({ sid: 'session-id' }, { audience: audiences });

    const claims = await verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' });

    expect(claims.audience).toEqual(audiences);
  });

  it('should reject a token with an invalid type', async () => {
    const token = await makeToken({ sid: 'session-id' }, { type: 'at+jwt' });

    await expect(
      verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'invalid',
    });
  });

  it('should reject a token with an unexpected algorithm', async () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({ sid: 'session-id' })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT', kid: KEY_ID })
      .setIssuer(ISSUER)
      .setSubject('user-id')
      .setAudience(AUDIENCE)
      .setIssuedAt(issuedAt)
      .setExpirationTime(issuedAt + 600)
      .sign(new TextEncoder().encode('a-secure-test-secret-with-32-bytes'));

    await expect(
      verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'invalid',
    });
  });

  it.each([
    { description: 'subject', options: { subject: null } },
    { description: 'issued-at', options: { issuedAt: null } },
    { description: 'expiration', options: { expiresAt: null } },
  ])('should reject a token without its $description claim', async ({ options }) => {
    const token = await makeToken({ sid: 'session-id' }, options);

    await expect(
      verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'invalid',
    });
  });

  it('should identify an expired token', async () => {
    const token = await makeToken(
      { sid: 'session-id' },
      { expiresAt: Math.floor(Date.now() / 1000) - 1 }
    );

    await expect(
      verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'expired',
      name: TokenVerificationError.name,
    });
  });

  it('should identify an invalid issuer', async () => {
    const token = await makeToken({ sid: 'session-id' }, { issuer: 'https://other.example.com' });

    await expect(
      verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'invalid_issuer',
      name: TokenVerificationError.name,
    });
  });

  it('should identify an invalid audience', async () => {
    const token = await makeToken({ sid: 'session-id' });

    await expect(
      verifier.verify({ token, audience: 'other-service', expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'invalid_audience',
      name: TokenVerificationError.name,
    });
  });

  it('should reject a token with an unknown key id', async () => {
    const token = await makeToken({ sid: 'session-id' }, { keyId: 'unknown-key-id' });

    await expect(
      verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'invalid_key_id',
      name: TokenVerificationError.name,
    });
  });

  it('should reject a token without a key id', async () => {
    const token = await makeToken({ sid: 'session-id' }, { omitKeyId: true });

    await expect(
      verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'invalid_key_id',
    });
  });

  it('should reject a token with an invalid signature', async () => {
    const token = await makeToken({ sid: 'session-id' }, { signingKey: anotherPrivateKey });

    await expect(
      verifier.verify({ token, audience: AUDIENCE, expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'invalid',
    });
  });

  it('should reject a malformed token', async () => {
    await expect(
      verifier.verify({ token: 'not-a-jwt', audience: AUDIENCE, expectedTyp: 'JWT' })
    ).rejects.toMatchObject({
      failure: 'invalid',
      name: TokenVerificationError.name,
    });
  });
});
