import type { OAuthScope } from '@/entities/oauth/OAuthScope.js';
import type { IOAuthConsentGrantsRepository } from '@/repositories/oauth/IOAuthConsentGrantsRepository.js';

export interface EvaluateOAuthConsentInput {
  userId: string;
  oauthClientId: string;
  scopes: OAuthScope[];
}

export interface EvaluateUserOAuthAuthorizationOutput {
  consentRequired: boolean;
  missingConsentScopes: OAuthScope[];
}

export class EvaluateOAuthConsentUseCase {
  constructor(private readonly consentGrantsRepository: IOAuthConsentGrantsRepository) {}

  async execute(input: EvaluateOAuthConsentInput): Promise<EvaluateUserOAuthAuthorizationOutput> {
    const scopesRequiringConsent = input.scopes.filter((scope) => scope.consentRequired);
    const activeConsentScopeIds = await this.consentGrantsRepository.findActiveScopeIds({
      userId: input.userId,
      oauthClientId: input.oauthClientId,
      scopeIds: scopesRequiringConsent.map((scope) => scope.id),
      now: new Date(),
    });
    const activeConsentScopeIdSet = new Set(activeConsentScopeIds);
    const missingConsentScopes = scopesRequiringConsent.filter(
      (scope) => !activeConsentScopeIdSet.has(scope.id)
    );

    return {
      consentRequired: missingConsentScopes.length > 0,
      missingConsentScopes,
    };
  }
}
