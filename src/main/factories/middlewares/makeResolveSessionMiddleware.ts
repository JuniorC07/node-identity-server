import { ResolveSessionMiddleware } from '@/middlewares/ResolveSessionMiddleware.js';
import { ValidateSessionUsecase } from '@/useCases/sessions/_internal/ValidateSessionUsecase.js';
import { UpdateSessionLastUsedAtUseCase } from '@/useCases/sessions/_internal/UpdateLastUsedAtUseCase.js';
import { RenewSessionUseCase } from '@/useCases/sessions/_internal/RenewSessionUseCase.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeSessionRepository } from '@/main/factories/repositories/makeSessionRepository.js';
import { makeCookieSerializerService } from '@/main/factories/services/makeCookieSerializerService.js';

export function makeResolveSessionMiddleware(): ResolveSessionMiddleware {
  const sessionTokenService = makeSHA256SessionTokenService();
  const sessionRepository = makeSessionRepository();
  const cookieSerializerService = makeCookieSerializerService();
  const validateSessionUsecase = new ValidateSessionUsecase(sessionRepository, sessionTokenService);
  const updateSessionLastUsedAtUseCase = new UpdateSessionLastUsedAtUseCase(sessionRepository);
  const renewSessionUseCase = new RenewSessionUseCase(sessionRepository);
  return new ResolveSessionMiddleware(
    validateSessionUsecase,
    cookieSerializerService,
    updateSessionLastUsedAtUseCase,
    renewSessionUseCase
  );
}
