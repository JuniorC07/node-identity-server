import { InvalidOAuthAuthorizationRequestError } from '@/errors/oauth/InvalidOAuthAuthorizationRequestError.js';
import type { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import type { IOAuthClientsRepository } from '@/repositories/oauth/IOAuthClientsRepository.js';
import type { ISessionTokenService } from '@/services/ISessionTokenService.js';
import type { EvaluateOAuthConsentUseCase } from '@/useCases/oauth/_internal/EvaluateOAuthConsentUseCase.js';
import type { ResolveRegisteredOAuthScopesUseCase } from '@/useCases/oauth/_internal/ResolveRegisteredOAuthScopesUseCase.js';

export interface GetPendingConsentDetailsInputRequest {
  authorizationRequestToken: string;
}

export interface GetPendingConsentDetailsInput extends GetPendingConsentDetailsInputRequest {
  userId: string;
  sessionId: string;
}

export interface GetPendingConsentDetailsOutput {
  client: {
    clientId: string;
    name: string;
  };
  consentRequired: boolean;
  requestedScopes: Array<{
    key: string;
    type: 'oidc' | 'resource';
    description: string;
    consentRequired: boolean;
    consentGranted: boolean;
  }>;
  expiresAt: Date;
}

export class GetPendingConsentDetailsUseCase {
  constructor(
    private readonly authorizationRequestsRepository: IAuthorizationRequestsRepository,
    private readonly clientsRepository: IOAuthClientsRepository,
    private readonly requestTokenService: ISessionTokenService,
    private readonly resolveRegisteredOAuthScopesUseCase: ResolveRegisteredOAuthScopesUseCase,
    private readonly evaluateOAuthConsentUseCase: EvaluateOAuthConsentUseCase
  ) {}

  async execute(input: GetPendingConsentDetailsInput): Promise<GetPendingConsentDetailsOutput> {
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

    const { scopes } = await this.resolveRegisteredOAuthScopesUseCase.execute({
      requestedScopeKeys: [...authorizationRequest.requestedScopes],
    });
    const evaluation = await this.evaluateOAuthConsentUseCase.execute({
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
      consentRequired: evaluation.consentRequired,
      requestedScopes: scopes.map((scope) => ({
        key: scope.key,
        type: scope.type,
        description: scope.description,
        consentRequired: scope.consentRequired,
        consentGranted: !scope.consentRequired || !missingConsentScopeKeys.has(scope.key),
      })),
      expiresAt: authorizationRequest.expiresAt,
    };
  }
}
