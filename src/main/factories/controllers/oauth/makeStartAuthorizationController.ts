import { StartAuthorizationController } from '@/controllers/oauth/StartAuthorizationController.js';
import { makeStartAuthorizationUseCase } from '@/main/factories/useCases/oauth/makeStartAuthorizationUseCase.js';
import { makeCreateOAuthAuthorizationCodeUseCase } from '@/main/factories/useCases/oauth/_internal/makeCreateOAuthAuthorizationCodeUseCase.js';
import { AuthorizeRequestValidator } from '@/validators/oauth/StartAuthorization/StartAuthorizationValidator.js';
import { authorizationRequestConfig } from '@/config/authorizationRequestConfig.js';

export function makeStartAuthorizationController(): StartAuthorizationController {
  const startAuthorizationUseCase = makeStartAuthorizationUseCase();
  const createOAuthAuthorizationCodeUseCase = makeCreateOAuthAuthorizationCodeUseCase();
  const validator = new AuthorizeRequestValidator();

  return new StartAuthorizationController(
    startAuthorizationUseCase,
    createOAuthAuthorizationCodeUseCase,
    validator,
    authorizationRequestConfig.loginPageUrl,
    authorizationRequestConfig.consentPageUrl
  );
}
