import { getAuthenticateUserController } from '@/controllers/users/getAuthenticateUserController.js';
import { makeGetAuthenticateUserUseCase } from '@/main/factories/useCases/users/makeGetAuthenticateUserUseCase.js';

export function makeGetAuthenticateUserController() {
  const useCase = makeGetAuthenticateUserUseCase();

  return new getAuthenticateUserController(useCase);
}
