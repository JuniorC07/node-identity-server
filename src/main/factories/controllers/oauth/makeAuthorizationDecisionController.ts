import { AuthorizationDecisionController } from '@/controllers/oauth/AuthorizationDecisionController.js';
import { makeDecideAuthorizationUseCase } from '@/main/factories/useCases/oauth/makeDecideAuthorizationUseCase.js';
import { AuthorizationDecisionValidator } from '@/validators/oauth/AuthorizationDecision/AuthorizationDecisionValidator.js';

export function makeAuthorizationDecisionController(): AuthorizationDecisionController {
  return new AuthorizationDecisionController(
    makeDecideAuthorizationUseCase(),
    new AuthorizationDecisionValidator()
  );
}
