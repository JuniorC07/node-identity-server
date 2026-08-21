import { randomUUID } from 'node:crypto';

import { OAuthConsentGrant } from '@/entities/oauth/OAuthConsentGrant.js';
import { InvalidOAuthAuthorizationRequestError } from '@/errors/oauth/InvalidOAuthAuthorizationRequestError.js';
import type { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import type { IAuthorizationApprovalUnitOfWork } from '@/repositories/oauth/IAuthorizationApprovalRepositories.js';
import type { ISessionTokenService } from '@/services/ISessionTokenService.js';
import type { EvaluateOAuthConsentUseCase } from '@/useCases/oauth/_internal/EvaluateOAuthConsentUseCase.js';
import type { ResolveRegisteredOAuthScopesUseCase } from '@/useCases/oauth/_internal/ResolveRegisteredOAuthScopesUseCase.js';
import type { CreateOAuthAuthorizationCodeUseCaseFactory } from '@/useCases/oauth/_internal/CreateOAuthAuthorizationCodeUseCase.js';
import { AuthorizationRequest } from '@/entities/AuthorizationRequest.js';
import { buildUri } from '@/utils/buildUri.js';

export interface DecideOAuthConsentRequestInput {
  authorizationRequestToken: string;
  decision: 'approve' | 'deny';
}

export interface DecideOAuthConsentInput extends DecideOAuthConsentRequestInput {
  userId: string;
  sessionId: string;
}

export interface DecideOAuthConsentOutput {
  redirectUri: string;
}

interface ApproveConsentsInput {
  authorizationRequest: AuthorizationRequest;
  userId: string;
  now: Date;
}

export class DecideOAuthConsentUseCase {
  constructor(
    private readonly authorizationRequestsRepository: IAuthorizationRequestsRepository,
    private readonly authorizationRequestTokenService: ISessionTokenService,
    private readonly authorizationApprovalUnitOfWork: IAuthorizationApprovalUnitOfWork,
    private readonly resolveRegisteredOAuthScopesUseCase: ResolveRegisteredOAuthScopesUseCase,
    private readonly evaluateOAuthConsentUseCase: EvaluateOAuthConsentUseCase,
    private readonly createOAuthAuthorizationCodeUseCaseFactory: CreateOAuthAuthorizationCodeUseCaseFactory
  ) {}

  async execute(input: DecideOAuthConsentInput): Promise<DecideOAuthConsentOutput> {
    const now = new Date();
    const requestTokenHash = this.authorizationRequestTokenService.hash(
      input.authorizationRequestToken
    );

    const authorizationRequest = await this.authorizationRequestsRepository.findPendingByTokenHash(
      requestTokenHash,
      now
    );

    if (
      !authorizationRequest ||
      authorizationRequest.userId !== input.userId ||
      authorizationRequest.sessionId !== input.sessionId
    ) {
      throw new InvalidOAuthAuthorizationRequestError();
    }

    if (input.decision === 'deny') {
      await this.authorizationRequestsRepository.consume(authorizationRequest.id, now);
      return {
        redirectUri: buildUri(authorizationRequest.redirectUri, {
          error: 'access_denied',
          state: authorizationRequest.state,
        }),
      };
    }

    const { rawCode } = await this.approveAuthorizationConsents({
      authorizationRequest,
      now,
      userId: authorizationRequest.userId,
    });

    return {
      redirectUri: buildUri(authorizationRequest.redirectUri, {
        code: rawCode,
        state: authorizationRequest.state,
      }),
    };
  }

  private async approveAuthorizationConsents(input: ApproveConsentsInput) {
    const { authorizationRequest, userId, now } = input;

    const { scopes } = await this.resolveRegisteredOAuthScopesUseCase.execute({
      requestedScopeKeys: [...authorizationRequest.requestedScopes],
    });

    const { missingConsentScopes } = await this.evaluateOAuthConsentUseCase.execute({
      oauthClientId: authorizationRequest.oauthClientId,
      scopes,
      userId,
    });
    const missingConsentKeys = new Set(missingConsentScopes.map((scope) => scope.key));

    const consentGrants = scopes
      .filter((scope) => missingConsentKeys.has(scope.key))
      .map(
        (scope) =>
          new OAuthConsentGrant({
            id: randomUUID(),
            userId,
            oauthClientId: authorizationRequest.oauthClientId,
            scopeId: scope.id,
            grantedAt: now,
            expiresAt: null,
            revokedAt: null,
          })
      );

    return this.authorizationApprovalUnitOfWork.execute(async (repositories) => {
      await repositories.consentGrants.saveAll(consentGrants);

      const createOAuthAuthorizationCodeUseCase = this.createOAuthAuthorizationCodeUseCaseFactory({
        authorizationRequests: repositories.authorizationRequests,
        authorizationCodes: repositories.authorizationCodes,
      });

      return createOAuthAuthorizationCodeUseCase.execute({
        authorizationRequestId: authorizationRequest.id,
      });
    });
  }

}
