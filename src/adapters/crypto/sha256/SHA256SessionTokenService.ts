import { createHash, randomBytes } from 'node:crypto';
import { ISessionTokenService, GeneratedSessionToken } from '@/services/ISessionTokenService.js';

export class SHA256SessionTokenService implements ISessionTokenService {
  generate(): GeneratedSessionToken {
    const rawToken = randomBytes(32).toString('base64url');

    return { rawToken, tokenHash: this.hash(rawToken) };
  }

  hash(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
