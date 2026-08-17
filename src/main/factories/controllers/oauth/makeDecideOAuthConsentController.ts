import { DecideOAuthConsentController } from '@/controllers/oauth/DecideOAuthConsentController.js';
import { makeDecideOAuthConsentUseCase } from '@/main/factories/useCases/oauth/makeDecideOAuthConsentUseCase.js';
import { DecideOAuthConsentValidator } from '@/validators/oauth/DecideOAuthConsent/DecideOAuthConsentValidator.js';

export function makeDecideOAuthConsentController(): DecideOAuthConsentController {
  const decideOAuthConsentUseCase = makeDecideOAuthConsentUseCase();
  const validator = new DecideOAuthConsentValidator();

  return new DecideOAuthConsentController(decideOAuthConsentUseCase, validator);
}
