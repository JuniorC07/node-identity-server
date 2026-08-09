import type { AuthorizationRequest } from '@/entities/AuthorizationRequest.js';

export interface IAuthorizationRequestsRepository {
  create(request: AuthorizationRequest): Promise<void>;
}
