import { AccessTokenExpiredError } from '@/errors/accessTokens/AccessTokenExpiredError.js';
import { InvalidAccessTokenAudienceError } from '@/errors/accessTokens/InvalidAccessTokenAudienceError.js';
import { InvalidAccessTokenError } from '@/errors/accessTokens/InvalidAccessTokenError.js';
import { InvalidAccessTokenIssuerError } from '@/errors/accessTokens/InvalidAccessTokenIssuerError.js';
import { InvalidAccessTokenKeyIdError } from '@/errors/accessTokens/InvalidAccessTokenKeyIdError.js';
import { TokenVerificationError } from '@/errors/jwt/TokenVerificationError.js';
import type { AccessTokenClaims } from '@/services/jwt/AccessTokenClaims.js';
import type { ITokenVerifierService } from '@/services/jwt/ITokenVerifierService.js';
import { TOKEN_TYPES } from '@/services/jwt/TokenTypes.js';

export interface VerifyAccessTokenInput {
  accessToken: string;
  audience: string | string[];
}

export type VerifyAccessTokenOutput = AccessTokenClaims;

export class VerifyAccessTokenUseCase {
  constructor(private readonly tokenVerifier: ITokenVerifierService) {}

  async execute(input: VerifyAccessTokenInput): Promise<VerifyAccessTokenOutput> {
    try {
      const token = await this.tokenVerifier.verify({
        token: input.accessToken,
        audience: input.audience,
        expectedTyp: TOKEN_TYPES.accessToken,
      });
      const sessionId = token.claims.sid;
      const clientId = token.claims.client_id;
      const scope = token.claims.scope;

      if (
        typeof sessionId !== 'string' ||
        sessionId.length === 0 ||
        typeof clientId !== 'string' ||
        clientId.length === 0 ||
        typeof scope !== 'string' ||
        scope.length === 0
      ) {
        throw new InvalidAccessTokenError();
      }

      return {
        issuer: token.issuer,
        subject: token.subject,
        scopes: scope.split(' '),
        clientId,
        sessionId,
        audience: token.audience,
        issuedAt: token.issuedAt,
        expiresAt: token.expiresAt,
      };
    } catch (error) {
      if (!(error instanceof TokenVerificationError)) {
        throw error;
      }

      throw this.mapVerificationError(error);
    }
  }

  private mapVerificationError(error: TokenVerificationError): Error {
    switch (error.failure) {
      case 'expired':
        return new AccessTokenExpiredError();
      case 'invalid_audience':
        return new InvalidAccessTokenAudienceError();
      case 'invalid_issuer':
        return new InvalidAccessTokenIssuerError();
      case 'invalid_key_id':
        return new InvalidAccessTokenKeyIdError();
      default:
        return new InvalidAccessTokenError();
    }
  }
}
