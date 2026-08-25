import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeAuthorizationCodeRepository } from '@/main/factories/repositories/oauth/makeAuthorizationCodesRepository.js';
import { makeOAuthClientsRepository } from '@/main/factories/repositories/oauth/makeOAuthClientsRepository.js';
import { makePasswordHasherService } from '@/main/factories/services/makePasswordHasherService.js';
import { makePkceService } from '@/main/factories/services/makePkceService.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeAccessTokenIssuerUseCase } from '@/main/factories/useCases/accessTokens/makeAccessTokenIssuerUseCase.js';
import { makeIdTokenIssuerUseCase } from '@/main/factories/useCases/idTokens/makeIdTokenIssuerUseCase.js';
import { makeEvaluateOAuthConsentUseCase } from '@/main/factories/useCases/oauth/_internal/makeEvaluateOAuthConsentUseCase.js';
import { makeResolveRegisteredOAuthScopesUseCase } from '@/main/factories/useCases/oauth/_internal/makeResolveRegisteredOAuthScopesUseCase.js';
import { makeValidateUserScopesUseCase } from '@/main/factories/useCases/oauth/_internal/makeValidateUserScopesUseCase.js';
import { ExchangeAuthorizationCodeUseCase } from '@/useCases/oauth/ExchangeAuthorizationCodeUseCase.js';
import { userInfoConfig } from '@/config/userInfoConfig.js';

export function makeExchangeAuthorizationCodeUseCase(): ExchangeAuthorizationCodeUseCase {
  const authorizationCodesRepository = makeAuthorizationCodeRepository();
  const authorizationRequestsRepository = makeAuthorizationRequestsRepository();
  const clientsRepository = makeOAuthClientsRepository();
  const authorizationCodeTokenService = makeSHA256SessionTokenService();
  const pkceService = makePkceService();
  const passwordHasherService = makePasswordHasherService();
  const resolveRegisteredOAuthScopesUseCase = makeResolveRegisteredOAuthScopesUseCase();
  const validateUserScopesUseCase = makeValidateUserScopesUseCase();
  const evaluateOAuthConsentUseCase = makeEvaluateOAuthConsentUseCase();
  const accessTokenIssuerUseCase = makeAccessTokenIssuerUseCase();
  const idTokenIssuerUseCase = makeIdTokenIssuerUseCase();

  return new ExchangeAuthorizationCodeUseCase(
    authorizationCodesRepository,
    authorizationRequestsRepository,
    clientsRepository,
    authorizationCodeTokenService,
    pkceService,
    passwordHasherService,
    resolveRegisteredOAuthScopesUseCase,
    validateUserScopesUseCase,
    evaluateOAuthConsentUseCase,
    accessTokenIssuerUseCase,
    idTokenIssuerUseCase,
    userInfoConfig.audience
  );
}
