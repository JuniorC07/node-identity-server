import { makeResetTestDatabaseAndMigrate } from '../scripts/resetTestDatabaseAndMigrate/makeResetTestDatabaseAndMigrate.js';

export default async function globalSetup(): Promise<void> {
  const testDatabaseRunner = makeResetTestDatabaseAndMigrate();

  await testDatabaseRunner.resetAndMigrate();
}
