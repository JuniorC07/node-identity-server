import { GetPendingConsentDetailsController } from '@/controllers/oauth/GetPendingConsentDetailsController.js';
import { makeGetPendingConsentDetailsUseCase } from '@/main/factories/useCases/oauth/makeGetPendingConsentDetailsUseCase.js';
import { GetPendingConsentDetailsValidator } from '@/validators/oauth/GetPendingConsentDetails/GetPendingConsentDetailsValidator.js';

export function makeGetPendingConsentDetailsController(): GetPendingConsentDetailsController {
  const getPendingConsentDetailsUseCase = makeGetPendingConsentDetailsUseCase();
  const validator = new GetPendingConsentDetailsValidator();

  return new GetPendingConsentDetailsController(getPendingConsentDetailsUseCase, validator);
}
