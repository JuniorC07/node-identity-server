import { describe, expect, it, vi } from 'vitest';

import { AccessTokenExpiredError } from '@/errors/accessTokens/AccessTokenExpiredError.js';
import { InvalidAccessTokenAudienceError } from '@/errors/accessTokens/InvalidAccessTokenAudienceError.js';
import { InvalidAccessTokenError } from '@/errors/accessTokens/InvalidAccessTokenError.js';
import { InvalidAccessTokenIssuerError } from '@/errors/accessTokens/InvalidAccessTokenIssuerError.js';
import { InvalidAccessTokenKeyIdError } from '@/errors/accessTokens/InvalidAccessTokenKeyIdError.js';
import {
  TokenVerificationError,
  type TokenVerificationFailure,
} from '@/errors/jwt/TokenVerificationError.js';
import type { AccessTokenClaims } from '@/services/jwt/AccessTokenClaims.js';
import type { ITokenVerifierService } from '@/services/jwt/ITokenVerifierService.js';
import { VerifyAccessTokenUseCase } from '@/useCases/accessTokens/VerifyAccessTokenUseCase.js';

describe('VerifyAccessTokenUseCase', () => {
  it('should return the claims from a verified access token', async () => {
    const claims: AccessTokenClaims = {
      issuer: 'https://identity.example.com',
      subject: 'user-id',
      sessionId: 'session-id',
      clientId: 'client-id',
      scopes: ['openid', 'profile', 'email'],
      audience: ['example-service'],
      issuedAt: new Date('2026-08-04T12:00:00.000Z'),
      expiresAt: new Date('2026-08-04T12:10:00.000Z'),
    };
    const verify = vi.fn<ITokenVerifierService['verify']>().mockResolvedValue({
      issuer: claims.issuer,
      subject: claims.subject,
      audience: claims.audience,
      issuedAt: claims.issuedAt,
      expiresAt: claims.expiresAt,
      claims: {
        sid: claims.sessionId,
        client_id: claims.clientId,
        scope: claims.scopes.join(' '),
      },
    });
    const tokenVerifier: ITokenVerifierService = { verify };
    const useCase = new VerifyAccessTokenUseCase(tokenVerifier);

    const output = await useCase.execute({
      accessToken: 'signed-access-token',
      audience: 'example-service',
    });

    expect(verify).toHaveBeenCalledOnce();
    expect(verify).toHaveBeenCalledWith({
      token: 'signed-access-token',
      audience: 'example-service',
      expectedTyp: 'at+jwt',
    });
    expect(output).toEqual(claims);
  });

  it.each([
    { failure: 'expired', ErrorType: AccessTokenExpiredError },
    { failure: 'invalid_audience', ErrorType: InvalidAccessTokenAudienceError },
    { failure: 'invalid_issuer', ErrorType: InvalidAccessTokenIssuerError },
    { failure: 'invalid_key_id', ErrorType: InvalidAccessTokenKeyIdError },
    { failure: 'invalid', ErrorType: InvalidAccessTokenError },
  ] as const)('should map $failure verification failures', async ({ failure, ErrorType }) => {
    const tokenVerifier: ITokenVerifierService = {
      verify: vi
        .fn<ITokenVerifierService['verify']>()
        .mockRejectedValue(new TokenVerificationError(failure as TokenVerificationFailure)),
    };
    const useCase = new VerifyAccessTokenUseCase(tokenVerifier);

    await expect(
      useCase.execute({
        accessToken: 'invalid-access-token',
        audience: 'example-service',
      })
    ).rejects.toBeInstanceOf(ErrorType);
  });

  it.each([undefined, '', 123])('should reject an invalid sid claim', async (sid) => {
    const tokenVerifier: ITokenVerifierService = {
      verify: vi.fn<ITokenVerifierService['verify']>().mockResolvedValue({
        issuer: 'https://identity.example.com',
        subject: 'user-id',
        audience: ['example-service'],
        issuedAt: new Date('2026-08-04T12:00:00.000Z'),
        expiresAt: new Date('2026-08-04T12:10:00.000Z'),
        claims: {
          sid,
          client_id: 'client-id',
          scope: 'openid profile',
        },
      }),
    };
    const useCase = new VerifyAccessTokenUseCase(tokenVerifier);

    await expect(
      useCase.execute({ accessToken: 'signed-access-token', audience: 'example-service' })
    ).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it.each([undefined, '', 123])('should reject an invalid client_id claim', async (clientId) => {
    const tokenVerifier: ITokenVerifierService = {
      verify: vi.fn<ITokenVerifierService['verify']>().mockResolvedValue({
        issuer: 'https://identity.example.com',
        subject: 'user-id',
        audience: ['example-service'],
        issuedAt: new Date('2026-08-04T12:00:00.000Z'),
        expiresAt: new Date('2026-08-04T12:10:00.000Z'),
        claims: {
          sid: 'session-id',
          client_id: clientId,
          scope: 'openid profile',
        },
      }),
    };
    const useCase = new VerifyAccessTokenUseCase(tokenVerifier);

    await expect(
      useCase.execute({ accessToken: 'signed-access-token', audience: 'example-service' })
    ).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it.each([undefined, '', 123])('should reject an invalid scope claim', async (scope) => {
    const tokenVerifier: ITokenVerifierService = {
      verify: vi.fn<ITokenVerifierService['verify']>().mockResolvedValue({
        issuer: 'https://identity.example.com',
        subject: 'user-id',
        audience: ['example-service'],
        issuedAt: new Date('2026-08-04T12:00:00.000Z'),
        expiresAt: new Date('2026-08-04T12:10:00.000Z'),
        claims: {
          sid: 'session-id',
          client_id: 'client-id',
          scope,
        },
      }),
    };
    const useCase = new VerifyAccessTokenUseCase(tokenVerifier);

    await expect(
      useCase.execute({ accessToken: 'signed-access-token', audience: 'example-service' })
    ).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });
});
