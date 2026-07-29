import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const localIdentityWithoutEmail = await knex('identities as identities')
    .join('users as users', 'users.id', 'identities.user_id')
    .where('identities.provider', 'local')
    .where((builder) => builder.whereNull('users.email').orWhereRaw("trim(users.email) = ''"))
    .first('identities.id');

  if (localIdentityWithoutEmail) {
    throw new Error('Cannot migrate a local identity whose user does not have an email');
  }

  const localIdentityWithLongSubject = await knex('identities')
    .where({ provider: 'local' })
    .whereRaw('length(trim(provider_subject)) > 50')
    .first('id');

  if (localIdentityWithLongSubject) {
    throw new Error('Cannot migrate a local login longer than 50 characters to username');
  }

  const duplicatedUsername = await knex('identities')
    .select(knex.raw('lower(trim(provider_subject)) AS username'))
    .where({ provider: 'local' })
    .groupByRaw('lower(trim(provider_subject))')
    .havingRaw('count(*) > 1')
    .first();

  if (duplicatedUsername) {
    throw new Error('Cannot migrate local logins that differ only by letter casing');
  }

  const duplicatedLocalEmail = await knex('identities as identities')
    .join('users as users', 'users.id', 'identities.user_id')
    .select(knex.raw('lower(trim(users.email)) AS email'))
    .where('identities.provider', 'local')
    .groupByRaw('lower(trim(users.email))')
    .havingRaw('count(*) > 1')
    .first();

  if (duplicatedLocalEmail) {
    throw new Error('Cannot use duplicated local emails as provider subjects');
  }

  await knex.schema.alterTable('users', (table) => {
    table.string('username', 50).nullable();
  });

  await knex.raw(`
    UPDATE users
    SET username = lower(trim(identities.provider_subject))
    FROM identities
    WHERE identities.user_id = users.id
      AND identities.provider = 'local'
  `);

  await knex.raw(`
    UPDATE users
    SET username = 'user_' || replace(id::text, '-', '')
    WHERE username IS NULL
  `);

  await knex.schema.alterTable('users', (table) => {
    table.string('username', 50).notNullable().alter();
  });

  await knex.raw(`
    CREATE UNIQUE INDEX users_username_lower_unique
    ON users (lower(username))
  `);

  await knex.raw(`
    UPDATE identities
    SET
      provider_subject = lower(trim(users.email)),
      provider_email = lower(trim(users.email)),
      updated_at = CURRENT_TIMESTAMP
    FROM users
    WHERE identities.user_id = users.id
      AND identities.provider = 'local'
  `);
}

export async function down(_knex: Knex): Promise<void> {
  // Forward-only migration: the previous local login cannot be reconstructed safely.
}
