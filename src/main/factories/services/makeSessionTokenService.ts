import { ISessionTokenService } from '@/services/ISessionTokenService.js';
import { SHA256SessionTokenService } from '@/adapters/crypto/sha256/SHA256SessionTokenService.js';

export function makeSHA256SessionTokenService(): ISessionTokenService {
  return new SHA256SessionTokenService();
}
