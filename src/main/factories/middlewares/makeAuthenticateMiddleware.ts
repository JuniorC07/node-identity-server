import { AuthenticateMiddleware } from '@/middlewares/AuthenticateMiddleware.js';
import { ValidateSessionUsecase } from '@/useCases/sessions/_internal/ValidateSessionUsecase.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeSessionRepository } from '@/main/factories/repositories/makeSessionRepository.js';
import { makeCookieSerializerService } from '@/main/factories/services/makeCookieSerializerService.js';

export function makeAuthenticateMiddleware(): AuthenticateMiddleware {
  const sessionTokenService = makeSHA256SessionTokenService();
  const sessionRepository = makeSessionRepository();
  const cookieSerializerService = makeCookieSerializerService();
  const validateSessionUsecase = new ValidateSessionUsecase(sessionRepository, sessionTokenService);
  return new AuthenticateMiddleware(validateSessionUsecase, cookieSerializerService);
}
