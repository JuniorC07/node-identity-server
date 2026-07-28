import { randomUUID } from 'node:crypto';

import { User } from '@/entities/User.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';
import type { IPasswordHasher } from '@/services/IPasswordHasher.js';
import { BadRequestError } from '@/errors/general/BadRequestError.js';

export interface CreateUserInput {
  name: string | null;
  email: string;
  login: string;
  password: string;
}

export class CreateUser {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = input?.email?.trim()?.toLowerCase() ?? null;
    const login = input.login?.trim() ?? null;

    if (email) {
      const userByEmail = await this.usersRepository.findUserByEmail(email);

      if (userByEmail) {
        throw new BadRequestError();
      }
    }

    if (login) {
      const userByLogin = await this.usersRepository.findUserByLogin(login);

      if (userByLogin) {
        throw new BadRequestError();
      }
    }

    const passwordHash = input.password ? await this.passwordHasher.hash(input.password) : null;

    const now = new Date();

    const user = new User({
      id: randomUUID(),
      name: input.name,
      email,
      login,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    await this.usersRepository.create(user);

    return user;
  }
}
