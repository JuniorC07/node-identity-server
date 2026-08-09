import type { OAuthScope } from '@/entities/OAuthScope.js';
import { OAuthAccessDeniedError } from '@/errors/oauth/OAuthAccessDeniedError.js';
import type { IOAuthConsentGrantsRepository } from '@/repositories/IOAuthConsentGrantsRepository.js';
import type { IUserResourceProfilesRepository } from '@/repositories/IUserResourceProfilesRepository.js';

export interface EvaluateUserOAuthAuthorizationInput {
  userId: string;
  oauthClientId: string;
  scopes: OAuthScope[];
}

export interface OAuthConsentScopeSummary {
  key: string;
  description: string;
}

export interface EvaluateUserOAuthAuthorizationOutput {
  consentRequired: boolean;
  missingConsentScopes: OAuthConsentScopeSummary[];
  audiences: string[];
  modules: string[];
}

export class EvaluateUserOAuthAuthorizationUseCase {
  constructor(
    private readonly userResourceProfilesRepository: IUserResourceProfilesRepository,
    private readonly consentGrantsRepository: IOAuthConsentGrantsRepository
  ) {}

  async execute(
    input: EvaluateUserOAuthAuthorizationInput
  ): Promise<EvaluateUserOAuthAuthorizationOutput> {
    const resourceScopes = input.scopes.filter((scope) => scope.isResource());
    const grantedScopeIds = await this.userResourceProfilesRepository.findGrantedScopeIds({
      userId: input.userId,
      scopeIds: resourceScopes.map((scope) => scope.id),
    });
    const grantedScopeIdSet = new Set(grantedScopeIds);

    if (resourceScopes.some((scope) => !grantedScopeIdSet.has(scope.id))) {
      throw new OAuthAccessDeniedError();
    }

    const scopesRequiringConsent = input.scopes.filter((scope) => scope.consentRequired);
    const activeConsentScopeIds = await this.consentGrantsRepository.findActiveScopeIds({
      userId: input.userId,
      oauthClientId: input.oauthClientId,
      scopeIds: scopesRequiringConsent.map((scope) => scope.id),
      now: new Date(),
    });
    const activeConsentScopeIdSet = new Set(activeConsentScopeIds);
    const missingConsentScopes = scopesRequiringConsent
      .filter((scope) => !activeConsentScopeIdSet.has(scope.id))
      .map((scope) => ({
        key: scope.key,
        description: scope.description,
      }));

    return {
      consentRequired: missingConsentScopes.length > 0,
      missingConsentScopes,
      audiences: [...new Set(resourceScopes.map((scope) => scope.resource.audience))],
      modules: [...new Set(resourceScopes.map((scope) => scope.module.key))],
    };
  }
}
