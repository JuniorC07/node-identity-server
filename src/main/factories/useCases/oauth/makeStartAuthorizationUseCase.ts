import { authorizationRequestConfig } from '@/config/authorizationRequestConfig.js';
import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeOAuthClientsRepository } from '@/main/factories/repositories/makeOAuthClientsRepository.js';
import { makePkceService } from '@/main/factories/services/makePkceService.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { StartAuthorizationUseCase } from '@/useCases/oauth/StartAuthorizationUseCase.js';

export function makeStartAuthorizationUseCase(): StartAuthorizationUseCase {
  const clientsRepository = makeOAuthClientsRepository();
  const authorizationRequestsRepository = makeAuthorizationRequestsRepository();
  const requestTokenService = makeSHA256SessionTokenService();
  const pkceService = makePkceService();

  return new StartAuthorizationUseCase(
    clientsRepository,
    authorizationRequestsRepository,
    requestTokenService,
    pkceService,
    authorizationRequestConfig.lifetimeInSeconds
  );
}
