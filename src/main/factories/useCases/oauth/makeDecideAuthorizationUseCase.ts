import { authorizationCodeConfig } from '@/config/authorizationCodeConfig.js';
import { makeAuthorizationCodesRepository } from '@/main/factories/repositories/makeAuthorizationCodesRepository.js';
import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeOAuthClientsRepository } from '@/main/factories/repositories/makeOAuthClientsRepository.js';
import { makeAuthorizationCodeTokenService } from '@/main/factories/services/makeAuthorizationCodeTokenService.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeEvaluateUserOAuthAuthorizationUseCase } from '@/main/factories/useCases/oauth/makeEvaluateUserOAuthAuthorizationUseCase.js';
import { makeResolveOAuthScopesUseCase } from '@/main/factories/useCases/oauth/makeResolveOAuthScopesUseCase.js';
import { DecideAuthorizationUseCase } from '@/useCases/oauth/DecideAuthorizationUseCase.js';

export function makeDecideAuthorizationUseCase(): DecideAuthorizationUseCase {
  return new DecideAuthorizationUseCase(
    makeAuthorizationRequestsRepository(),
    makeAuthorizationCodesRepository(),
    makeOAuthClientsRepository(),
    makeSHA256SessionTokenService(),
    makeAuthorizationCodeTokenService(),
    makeResolveOAuthScopesUseCase(),
    makeEvaluateUserOAuthAuthorizationUseCase(),
    authorizationCodeConfig.lifetimeInSeconds
  );
}
