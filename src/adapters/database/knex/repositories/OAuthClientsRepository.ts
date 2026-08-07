import type { Knex } from 'knex';

import { OAuthClient } from '@/entities/OAuthClient.js';
import type { IOAuthClientsRepository } from '@/repositories/IOAuthClientsRepository.js';

interface OAuthClientRow {
  id: string;
  client_id: string;
  name: string;
  type: string;
  client_secret_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

interface OAuthClientRedirectUriRow {
  oauth_client_id: string;
  redirect_uri: string;
}

interface OAuthClientAllowedScopeRow {
  oauth_client_id: string;
  scope: string;
}

export class KnexOAuthClientsRepository implements IOAuthClientsRepository {
  constructor(private readonly db: Knex) {}

  async create(client: OAuthClient): Promise<void> {
    await this.db.transaction(async (trx) => {
      await trx<OAuthClientRow>('oauth_clients').insert({
        id: client.id,
        client_id: client.clientId,
        name: client.name,
        type: client.type,
        client_secret_hash: client.clientSecretHash,
        created_at: client.createdAt,
        updated_at: client.updatedAt,
      });

      if (client.redirectUris.length > 0) {
        await trx<OAuthClientRedirectUriRow>('oauth_client_redirect_uris').insert(
          client.redirectUris.map((redirectUri) => ({
            oauth_client_id: client.id,
            redirect_uri: redirectUri,
          }))
        );
      }

      if (client.allowedScopes.length > 0) {
        await trx<OAuthClientAllowedScopeRow>('oauth_client_allowed_scopes').insert(
          client.allowedScopes.map((scope) => ({
            oauth_client_id: client.id,
            scope,
          }))
        );
      }
    });
  }

  async findByClientId(clientId: string): Promise<OAuthClient | null> {
    const clientRow = await this.db<OAuthClientRow>('oauth_clients')
      .where({ client_id: clientId })
      .first();

    if (!clientRow) {
      return null;
    }

    const [redirectUriRows, allowedScopeRows] = await Promise.all([
      this.db<OAuthClientRedirectUriRow>('oauth_client_redirect_uris')
        .select('redirect_uri')
        .where({ oauth_client_id: clientRow.id })
        .orderBy('redirect_uri'),
      this.db<OAuthClientAllowedScopeRow>('oauth_client_allowed_scopes')
        .select('scope')
        .where({ oauth_client_id: clientRow.id })
        .orderBy('scope'),
    ]);

    return this.toDomain(
      clientRow,
      redirectUriRows.map((row) => row.redirect_uri),
      allowedScopeRows.map((row) => row.scope)
    );
  }

  private toDomain(
    clientRow: OAuthClientRow,
    redirectUris: string[],
    allowedScopes: string[]
  ): OAuthClient {
    const commonProps = {
      id: clientRow.id,
      clientId: clientRow.client_id,
      name: clientRow.name,
      redirectUris,
      allowedScopes,
      createdAt: clientRow.created_at,
      updatedAt: clientRow.updated_at,
    };

    if (clientRow.type === 'public' && clientRow.client_secret_hash === null) {
      return new OAuthClient({
        ...commonProps,
        type: 'public',
        clientSecretHash: null,
      });
    }

    if (
      clientRow.type === 'confidential' &&
      typeof clientRow.client_secret_hash === 'string' &&
      clientRow.client_secret_hash.length > 0
    ) {
      return new OAuthClient({
        ...commonProps,
        type: 'confidential',
        clientSecretHash: clientRow.client_secret_hash,
      });
    }

    throw new Error(`Invalid persisted OAuth client state for client ${clientRow.client_id}`);
  }
}
