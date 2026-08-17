import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { DecideOAuthConsentController } from '@/controllers/oauth/DecideOAuthConsentController.js';
import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import type { DecideOAuthConsentUseCase } from '@/useCases/oauth/DecideOAuthConsentUseCase.js';
import type { DecideOAuthConsentValidator } from '@/validators/oauth/DecideOAuthConsent/DecideOAuthConsentValidator.js';

function makeSut() {
  const execute = vi.fn<DecideOAuthConsentUseCase['execute']>();
  const validate = vi
    .fn<DecideOAuthConsentValidator['validate']>()
    .mockReturnValue({ authorizationRequestToken: 'request-token', decision: 'approve' });
  const controller = new DecideOAuthConsentController(
    { execute } as unknown as DecideOAuthConsentUseCase,
    { validate } as DecideOAuthConsentValidator
  );

  return { controller, execute, validate };
}

describe('DecideOAuthConsentController', () => {
  it('should reject unauthenticated requests', async () => {
    const { controller, execute, validate } = makeSut();
    const req = { params: {}, body: {} } as Request;

    await expect(controller.handle(req, {} as Response)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(validate).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  it('should validate the request and redirect to the OAuth callback', async () => {
    const { controller, execute, validate } = makeSut();
    execute.mockResolvedValue({
      redirectUri: 'https://client.example.com/callback?code=raw-code&state=state',
    });
    const req = {
      params: { authorizationRequestToken: 'request-token' },
      body: { decision: 'approve' },
      auth: { userId: 'user-id', sessionId: 'session-id', identityId: 'identity-id' },
    } as unknown as Request;
    const redirect = vi.fn();

    await controller.handle(req, { redirect } as unknown as Response);

    expect(validate).toHaveBeenCalledWith({
      authorizationRequestToken: 'request-token',
      decision: 'approve',
    });
    expect(execute).toHaveBeenCalledWith({
      authorizationRequestToken: 'request-token',
      decision: 'approve',
      userId: 'user-id',
      sessionId: 'session-id',
    });
    expect(redirect).toHaveBeenCalledWith(
      302,
      'https://client.example.com/callback?code=raw-code&state=state'
    );
  });
});
