import { UnsupportedOAuthGrantTypeError } from '@/errors/oauth/UnsupportedOAuthGrantTypeError.js';
import { InvalidOAuthGrantError } from '@/errors/oauth/InvalidOAuthGrantError.js';
import { InvalidOAuthClientError } from '@/errors/oauth/InvalidOAuthClientError.js';
import type { IAuthorizationCodesRepository } from '@/repositories/oauth/IOAuthAuthorizationCodesRepository.js';
import type { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import type { IOAuthClientsRepository } from '@/repositories/oauth/IOAuthClientsRepository.js';
import type { IPasswordHasherService } from '@/services/IPasswordHasherService.js';
import type { IPkceService } from '@/services/IPkceService.js';
import type { ISessionTokenService } from '@/services/ISessionTokenService.js';
import type { AccessTokenIssuerUseCase } from '@/useCases/accessTokens/AccessTokenIssuerUseCase.js';
import type { ResolveRegisteredOAuthScopesUseCase } from '@/useCases/oauth/_internal/ResolveRegisteredOAuthScopesUseCase.js';
import type { ValidateUserScopesUseCase } from '@/useCases/oauth/_internal/ValidateUserScopesUseCase.js';
import type { EvaluateOAuthConsentUseCase } from '@/useCases/oauth/_internal/EvaluateOAuthConsentUseCase.js';
import type { IdTokenIssuerUseCase } from '@/useCases/idTokens/IdTokenIssuerUseCase.js';

export interface ExchangeAuthorizationCodeRequestInput {
  grantType: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string | null;
}

export type ExchangeAuthorizationCodeInput = ExchangeAuthorizationCodeRequestInput;

export interface ExchangeAuthorizationCodeOutput {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string;
  idToken: string | null;
}

export class ExchangeAuthorizationCodeUseCase {
  constructor(
    private readonly authorizationCodesRepository: IAuthorizationCodesRepository,
    private readonly authorizationRequestsRepository: IAuthorizationRequestsRepository,
    private readonly clientsRepository: IOAuthClientsRepository,
    private readonly authorizationCodeTokenService: ISessionTokenService,
    private readonly pkceService: IPkceService,
    private readonly passwordHasherService: IPasswordHasherService,
    private readonly resolveRegisteredOAuthScopesUseCase: ResolveRegisteredOAuthScopesUseCase,
    private readonly validateUserScopesUseCase: ValidateUserScopesUseCase,
    private readonly evaluateOAuthConsentUseCase: EvaluateOAuthConsentUseCase,
    private readonly accessTokenIssuerUseCase: AccessTokenIssuerUseCase,
    private readonly idTokenIssuerUseCase: IdTokenIssuerUseCase
  ) {}

  async execute(input: ExchangeAuthorizationCodeInput): Promise<ExchangeAuthorizationCodeOutput> {
    if (input.grantType !== 'authorization_code') {
      throw new UnsupportedOAuthGrantTypeError();
    }

    const client = await this.clientsRepository.findByClientId(input.clientId);

    if (!client) {
      throw new InvalidOAuthClientError(true);
    }

    if (client.isConfidential()) {
      if (
        !input.clientSecret ||
        !(await this.passwordHasherService.verify(input.clientSecret, client.clientSecretHash!))
      ) {
        throw new InvalidOAuthClientError(true);
      }
    } else if (input.clientSecret) {
      throw new InvalidOAuthClientError(true);
    }

    const now = new Date();
    const codeHash = this.authorizationCodeTokenService.hash(input.code);
    const authorizationCode = await this.authorizationCodesRepository.findPendingByCodeHash(
      codeHash,
      now
    );
    if (!authorizationCode) {
      throw new InvalidOAuthGrantError();
    }
    const authorizationRequest = await this.authorizationRequestsRepository.findById(
      authorizationCode.authorizationRequestId
    );

    if (
      !authorizationRequest ||
      authorizationRequest?.oauthClientId !== client.id ||
      authorizationRequest.redirectUri !== input.redirectUri ||
      authorizationRequest.codeChallengeMethod !== 'S256' ||
      !this.pkceService.isValidVerifier(input.codeVerifier) ||
      this.pkceService.createChallenge(input.codeVerifier) !== authorizationRequest.codeChallenge
    ) {
      throw new InvalidOAuthGrantError();
    }

    const { scopes } = await this.resolveRegisteredOAuthScopesUseCase.execute({
      requestedScopeKeys: [...authorizationRequest.requestedScopes],
    });

    const evaluation = await this.evaluateOAuthConsentUseCase.execute({
      userId: authorizationRequest.userId,
      oauthClientId: client.id,
      scopes,
    });

    if (evaluation.consentRequired) {
      throw new InvalidOAuthGrantError();
    }

    await this.validateUserScopesUseCase.execute({
      userId: authorizationRequest.userId,
      scopes,
    });

    const audience = [
      ...new Set(
        scopes.filter((scope) => scope.isResource()).map((scope) => scope.resource.audience)
      ),
    ];

    const scopeKeys = scopes.map((scope) => scope.key);
    const accessToken = await this.accessTokenIssuerUseCase.execute({
      subject: authorizationRequest.userId,
      sessionId: authorizationRequest.sessionId,
      clientId: client.clientId,
      audience: audience,
      scopes: scopeKeys,
    });
    const idToken = scopeKeys.includes('openid')
      ? await this.idTokenIssuerUseCase.execute({
          userId: authorizationRequest.userId,
          sessionId: authorizationRequest.sessionId,
          clientId: client.clientId,
          nonce: authorizationRequest.nonce,
          scopes: scopeKeys,
        })
      : null;

    const consumed = await this.authorizationCodesRepository.consume({
      id: authorizationCode.id,
      consumedAt: now,
      status: 'approved',
    });

    if (!consumed) {
      throw new InvalidOAuthGrantError();
    }

    return {
      accessToken: accessToken.accessToken,
      tokenType: accessToken.tokenType,
      expiresIn: accessToken.expiresIn,
      scope: scopeKeys.join(' '),
      idToken,
    };
  }
}
