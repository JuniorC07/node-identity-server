import type { AuthorizationRequest } from '@/entities/AuthorizationRequest.js';

export interface IAuthorizationRequestsRepository {
  create(request: AuthorizationRequest): Promise<void>;
  findById(id: string): Promise<AuthorizationRequest | null>;
  findPendingByTokenHash(tokenHash: string, now: Date): Promise<AuthorizationRequest | null>;
  findPendingById(id: string, now: Date): Promise<AuthorizationRequest | null>;
  consume(id: string, now: Date): Promise<boolean>;
}
