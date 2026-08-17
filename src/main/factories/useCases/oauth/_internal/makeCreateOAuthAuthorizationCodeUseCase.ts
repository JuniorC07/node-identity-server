import { authorizationRequestConfig } from '@/config/authorizationRequestConfig.js';
import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeAuthorizationCodeRepository } from '@/main/factories/repositories/oauth/makeAuthorizationCodesRepository.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import type { IAuthorizationCodesRepository } from '@/repositories/oauth/IOAuthAuthorizationCodesRepository.js';
import { CreateOAuthAuthorizationCodeUseCase } from '@/useCases/oauth/_internal/CreateOAuthAuthorizationCodeUseCase.js';

export type CreateOAuthAuthorizationCodeUseCaseFactory = (
  repository: IAuthorizationCodesRepository
) => CreateOAuthAuthorizationCodeUseCase;

export function makeCreateOAuthAuthorizationCodeUseCase(
  authorizationCodesRepository: IAuthorizationCodesRepository = makeAuthorizationCodeRepository({})
): CreateOAuthAuthorizationCodeUseCase {
  const authorizationRequestsRepository = makeAuthorizationRequestsRepository({});
  const authorizationCodeTokenService = makeSHA256SessionTokenService();

  return new CreateOAuthAuthorizationCodeUseCase(
    authorizationRequestsRepository,
    authorizationCodesRepository,
    authorizationCodeTokenService,
    authorizationRequestConfig.lifetimeInSeconds
  );
}
