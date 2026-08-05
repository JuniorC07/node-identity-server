import { exportPKCS8, exportSPKI, generateKeyPair } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';

import { PemTokenKeyStoreService } from '@/adapters/accessTokens/PemTokenKeyStoreService.js';

const KEY_ID = 'test-key-id';

let privateKeyPem: string;
let publicKeyPem: string;

describe('PemTokenKeyStoreService', () => {
  beforeAll(async () => {
    const keyPair = await generateKeyPair('RS256', { extractable: true });
    privateKeyPem = await exportPKCS8(keyPair.privateKey);
    publicKeyPem = await exportSPKI(keyPair.publicKey);
  });

  function makeSut() {
    return new PemTokenKeyStoreService({
      keyId: KEY_ID,
      algorithm: 'RS256',
      privateKeyPem,
      publicKeyPem,
    });
  }

  it('should import the signing and verification keys from PEM', async () => {
    const keyStore = makeSut();

    const signingKey = await keyStore.getSigningKey();
    const verificationKey = await keyStore.findVerificationKey(KEY_ID);

    expect(signingKey).toMatchObject({
      id: KEY_ID,
      algorithm: 'RS256',
      privateKey: expect.anything(),
    });
    expect(verificationKey).toMatchObject({
      id: KEY_ID,
      algorithm: 'RS256',
      publicKey: expect.anything(),
    });
  });

  it('should return null when the key id is unknown', async () => {
    const keyStore = makeSut();

    await expect(keyStore.findVerificationKey('unknown-key-id')).resolves.toBeNull();
  });

  it('should cache imported keys', async () => {
    const keyStore = makeSut();

    const firstSigningKey = await keyStore.getSigningKey();
    const secondSigningKey = await keyStore.getSigningKey();
    const firstVerificationKey = await keyStore.findVerificationKey(KEY_ID);
    const secondVerificationKey = await keyStore.findVerificationKey(KEY_ID);

    expect(secondSigningKey).toBe(firstSigningKey);
    expect(secondVerificationKey).toBe(firstVerificationKey);
  });

  it('should reject malformed PEM keys', async () => {
    const keyStore = new PemTokenKeyStoreService({
      keyId: KEY_ID,
      algorithm: 'RS256',
      privateKeyPem: 'invalid-private-key',
      publicKeyPem: 'invalid-public-key',
    });

    await expect(keyStore.getSigningKey()).rejects.toThrow();
    await expect(keyStore.findVerificationKey(KEY_ID)).rejects.toThrow();
  });
});
