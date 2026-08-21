import { authorizationRequestConfig } from '@/config/authorizationRequestConfig.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import {
  CreateOAuthAuthorizationCodeUseCase,
  type CreateOAuthAuthorizationCodeRepositories,
} from '@/useCases/oauth/_internal/CreateOAuthAuthorizationCodeUseCase.js';

export function makeCreateOAuthAuthorizationCodeUseCase(
  repositories: CreateOAuthAuthorizationCodeRepositories
): CreateOAuthAuthorizationCodeUseCase {
  const authorizationCodeTokenService = makeSHA256SessionTokenService();

  return new CreateOAuthAuthorizationCodeUseCase(
    repositories.authorizationRequests,
    repositories.authorizationCodes,
    authorizationCodeTokenService,
    authorizationRequestConfig.lifetimeInSeconds
  );
}
