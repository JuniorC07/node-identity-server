import { randomUUID } from 'node:crypto';

import { OAuthConsentGrant } from '@/entities/OAuthConsentGrant.js';
import type { IOAuthConsentGrantsRepository } from '@/repositories/IOAuthConsentGrantsRepository.js';

export interface GrantOAuthConsentInput {
  userId: string;
  oauthClientId: string;
  scopeIds: string[];
  expiresAt: Date | null;
}

export class GrantOAuthConsentUseCase {
  constructor(private readonly consentGrantsRepository: IOAuthConsentGrantsRepository) {}

  async execute(input: GrantOAuthConsentInput): Promise<void> {
    const now = new Date();
    const grants = [...new Set(input.scopeIds)].map(
      (scopeId) =>
        new OAuthConsentGrant({
          id: randomUUID(),
          userId: input.userId,
          oauthClientId: input.oauthClientId,
          scopeId,
          grantedAt: now,
          expiresAt: input.expiresAt,
          revokedAt: null,
        })
    );

    await this.consentGrantsRepository.saveAll(grants);
  }
}
