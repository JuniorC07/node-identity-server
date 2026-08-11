import type { Request, Response } from 'express';

import type { StartAuthorizationUseCase } from '@/useCases/oauth/StartAuthorizationUseCase.js';
import type { AuthorizeRequestValidator } from '@/validators/oauth/StartAuthorization/StartAuthorizationValidator.js';

export class StartAuthorizationController {
  constructor(
    private readonly startAuthorizationUseCase: StartAuthorizationUseCase,
    private readonly validator: AuthorizeRequestValidator,
    private readonly loginPageUrl: string,
    private readonly consentPageUrl: string
  ) {}

  handle = async (req: Request, res: Response): Promise<void> => {
    const input = this.validator.validate(req.query);
    const output = await this.startAuthorizationUseCase.execute({
      ...input,
      userId: req.auth?.userId ?? null,
      sessionId: req.auth?.sessionId ?? null,
    });

    if (output.authenticationRequired) {
      const loginQuery = new URLSearchParams({ return_to: req.originalUrl });
      const querySeparator = this.loginPageUrl.includes('?') ? '&' : '?';
      res.redirect(302, `${this.loginPageUrl}${querySeparator}${loginQuery.toString()}`);
      return;
    }

    if (output.consentRequired) {
      const consentQuery = new URLSearchParams({
        authorization_request: output.authorizationRequestToken,
      });
      const querySeparator = this.consentPageUrl.includes('?') ? '&' : '?';

      res.redirect(302, `${this.consentPageUrl}${querySeparator}${consentQuery.toString()}`);
      return;
    }
    const { authenticationRequired: _authenticationRequired, ...responseBody } = output;

    res.status(200).json(responseBody);
  };
}
