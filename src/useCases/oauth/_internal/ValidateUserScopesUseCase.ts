import type { OAuthScope } from '@/entities/oauth/OAuthScope.js';
import { InvalidOAuthScopeError } from '@/errors/oauth/InvalidOAuthScopeError.js';
import { OAuthAccessDeniedError } from '@/errors/oauth/OAuthAccessDeniedError.js';
import type { IUserResourceProfilesRepository } from '@/repositories/IUserResourceProfilesRepository.js';

export interface ValidateUserScopesInput {
  userId: string;
  scopes: OAuthScope[];
}

export class ValidateUserScopesUseCase {
  constructor(private readonly userResourceProfilesRepository: IUserResourceProfilesRepository) {}

  async execute(input: ValidateUserScopesInput): Promise<void> {
    const resourceScopes = input.scopes.filter((scope) => scope.isResource());
    const grantedScopeIds = await this.userResourceProfilesRepository.findGrantedScopeIds({
      userId: input.userId,
      scopeIds: resourceScopes.map((scope) => scope.id),
    });
    const grantedScopeIdSet = new Set(grantedScopeIds);

    if (resourceScopes.some((scope) => !grantedScopeIdSet.has(scope.id))) {
      throw new OAuthAccessDeniedError();
    }

    const audiences = [...new Set(resourceScopes.map((scope) => scope.resource.audience))];

    if (audiences.length > 1) {
      throw new InvalidOAuthScopeError();
    }
  }
}
