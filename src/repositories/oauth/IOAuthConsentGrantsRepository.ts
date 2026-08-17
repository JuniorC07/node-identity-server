import { OAuthConsentGrant } from '@/entities/oauth/OAuthConsentGrant.js';
export interface FindActiveConsentScopeIdsInput {
  userId: string;
  oauthClientId: string;
  scopeIds: readonly string[];
  now: Date;
}

export interface IOAuthConsentGrantsRepository {
  findActiveScopeIds(input: FindActiveConsentScopeIdsInput): Promise<string[]>;
  saveAll(grants: OAuthConsentGrant[]): Promise<void>;
}
