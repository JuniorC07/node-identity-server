export interface IUnitOfWork<TRepositories> {
  execute<TResult>(operation: (repositories: TRepositories) => Promise<TResult>): Promise<TResult>;
}
