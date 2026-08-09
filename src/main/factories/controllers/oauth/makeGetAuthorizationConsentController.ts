import { GetAuthorizationConsentController } from '@/controllers/oauth/GetAuthorizationConsentController.js';
import { makeGetAuthorizationConsentUseCase } from '@/main/factories/useCases/oauth/makeGetAuthorizationConsentUseCase.js';

export function makeGetAuthorizationConsentController(): GetAuthorizationConsentController {
  return new GetAuthorizationConsentController(makeGetAuthorizationConsentUseCase());
}
