import { randomUUID } from 'node:crypto';

import { AuthorizationCode } from '@/entities/AuthorizationCode.js';
import { OAuthConsentGrant } from '@/entities/OAuthConsentGrant.js';
import { InvalidOAuthAuthorizationRequestError } from '@/errors/oauth/InvalidOAuthAuthorizationRequestError.js';
import { InvalidOAuthTargetError } from '@/errors/oauth/InvalidOAuthTargetError.js';
import type { IAuthorizationCodesRepository } from '@/repositories/IAuthorizationCodesRepository.js';
import type { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import type { IOAuthClientsRepository } from '@/repositories/IOAuthClientsRepository.js';
import type { IAuthorizationCodeTokenService } from '@/services/oauth/IAuthorizationCodeTokenService.js';
import type { ISessionTokenService } from '@/services/ISessionTokenService.js';
import type { EvaluateUserOAuthAuthorizationUseCase } from '@/useCases/oauth/EvaluateUserOAuthAuthorizationUseCase.js';
import type { ResolveOAuthScopesUseCase } from '@/useCases/oauth/ResolveOAuthScopesUseCase.js';

export interface DecideAuthorizationInput {
  authorizationRequestToken: string;
  decision: 'approve' | 'deny';
  userId: string;
  sessionId: string;
}

export interface DecideAuthorizationOutput {
  redirectUri: string;
}

export class DecideAuthorizationUseCase {
  constructor(
    private readonly authorizationRequestsRepository: IAuthorizationRequestsRepository,
    private readonly authorizationCodesRepository: IAuthorizationCodesRepository,
    private readonly clientsRepository: IOAuthClientsRepository,
    private readonly authorizationRequestTokenService: ISessionTokenService,
    private readonly authorizationCodeTokenService: IAuthorizationCodeTokenService,
    private readonly resolveOAuthScopesUseCase: ResolveOAuthScopesUseCase,
    private readonly evaluateUserOAuthAuthorizationUseCase: EvaluateUserOAuthAuthorizationUseCase,
    private readonly authorizationCodeLifetimeInSeconds: number
  ) {}

  async execute(input: DecideAuthorizationInput): Promise<DecideAuthorizationOutput> {
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
      const consumed = await this.authorizationRequestsRepository.consume(
        authorizationRequest.id,
        now
      );

      if (!consumed) {
        throw new InvalidOAuthAuthorizationRequestError();
      }

      return {
        redirectUri: this.buildRedirectUri(authorizationRequest.redirectUri, {
          error: 'access_denied',
          state: authorizationRequest.state,
        }),
      };
    }

    const client = await this.clientsRepository.findById(authorizationRequest.oauthClientId);

    if (!client || !client.allowsRedirectUri(authorizationRequest.redirectUri)) {
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

    if (evaluation.audiences.length > 1) {
      throw new InvalidOAuthTargetError();
    }

    const missingConsentKeys = new Set(evaluation.missingConsentScopes.map((scope) => scope.key));
    const consentGrants = scopes
      .filter((scope) => missingConsentKeys.has(scope.key))
      .map(
        (scope) =>
          new OAuthConsentGrant({
            id: randomUUID(),
            userId: input.userId,
            oauthClientId: client.id,
            scopeId: scope.id,
            grantedAt: now,
            expiresAt: null,
            revokedAt: null,
          })
      );
    const { rawToken: rawCode, tokenHash: codeHash } =
      this.authorizationCodeTokenService.generate();
    const authorizationCode = new AuthorizationCode({
      id: randomUUID(),
      codeHash,
      oauthClientId: client.id,
      userId: input.userId,
      sessionId: input.sessionId,
      redirectUri: authorizationRequest.redirectUri,
      grantedScopes: [...authorizationRequest.requestedScopes],
      nonce: authorizationRequest.nonce,
      codeChallenge: authorizationRequest.codeChallenge,
      codeChallengeMethod: authorizationRequest.codeChallengeMethod,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.authorizationCodeLifetimeInSeconds * 1000),
      usedAt: null,
    });

    const issued = await this.authorizationCodesRepository.issue({
      authorizationRequestId: authorizationRequest.id,
      authorizationCode,
      consentGrants,
      now,
    });

    if (!issued) {
      throw new InvalidOAuthAuthorizationRequestError();
    }

    return {
      redirectUri: this.buildRedirectUri(authorizationRequest.redirectUri, {
        code: rawCode,
        state: authorizationRequest.state,
      }),
    };
  }

  private buildRedirectUri(redirectUri: string, parameters: Record<string, string>): string {
    const url = new URL(redirectUri);

    for (const [key, value] of Object.entries(parameters)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  }
}
