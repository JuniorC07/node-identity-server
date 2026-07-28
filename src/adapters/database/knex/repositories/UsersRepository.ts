import type { Knex } from 'knex';

import { User } from '@/entities/User.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  login: string | null;
  password_hash: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export class KnexUsersRepository implements IUsersRepository {
  constructor(private readonly db: Knex) {}

  async create(user: User): Promise<void> {
    await this.db<UserRow>('users').insert({
      id: user.id,
      name: user.name,
      email: user.email,
      login: user.login,
      password_hash: user.passwordHash,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    });
  }

  async findUserByLogin(login: string): Promise<User | null> {
    const user = await this.db<UserRow>('users').where({ login }).first();

    return user ? this.toDomain(user) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.db<UserRow>('users').where({ email }).first();

    return user ? this.toDomain(user) : null;
  }

  private toDomain(user: UserRow): User {
    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      login: user.login,
      passwordHash: user.password_hash,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    });
  }
}
