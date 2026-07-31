import { describe, expect, it } from 'vitest';

import { Identity } from '@/entities/Identity.js';
import { User } from '@/entities/User.js';
import { UserAlreadyExistsError } from '@/errors/general/UserAlreadyExistsError.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';
import type { IPasswordHasherService } from '@/services/IPasswordHasherService.js';
import { CreateUserUseCase } from '@/useCases/users/CreateUserUseCase.js';

class InMemoryUsersRepository implements IUsersRepository {
  users: User[] = [];
  identities: Identity[] = [];

  async create(user: User, identity: Identity): Promise<void> {
    this.users.push(user);
    this.identities.push(identity);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.users.find((user) => user.username === username) ?? null;
  }
}

class FakePasswordHasher implements IPasswordHasherService {
  async hash(password: string): Promise<string> {
    return `hashed:${password}`;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return hash === `hashed:${password}`;
  }
}

function makeSut() {
  const usersRepository = new InMemoryUsersRepository();
  const passwordHasher = new FakePasswordHasher();
  const createUser = new CreateUserUseCase(usersRepository, passwordHasher);

  return { createUser, usersRepository };
}

describe('CreateUser', () => {
  it('should create a user with a local identity', async () => {
    const { createUser, usersRepository } = makeSut();

    const output = await createUser.execute({
      name: 'John Doe',
      email: ' JOHN@EXAMPLE.COM ',
      username: ' John.Doe ',
      password: 'secret12345@',
    });

    expect(output.user.email).toBe('john@example.com');
    expect(output.user.username).toBe('john.doe');
    expect(output.identity).toEqual(
      expect.objectContaining({
        userId: output.user.id,
        provider: 'local',
        providerSubject: 'john@example.com',
        providerEmail: 'john@example.com',
        passwordHash: 'hashed:secret12345@',
      })
    );
    expect(usersRepository.users).toHaveLength(1);
    expect(usersRepository.identities).toHaveLength(1);
  });

  it('should reject an email already in use', async () => {
    const { createUser } = makeSut();
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'john',
      password: 'secret12345@',
    };

    await createUser.execute(input);

    await expect(createUser.execute({ ...input, username: 'john2' })).rejects.toBeInstanceOf(
      UserAlreadyExistsError
    );
  });

  it('should reject a username already in use', async () => {
    const { createUser } = makeSut();
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'john',
      password: 'secret12345@',
    };

    await createUser.execute(input);

    await expect(
      createUser.execute({ ...input, email: 'another@example.com' })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
