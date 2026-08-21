import { exportJWK } from 'jose';
import { JsonWebKeySet, IJsonWebKeySetService } from '@/services/jwks/IJsonWebKeySetService.js';
import type { ITokenKeyStoreService } from '@/services/jwt/ITokenKeyStoreService.js';

export class JoseJsonWebKeySetService implements IJsonWebKeySetService {
  constructor(private readonly keyStore: ITokenKeyStoreService) {}

  async getPublicKeySet(): Promise<JsonWebKeySet> {
    const verificationKeys = await this.keyStore.getVerificationKeys();

    const keys = await Promise.all(
      verificationKeys.map(async (key) => {
        const jwk = await exportJWK(key.publicKey);

        if (!jwk.kty) {
          throw new Error(`Verification key ${key.id} has no key type`);
        }

        return {
          ...jwk,
          kty: jwk.kty,
          kid: key.id,
          alg: key.algorithm,
          use: 'sig' as const,
          key_ops: ['verify'] as ['verify'],
        };
      })
    );

    return { keys };
  }
}
