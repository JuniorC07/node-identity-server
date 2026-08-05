import { generateKeyPair, SignJWT } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';

import { JoseTokenVerifierService } from '@/adapters/accessTokens/JoseTokenVerifierService.js';
import { AccessTokenExpiredError } from '@/errors/accessTokens/AccessTokenExpiredError.js';
import { InvalidAccessTokenAudienceError } from '@/errors/accessTokens/InvalidAccessTokenAudienceError.js';
import { InvalidAccessTokenError } from '@/errors/accessTokens/InvalidAccessTokenError.js';
import { InvalidAccessTokenIssuerError } from '@/errors/accessTokens/InvalidAccessTokenIssuerError.js';
import { InvalidAccessTokenKeyIdError } from '@/errors/accessTokens/InvalidAccessTokenKeyIdError.js';
import type { ITokenKeyStoreService } from '@/services/accessTokens/ITokenKeyStoreService.js';

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
    typ: options.type ?? 'at+jwt',
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

  it('should return all claims from a valid access token', async () => {
    const token = await makeToken({ sid: 'session-id' });

    const claims = await verifier.verify({ token, audience: AUDIENCE });

    expect(claims).toEqual({
      issuer: ISSUER,
      subject: 'user-id',
      sessionId: 'session-id',
      audience: [AUDIENCE],
      issuedAt: expect.any(Date),
      expiresAt: expect.any(Date),
    });
    expect(claims.expiresAt.getTime()).toBeGreaterThan(claims.issuedAt.getTime());
  });

  it('should preserve every audience from a valid access token', async () => {
    const audiences = [AUDIENCE, 'another-service'];
    const token = await makeToken({ sid: 'session-id' }, { audience: audiences });

    const claims = await verifier.verify({ token, audience: AUDIENCE });

    expect(claims.audience).toEqual(audiences);
  });

  it.each([
    { description: 'missing', payload: {} },
    { description: 'empty', payload: { sid: '' } },
    { description: 'not a string', payload: { sid: 123 } },
  ])('should reject a $description sid claim', async ({ payload }) => {
    const token = await makeToken(payload);

    await expect(verifier.verify({ token, audience: AUDIENCE })).rejects.toBeInstanceOf(
      InvalidAccessTokenError
    );
  });

  it('should reject an access token with an invalid type', async () => {
    const token = await makeToken({ sid: 'session-id' }, { type: 'JWT' });

    await expect(verifier.verify({ token, audience: AUDIENCE })).rejects.toBeInstanceOf(
      InvalidAccessTokenError
    );
  });

  it('should reject an access token with an unexpected algorithm', async () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({ sid: 'session-id' })
      .setProtectedHeader({ alg: 'HS256', typ: 'at+jwt', kid: KEY_ID })
      .setIssuer(ISSUER)
      .setSubject('user-id')
      .setAudience(AUDIENCE)
      .setIssuedAt(issuedAt)
      .setExpirationTime(issuedAt + 600)
      .sign(new TextEncoder().encode('a-secure-test-secret-with-32-bytes'));

    await expect(verifier.verify({ token, audience: AUDIENCE })).rejects.toBeInstanceOf(
      InvalidAccessTokenError
    );
  });

  it.each([
    { description: 'subject', options: { subject: null } },
    { description: 'issued-at', options: { issuedAt: null } },
    { description: 'expiration', options: { expiresAt: null } },
  ])('should reject an access token without its $description claim', async ({ options }) => {
    const token = await makeToken({ sid: 'session-id' }, options);

    await expect(verifier.verify({ token, audience: AUDIENCE })).rejects.toBeInstanceOf(
      InvalidAccessTokenError
    );
  });

  it('should map an expired token to AccessTokenExpiredError', async () => {
    const token = await makeToken(
      { sid: 'session-id' },
      { expiresAt: Math.floor(Date.now() / 1000) - 1 }
    );

    await expect(verifier.verify({ token, audience: AUDIENCE })).rejects.toMatchObject({
      code: 'access_token_expired',
      message: 'Access token expired',
      name: AccessTokenExpiredError.name,
    });
  });

  it('should map an invalid issuer to an access-token-specific error', async () => {
    const token = await makeToken({ sid: 'session-id' }, { issuer: 'https://other.example.com' });

    await expect(verifier.verify({ token, audience: AUDIENCE })).rejects.toMatchObject({
      code: 'invalid_access_token_issuer',
      message: 'Invalid access token issuer',
      name: InvalidAccessTokenIssuerError.name,
    });
  });

  it('should map an invalid audience to an access-token-specific error', async () => {
    const token = await makeToken({ sid: 'session-id' });

    await expect(verifier.verify({ token, audience: 'other-service' })).rejects.toMatchObject({
      code: 'invalid_access_token_audience',
      message: 'Invalid access token audience',
      name: InvalidAccessTokenAudienceError.name,
    });
  });

  it('should reject an access token with an unknown key id', async () => {
    const token = await makeToken({ sid: 'session-id' }, { keyId: 'unknown-key-id' });

    await expect(verifier.verify({ token, audience: AUDIENCE })).rejects.toMatchObject({
      code: 'invalid_access_token_key_id',
      message: 'Invalid access token key id',
      name: InvalidAccessTokenKeyIdError.name,
    });
  });

  it('should reject an access token without a key id', async () => {
    const token = await makeToken({ sid: 'session-id' }, { omitKeyId: true });

    await expect(verifier.verify({ token, audience: AUDIENCE })).rejects.toBeInstanceOf(
      InvalidAccessTokenKeyIdError
    );
  });

  it('should reject an access token with an invalid signature', async () => {
    const token = await makeToken({ sid: 'session-id' }, { signingKey: anotherPrivateKey });

    await expect(verifier.verify({ token, audience: AUDIENCE })).rejects.toBeInstanceOf(
      InvalidAccessTokenError
    );
  });

  it('should reject a malformed access token', async () => {
    await expect(verifier.verify({ token: 'not-a-jwt', audience: AUDIENCE })).rejects.toMatchObject(
      {
        code: 'invalid_access_token',
        message: 'Invalid access token',
        name: InvalidAccessTokenError.name,
      }
    );
  });
});
