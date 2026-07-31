import { CreateLocalSessionController } from '@/controllers/sessions/CreateLocalSessionController.js';
import { makeCreateLocalSessionUseCase } from '@/main/factories/sessions/makeCreateSessionUseCase.js';
import { CreateSessionValidator } from '@/validators/sessions/createSession/CreateSessionValidator.js';
import { CookieSerializerService } from '@/adapters/cookies/cookie/CookieSerializer.js';

export function makeCreateLocalSessionController() {
  const useCase = makeCreateLocalSessionUseCase();
  const validator = new CreateSessionValidator();
  const cookieSerializerService = new CookieSerializerService();

  return new CreateLocalSessionController(useCase, validator, cookieSerializerService);
}
