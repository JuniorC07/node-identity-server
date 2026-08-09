import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeOAuthClientsRepository } from '@/main/factories/repositories/makeOAuthClientsRepository.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeEvaluateUserOAuthAuthorizationUseCase } from '@/main/factories/useCases/oauth/makeEvaluateUserOAuthAuthorizationUseCase.js';
import { makeResolveOAuthScopesUseCase } from '@/main/factories/useCases/oauth/makeResolveOAuthScopesUseCase.js';
import { GetAuthorizationConsentUseCase } from '@/useCases/oauth/GetAuthorizationConsentUseCase.js';

export function makeGetAuthorizationConsentUseCase(): GetAuthorizationConsentUseCase {
  return new GetAuthorizationConsentUseCase(
    makeAuthorizationRequestsRepository(),
    makeOAuthClientsRepository(),
    makeSHA256SessionTokenService(),
    makeResolveOAuthScopesUseCase(),
    makeEvaluateUserOAuthAuthorizationUseCase()
  );
}
