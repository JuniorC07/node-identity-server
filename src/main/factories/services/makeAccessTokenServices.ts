import { JoseTokenSignerService } from '@/adapters/jwt/jose/JoseTokenSignerService.js';
import { JoseTokenVerifierService } from '@/adapters/jwt/jose/JoseTokenVerifierService.js';
import { accessTokenConfig } from '@/config/accessTokenConfig.js';
import { makeTokenKeyStoreService } from '@/main/factories/services/makeTokenKeyStoreService.js';
import type { ITokenSignerService } from '@/services/jwt/ITokenSignerService.js';
import type { ITokenVerifierService } from '@/services/jwt/ITokenVerifierService.js';

export function makeAccessTokenSignerService(): ITokenSignerService {
  const tokenKeyStore = makeTokenKeyStoreService();

  return new JoseTokenSignerService(tokenKeyStore, {
    issuer: accessTokenConfig.issuer,
    algorithm: accessTokenConfig.algorithm,
  });
}

export function makeAccessTokenVerifierService(): ITokenVerifierService {
  const tokenKeyStore = makeTokenKeyStoreService();

  return new JoseTokenVerifierService(tokenKeyStore, {
    issuer: accessTokenConfig.issuer,
    algorithm: accessTokenConfig.algorithm,
  });
}
