import { makeOAuthScopesRepository } from '@/main/factories/repositories/oauth/makeOAuthScopesRepository.js';
import { ResolveRegisteredOAuthScopesUseCase } from '@/useCases/oauth/_internal/ResolveRegisteredOAuthScopesUseCase.js';

export function makeResolveRegisteredOAuthScopesUseCase(): ResolveRegisteredOAuthScopesUseCase {
  const clientsRepository = makeOAuthScopesRepository();

  return new ResolveRegisteredOAuthScopesUseCase(clientsRepository);
}
