import * as dotenv from 'dotenv';
import knex, { Knex } from 'knex';
import { join } from 'node:path';

import type { TestDatabaseRunner } from '../contracts/TestDatabaseRunner.js';

const projectRoot = join(import.meta.dirname, '../../..');
const testEnvironmentPath = join(projectRoot, '.env.test');
const migrationsDirectory = join(projectRoot, 'src/adapters/database/knex/migrations');

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} in ${testEnvironmentPath}`);
  }

  return value;
}

function loadTestDatabaseConfig(): Knex.Config {
  const result = dotenv.config({
    path: testEnvironmentPath,
    override: true,
    quiet: true,
  });

  if (result.error) {
    throw new Error(`Could not load ${testEnvironmentPath}`, { cause: result.error });
  }

  const database = requiredEnvironmentVariable('DATABASE_NAME');

  if (!database.endsWith('_test')) {
    throw new Error('Refusing to reset a database whose name does not end with "_test"');
  }

  return {
    client: requiredEnvironmentVariable('DATABASE_CLIENT'),
    connection: {
      host: requiredEnvironmentVariable('DATABASE_HOST'),
      port: Number(requiredEnvironmentVariable('DATABASE_PORT')),
      user: requiredEnvironmentVariable('DATABASE_USER'),
      password: requiredEnvironmentVariable('DATABASE_PASSWORD'),
      database,
    },
  };
}

export class KnexTestDatabaseRunner implements TestDatabaseRunner {
  async resetAndMigrate(): Promise<void> {
    const testConfig = loadTestDatabaseConfig();
    const testConnection = testConfig.connection as Knex.PgConnectionConfig;
    const databaseName = requiredEnvironmentVariable('DATABASE_NAME');
    const databaseUser = requiredEnvironmentVariable('DATABASE_USER');

    const adminDb = knex({
      ...testConfig,
      connection: {
        ...testConnection,
        database: process.env.DATABASE_ADMIN_NAME || 'postgres',
      },
    });

    try {
      await adminDb.raw('DROP DATABASE IF EXISTS ?? WITH (FORCE)', [databaseName]);
      await adminDb.raw('CREATE DATABASE ?? OWNER ??', [databaseName, databaseUser]);
    } finally {
      await adminDb.destroy();
    }

    const testDb = knex({
      ...testConfig,
      migrations: {
        directory: migrationsDirectory,
        loadExtensions: ['.ts'],
      },
    });

    try {
      await testDb.migrate.latest();
    } finally {
      await testDb.destroy();
    }
  }
}
