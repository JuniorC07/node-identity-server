import { SHA256SessionTokenService } from '@/adapters/crypto/sha256/SHA256SessionTokenService.js';
import type { IAuthorizationCodeTokenService } from '@/services/oauth/IAuthorizationCodeTokenService.js';

export function makeAuthorizationCodeTokenService(): IAuthorizationCodeTokenService {
  return new SHA256SessionTokenService();
}
