import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('oauth_clients', (table) => {
    table.uuid('id').primary();
    table.string('client_id', 100).notNullable().unique();
    table.string('name', 150).notNullable();
    table.string('type', 20).notNullable();
    table.text('client_secret_hash').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
  });

  await knex.raw(`
    ALTER TABLE oauth_clients
    ADD CONSTRAINT oauth_clients_type_check
    CHECK (type IN ('public', 'confidential'))
  `);

  await knex.raw(`
    ALTER TABLE oauth_clients
    ADD CONSTRAINT oauth_clients_secret_check
    CHECK (
      (type = 'public' AND client_secret_hash IS NULL)
      OR
      (type = 'confidential' AND client_secret_hash IS NOT NULL)
    )
  `);

  await knex.schema.createTable('oauth_client_redirect_uris', (table) => {
    table
      .uuid('oauth_client_id')
      .notNullable()
      .references('id')
      .inTable('oauth_clients')
      .onDelete('CASCADE');

    table.text('redirect_uri').notNullable();

    table.primary(['oauth_client_id', 'redirect_uri']);
  });

  await knex.schema.createTable('oauth_client_allowed_scopes', (table) => {
    table
      .uuid('oauth_client_id')
      .notNullable()
      .references('id')
      .inTable('oauth_clients')
      .onDelete('CASCADE');

    table.string('scope', 100).notNullable();

    table.primary(['oauth_client_id', 'scope']);
  });
}

export async function down(_knex: Knex): Promise<void> {
  // Forward-only migration.
}
