import { TokenController } from '@/controllers/oauth/TokenController.js';
import { makeExchangeAuthorizationCodeUseCase } from '@/main/factories/useCases/oauth/makeExchangeAuthorizationCodeUseCase.js';
import { TokenRequestValidator } from '@/validators/oauth/Token/TokenRequestValidator.js';

export function makeTokenController(): TokenController {
  const exchangeAuthorizationCodeUseCase = makeExchangeAuthorizationCodeUseCase();
  const validator = new TokenRequestValidator();

  return new TokenController(exchangeAuthorizationCodeUseCase, validator);
}
