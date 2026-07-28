import { CreateUserController } from '@/controllers/createUser.js';
import { makeCreateUser } from '@/main/factories/useCases/makeCreateUser.js';
import { CreateUserValidator } from '@/validators/users/createUser/index.js';

export function makeCreateUserController() {
  const useCase = makeCreateUser();
  const validator = new CreateUserValidator();

  return new CreateUserController(useCase, validator);
}
