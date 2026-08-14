import type { OAuthClient } from '@/entities/oauth/OAuthClient.js';

export interface IOAuthClientsRepository {
  create(client: OAuthClient): Promise<void>;
  findById(id: string): Promise<OAuthClient | null>;
  findByClientId(clientId: string): Promise<OAuthClient | null>;
}
