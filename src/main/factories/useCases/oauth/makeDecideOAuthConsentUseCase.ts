import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeAuthorizationApprovalUnitOfWork } from '@/main/factories/unitOfWork/makeAuthorizationApprovalUnitOfWork.js';
import { makeCreateOAuthAuthorizationCodeUseCase } from '@/main/factories/useCases/oauth/_internal/makeCreateOAuthAuthorizationCodeUseCase.js';
import { makeEvaluateOAuthConsentUseCase } from '@/main/factories/useCases/oauth/_internal/makeEvaluateOAuthConsentUseCase.js';
import { makeResolveRegisteredOAuthScopesUseCase } from '@/main/factories/useCases/oauth/_internal/makeResolveRegisteredOAuthScopesUseCase.js';
import { DecideOAuthConsentUseCase } from '@/useCases/oauth/DecideOAuthConsentUseCase.js';

export function makeDecideOAuthConsentUseCase(): DecideOAuthConsentUseCase {
  const authorizationRequestsRepository = makeAuthorizationRequestsRepository({});
  const authorizationRequestTokenService = makeSHA256SessionTokenService();
  const authorizationApprovalUnitOfWork = makeAuthorizationApprovalUnitOfWork();
  const resolveRegisteredOAuthScopesUseCase = makeResolveRegisteredOAuthScopesUseCase();
  const evaluateOAuthConsentUseCase = makeEvaluateOAuthConsentUseCase();

  return new DecideOAuthConsentUseCase(
    authorizationRequestsRepository,
    authorizationRequestTokenService,
    authorizationApprovalUnitOfWork,
    resolveRegisteredOAuthScopesUseCase,
    evaluateOAuthConsentUseCase,
    makeCreateOAuthAuthorizationCodeUseCase
  );
}
