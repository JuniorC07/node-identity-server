import type { Request, Response } from 'express';

import type { ExchangeAuthorizationCodeUseCase } from '@/useCases/oauth/ExchangeAuthorizationCodeUseCase.js';
import type { TokenRequestValidator } from '@/validators/oauth/Token/TokenRequestValidator.js';

export class TokenController {
  constructor(
    private readonly exchangeAuthorizationCodeUseCase: ExchangeAuthorizationCodeUseCase,
    private readonly validator: TokenRequestValidator
  ) {}

  handle = async (req: Request, res: Response): Promise<void> => {
    const input = this.validator.validate(req.body, req.header('authorization'));
    const output = await this.exchangeAuthorizationCodeUseCase.execute(input);

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.status(200).json({
      access_token: output.accessToken,
      token_type: output.tokenType,
      expires_in: output.expiresIn,
      scope: output.scope,
      ...(output.idToken ? { id_token: output.idToken } : {}),
    });
  };
}
