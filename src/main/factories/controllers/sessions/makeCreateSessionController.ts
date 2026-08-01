import { CreateLocalSessionController } from '@/controllers/sessions/CreateLocalSessionController.js';
import { makeCreateLocalSessionUseCase } from '@/main/factories/useCases/sessions/makeCreateSessionUseCase.js';
import { makeCookieSerializerService } from '@/main/factories/services/makeCookieSerializerService.js';
import { CreateLocalSessionValidator } from '@/validators/sessions/createSession/CreateLocalSessionValidator.js';

export function makeCreateLocalSessionController() {
  const useCase = makeCreateLocalSessionUseCase();
  const validator = new CreateLocalSessionValidator();
  const cookieSerializerService = makeCookieSerializerService();

  return new CreateLocalSessionController(useCase, validator, cookieSerializerService);
}
