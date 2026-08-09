import type { OAuthScope } from '@/entities/OAuthScope.js';
import { InvalidOAuthScopeError } from '@/errors/oauth/InvalidOAuthScopeError.js';
import type { IOAuthScopesRepository } from '@/repositories/IOAuthScopesRepository.js';

export interface ResolveOAuthScopesInput {
  requestedScopeKeys: string[];
  clientAllowedScopeKeys: readonly string[];
}

export interface ResolveOAuthScopesOutput {
  scopes: OAuthScope[];
}

export class ResolveOAuthScopesUseCase {
  constructor(private readonly scopesRepository: IOAuthScopesRepository) {}

  async execute(input: ResolveOAuthScopesInput): Promise<ResolveOAuthScopesOutput> {
    const clientAllowedScopes = new Set(input.clientAllowedScopeKeys);

    if (
      input.requestedScopeKeys.length === 0 ||
      input.requestedScopeKeys.some((scope) => !clientAllowedScopes.has(scope))
    ) {
      throw new InvalidOAuthScopeError();
    }

    const persistedScopes = await this.scopesRepository.findByKeys(input.requestedScopeKeys);
    const scopesByKey = new Map(persistedScopes.map((scope) => [scope.key, scope]));
    const scopes = input.requestedScopeKeys.map((scopeKey) => scopesByKey.get(scopeKey));

    if (scopes.some((scope) => !scope || !scope.enabled)) {
      throw new InvalidOAuthScopeError();
    }

    return { scopes: scopes as OAuthScope[] };
  }
}
