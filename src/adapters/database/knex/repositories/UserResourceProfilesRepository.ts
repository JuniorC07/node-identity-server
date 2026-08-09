import type { Knex } from 'knex';

import type {
  FindUserGrantedScopeIdsInput,
  IUserResourceProfilesRepository,
} from '@/repositories/IUserResourceProfilesRepository.js';

interface GrantedScopeRow {
  scope_id: string;
}

export class KnexUserResourceProfilesRepository implements IUserResourceProfilesRepository {
  constructor(private readonly db: Knex) {}

  async findGrantedScopeIds(input: FindUserGrantedScopeIdsInput): Promise<string[]> {
    if (input.scopeIds.length === 0) {
      return [];
    }

    const rows = await this.db<GrantedScopeRow>('user_resource_profiles as assignment')
      .innerJoin('profile_scopes as permission', function joinProfileScopes() {
        this.on('permission.profile_id', '=', 'assignment.profile_id').andOn(
          'permission.resource_id',
          '=',
          'assignment.resource_id'
        );
      })
      .select('permission.scope_id')
      .where('assignment.user_id', input.userId)
      .whereIn('permission.scope_id', [...input.scopeIds]);

    return [...new Set(rows.map((row) => row.scope_id))];
  }
}
