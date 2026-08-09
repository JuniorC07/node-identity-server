import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { StartAuthorizationController } from '@/controllers/oauth/StartAuthorizationController.js';
import type {
  StartAuthorizationRequestInput,
  StartAuthorizationUseCase,
} from '@/useCases/oauth/StartAuthorizationUseCase.js';
import type { AuthorizeRequestValidator } from '@/validators/oauth/StartAuthorization/StartAuthorizationValidator.js';

const validInput: StartAuthorizationRequestInput = {
  responseType: 'code',
  clientId: 'client-id',
  redirectUri: 'https://client.example.com/callback',
  scope: 'openid profile',
  state: 'state-with-enough-entropy',
  nonce: 'nonce-with-enough-entropy',
  codeChallenge: 'A'.repeat(43),
  codeChallengeMethod: 'S256',
};

function makeSut() {
  const execute = vi.fn<StartAuthorizationUseCase['execute']>();
  const validate = vi.fn<AuthorizeRequestValidator['validate']>().mockReturnValue(validInput);
  const controller = new StartAuthorizationController(
    { execute } as unknown as StartAuthorizationUseCase,
    { validate } as AuthorizeRequestValidator,
    '/login'
  );

  return { controller, execute, validate };
}

describe('StartAuthorizationController', () => {
  it('should redirect an unauthenticated user to login after validating the request', async () => {
    const { controller, execute, validate } = makeSut();
    execute.mockResolvedValue({ authenticationRequired: true });
    const req = {
      query: { response_type: 'code' },
      originalUrl: '/oauth/authorize?response_type=code&client_id=client-id',
    } as unknown as Request;
    const redirect = vi.fn();
    const res = { redirect } as unknown as Response;

    await controller.handle(req, res);

    expect(validate).toHaveBeenCalledWith(req.query);
    expect(execute).toHaveBeenCalledWith({
      ...validInput,
      userId: null,
      sessionId: null,
    });
    expect(redirect).toHaveBeenCalledWith(
      302,
      '/login?return_to=%2Foauth%2Fauthorize%3Fresponse_type%3Dcode%26client_id%3Dclient-id'
    );
  });

  it('should start authorization with the resolved user and session', async () => {
    const { controller, execute } = makeSut();
    execute.mockResolvedValue({
      authenticationRequired: false,
      authorizationRequestToken: 'authorization-request-token',
      client: { clientId: 'client-id', name: 'Example client' },
      requestedScopes: ['openid', 'profile'],
    });
    const req = {
      query: {},
      originalUrl: '/oauth/authorize',
      auth: {
        userId: 'user-id',
        sessionId: 'session-id',
        identityId: 'identity-id',
      },
    } as Request;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    await controller.handle(req, res);

    expect(execute).toHaveBeenCalledWith({
      ...validInput,
      userId: 'user-id',
      sessionId: 'session-id',
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      authorizationRequestToken: 'authorization-request-token',
      client: { clientId: 'client-id', name: 'Example client' },
      requestedScopes: ['openid', 'profile'],
    });
  });
});
