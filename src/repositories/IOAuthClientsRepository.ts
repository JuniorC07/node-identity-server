import type { OAuthClient } from '@/entities/OAuthClient.js';

export interface IOAuthClientsRepository {
  create(client: OAuthClient): Promise<void>;
  findByClientId(clientId: string): Promise<OAuthClient | null>;
}
