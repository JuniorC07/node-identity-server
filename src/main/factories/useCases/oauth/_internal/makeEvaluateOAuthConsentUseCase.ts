import { makeOAuthConsentGrantsRepository } from '@/main/factories/repositories/oauth/makeOAuthConsentGrantsRepository.js';
import { EvaluateOAuthConsentUseCase } from '@/useCases/oauth/_internal/EvaluateOAuthConsentUseCase.js';

export function makeEvaluateOAuthConsentUseCase(): EvaluateOAuthConsentUseCase {
  const consentGrantsRepository = makeOAuthConsentGrantsRepository();

  return new EvaluateOAuthConsentUseCase(consentGrantsRepository);
}
