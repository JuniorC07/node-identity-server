import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
import { join } from 'node:path';

dotenv.config({
  override: true,
  quiet: true,
  path: join(import.meta.dirname, '../../../../.env'),
});

const config: Record<string, Knex.Config> = {
  development: {
    client: process.env.DATABASE_CLIENT,
    connection: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT) || 5432,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    },
  },
};

export default config;
