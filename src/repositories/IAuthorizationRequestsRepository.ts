import type { AuthorizationRequest } from '@/entities/AuthorizationRequest.js';

export interface IAuthorizationRequestsRepository {
  create(request: AuthorizationRequest): Promise<void>;
  findPendingByTokenHash(tokenHash: string, now: Date): Promise<AuthorizationRequest | null>;
  consume(id: string, now: Date): Promise<boolean>;
}
