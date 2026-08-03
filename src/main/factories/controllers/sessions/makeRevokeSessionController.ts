import { RevokeSessionController } from '@/controllers/sessions/RevokeSessionController.js';
import { makeRevokeSessionUseCase } from '@/main/factories/useCases/sessions/makeRevokeSessionUseCase.js';
import { makeCookieSerializerService } from '@/main/factories/services/makeCookieSerializerService.js';

export function makeRevokeSessionController(): RevokeSessionController {
  const useCase = makeRevokeSessionUseCase();
  const cookieSerializerService = makeCookieSerializerService();

  return new RevokeSessionController(useCase, cookieSerializerService);
}
