import { randomUUID } from 'node:crypto';

import { Identity } from '@/entities/Identity.js';
import { User } from '@/entities/User.js';
import { UserAlreadyExistsError } from '@/errors/general/UserAlreadyExistsError.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';
import type { IPasswordHasherService } from '@/services/IPasswordHasherService.js';

export interface CreateUserInput {
  name: string | null;
  email: string;
  username: string;
  password: string;
}

export interface CreateUserOutput {
  user: User;
  identity: Identity;
}

export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly passwordHasher: IPasswordHasherService
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const email = input.email.trim().toLowerCase();
    const username = input.username.trim().toLowerCase();

    const userByEmail = await this.usersRepository.findUserByEmail(email);

    if (userByEmail) {
      throw new UserAlreadyExistsError();
    }

    const userByUsername = await this.usersRepository.findUserByUsername(username);

    if (userByUsername) {
      throw new UserAlreadyExistsError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const now = new Date();

    const user = new User({
      id: randomUUID(),
      name: input.name,
      email,
      username,
      createdAt: now,
      updatedAt: now,
    });

    const identity = new Identity({
      id: randomUUID(),
      userId: user.id,
      provider: 'local',
      providerSubject: email,
      passwordHash,
      providerEmail: email,
      createdAt: now,
      updatedAt: now,
    });

    await this.usersRepository.create(user, identity);

    return { user, identity };
  }
}
