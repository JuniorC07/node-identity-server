import { JoseTokenSignerService } from '@/adapters/jwt/jose/JoseTokenSignerService.js';
import { JoseTokenVerifierService } from '@/adapters/jwt/jose/JoseTokenVerifierService.js';
import { PemTokenKeyStoreService } from '@/adapters/jwt/PemTokenKeyStoreService.js';
import { accessTokenConfig } from '@/config/accessTokenConfig.js';
import type { ITokenSignerService } from '@/services/jwt/ITokenSignerService.js';
import type { ITokenVerifierService } from '@/services/jwt/ITokenVerifierService.js';

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
