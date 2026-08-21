import type { AuthorizationCode } from '@/entities/oauth/AuthorizationCode.js';

type ExchangeStatus = 'approved' | 'denied';

export interface ConsumeAuthorizationCodeInput {
  id: string;
  consumedAt: Date;
  status: ExchangeStatus;
}

export interface IAuthorizationCodesRepository {
  create(input: AuthorizationCode): Promise<void>;
  findPendingByCodeHash(codeHash: string, now: Date): Promise<AuthorizationCode | null>;
  consume(input: ConsumeAuthorizationCodeInput): Promise<boolean>;
}
