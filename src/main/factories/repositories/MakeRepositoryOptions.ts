import { db } from '@/adapters/database/knex/connection.js';

export interface MakeRepositoryOptions {
  connection?: typeof db;
}
