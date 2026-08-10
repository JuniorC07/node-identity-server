import { accessTokenConfig } from '@/config/accessTokenConfig.js';
import { makeAuthorizationCodesRepository } from '@/main/factories/repositories/makeAuthorizationCodesRepository.js';
import { makeOAuthClientsRepository } from '@/main/factories/repositories/makeOAuthClientsRepository.js';
import { makeSessionRepository } from '@/main/factories/repositories/makeSessionRepository.js';
import { makeUsersRepository } from '@/main/factories/repositories/makeUsersRepository.js';
import { makeAuthorizationCodeTokenService } from '@/main/factories/services/makeAuthorizationCodeTokenService.js';
import { makePasswordHasherService } from '@/main/factories/services/makePasswordHasherService.js';
import { makePkceService } from '@/main/factories/services/makePkceService.js';
import { makeAccessTokenIssuerUseCase } from '@/main/factories/useCases/accessTokens/makeAccessTokenIssuerUseCase.js';
import { makeIdTokenIssuerUseCase } from '@/main/factories/useCases/idTokens/makeIdTokenIssuerUseCase.js';
import { makeEvaluateUserOAuthAuthorizationUseCase } from '@/main/factories/useCases/oauth/makeEvaluateUserOAuthAuthorizationUseCase.js';
import { makeResolveOAuthScopesUseCase } from '@/main/factories/useCases/oauth/makeResolveOAuthScopesUseCase.js';
import { ExchangeAuthorizationCodeUseCase } from '@/useCases/oauth/ExchangeAuthorizationCodeUseCase.js';

export function makeExchangeAuthorizationCodeUseCase(): ExchangeAuthorizationCodeUseCase {
  return new ExchangeAuthorizationCodeUseCase(
    makeAuthorizationCodesRepository(),
    makeOAuthClientsRepository(),
    makeSessionRepository(),
    makeUsersRepository(),
    makeAuthorizationCodeTokenService(),
    makePkceService(),
    makePasswordHasherService(),
    makeResolveOAuthScopesUseCase(),
    makeEvaluateUserOAuthAuthorizationUseCase(),
    makeAccessTokenIssuerUseCase(),
    makeIdTokenIssuerUseCase(),
    accessTokenConfig.userInfoAudience
  );
}
