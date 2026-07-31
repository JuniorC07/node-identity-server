import { CreateUserController } from '@/controllers/users/createUserController.js';
import { makeCreateUser } from '@/main/factories/useCases/users/makeCreateUserUseCase.js';
import { CreateUserValidator } from '@/validators/users/createUser/CreateUserValidator.js';

export function makeCreateUserController() {
  const useCase = makeCreateUser();
  const validator = new CreateUserValidator();

  return new CreateUserController(useCase, validator);
}
