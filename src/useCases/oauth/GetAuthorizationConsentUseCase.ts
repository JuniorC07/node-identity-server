import { InvalidOAuthAuthorizationRequestError } from '@/errors/oauth/InvalidOAuthAuthorizationRequestError.js';
import type { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import type { IOAuthClientsRepository } from '@/repositories/IOAuthClientsRepository.js';
import type { ISessionTokenService } from '@/services/ISessionTokenService.js';
import type { EvaluateUserOAuthAuthorizationUseCase } from '@/useCases/oauth/EvaluateUserOAuthAuthorizationUseCase.js';
import type { ResolveOAuthScopesUseCase } from '@/useCases/oauth/ResolveOAuthScopesUseCase.js';

export interface GetAuthorizationConsentInput {
  authorizationRequestToken: string;
  userId: string;
  sessionId: string;
}

export interface GetAuthorizationConsentOutput {
  client: {
    clientId: string;
    name: string;
  };
  requestedScopes: Array<{
    key: string;
    type: 'oidc' | 'resource';
    description: string;
    consentRequired: boolean;
    consentGranted: boolean;
  }>;
  audiences: string[];
  modules: string[];
  expiresAt: Date;
}

export class GetAuthorizationConsentUseCase {
  constructor(
    private readonly authorizationRequestsRepository: IAuthorizationRequestsRepository,
    private readonly clientsRepository: IOAuthClientsRepository,
    private readonly requestTokenService: ISessionTokenService,
    private readonly resolveOAuthScopesUseCase: ResolveOAuthScopesUseCase,
    private readonly evaluateUserOAuthAuthorizationUseCase: EvaluateUserOAuthAuthorizationUseCase
  ) {}

  async execute(input: GetAuthorizationConsentInput): Promise<GetAuthorizationConsentOutput> {
    const requestTokenHash = this.requestTokenService.hash(input.authorizationRequestToken);
    const authorizationRequest = await this.authorizationRequestsRepository.findPendingByTokenHash(
      requestTokenHash,
      new Date()
    );

    if (
      !authorizationRequest ||
      authorizationRequest.userId !== input.userId ||
      authorizationRequest.sessionId !== input.sessionId
    ) {
      throw new InvalidOAuthAuthorizationRequestError();
    }

    const client = await this.clientsRepository.findById(authorizationRequest.oauthClientId);

    if (!client) {
      throw new InvalidOAuthAuthorizationRequestError();
    }

    const { scopes } = await this.resolveOAuthScopesUseCase.execute({
      requestedScopeKeys: [...authorizationRequest.requestedScopes],
      clientAllowedScopeKeys: client.allowedScopes,
    });
    const evaluation = await this.evaluateUserOAuthAuthorizationUseCase.execute({
      userId: input.userId,
      oauthClientId: client.id,
      scopes,
    });
    const missingConsentScopeKeys = new Set(
      evaluation.missingConsentScopes.map((scope) => scope.key)
    );

    return {
      client: {
        clientId: client.clientId,
        name: client.name,
      },
      requestedScopes: scopes.map((scope) => ({
        key: scope.key,
        type: scope.type,
        description: scope.description,
        consentRequired: scope.consentRequired,
        consentGranted: !scope.consentRequired || !missingConsentScopeKeys.has(scope.key),
      })),
      audiences: evaluation.audiences,
      modules: evaluation.modules,
      expiresAt: authorizationRequest.expiresAt,
    };
  }
}
