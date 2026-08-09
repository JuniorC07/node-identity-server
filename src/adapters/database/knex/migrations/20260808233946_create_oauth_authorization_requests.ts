import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('oauth_authorization_requests', (table) => {
    table.uuid('id').primary();

    table.specificType('request_token_hash', 'char(64)').notNullable().unique();

    table
      .uuid('oauth_client_id')
      .notNullable()
      .references('id')
      .inTable('oauth_clients')
      .onDelete('CASCADE');

    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');

    table.uuid('session_id').notNullable().references('id').inTable('sessions').onDelete('CASCADE');

    table.text('redirect_uri').notNullable();
    table.specificType('requested_scopes', 'text[]').notNullable();
    table.text('state').notNullable();
    table.text('nonce').nullable();

    table.string('code_challenge', 128).notNullable();
    table.string('code_challenge_method', 10).notNullable();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.timestamp('consumed_at', { useTz: true }).nullable();

    table.index(['oauth_client_id']);
    table.index(['user_id']);
    table.index(['session_id']);
    table.index(['expires_at']);
  });

  await knex.raw(`
    ALTER TABLE oauth_authorization_requests
    ADD CONSTRAINT oauth_authorization_requests_pkce_method_check
    CHECK (code_challenge_method = 'S256')
  `);

  await knex.raw(`
    ALTER TABLE oauth_authorization_requests
    ADD CONSTRAINT oauth_authorization_requests_expiration_check
    CHECK (expires_at > created_at)
  `);
}

export async function down(_knex: Knex): Promise<void> {
  // Forward-only migration.
}
