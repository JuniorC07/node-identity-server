import { PemTokenKeyStoreService } from '@/adapters/jwt/PemTokenKeyStoreService.js';
import { accessTokenConfig } from '@/config/accessTokenConfig.js';
import type { ITokenKeyStoreService } from '@/services/jwt/ITokenKeyStoreService.js';

const tokenKeyStore = new PemTokenKeyStoreService({
  keyId: accessTokenConfig.signingKey.id,
  algorithm: accessTokenConfig.algorithm,
  privateKeyPem: accessTokenConfig.signingKey.privateKey,
  publicKeyPem: accessTokenConfig.signingKey.publicKey,
});

export function makeTokenKeyStoreService(): ITokenKeyStoreService {
  return tokenKeyStore;
}
