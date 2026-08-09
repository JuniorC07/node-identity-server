import { randomUUID } from 'node:crypto';

import { AuthorizationRequest } from '@/entities/AuthorizationRequest.js';
import { InvalidOAuthClientError } from '@/errors/oauth/InvalidOAuthClientError.js';
import { InvalidOAuthNonceError } from '@/errors/oauth/InvalidOAuthNonceError.js';
import { InvalidOAuthRedirectUriError } from '@/errors/oauth/InvalidOAuthRedirectUriError.js';
import { InvalidOAuthScopeError } from '@/errors/oauth/InvalidOAuthScopeError.js';
import { InvalidPkceChallengeError } from '@/errors/oauth/InvalidPkceChallengeError.js';
import { UnsupportedOAuthResponseTypeError } from '@/errors/oauth/UnsupportedOAuthResponseTypeError.js';
import { UnsupportedPkceMethodError } from '@/errors/oauth/UnsupportedPkceMethodError.js';
import type { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import type { IOAuthClientsRepository } from '@/repositories/IOAuthClientsRepository.js';
import type { IPkceService } from '@/services/IPkceService.js';
import type { ISessionTokenService } from '@/services/ISessionTokenService.js';

export interface AuthorizationStartedOutput {
  authenticationRequired: false;
  authorizationRequestToken: string;
  client: {
    clientId: string;
    name: string;
  };
  requestedScopes: string[];
}

export interface AuthenticationRequiredOutput {
  authenticationRequired: true;
}

export type StartAuthorizationOutput = AuthorizationStartedOutput | AuthenticationRequiredOutput;

export interface StartAuthorizationRequestInput {
  responseType: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  nonce: string | null;
  codeChallenge: string;
  codeChallengeMethod: string;
}

export interface StartAuthorizationInput extends StartAuthorizationRequestInput {
  userId: string | null;
  sessionId: string | null;
}

export class StartAuthorizationUseCase {
  constructor(
    private readonly clientsRepository: IOAuthClientsRepository,
    private readonly authorizationRequestsRepository: IAuthorizationRequestsRepository,
    private readonly requestTokenService: ISessionTokenService,
    private readonly pkceService: IPkceService,
    private readonly requestLifetimeInSeconds: number
  ) {}

  async execute(input: StartAuthorizationInput): Promise<StartAuthorizationOutput> {
    const client = await this.clientsRepository.findByClientId(input.clientId);

    if (!client) {
      throw new InvalidOAuthClientError();
    }

    if (!client.allowsRedirectUri(input.redirectUri)) {
      throw new InvalidOAuthRedirectUriError();
    }

    if (input.responseType !== 'code') {
      throw new UnsupportedOAuthResponseTypeError();
    }

    const requestedScopes = [
      ...new Set(
        input.scope
          .split(' ')
          .map((scope) => scope.trim())
          .filter(Boolean)
      ),
    ];

    if (requestedScopes.length === 0 || !client.allowsScopes(requestedScopes)) {
      throw new InvalidOAuthScopeError();
    }

    if (input.codeChallengeMethod !== 'S256') {
      throw new UnsupportedPkceMethodError();
    }

    if (!this.pkceService.isValidChallenge(input.codeChallenge)) {
      throw new InvalidPkceChallengeError();
    }

    if (requestedScopes.includes('openid') && !input.nonce) {
      throw new InvalidOAuthNonceError();
    }

    if (!input.userId || !input.sessionId) {
      return { authenticationRequired: true };
    }

    const { rawToken, tokenHash } = this.requestTokenService.generate();

    const now = new Date();

    const authorizationRequest = new AuthorizationRequest({
      id: randomUUID(),
      requestTokenHash: tokenHash,
      oauthClientId: client.id,
      userId: input.userId,
      sessionId: input.sessionId,
      redirectUri: input.redirectUri,
      requestedScopes,
      state: input.state,
      nonce: input.nonce,
      codeChallenge: input.codeChallenge,
      codeChallengeMethod: 'S256',
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.requestLifetimeInSeconds * 1000),
      consumedAt: null,
    });

    await this.authorizationRequestsRepository.create(authorizationRequest);

    return {
      authenticationRequired: false,
      authorizationRequestToken: rawToken,
      client: {
        clientId: client.clientId,
        name: client.name,
      },
      requestedScopes,
    };
  }
}
