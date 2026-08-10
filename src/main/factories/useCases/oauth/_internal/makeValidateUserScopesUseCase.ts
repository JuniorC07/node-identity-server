import { makeUserResourceProfilesRepository } from '@/main/factories/repositories/makeUserResourceProfilesRepository.js';
import { ValidateUserScopesUseCase } from '@/useCases/oauth/_internal/ValidateUserScopesUseCase.js';

export function makeValidateUserScopesUseCase(): ValidateUserScopesUseCase {
  const userResourceProfilesRepository = makeUserResourceProfilesRepository();

  return new ValidateUserScopesUseCase(userResourceProfilesRepository);
}
