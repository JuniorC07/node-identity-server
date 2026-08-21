import { decodeProtectedHeader, errors, jwtVerify } from 'jose';

import { TokenVerificationError } from '@/errors/jwt/TokenVerificationError.js';
import type {
  ITokenVerifierService,
  VerifyTokenInput,
  VerifyTokenOutput,
} from '@/services/jwt/ITokenVerifierService.js';
import type { ITokenKeyStoreService } from '@/services/jwt/ITokenKeyStoreService.js';

interface JoseTokenVerifierConfig {
  issuer: string;
  algorithm: 'RS256';
}

export class JoseTokenVerifierService implements ITokenVerifierService {
  constructor(
    private readonly keyStore: ITokenKeyStoreService,
    private readonly config: JoseTokenVerifierConfig
  ) {}

  async verify(input: VerifyTokenInput): Promise<VerifyTokenOutput> {
    try {
      const protectedHeader = decodeProtectedHeader(input.token);

      if (typeof protectedHeader.kid !== 'string' || protectedHeader.kid.length === 0) {
        throw new TokenVerificationError('invalid_key_id');
      }

      if (protectedHeader.alg !== this.config.algorithm) {
        throw new TokenVerificationError('invalid');
      }

      const verificationKey = await this.keyStore.findVerificationKey(protectedHeader.kid);

      if (!verificationKey) {
        throw new TokenVerificationError('invalid_key_id');
      }

      const { payload } = await jwtVerify(input.token, verificationKey.publicKey, {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
        audience: input.audience,
        typ: input.expectedTyp,
      });

      if (
        typeof payload.iss !== 'string' ||
        typeof payload.sub !== 'string' ||
        typeof payload.iat !== 'number' ||
        typeof payload.exp !== 'number' ||
        payload.aud === undefined
      ) {
        throw new TokenVerificationError('invalid');
      }

      const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      const {
        iss: _issuer,
        sub: _subject,
        aud: _audience,
        iat: _issuedAt,
        exp: _expiresAt,
        ...claims
      } = payload;

      return {
        issuer: payload.iss,
        subject: payload.sub,
        audience,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        claims,
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: unknown): Error {
    if (error instanceof TokenVerificationError) {
      return error;
    }

    if (error instanceof errors.JWTExpired) {
      return new TokenVerificationError('expired');
    }

    if (error instanceof errors.JWTClaimValidationFailed) {
      if (error.claim === 'iss') {
        return new TokenVerificationError('invalid_issuer');
      }

      if (error.claim === 'aud') {
        return new TokenVerificationError('invalid_audience');
      }
    }

    return new TokenVerificationError('invalid');
  }
}
