import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('identities', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');

    table.string('provider', 30).notNullable();
    table.string('provider_subject', 255).notNullable();
    table.string('password_hash').nullable();
    table.string('provider_email').nullable();

    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();

    table.unique(['provider', 'provider_subject']);
    table.unique(['user_id', 'provider']);
  });

  await knex.raw(`
    ALTER TABLE identities
    ADD CONSTRAINT identities_password_check
    CHECK (
      (provider = 'local' AND password_hash IS NOT NULL)
      OR
      (provider <> 'local' AND password_hash IS NULL)
    )
  `);

  await knex.raw(`
    INSERT INTO identities (
      id,
      user_id,
      provider,
      provider_subject,
      password_hash,
      created_at,
      updated_at
    )
    SELECT
      gen_random_uuid(),
      id,
      'local',
      login,
      password_hash,
      created_at,
      updated_at
    FROM users
    WHERE login IS NOT NULL
      AND password_hash IS NOT NULL
  `);

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('login');
    table.dropColumn('password_hash');
  });
}

export async function down(_knex: Knex): Promise<void> {
  // Forward-only migration.
}
