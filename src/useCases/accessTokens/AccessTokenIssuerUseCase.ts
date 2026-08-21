import type { ITokenSignerService } from '@/services/jwt/ITokenSignerService.js';
import { TOKEN_TYPES } from '@/services/jwt/TokenTypes.js';

export interface AccessTokenIssuerInput {
  subject: string;
  sessionId: string;
  clientId: string;
  scopes: string[];
  audience: string | string[];
}

export interface AccessTokenIssuerOutput {
  accessToken: string;
  tokenType: 'Bearer';
  issuedAt: Date;
  expiresAt: Date;
  expiresIn: number;
}

export class AccessTokenIssuerUseCase {
  constructor(
    private readonly tokenSigner: ITokenSignerService,
    private readonly accessTokenLifetimeInSeconds: number
  ) {}

  async execute(input: AccessTokenIssuerInput): Promise<AccessTokenIssuerOutput> {
    const result = await this.tokenSigner.sign({
      subject: input.subject,
      audience: input.audience,
      expiresInSeconds: this.accessTokenLifetimeInSeconds,
      typ: TOKEN_TYPES.accessToken,
      claims: {
        sid: input.sessionId,
        client_id: input.clientId,
        scope: input.scopes.join(' '),
      },
    });

    return {
      accessToken: result.token,
      tokenType: 'Bearer',
      issuedAt: result.issuedAt,
      expiresAt: result.expiresAt,
      expiresIn: this.accessTokenLifetimeInSeconds,
    };
  }
}
