import { describe, expect, it, vi } from 'vitest';

import type { IOAuthConsentGrantsRepository } from '@/repositories/IOAuthConsentGrantsRepository.js';
import { GrantOAuthConsentUseCase } from '@/useCases/oauth/GrantOAuthConsentUseCase.js';

describe('GrantOAuthConsentUseCase', () => {
  it('should persist one active grant per unique scope', async () => {
    const saveAll = vi.fn<IOAuthConsentGrantsRepository['saveAll']>();
    const repository: IOAuthConsentGrantsRepository = {
      findActiveScopeIds: vi.fn<IOAuthConsentGrantsRepository['findActiveScopeIds']>(),
      save: vi.fn<IOAuthConsentGrantsRepository['save']>(),
      saveAll,
    };
    const useCase = new GrantOAuthConsentUseCase(repository);

    await useCase.execute({
      userId: 'user-id',
      oauthClientId: 'client-id',
      scopeIds: ['profile-id', 'email-id', 'profile-id'],
      expiresAt: null,
    });

    expect(saveAll).toHaveBeenCalledOnce();
    const grants = saveAll.mock.calls[0]?.[0];
    expect(grants).toHaveLength(2);
    expect(grants?.map((grant) => grant.scopeId)).toEqual(['profile-id', 'email-id']);
    expect(
      grants?.every(
        (grant) =>
          grant.userId === 'user-id' &&
          grant.oauthClientId === 'client-id' &&
          grant.revokedAt === null
      )
    ).toBe(true);
  });
});
