import { KnexTestDatabaseRunner } from './adapters/KnexTestDatabaseRunner.js';
import type { TestDatabaseRunner } from './contracts/TestDatabaseRunner.js';

export function makeResetTestDatabaseAndMigrate(): TestDatabaseRunner {
  return new KnexTestDatabaseRunner();
}
