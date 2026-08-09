import { makeOAuthScopesRepository } from '@/main/factories/repositories/makeOAuthScopesRepository.js';
import { ResolveOAuthScopesUseCase } from '@/useCases/oauth/ResolveOAuthScopesUseCase.js';

export function makeResolveOAuthScopesUseCase(): ResolveOAuthScopesUseCase {
  return new ResolveOAuthScopesUseCase(makeOAuthScopesRepository());
}
