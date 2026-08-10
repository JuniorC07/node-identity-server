import type { User } from '@/entities/User.js';
import type { IIdTokenSignerService } from '@/services/idTokens/IIdTokenSignerService.js';

export interface IdTokenIssuerInput {
  user: User;
  sessionId: string;
  clientId: string;
  nonce: string | null;
  scopes: string[];
}

export class IdTokenIssuerUseCase {
  constructor(
    private readonly signer: IIdTokenSignerService,
    private readonly lifetimeInSeconds: number
  ) {}

  async execute(input: IdTokenIssuerInput): Promise<string> {
    const scopeSet = new Set(input.scopes);
    const claims: Record<string, string> = {};

    if (scopeSet.has('profile')) {
      claims.preferred_username = input.user.username;

      if (input.user.name) {
        claims.name = input.user.name;
      }
    }

    if (scopeSet.has('email') && input.user.email) {
      claims.email = input.user.email;
    }

    const result = await this.signer.sign({
      subject: input.user.id,
      audience: input.clientId,
      sessionId: input.sessionId,
      nonce: input.nonce,
      claims,
      expiresInSeconds: this.lifetimeInSeconds,
    });

    return result.token;
  }
}
