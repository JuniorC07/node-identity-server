import { makeOAuthConsentGrantsRepository } from '@/main/factories/repositories/makeOAuthConsentGrantsRepository.js';
import { makeUserResourceProfilesRepository } from '@/main/factories/repositories/makeUserResourceProfilesRepository.js';
import { EvaluateUserOAuthAuthorizationUseCase } from '@/useCases/oauth/EvaluateUserOAuthAuthorizationUseCase.js';

export function makeEvaluateUserOAuthAuthorizationUseCase(): EvaluateUserOAuthAuthorizationUseCase {
  return new EvaluateUserOAuthAuthorizationUseCase(
    makeUserResourceProfilesRepository(),
    makeOAuthConsentGrantsRepository()
  );
}
