import type { Request, Response } from 'express';

import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import type { DecideOAuthConsentUseCase } from '@/useCases/oauth/DecideOAuthConsentUseCase.js';
import type { DecideOAuthConsentValidator } from '@/validators/oauth/DecideOAuthConsent/DecideOAuthConsentValidator.js';

export class DecideOAuthConsentController {
  constructor(
    private readonly decideOAuthConsentUseCase: DecideOAuthConsentUseCase,
    private readonly decideOAuthConsentValidator: DecideOAuthConsentValidator
  ) {}

  handle = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      throw new UnauthorizedError();
    }

    const input = this.decideOAuthConsentValidator.validate({
      ...req.params,
      ...(req.body ?? {}),
    });
    const { redirectUri } = await this.decideOAuthConsentUseCase.execute({
      ...input,
      userId: req.auth.userId,
      sessionId: req.auth.sessionId,
    });

    res.redirect(302, redirectUri);
  };
}
