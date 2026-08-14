import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { GetPendingConsentDetailsController } from '@/controllers/oauth/GetPendingConsentDetailsController.js';
import { BadRequestError } from '@/errors/general/BadRequestError.js';
import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import type { GetPendingConsentDetailsUseCase } from '@/useCases/oauth/GetPendingConsentDetailsUseCase.js';
import type { GetPendingConsentDetailsValidator } from '@/validators/oauth/GetPendingConsentDetails/GetPendingConsentDetailsValidator.js';

function makeSut() {
  const execute = vi.fn<GetPendingConsentDetailsUseCase['execute']>();
  const validate = vi
    .fn<GetPendingConsentDetailsValidator['validate']>()
    .mockReturnValue({ authorizationRequestToken: 'request-token' });
  const controller = new GetPendingConsentDetailsController(
    { execute } as unknown as GetPendingConsentDetailsUseCase,
    { validate } as GetPendingConsentDetailsValidator
  );

  return { controller, execute, validate };
}

describe('GetPendingConsentDetailsController', () => {
  it('should reject unauthenticated requests', async () => {
    const { controller, execute } = makeSut();
    const req = { params: { requestToken: 'request-token' } } as unknown as Request;

    await expect(controller.handle(req, {} as Response)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(execute).not.toHaveBeenCalled();
  });

  it('should reject requests without a valid request token parameter', async () => {
    const { controller, execute, validate } = makeSut();
    validate.mockImplementation(() => {
      throw new BadRequestError();
    });
    const req = {
      auth: { userId: 'user-id', sessionId: 'session-id', identityId: 'identity-id' },
      params: {},
    } as Request;

    await expect(controller.handle(req, {} as Response)).rejects.toBeInstanceOf(BadRequestError);
    expect(validate).toHaveBeenCalledWith(req.params);
    expect(execute).not.toHaveBeenCalled();
  });

  it('should return the pending consent details for the authenticated session', async () => {
    const { controller, execute, validate } = makeSut();
    const output = {
      client: { clientId: 'client-id', name: 'Example client' },
      consentRequired: true,
      requestedScopes: [
        {
          key: 'profile',
          type: 'oidc' as const,
          description: 'Access basic profile information',
          consentRequired: true,
          consentGranted: false,
        },
      ],
      expiresAt: new Date('2026-08-13T12:00:00.000Z'),
    };
    execute.mockResolvedValue(output);
    const req = {
      auth: { userId: 'user-id', sessionId: 'session-id', identityId: 'identity-id' },
      params: { requestToken: 'request-token' },
    } as unknown as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });

    await controller.handle(req, { status } as unknown as Response);

    expect(validate).toHaveBeenCalledWith(req.params);
    expect(execute).toHaveBeenCalledWith({
      authorizationRequestToken: 'request-token',
      userId: 'user-id',
      sessionId: 'session-id',
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(output);
  });
});
