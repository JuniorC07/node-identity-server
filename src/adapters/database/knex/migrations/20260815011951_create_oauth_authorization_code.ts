import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('oauth_authorization_codes', (table) => {
    table.uuid('id').primary();

    table
      .uuid('authorization_request_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('oauth_authorization_requests')
      .onDelete('CASCADE');

    table.specificType('code_hash', 'char(64)').notNullable().unique();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.timestamp('approved_at', { useTz: true }).nullable();
    table.timestamp('denied_at', { useTz: true }).nullable();

    table.index(['expires_at']);
  });

  await knex.raw(`
    ALTER TABLE oauth_authorization_codes
    ADD CONSTRAINT oauth_authorization_codes_expiration_check
    CHECK (expires_at > created_at)
  `);

  await knex.raw(`
    ALTER TABLE oauth_authorization_codes
    ADD CONSTRAINT oauth_authorization_codes_decision_check
    CHECK (
      (approved_at IS NULL OR approved_at >= created_at)
      AND (denied_at IS NULL OR denied_at >= created_at)
      AND NOT (approved_at IS NOT NULL AND denied_at IS NOT NULL)
    )
  `);
}

export async function down(_knex: Knex): Promise<void> {
  // Forward-only migration.
}
