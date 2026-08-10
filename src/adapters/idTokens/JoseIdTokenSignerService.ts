import { SignJWT } from 'jose';

import type { ITokenKeyStoreService } from '@/services/accessTokens/ITokenKeyStoreService.js';
import type {
  IIdTokenSignerService,
  SignIdTokenInput,
  SignIdTokenOutput,
} from '@/services/idTokens/IIdTokenSignerService.js';

interface JoseIdTokenSignerConfig {
  issuer: string;
  algorithm: 'RS256';
}

export class JoseIdTokenSignerService implements IIdTokenSignerService {
  constructor(
    private readonly keyStore: ITokenKeyStoreService,
    private readonly config: JoseIdTokenSignerConfig
  ) {}

  async sign(input: SignIdTokenInput): Promise<SignIdTokenOutput> {
    const signingKey = await this.keyStore.getSigningKey();
    const issuedAtInSeconds = Math.floor(Date.now() / 1000);
    const expiresAtInSeconds = issuedAtInSeconds + input.expiresInSeconds;
    const claims = input.nonce
      ? { ...input.claims, sid: input.sessionId, nonce: input.nonce }
      : {
          ...input.claims,
          sid: input.sessionId,
        };

    const token = await new SignJWT(claims)
      .setProtectedHeader({
        alg: this.config.algorithm,
        typ: 'JWT',
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
