import type { AuthorizationCode } from '@/entities/oauth/AuthorizationCode.js';

export interface IAuthorizationCodesRepository {
  create(input: AuthorizationCode): Promise<void>;
}
