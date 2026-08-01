import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';
import { User } from '@/entities/User.js';

export interface GetAuthenticatedUserInput {
  userId: string;
}

export class GetAuthenticatedUserUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: GetAuthenticatedUserInput): Promise<User | null> {
    const user = await this.usersRepository.findUserById(input.userId);

    if (!user) {
      throw new UnauthorizedError();
    }

    return user;
  }
}
