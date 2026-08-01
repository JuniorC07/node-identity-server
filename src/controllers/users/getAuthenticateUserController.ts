import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import { GetAuthenticatedUserUseCase } from '@/useCases/users/GetAuthenticatedUserUseCase.js';
import { type Request, type Response } from 'express';

export class getAuthenticateUserController {
  constructor(private readonly getAuthenticatedUser: GetAuthenticatedUserUseCase) {}
  handle = async (req: Request, res: Response): Promise<void> => {
    const user = await this.getAuthenticatedUser.execute({ userId: req.auth?.userId ?? '' });

    if (!user) {
      throw new UnauthorizedError();
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  };
}
