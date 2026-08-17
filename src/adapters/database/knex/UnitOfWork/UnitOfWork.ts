import type { Knex } from 'knex';

import type { IUnitOfWork } from '@/services/database/IUnitOfWork.js';

export class KnexUnitOfWork<TRepositories> implements IUnitOfWork<TRepositories> {
  constructor(
    private readonly db: Knex,

    private readonly createRepositories: (trx: Knex.Transaction) => TRepositories
  ) {}

  execute<TResult>(operation: (repositories: TRepositories) => Promise<TResult>): Promise<TResult> {
    return this.db.transaction(async (trx) => {
      const repositories = this.createRepositories(trx);

      return operation(repositories);
    });
  }
}
