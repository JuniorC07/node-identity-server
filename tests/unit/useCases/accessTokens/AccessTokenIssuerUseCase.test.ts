import { describe, expect, it, vi } from 'vitest';

import type { ITokenSignerService } from '@/services/accessTokens/ITokenSignerService.js';
import { AccessTokenIssuerUseCase } from '@/useCases/accessTokens/AccessTokenIssuerUseCase.js';

const ACCESS_TOKEN_LIFETIME_IN_SECONDS = 600;

describe('AccessTokenIssuerUseCase', () => {
  it('should issue an access token using the configured lifetime', async () => {
    const issuedAt = new Date('2026-08-04T12:00:00.000Z');
    const expiresAt = new Date('2026-08-04T12:10:00.000Z');
    const sign = vi.fn<ITokenSignerService['sign']>().mockResolvedValue({
      token: 'signed-access-token',
      issuedAt,
      expiresAt,
    });
    const tokenSigner: ITokenSignerService = { sign };
    const useCase = new AccessTokenIssuerUseCase(tokenSigner, ACCESS_TOKEN_LIFETIME_IN_SECONDS);

    const output = await useCase.execute({
      subject: 'user-id',
      sessionId: 'session-id',
      audience: ['service-a', 'service-b'],
    });

    expect(sign).toHaveBeenCalledOnce();
    expect(sign).toHaveBeenCalledWith({
      subject: 'user-id',
      sessionId: 'session-id',
      audience: ['service-a', 'service-b'],
      expiresInSeconds: ACCESS_TOKEN_LIFETIME_IN_SECONDS,
    });
    expect(output).toEqual({
      accessToken: 'signed-access-token',
      tokenType: 'Bearer',
      issuedAt,
      expiresAt,
      expiresIn: ACCESS_TOKEN_LIFETIME_IN_SECONDS,
    });
  });

  it('should propagate token signing failures', async () => {
    const signingError = new Error('Unable to sign access token');
    const tokenSigner: ITokenSignerService = {
      sign: vi.fn<ITokenSignerService['sign']>().mockRejectedValue(signingError),
    };
    const useCase = new AccessTokenIssuerUseCase(tokenSigner, ACCESS_TOKEN_LIFETIME_IN_SECONDS);

    await expect(
      useCase.execute({
        subject: 'user-id',
        sessionId: 'session-id',
        audience: 'service-a',
      })
    ).rejects.toBe(signingError);
  });
});
