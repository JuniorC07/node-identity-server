import { GetPendingConsentDetailsUseCase } from '@/useCases/oauth/GetPendingConsentDetailsUseCase.js';
import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeResolveRegisteredOAuthScopesUseCase } from '@/main/factories/useCases/oauth/_internal/makeResolveRegisteredOAuthScopesUseCase.js';
import { makeEvaluateOAuthConsentUseCase } from '@/main/factories/useCases/oauth/_internal/makeEvaluateOAuthConsentUseCase.js';
import { makeOAuthClientsRepository } from '@/main/factories/repositories/oauth/makeOAuthClientsRepository.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';

export function makeGetPendingConsentDetailsUseCase(): GetPendingConsentDetailsUseCase {
  const authorizationRequestsRepository = makeAuthorizationRequestsRepository();
  const clientsRepository = makeOAuthClientsRepository();

  const sessionTokenService = makeSHA256SessionTokenService();

  const resolveRegisteredOAuthScopesUseCase = makeResolveRegisteredOAuthScopesUseCase();
  const evaluateOAuthConsentUseCase = makeEvaluateOAuthConsentUseCase();

  return new GetPendingConsentDetailsUseCase(
    authorizationRequestsRepository,
    clientsRepository,
    sessionTokenService,
    resolveRegisteredOAuthScopesUseCase,
    evaluateOAuthConsentUseCase
  );
}
