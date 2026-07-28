import { BcryptPasswordHasher } from '@/adapters/crypto/bcrypt/BcryptPasswordHasher.js';
import { db } from '@/adapters/database/knex/connection.js';
import { KnexUsersRepository } from '@/adapters/database/knex/repositories/UsersRepository.js';
import { CreateUser } from '@/useCases/CreateUser.js';

export function makeCreateUser(): CreateUser {
  const usersRepository = new KnexUsersRepository(db);

  const rounds = process.env.NODE_ENV === 'development' ? 1 : 14;
  const passwordPepper = process.env.PASSWORD_PEPPER ?? '';
  const passwordHasher = new BcryptPasswordHasher(passwordPepper, rounds);

  return new CreateUser(usersRepository, passwordHasher);
}
