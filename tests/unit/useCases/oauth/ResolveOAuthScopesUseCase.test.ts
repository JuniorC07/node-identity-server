import { describe, expect, it, vi } from 'vitest';

import { OAuthScope } from '@/entities/OAuthScope.js';
import { InvalidOAuthScopeError } from '@/errors/oauth/InvalidOAuthScopeError.js';
import type { IOAuthScopesRepository } from '@/repositories/IOAuthScopesRepository.js';
import { ResolveOAuthScopesUseCase } from '@/useCases/oauth/ResolveOAuthScopesUseCase.js';

function oidcScope(key: string, enabled = true): OAuthScope {
  return new OAuthScope({
    id: `${key}-id`,
    key,
    type: 'oidc',
    resource: null,
    module: null,
    action: null,
    description: `${key} description`,
    consentRequired: key !== 'openid',
    enabled,
  });
}

describe('ResolveOAuthScopesUseCase', () => {
  it('should preserve the requested scope order', async () => {
    const findByKeys = vi
      .fn<IOAuthScopesRepository['findByKeys']>()
      .mockResolvedValue([oidcScope('openid'), oidcScope('profile')]);
    const useCase = new ResolveOAuthScopesUseCase({ findByKeys });

    const output = await useCase.execute({
      requestedScopeKeys: ['profile', 'openid'],
      clientAllowedScopeKeys: ['openid', 'profile'],
    });

    expect(output.scopes.map((scope) => scope.key)).toEqual(['profile', 'openid']);
  });

  it('should reject a scope not allowed for the client', async () => {
    const findByKeys = vi.fn<IOAuthScopesRepository['findByKeys']>();
    const useCase = new ResolveOAuthScopesUseCase({ findByKeys });

    await expect(
      useCase.execute({
        requestedScopeKeys: ['email'],
        clientAllowedScopeKeys: ['openid'],
      })
    ).rejects.toBeInstanceOf(InvalidOAuthScopeError);
    expect(findByKeys).not.toHaveBeenCalled();
  });

  it('should reject an unregistered scope', async () => {
    const findByKeys = vi
      .fn<IOAuthScopesRepository['findByKeys']>()
      .mockResolvedValue([oidcScope('openid')]);
    const useCase = new ResolveOAuthScopesUseCase({ findByKeys });

    await expect(
      useCase.execute({
        requestedScopeKeys: ['openid', 'unknown'],
        clientAllowedScopeKeys: ['openid', 'unknown'],
      })
    ).rejects.toBeInstanceOf(InvalidOAuthScopeError);
  });

  it('should reject a disabled scope', async () => {
    const findByKeys = vi
      .fn<IOAuthScopesRepository['findByKeys']>()
      .mockResolvedValue([oidcScope('profile', false)]);
    const useCase = new ResolveOAuthScopesUseCase({ findByKeys });

    await expect(
      useCase.execute({
        requestedScopeKeys: ['profile'],
        clientAllowedScopeKeys: ['profile'],
      })
    ).rejects.toBeInstanceOf(InvalidOAuthScopeError);
  });
});
