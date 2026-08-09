import { describe, expect, it, vi } from 'vitest';

import { OAuthScope } from '@/entities/OAuthScope.js';
import { OAuthAccessDeniedError } from '@/errors/oauth/OAuthAccessDeniedError.js';
import type { IOAuthConsentGrantsRepository } from '@/repositories/IOAuthConsentGrantsRepository.js';
import type { IUserResourceProfilesRepository } from '@/repositories/IUserResourceProfilesRepository.js';
import { EvaluateUserOAuthAuthorizationUseCase } from '@/useCases/oauth/EvaluateUserOAuthAuthorizationUseCase.js';

function resourceScope(consentRequired = true): OAuthScope {
  return new OAuthScope({
    id: 'orders-read-id',
    key: 'orders:read',
    type: 'resource',
    resource: {
      id: 'orders-resource-id',
      audience: 'https://api.example.com/orders',
    },
    module: {
      id: 'orders-module-id',
      key: 'orders',
    },
    action: {
      id: 'read-action-id',
      key: 'read',
    },
    description: 'Read orders',
    consentRequired,
    enabled: true,
  });
}

function oidcScope(): OAuthScope {
  return new OAuthScope({
    id: 'profile-id',
    key: 'profile',
    type: 'oidc',
    resource: null,
    module: null,
    action: null,
    description: 'Access basic profile information',
    consentRequired: true,
    enabled: true,
  });
}

function makeSut(grantedScopeIds: string[] = [], activeConsentScopeIds: string[] = []) {
  const findGrantedScopeIds = vi
    .fn<IUserResourceProfilesRepository['findGrantedScopeIds']>()
    .mockResolvedValue(grantedScopeIds);
  const findActiveScopeIds = vi
    .fn<IOAuthConsentGrantsRepository['findActiveScopeIds']>()
    .mockResolvedValue(activeConsentScopeIds);
  const consentGrantsRepository: IOAuthConsentGrantsRepository = {
    findActiveScopeIds,
    save: vi.fn<IOAuthConsentGrantsRepository['save']>(),
    saveAll: vi.fn<IOAuthConsentGrantsRepository['saveAll']>(),
  };
  const useCase = new EvaluateUserOAuthAuthorizationUseCase(
    { findGrantedScopeIds },
    consentGrantsRepository
  );

  return { useCase, findGrantedScopeIds, findActiveScopeIds };
}

describe('EvaluateUserOAuthAuthorizationUseCase', () => {
  it('should require consent and return only modules from authorized resource scopes', async () => {
    const scope = resourceScope();
    const { useCase } = makeSut([scope.id]);

    const output = await useCase.execute({
      userId: 'user-id',
      oauthClientId: 'client-id',
      scopes: [scope],
    });

    expect(output).toEqual({
      consentRequired: true,
      missingConsentScopes: [{ key: 'orders:read', description: 'Read orders' }],
      audiences: ['https://api.example.com/orders'],
      modules: ['orders'],
    });
  });

  it('should deny a resource scope not granted by the user profile for its audience', async () => {
    const scope = resourceScope();
    const { useCase, findActiveScopeIds } = makeSut();

    await expect(
      useCase.execute({
        userId: 'user-id',
        oauthClientId: 'client-id',
        scopes: [scope],
      })
    ).rejects.toBeInstanceOf(OAuthAccessDeniedError);
    expect(findActiveScopeIds).not.toHaveBeenCalled();
  });

  it('should not require profile permissions for OIDC scopes', async () => {
    const scope = oidcScope();
    const { useCase, findGrantedScopeIds } = makeSut([], [scope.id]);

    const output = await useCase.execute({
      userId: 'user-id',
      oauthClientId: 'client-id',
      scopes: [scope],
    });

    expect(findGrantedScopeIds).toHaveBeenCalledWith({
      userId: 'user-id',
      scopeIds: [],
    });
    expect(output.consentRequired).toBe(false);
    expect(output.audiences).toEqual([]);
    expect(output.modules).toEqual([]);
  });

  it('should reuse an active consent that covers every required scope', async () => {
    const scope = resourceScope();
    const { useCase } = makeSut([scope.id], [scope.id]);

    const output = await useCase.execute({
      userId: 'user-id',
      oauthClientId: 'client-id',
      scopes: [scope],
    });

    expect(output.consentRequired).toBe(false);
    expect(output.missingConsentScopes).toEqual([]);
  });
});
