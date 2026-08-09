import { makeOAuthConsentGrantsRepository } from '@/main/factories/repositories/makeOAuthConsentGrantsRepository.js';
import { GrantOAuthConsentUseCase } from '@/useCases/oauth/GrantOAuthConsentUseCase.js';

export function makeGrantOAuthConsentUseCase(): GrantOAuthConsentUseCase {
  return new GrantOAuthConsentUseCase(makeOAuthConsentGrantsRepository());
}
