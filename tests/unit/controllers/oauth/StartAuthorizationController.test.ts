import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { StartAuthorizationController } from '@/controllers/oauth/StartAuthorizationController.js';
import type {
  StartAuthorizationRequestInput,
  StartAuthorizationUseCase,
} from '@/useCases/oauth/StartAuthorizationUseCase.js';
import type { DecideAuthorizationUseCase } from '@/useCases/oauth/DecideAuthorizationUseCase.js';
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
  const decide = vi.fn<DecideAuthorizationUseCase['execute']>();
  const validate = vi.fn<AuthorizeRequestValidator['validate']>().mockReturnValue(validInput);
  const controller = new StartAuthorizationController(
    { execute } as unknown as StartAuthorizationUseCase,
    { execute: decide } as unknown as DecideAuthorizationUseCase,
    { validate } as AuthorizeRequestValidator,
    '/login',
    '/consent'
  );

  return { controller, execute, decide, validate };
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
    const { controller, execute, decide } = makeSut();
    execute.mockResolvedValue({
      authenticationRequired: false,
      consentRequired: false,
      authorizationRequestToken: 'authorization-request-token',
      client: { clientId: 'client-id', name: 'Example client' },
      requestedScopes: ['openid', 'profile'],
      missingConsentScopes: [],
      audiences: [],
      modules: [],
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
    decide.mockResolvedValue({
      redirectUri: 'https://client.example.com/callback?code=code&state=state',
    });
    const redirect = vi.fn();
    const res = { redirect } as unknown as Response;

    await controller.handle(req, res);

    expect(execute).toHaveBeenCalledWith({
      ...validInput,
      userId: 'user-id',
      sessionId: 'session-id',
    });
    expect(decide).toHaveBeenCalledWith({
      authorizationRequestToken: 'authorization-request-token',
      decision: 'approve',
      userId: 'user-id',
      sessionId: 'session-id',
    });
    expect(redirect).toHaveBeenCalledWith(
      302,
      'https://client.example.com/callback?code=code&state=state'
    );
  });

  it('should redirect to consent when a requested scope has no active grant', async () => {
    const { controller, execute } = makeSut();
    execute.mockResolvedValue({
      authenticationRequired: false,
      consentRequired: true,
      authorizationRequestToken: 'authorization-request-token',
      client: { clientId: 'client-id', name: 'Example client' },
      requestedScopes: ['openid', 'profile'],
      missingConsentScopes: [{ key: 'profile', description: 'Access basic profile information' }],
      audiences: [],
      modules: [],
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
    const redirect = vi.fn();
    const res = { redirect } as unknown as Response;

    await controller.handle(req, res);

    expect(redirect).toHaveBeenCalledWith(
      302,
      '/consent?authorization_request=authorization-request-token'
    );
  });
});
