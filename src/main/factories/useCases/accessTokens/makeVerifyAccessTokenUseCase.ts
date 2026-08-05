import { makeAccessTokenVerifierService } from '@/main/factories/services/makeAccessTokenServices.js';
import { VerifyAccessTokenUseCase } from '@/useCases/accessTokens/VerifyAccessTokenUseCase.js';

export function makeVerifyAccessTokenUseCase(): VerifyAccessTokenUseCase {
  const tokenVerifier = makeAccessTokenVerifierService();
  return new VerifyAccessTokenUseCase(tokenVerifier);
}
