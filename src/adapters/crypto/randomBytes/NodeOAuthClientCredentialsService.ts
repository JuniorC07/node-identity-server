import { randomBytes } from 'node:crypto';

import type { IOAuthClientCredentialsService } from '@/services/IOAuthClientCredentialsService.js';

export class NodeOAuthClientCredentialsService implements IOAuthClientCredentialsService {
  generateClientId(): string {
    return `client_${randomBytes(24).toString('base64url')}`;
  }

  generateClientSecret(): string {
    return randomBytes(32).toString('base64url');
  }
}
