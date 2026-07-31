export interface TestDatabaseRunner {
  resetAndMigrate(): Promise<void>;
}
