import { describe, expect, it, vi } from 'vitest';

import { InvalidAccessTokenError } from '@/errors/accessTokens/InvalidAccessTokenError.js';
import type { AccessTokenClaims } from '@/services/accessTokens/AccessTokenClaims.js';
import type { ITokenVerifierService } from '@/services/accessTokens/ITokenVerifierService.js';
import { VerifyAccessTokenUseCase } from '@/useCases/accessTokens/VerifyAccessTokenUseCase.js';

describe('VerifyAccessTokenUseCase', () => {
  it('should return the claims from a verified access token', async () => {
    const claims: AccessTokenClaims = {
      issuer: 'https://identity.example.com',
      subject: 'user-id',
      sessionId: 'session-id',
      audience: ['example-service'],
      issuedAt: new Date('2026-08-04T12:00:00.000Z'),
      expiresAt: new Date('2026-08-04T12:10:00.000Z'),
    };
    const verify = vi.fn<ITokenVerifierService['verify']>().mockResolvedValue(claims);
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
    });
    expect(output).toBe(claims);
  });

  it('should propagate access token verification failures', async () => {
    const verificationError = new InvalidAccessTokenError();
    const tokenVerifier: ITokenVerifierService = {
      verify: vi.fn<ITokenVerifierService['verify']>().mockRejectedValue(verificationError),
    };
    const useCase = new VerifyAccessTokenUseCase(tokenVerifier);

    await expect(
      useCase.execute({
        accessToken: 'invalid-access-token',
        audience: 'example-service',
      })
    ).rejects.toBe(verificationError);
  });
});
