import { CreateLocalSessionController } from '@/controllers/sessions/CreateLocalSessionController.js';
import { makeCreateLocalSessionUseCase } from '@/main/factories/useCases/sessions/makeCreateSessionUseCase.js';
import { CreateLocalSessionValidator } from '@/validators/sessions/createSession/CreateLocalSessionValidator.js';
import { CookieSerializerService } from '@/adapters/cookies/cookie/CookieSerializerService.js';

export function makeCreateLocalSessionController() {
  const useCase = makeCreateLocalSessionUseCase();
  const validator = new CreateLocalSessionValidator();
  const cookieSerializerService = new CookieSerializerService();

  return new CreateLocalSessionController(useCase, validator, cookieSerializerService);
}
