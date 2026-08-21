import { JoseJsonWebKeySetService } from '@/adapters/jwks/jose/JoseJsonWebKeySetService.js';
import { makeTokenKeyStoreService } from '@/main/factories/services/makeTokenKeyStoreService.js';
import type { IJsonWebKeySetService } from '@/services/jwks/IJsonWebKeySetService.js';

export function makeJsonWebKeySetService(): IJsonWebKeySetService {
  const tokenKeyStore = makeTokenKeyStoreService();

  return new JoseJsonWebKeySetService(tokenKeyStore);
}
