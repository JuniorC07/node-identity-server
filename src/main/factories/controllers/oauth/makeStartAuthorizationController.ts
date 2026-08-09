import { StartAuthorizationController } from '@/controllers/oauth/StartAuthorizationController.js';
import { makeStartAuthorizationUseCase } from '@/main/factories/useCases/oauth/makeStartAuthorizationUseCase.js';
import { AuthorizeRequestValidator } from '@/validators/oauth/StartAuthorization/StartAuthorizationValidator.js';
import { authorizationRequestConfig } from '@/config/authorizationRequestConfig.js';

export function makeStartAuthorizationController(): StartAuthorizationController {
  const startAuthorizationUseCase = makeStartAuthorizationUseCase();
  const validator = new AuthorizeRequestValidator();

  return new StartAuthorizationController(
    startAuthorizationUseCase,
    validator,
    authorizationRequestConfig.loginPageUrl,
    authorizationRequestConfig.consentPageUrl
  );
}
