import { CreateOAuthClientController } from '@/controllers/oauth/CreateOAuthClientController.js';
import { makeCreateOAuthClientUseCase } from '@/main/factories/useCases/oauth/makeCreateOAuthClientUseCase.js';
import { CreateOAuthClientValidator } from '@/validators/oauth/CreateOAuthClientValidator.js';

export function makeCreateOAuthClientController(): CreateOAuthClientController {
  const useCase = makeCreateOAuthClientUseCase();
  const validator = new CreateOAuthClientValidator();

  return new CreateOAuthClientController(useCase, validator);
}
