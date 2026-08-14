import { authorizationRequestConfig } from '@/config/authorizationRequestConfig.js';
import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeOAuthClientsRepository } from '@/main/factories/repositories/oauth/makeOAuthClientsRepository.js';
import { makeResolveRegisteredOAuthScopesUseCase } from '@/main/factories/useCases/oauth/_internal/makeResolveRegisteredOAuthScopesUseCase.js';
import { makeValidateUserScopesUseCase } from '@/main/factories/useCases/oauth/_internal/makeValidateUserScopesUseCase.js';
import { makePkceService } from '@/main/factories/services/makePkceService.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeEvaluateOAuthConsentUseCase } from '@/main/factories/useCases/oauth/_internal/makeEvaluateOAuthConsentUseCase.js';
import { StartAuthorizationUseCase } from '@/useCases/oauth/StartAuthorizationUseCase.js';

export function makeStartAuthorizationUseCase(): StartAuthorizationUseCase {
  const clientsRepository = makeOAuthClientsRepository();
  const authorizationRequestsRepository = makeAuthorizationRequestsRepository();
  const requestTokenService = makeSHA256SessionTokenService();
  const pkceService = makePkceService();
  const resolveRegisteredOAuthScopesUseCase = makeResolveRegisteredOAuthScopesUseCase();
  const validateUserScopesUseCase = makeValidateUserScopesUseCase();
  const evaluateOAuthConsentUseCase = makeEvaluateOAuthConsentUseCase();

  return new StartAuthorizationUseCase(
    clientsRepository,
    authorizationRequestsRepository,
    requestTokenService,
    pkceService,
    resolveRegisteredOAuthScopesUseCase,
    validateUserScopesUseCase,
    evaluateOAuthConsentUseCase,
    authorizationRequestConfig.lifetimeInSeconds
  );
}
