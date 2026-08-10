import { randomUUID } from 'node:crypto';

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('oauth_resources', (table) => {
    table.uuid('id').primary();
    table.string('key', 100).notNullable().unique();
    table.text('audience').notNullable().unique();
    table.string('name', 150).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
  });

  await knex.schema.createTable('authorization_profiles', (table) => {
    table.uuid('id').primary();
    table
      .uuid('resource_id')
      .notNullable()
      .references('id')
      .inTable('oauth_resources')
      .onDelete('CASCADE');
    table.string('key', 100).notNullable();
    table.string('name', 150).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();

    table.unique(['resource_id', 'key']);
    table.unique(['id', 'resource_id']);
  });

  await knex.schema.createTable('authorization_modules', (table) => {
    table.uuid('id').primary();
    table
      .uuid('resource_id')
      .notNullable()
      .references('id')
      .inTable('oauth_resources')
      .onDelete('CASCADE');
    table.string('key', 100).notNullable();
    table.string('name', 150).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();

    table.unique(['resource_id', 'key']);
    table.unique(['id', 'resource_id']);
  });

  await knex.schema.createTable('authorization_actions', (table) => {
    table.uuid('id').primary();
    table.string('key', 100).notNullable().unique();
    table.string('name', 150).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
  });

  await knex.schema.createTable('oauth_scopes', (table) => {
    table.uuid('id').primary();
    table.string('key', 100).notNullable().unique();
    table.string('type', 20).notNullable();
    table.uuid('resource_id').nullable();
    table.uuid('module_id').nullable();
    table.uuid('action_id').nullable();
    table.text('description').notNullable();
    table.boolean('consent_required').notNullable().defaultTo(false);
    table.boolean('enabled').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();

    table.foreign('resource_id').references('id').inTable('oauth_resources').onDelete('CASCADE');
    table
      .foreign('action_id')
      .references('id')
      .inTable('authorization_actions')
      .onDelete('CASCADE');
    table
      .foreign(['module_id', 'resource_id'])
      .references(['id', 'resource_id'])
      .inTable('authorization_modules')
      .onDelete('CASCADE');
    table.unique(['id', 'resource_id']);
    table.index(['resource_id']);
  });

  await knex.raw(`
    ALTER TABLE oauth_scopes
    ADD CONSTRAINT oauth_scopes_type_check
    CHECK (type IN ('oidc', 'resource'))
  `);

  await knex.raw(`
    ALTER TABLE oauth_scopes
    ADD CONSTRAINT oauth_scopes_context_check
    CHECK (
      (
        type = 'oidc'
        AND resource_id IS NULL
        AND module_id IS NULL
        AND action_id IS NULL
      )
      OR
      (
        type = 'resource'
        AND resource_id IS NOT NULL
        AND module_id IS NOT NULL
        AND action_id IS NOT NULL
      )
    )
  `);

  await knex.schema.createTable('user_resource_profiles', (table) => {
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('resource_id').notNullable();
    table.uuid('profile_id').notNullable();
    table.timestamp('assigned_at', { useTz: true }).notNullable();

    table.primary(['user_id', 'resource_id']);
    table
      .foreign(['profile_id', 'resource_id'])
      .references(['id', 'resource_id'])
      .inTable('authorization_profiles')
      .onDelete('CASCADE');
    table.index(['profile_id']);
  });

  await knex.schema.createTable('profile_scopes', (table) => {
    table.uuid('profile_id').notNullable();
    table.uuid('resource_id').notNullable();
    table.uuid('scope_id').notNullable();

    table.primary(['profile_id', 'scope_id']);
    table
      .foreign(['profile_id', 'resource_id'])
      .references(['id', 'resource_id'])
      .inTable('authorization_profiles')
      .onDelete('CASCADE');
    table
      .foreign(['scope_id', 'resource_id'])
      .references(['id', 'resource_id'])
      .inTable('oauth_scopes')
      .onDelete('CASCADE');
    table.index(['scope_id']);
  });

  await knex.schema.alterTable('oauth_client_allowed_scopes', (table) => {
    table.dropPrimary('oauth_client_allowed_scopes_pkey');
    table.dropColumn('scope');
  });

  await knex.schema.alterTable('oauth_client_allowed_scopes', (table) => {
    table
      .uuid('scope_id')
      .notNullable()
      .references('id')
      .inTable('oauth_scopes')
      .onDelete('CASCADE');

    table.primary(['oauth_client_id', 'scope_id']);
    table.index(['scope_id']);
  });

  await knex.schema.createTable('oauth_consent_grants', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table
      .uuid('oauth_client_id')
      .notNullable()
      .references('id')
      .inTable('oauth_clients')
      .onDelete('CASCADE');
    table
      .uuid('scope_id')
      .notNullable()
      .references('id')
      .inTable('oauth_scopes')
      .onDelete('CASCADE');
    table.timestamp('granted_at', { useTz: true }).notNullable();
    table.timestamp('expires_at', { useTz: true }).nullable();
    table.timestamp('revoked_at', { useTz: true }).nullable();

    table.unique(['user_id', 'oauth_client_id', 'scope_id']);
    table.index(['oauth_client_id']);
    table.index(['scope_id']);
    table.index(['expires_at']);
  });

  await knex.raw(`
    ALTER TABLE oauth_consent_grants
    ADD CONSTRAINT oauth_consent_grants_expiration_check
    CHECK (expires_at IS NULL OR expires_at > granted_at)
  `);

  const now = new Date();
  await knex('oauth_scopes').insert([
    {
      id: randomUUID(),
      key: 'openid',
      type: 'oidc',
      description: 'Authenticate using OpenID Connect',
      consent_required: false,
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      key: 'profile',
      type: 'oidc',
      description: 'Access basic profile information',
      consent_required: true,
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      key: 'email',
      type: 'oidc',
      description: 'Access the user email address',
      consent_required: true,
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      key: 'phone',
      type: 'oidc',
      description: 'Access the user phone number',
      consent_required: true,
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      key: 'address',
      type: 'oidc',
      description: 'Access the user address',
      consent_required: true,
      enabled: true,
      created_at: now,
      updated_at: now,
    },
  ]);
}

export async function down(_knex: Knex): Promise<void> {
  // Forward-only migration.
}
