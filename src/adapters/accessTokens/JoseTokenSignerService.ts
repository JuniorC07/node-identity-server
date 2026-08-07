import { SignJWT } from 'jose';

import type {
  ITokenSignerService,
  SignTokenInput,
  SignTokenOutput,
} from '@/services/accessTokens/ITokenSignerService.js';
import type { ITokenKeyStoreService } from '@/services/accessTokens/ITokenKeyStoreService.js';

interface JoseTokenSignerConfig {
  issuer: string;
  algorithm: 'RS256';
}

export class JoseTokenSignerService implements ITokenSignerService {
  constructor(
    private readonly keyStore: ITokenKeyStoreService,
    private readonly config: JoseTokenSignerConfig
  ) {}

  async sign(input: SignTokenInput): Promise<SignTokenOutput> {
    const signingKey = await this.keyStore.getSigningKey();

    const issuedAtInSeconds = Math.floor(Date.now() / 1000);
    const expiresAtInSeconds = issuedAtInSeconds + input.expiresInSeconds;
    const token = await new SignJWT({ sid: input.sessionId })
      .setProtectedHeader({
        alg: this.config.algorithm,
        typ: 'at+jwt',
        kid: signingKey.id,
      })
      .setIssuer(this.config.issuer)
      .setSubject(input.subject)
      .setAudience(input.audience)
      .setIssuedAt(issuedAtInSeconds)
      .setExpirationTime(expiresAtInSeconds)
      .sign(signingKey.privateKey);

    return {
      token,
      issuedAt: new Date(issuedAtInSeconds * 1000),
      expiresAt: new Date(expiresAtInSeconds * 1000),
    };
  }
}
