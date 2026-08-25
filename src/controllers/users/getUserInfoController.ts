import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import { GetUserInfoUseCase } from '@/useCases/users/GetUserInfoUseCase.js';
import { type Request, type Response } from 'express';

export class getUserInfoController {
  constructor(private readonly getUserInfoUseCase: GetUserInfoUseCase) {}
  handle = async (req: Request, res: Response): Promise<void> => {
    if (!req.accessTokenAuth) {
      throw new UnauthorizedError();
    }

    const output = await this.getUserInfoUseCase.execute({
      userId: req.accessTokenAuth?.userId,
      scopes: req.accessTokenAuth.scopes,
    });

    res.status(200).json(output);
  };
}
