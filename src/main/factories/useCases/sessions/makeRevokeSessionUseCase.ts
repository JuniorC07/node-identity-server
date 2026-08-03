import { RevokeSessionUseCase } from '@/useCases/sessions/RevokeSessionUseCase.js';
import { makeSessionRepository } from '@/main/factories/repositories/makeSessionRepository.js';

export function makeRevokeSessionUseCase(): RevokeSessionUseCase {
  const sessionRepository = makeSessionRepository();
  return new RevokeSessionUseCase(sessionRepository);
}
