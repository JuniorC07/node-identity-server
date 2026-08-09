import type { Knex } from 'knex';

import { OAuthScope } from '@/entities/OAuthScope.js';
import type { IOAuthScopesRepository } from '@/repositories/IOAuthScopesRepository.js';

interface OAuthScopeRow {
  id: string;
  key: string;
  type: 'oidc' | 'resource';
  resource_id: string | null;
  resource_audience: string | null;
  module_id: string | null;
  module_key: string | null;
  action_id: string | null;
  action_key: string | null;
  description: string;
  consent_required: boolean;
  enabled: boolean;
}

export class KnexOAuthScopesRepository implements IOAuthScopesRepository {
  constructor(private readonly db: Knex) {}

  async findByKeys(keys: readonly string[]): Promise<OAuthScope[]> {
    if (keys.length === 0) {
      return [];
    }

    const rows = await this.db<OAuthScopeRow>('oauth_scopes as scope')
      .leftJoin('oauth_resources as resource', 'resource.id', 'scope.resource_id')
      .leftJoin('authorization_modules as module', 'module.id', 'scope.module_id')
      .leftJoin('authorization_actions as action', 'action.id', 'scope.action_id')
      .select(
        'scope.id',
        'scope.key',
        'scope.type',
        'scope.resource_id',
        'resource.audience as resource_audience',
        'scope.module_id',
        'module.key as module_key',
        'scope.action_id',
        'action.key as action_key',
        'scope.description',
        'scope.consent_required',
        'scope.enabled'
      )
      .whereIn('scope.key', [...keys])
      .orderBy('scope.key');

    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: OAuthScopeRow): OAuthScope {
    const commonProps = {
      id: row.id,
      key: row.key,
      description: row.description,
      consentRequired: row.consent_required,
      enabled: row.enabled,
    };

    if (
      row.type === 'oidc' &&
      row.resource_id === null &&
      row.resource_audience === null &&
      row.module_id === null &&
      row.module_key === null &&
      row.action_id === null &&
      row.action_key === null
    ) {
      return new OAuthScope({
        ...commonProps,
        type: 'oidc',
        resource: null,
        module: null,
        action: null,
      });
    }

    if (
      row.type === 'resource' &&
      row.resource_id &&
      row.resource_audience &&
      row.module_id &&
      row.module_key &&
      row.action_id &&
      row.action_key
    ) {
      return new OAuthScope({
        ...commonProps,
        type: 'resource',
        resource: {
          id: row.resource_id,
          audience: row.resource_audience,
        },
        module: {
          id: row.module_id,
          key: row.module_key,
        },
        action: {
          id: row.action_id,
          key: row.action_key,
        },
      });
    }

    throw new Error(`Invalid persisted OAuth scope state for scope ${row.key}`);
  }
}
