import { decodeProtectedHeader, errors, jwtVerify } from 'jose';

import { AccessTokenExpiredError } from '@/errors/accessTokens/AccessTokenExpiredError.js';
import { InvalidAccessTokenError } from '@/errors/accessTokens/InvalidAccessTokenError.js';
import { InvalidAccessTokenAudienceError } from '@/errors/accessTokens/InvalidAccessTokenAudienceError.js';
import { InvalidAccessTokenIssuerError } from '@/errors/accessTokens/InvalidAccessTokenIssuerError.js';
import { InvalidAccessTokenKeyIdError } from '@/errors/accessTokens/InvalidAccessTokenKeyIdError.js';
import type { AccessTokenClaims } from '@/services/accessTokens/AccessTokenClaims.js';
import type {
  ITokenVerifierService,
  VerifyTokenInput,
} from '@/services/accessTokens/ITokenVerifierService.js';
import type { ITokenKeyStoreService } from '@/services/accessTokens/ITokenKeyStoreService.js';

interface JoseTokenVerifierConfig {
  issuer: string;
  algorithm: 'RS256';
}

export class JoseTokenVerifierService implements ITokenVerifierService {
  constructor(
    private readonly keyStore: ITokenKeyStoreService,
    private readonly config: JoseTokenVerifierConfig
  ) {}

  async verify(input: VerifyTokenInput): Promise<AccessTokenClaims> {
    try {
      const protectedHeader = decodeProtectedHeader(input.token);

      if (typeof protectedHeader.kid !== 'string' || protectedHeader.kid.length === 0) {
        throw new InvalidAccessTokenKeyIdError();
      }

      if (protectedHeader.alg !== this.config.algorithm) {
        throw new InvalidAccessTokenError();
      }

      const verificationKey = await this.keyStore.findVerificationKey(protectedHeader.kid);

      if (!verificationKey) {
        throw new InvalidAccessTokenKeyIdError();
      }

      const { payload } = await jwtVerify(input.token, verificationKey.publicKey, {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
        audience: input.audience,
        typ: 'at+jwt',
      });

      if (
        typeof payload.iss !== 'string' ||
        typeof payload.sub !== 'string' ||
        typeof payload.sid !== 'string' ||
        payload.sid.length === 0 ||
        typeof payload.iat !== 'number' ||
        typeof payload.exp !== 'number' ||
        payload.aud === undefined
      ) {
        throw new InvalidAccessTokenError();
      }

      const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

      return {
        issuer: payload.iss,
        subject: payload.sub,
        sessionId: payload.sid,
        audience,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: unknown): Error {
    if (
      error instanceof AccessTokenExpiredError ||
      error instanceof InvalidAccessTokenError ||
      error instanceof InvalidAccessTokenIssuerError ||
      error instanceof InvalidAccessTokenAudienceError ||
      error instanceof InvalidAccessTokenKeyIdError
    ) {
      return error;
    }

    if (error instanceof errors.JWTExpired) {
      return new AccessTokenExpiredError();
    }

    if (error instanceof errors.JWTClaimValidationFailed) {
      if (error.claim === 'iss') {
        return new InvalidAccessTokenIssuerError();
      }

      if (error.claim === 'aud') {
        return new InvalidAccessTokenAudienceError();
      }
    }

    return new InvalidAccessTokenError();
  }
}
