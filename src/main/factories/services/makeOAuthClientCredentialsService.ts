import { IOAuthClientCredentialsService } from '@/services/IOAuthClientCredentialsService.js';
import { NodeOAuthClientCredentialsService } from '@/adapters/crypto/randomBytes/NodeOAuthClientCredentialsService.js';

export function makeOAuthClientCredentialsService(): IOAuthClientCredentialsService {
  return new NodeOAuthClientCredentialsService();
}
