import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();

    table.string('name').nullable();
    table.string('email').nullable().unique();
    table.string('login').nullable().unique();
    table.string('password_hash').nullable();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
  });
}

export async function down(_knex: Knex): Promise<void> {
  // Forward-only migration.
}
