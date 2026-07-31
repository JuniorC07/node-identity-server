import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sessions', (table) => {
    table.uuid('id').primary();

    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');

    table
      .uuid('identity_id')
      .notNullable()
      .references('id')
      .inTable('identities')
      .onDelete('CASCADE');

    table.specificType('token_hash', 'char(64)').notNullable().unique();

    table.specificType('ip_address', 'inet').nullable();
    table.text('user_agent').nullable();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('last_used_at', { useTz: true }).notNullable();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.timestamp('revoked_at', { useTz: true }).nullable();

    table.index(['user_id']);
    table.index(['identity_id']);
    table.index(['expires_at']);
  });

  await knex.raw(`
    ALTER TABLE sessions
    ADD CONSTRAINT sessions_expiration_check
    CHECK (expires_at > created_at)
  `);
}

export async function down(_knex: Knex): Promise<void> {
  // Forward-only migration: the previous local login cannot be reconstructed safely.
}
