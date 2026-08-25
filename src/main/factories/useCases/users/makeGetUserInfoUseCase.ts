import { makeUsersRepository } from '@/main/factories/repositories/makeUsersRepository.js';
import { GetUserInfoUseCase } from '@/useCases/users/GetUserInfoUseCase.js';

export function makeGetUserInfoUseCase(): GetUserInfoUseCase {
  const usersRepository = makeUsersRepository();

  return new GetUserInfoUseCase(usersRepository);
}
