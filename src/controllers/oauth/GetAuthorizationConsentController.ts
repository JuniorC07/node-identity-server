import type { Request, Response } from 'express';

import { InvalidOAuthAuthorizationRequestError } from '@/errors/oauth/InvalidOAuthAuthorizationRequestError.js';
import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import type { GetAuthorizationConsentUseCase } from '@/useCases/oauth/GetAuthorizationConsentUseCase.js';

export class GetAuthorizationConsentController {
  constructor(private readonly getAuthorizationConsentUseCase: GetAuthorizationConsentUseCase) {}

  handle = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      throw new UnauthorizedError();
    }

    const authorizationRequestToken = req.params.authorizationRequestToken;

    if (typeof authorizationRequestToken !== 'string' || authorizationRequestToken.length === 0) {
      throw new InvalidOAuthAuthorizationRequestError();
    }

    const output = await this.getAuthorizationConsentUseCase.execute({
      authorizationRequestToken,
      userId: req.auth.userId,
      sessionId: req.auth.sessionId,
    });

    res.status(200).json(output);
  };
}
