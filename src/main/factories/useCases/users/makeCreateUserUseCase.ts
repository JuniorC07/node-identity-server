import { db } from '@/adapters/database/knex/connection.js';
import { KnexUsersRepository } from '@/adapters/database/knex/repositories/UsersRepository.js';
import { CreateUserUseCase } from '@/useCases/users/CreateUserUseCase.js';
import { makePasswordHasherService } from '../../services/makePasswordHasherService.js';

export function makeCreateUser(): CreateUserUseCase {
  const usersRepository = new KnexUsersRepository(db);

  const passwordHasher = makePasswordHasherService();

  return new CreateUserUseCase(usersRepository, passwordHasher);
}
