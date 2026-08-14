import type { Request, Response } from 'express';
import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import type { GetPendingConsentDetailsUseCase } from '@/useCases/oauth/GetPendingConsentDetailsUseCase.js';
import { GetPendingConsentDetailsValidator } from '@/validators/oauth/GetPendingConsentDetails/GetPendingConsentDetailsValidator.js';

export class GetPendingConsentDetailsController {
  constructor(
    private readonly getPendingConsentDetailsUseCase: GetPendingConsentDetailsUseCase,
    private readonly getPendingConsentDetailsValidator: GetPendingConsentDetailsValidator
  ) {}

  handle = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      throw new UnauthorizedError();
    }
    const { authorizationRequestToken } = this.getPendingConsentDetailsValidator.validate(
      req.params
    );

    const output = await this.getPendingConsentDetailsUseCase.execute({
      authorizationRequestToken,
      userId: req.auth.userId,
      sessionId: req.auth.sessionId,
    });

    res.status(200).json(output);
  };
}
