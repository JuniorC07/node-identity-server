import { BcryptPasswordHasherService } from '@/adapters/crypto/bcrypt/BcryptPasswordHasherService.js';
import { db } from '@/adapters/database/knex/connection.js';
import { KnexUsersRepository } from '@/adapters/database/knex/repositories/UsersRepository.js';
import { CreateUserUseCase } from '@/useCases/users/CreateUserUseCase.js';

export function makeCreateUser(): CreateUserUseCase {
  const usersRepository = new KnexUsersRepository(db);

  const rounds = process.env.NODE_ENV === 'development' ? 1 : 14;
  const passwordPepper = process.env.PASSWORD_PEPPER ?? '';
  const passwordHasher = new BcryptPasswordHasherService(passwordPepper, rounds);

  return new CreateUserUseCase(usersRepository, passwordHasher);
}
