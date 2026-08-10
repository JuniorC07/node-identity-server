import type { Request, Response } from 'express';

import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import type { DecideAuthorizationUseCase } from '@/useCases/oauth/DecideAuthorizationUseCase.js';
import type { AuthorizationDecisionValidator } from '@/validators/oauth/AuthorizationDecision/AuthorizationDecisionValidator.js';

export class AuthorizationDecisionController {
  constructor(
    private readonly decideAuthorizationUseCase: DecideAuthorizationUseCase,
    private readonly validator: AuthorizationDecisionValidator
  ) {}

  handle = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      throw new UnauthorizedError();
    }

    const input = this.validator.validate(req.body);
    const output = await this.decideAuthorizationUseCase.execute({
      ...input,
      userId: req.auth.userId,
      sessionId: req.auth.sessionId,
    });

    res.redirect(303, output.redirectUri);
  };
}
