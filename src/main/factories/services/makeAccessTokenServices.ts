import { JoseTokenSignerService } from '@/adapters/accessTokens/JoseTokenSignerService.js';
import { JoseTokenVerifierService } from '@/adapters/accessTokens/JoseTokenVerifierService.js';
import { PemTokenKeyStoreService } from '@/adapters/accessTokens/PemTokenKeyStoreService.js';
import { accessTokenConfig } from '@/config/accessTokenConfig.js';
import type { ITokenSignerService } from '@/services/accessTokens/ITokenSignerService.js';
import type { ITokenVerifierService } from '@/services/accessTokens/ITokenVerifierService.js';

const tokenKeyStore = new PemTokenKeyStoreService({
  keyId: accessTokenConfig.signingKey.id,
  algorithm: accessTokenConfig.algorithm,
  privateKeyPem: accessTokenConfig.signingKey.privateKey,
  publicKeyPem: accessTokenConfig.signingKey.publicKey,
});

export function makeAccessTokenSignerService(): ITokenSignerService {
  return new JoseTokenSignerService(tokenKeyStore, {
    issuer: accessTokenConfig.issuer,
    algorithm: accessTokenConfig.algorithm,
  });
}

export function makeAccessTokenVerifierService(): ITokenVerifierService {
  return new JoseTokenVerifierService(tokenKeyStore, {
    issuer: accessTokenConfig.issuer,
    algorithm: accessTokenConfig.algorithm,
  });
}
