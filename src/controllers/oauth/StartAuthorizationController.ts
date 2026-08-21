import type { Request, Response } from 'express';

import type { StartAuthorizationUseCase } from '@/useCases/oauth/StartAuthorizationUseCase.js';
import type { AuthorizeRequestValidator } from '@/validators/oauth/StartAuthorization/StartAuthorizationValidator.js';
import { InvalidOAuthAuthorizationRequestError } from '@/errors/oauth/InvalidOAuthAuthorizationRequestError.js';
import { buildUri } from '@/utils/buildUri.js';

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
      const loginUri = buildUri(this.loginPageUrl, { return_to: req.originalUrl });
      res.redirect(302, loginUri);
      return;
    }

    if (output.consentRequired) {
      const consentUri = buildUri(this.consentPageUrl, {
        authorization_request: output.authorizationRequestToken,
      });
      res.redirect(302, consentUri);
      return;
    }

    if (!output.authorizationCode) {
      throw new InvalidOAuthAuthorizationRequestError();
    }

    const redirectUri = buildUri(output.redirectUri, {
      code: output.authorizationCode.rawCode,
      state: output.state,
    });

    res.redirect(302, redirectUri);
  };
}
