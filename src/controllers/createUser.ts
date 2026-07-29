import { CreateUser } from '@/useCases/CreateUser.js';
import { CreateUserValidator } from '@/validators/users/createUser/index.js';
import { type Request, type Response } from 'express';

export class CreateUserController {
  constructor(
    private readonly createUser: CreateUser,
    private readonly validator: CreateUserValidator
  ) {}
  handle = async (req: Request, res: Response): Promise<void> => {
    const input = this.validator.validate(req.body);

    const { user } = await this.createUser.execute(input);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  };
}
