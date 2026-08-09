import type { OAuthConsentGrant } from '@/entities/OAuthConsentGrant.js';

export interface FindActiveConsentScopeIdsInput {
  userId: string;
  oauthClientId: string;
  scopeIds: readonly string[];
  now: Date;
}

export interface IOAuthConsentGrantsRepository {
  findActiveScopeIds(input: FindActiveConsentScopeIdsInput): Promise<string[]>;
  save(grant: OAuthConsentGrant): Promise<void>;
  saveAll(grants: OAuthConsentGrant[]): Promise<void>;
}
