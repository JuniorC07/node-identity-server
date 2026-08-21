import type { ITokenSignerService } from '@/services/jwt/ITokenSignerService.js';
import { TOKEN_TYPES } from '@/services/jwt/TokenTypes.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';
import { BadRequestError } from '@/errors/general/BadRequestError.js';

export interface IdTokenIssuerInput {
  userId: string;
  sessionId: string;
  clientId: string;
  nonce: string | null;
  scopes: string[];
}

export class IdTokenIssuerUseCase {
  constructor(
    private readonly signer: ITokenSignerService,
    private readonly usersRepository: IUsersRepository,
    private readonly lifetimeInSeconds: number
  ) {}

  async execute(input: IdTokenIssuerInput): Promise<string> {
    const scopeSet = new Set(input.scopes);
    const claims: Record<string, string> = {
      sid: input.sessionId,
    };

    if (input.nonce) {
      claims.nonce = input.nonce;
    }
    const user = await this.usersRepository.findUserById(input.userId);
    if (!user) {
      throw new BadRequestError();
    }

    if (scopeSet.has('profile')) {
      claims.preferred_username = user.username;

      if (user.name) {
        claims.name = user.name;
      }
    }

    if (scopeSet.has('email') && user.email) {
      claims.email = user.email;
    }

    const result = await this.signer.sign({
      subject: user.id,
      audience: input.clientId,
      typ: TOKEN_TYPES.idToken,
      claims,
      expiresInSeconds: this.lifetimeInSeconds,
    });

    return result.token;
  }
}
