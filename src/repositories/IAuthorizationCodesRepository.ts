import type { AuthorizationCode } from '@/entities/AuthorizationCode.js';
import type { OAuthConsentGrant } from '@/entities/OAuthConsentGrant.js';

export interface IssueAuthorizationCodeInput {
  authorizationRequestId: string;
  authorizationCode: AuthorizationCode;
  consentGrants: OAuthConsentGrant[];
  now: Date;
}

export interface IAuthorizationCodesRepository {
  issue(input: IssueAuthorizationCodeInput): Promise<boolean>;
  findPendingByCodeHash(codeHash: string, now: Date): Promise<AuthorizationCode | null>;
  consume(id: string, now: Date): Promise<boolean>;
}
