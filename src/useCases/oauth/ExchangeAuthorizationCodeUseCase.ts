import { InvalidOAuthClientCredentialsError } from '@/errors/oauth/InvalidOAuthClientCredentialsError.js';
import { InvalidOAuthGrantError } from '@/errors/oauth/InvalidOAuthGrantError.js';
import { InvalidOAuthTargetError } from '@/errors/oauth/InvalidOAuthTargetError.js';
import { UnsupportedOAuthGrantTypeError } from '@/errors/oauth/UnsupportedOAuthGrantTypeError.js';
import type { IAuthorizationCodesRepository } from '@/repositories/IAuthorizationCodesRepository.js';
import type { IOAuthClientsRepository } from '@/repositories/IOAuthClientsRepository.js';
import type { ISessionsRepository } from '@/repositories/ISessionsRepository.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';
import type { IPasswordHasherService } from '@/services/IPasswordHasherService.js';
import type { IPkceService } from '@/services/IPkceService.js';
import type { IAuthorizationCodeTokenService } from '@/services/oauth/IAuthorizationCodeTokenService.js';
import type { AccessTokenIssuerUseCase } from '@/useCases/accessTokens/AccessTokenIssuerUseCase.js';
import type { IdTokenIssuerUseCase } from '@/useCases/idTokens/IdTokenIssuerUseCase.js';
import type { EvaluateUserOAuthAuthorizationUseCase } from '@/useCases/oauth/EvaluateUserOAuthAuthorizationUseCase.js';
import type { ResolveOAuthScopesUseCase } from '@/useCases/oauth/ResolveOAuthScopesUseCase.js';

export interface ExchangeAuthorizationCodeInput {
  grantType: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string | null;
}

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
    private readonly clientsRepository: IOAuthClientsRepository,
    private readonly sessionsRepository: ISessionsRepository,
    private readonly usersRepository: IUsersRepository,
    private readonly authorizationCodeTokenService: IAuthorizationCodeTokenService,
    private readonly pkceService: IPkceService,
    private readonly passwordHasherService: IPasswordHasherService,
    private readonly resolveOAuthScopesUseCase: ResolveOAuthScopesUseCase,
    private readonly evaluateUserOAuthAuthorizationUseCase: EvaluateUserOAuthAuthorizationUseCase,
    private readonly accessTokenIssuerUseCase: AccessTokenIssuerUseCase,
    private readonly idTokenIssuerUseCase: IdTokenIssuerUseCase,
    private readonly userInfoAudience: string
  ) {}

  async execute(input: ExchangeAuthorizationCodeInput): Promise<ExchangeAuthorizationCodeOutput> {
    if (input.grantType !== 'authorization_code') {
      throw new UnsupportedOAuthGrantTypeError();
    }

    const client = await this.clientsRepository.findByClientId(input.clientId);

    if (!client) {
      throw new InvalidOAuthClientCredentialsError();
    }

    if (client.isConfidential()) {
      if (
        !input.clientSecret ||
        !(await this.passwordHasherService.verify(input.clientSecret, client.clientSecretHash!))
      ) {
        throw new InvalidOAuthClientCredentialsError();
      }
    } else if (input.clientSecret) {
      throw new InvalidOAuthClientCredentialsError();
    }

    const now = new Date();
    const codeHash = this.authorizationCodeTokenService.hash(input.code);
    const authorizationCode = await this.authorizationCodesRepository.findPendingByCodeHash(
      codeHash,
      now
    );

    if (
      !authorizationCode ||
      authorizationCode.oauthClientId !== client.id ||
      authorizationCode.redirectUri !== input.redirectUri ||
      authorizationCode.codeChallengeMethod !== 'S256' ||
      !this.pkceService.isValidVerifier(input.codeVerifier) ||
      this.pkceService.createChallenge(input.codeVerifier) !== authorizationCode.codeChallenge
    ) {
      throw new InvalidOAuthGrantError();
    }

    const [session, user] = await Promise.all([
      this.sessionsRepository.findActiveById(authorizationCode.sessionId),
      this.usersRepository.findUserById(authorizationCode.userId),
    ]);

    if (!session || session.userId !== authorizationCode.userId || !user) {
      throw new InvalidOAuthGrantError();
    }

    const { scopes } = await this.resolveOAuthScopesUseCase.execute({
      requestedScopeKeys: [...authorizationCode.grantedScopes],
      clientAllowedScopeKeys: client.allowedScopes,
    });
    const evaluation = await this.evaluateUserOAuthAuthorizationUseCase.execute({
      userId: user.id,
      oauthClientId: client.id,
      scopes,
    });

    if (evaluation.consentRequired) {
      throw new InvalidOAuthGrantError();
    }

    if (evaluation.audiences.length > 1) {
      throw new InvalidOAuthTargetError();
    }

    const consumed = await this.authorizationCodesRepository.consume(authorizationCode.id, now);

    if (!consumed) {
      throw new InvalidOAuthGrantError();
    }

    const scopeKeys = scopes.map((scope) => scope.key);
    const accessToken = await this.accessTokenIssuerUseCase.execute({
      subject: user.id,
      sessionId: session.id,
      clientId: client.clientId,
      audience: evaluation.audiences[0] ?? this.userInfoAudience,
      scopes: scopeKeys,
      modules: evaluation.modules,
    });
    const idToken = scopeKeys.includes('openid')
      ? await this.idTokenIssuerUseCase.execute({
          user,
          sessionId: session.id,
          clientId: client.clientId,
          nonce: authorizationCode.nonce,
          scopes: scopeKeys,
        })
      : null;

    return {
      accessToken: accessToken.accessToken,
      tokenType: accessToken.tokenType,
      expiresIn: accessToken.expiresIn,
      scope: scopeKeys.join(' '),
      idToken,
    };
  }
}
