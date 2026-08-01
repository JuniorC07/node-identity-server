import { db } from '@/adapters/database/knex/connection.js';
import { KnexUsersRepository } from '@/adapters/database/knex/repositories/UsersRepository.js';
import { GetAuthenticatedUserUseCase } from '@/useCases/users/GetAuthenticatedUserUseCase.js';

export function makeGetAuthenticateUserUseCase(): GetAuthenticatedUserUseCase {
  const usersRepository = new KnexUsersRepository(db);

  return new GetAuthenticatedUserUseCase(usersRepository);
}
