import type { OAuthScope } from '@/entities/oauth/OAuthScope.js';
import { InvalidOAuthScopeError } from '@/errors/oauth/InvalidOAuthScopeError.js';
import type { IOAuthScopesRepository } from '@/repositories/oauth/IOAuthScopesRepository.js';

export interface ResolveRegisteredOAuthScopesInput {
  requestedScopeKeys: string[];
}

export interface ResolveRegisteredOAuthScopesOutput {
  scopes: OAuthScope[];
}

export class ResolveRegisteredOAuthScopesUseCase {
  constructor(private readonly scopesRepository: IOAuthScopesRepository) {}

  async execute(
    input: ResolveRegisteredOAuthScopesInput
  ): Promise<ResolveRegisteredOAuthScopesOutput> {
    const requestedScopeKeys = [...new Set(input.requestedScopeKeys)];

    const persistedScopes = await this.scopesRepository.findByKeys(requestedScopeKeys);
    const scopesByKey = new Map(persistedScopes.map((scope) => [scope.key, scope]));
    const scopes = requestedScopeKeys.map((scopeKey) => scopesByKey.get(scopeKey));

    if (scopes.some((scope) => !scope || !scope.enabled)) {
      throw new InvalidOAuthScopeError();
    }

    return { scopes: scopes as OAuthScope[] };
  }
}
