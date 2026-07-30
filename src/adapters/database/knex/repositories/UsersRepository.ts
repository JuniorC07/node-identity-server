import type { Knex } from 'knex';

import { Identity, type IdentityProvider } from '@/entities/Identity.js';
import { User } from '@/entities/User.js';
import { UserAlreadyExistsError } from '@/errors/general/UserAlreadyExistsError.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  username: string;
  created_at: Date | string;
  updated_at: Date | string;
}

interface IdentityRow {
  id: string;
  user_id: string;
  provider: IdentityProvider;
  provider_subject: string;
  password_hash: string | null;
  provider_email: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}

export class KnexUsersRepository implements IUsersRepository {
  constructor(private readonly db: Knex) {}

  async create(user: User, identity: Identity): Promise<void> {
    try {
      await this.db.transaction(async (trx) => {
        await trx<UserRow>('users').insert({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        });

        await trx<IdentityRow>('identities').insert({
          id: identity.id,
          user_id: identity.userId,
          provider: identity.provider,
          provider_subject: identity.providerSubject,
          password_hash: identity.passwordHash,
          provider_email: identity.providerEmail,
          created_at: identity.createdAt,
          updated_at: identity.updatedAt,
        });
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new UserAlreadyExistsError();
      }

      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.db<UserRow>('users').where({ email }).first();

    return user ? this.toDomain(user) : null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await this.db<UserRow>('users')
      .whereRaw('lower(username) = ?', [username.toLowerCase()])
      .first();

    return user ? this.toDomain(user) : null;
  }

  private toDomain(user: UserRow): User {
    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    });
  }

  private identityToDomain(identity: IdentityRow): Identity {
    const commonProps = {
      id: identity.id,
      userId: identity.user_id,
      providerSubject: identity.provider_subject,
      providerEmail: identity.provider_email,
      createdAt: new Date(identity.created_at),
      updatedAt: new Date(identity.updated_at),
    };

    return identity.provider === 'local'
      ? new Identity({ ...commonProps, provider: 'local', passwordHash: identity.password_hash! })
      : new Identity({ ...commonProps, provider: identity.provider, passwordHash: null });
  }
}
