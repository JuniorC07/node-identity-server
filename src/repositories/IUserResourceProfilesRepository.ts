export interface FindUserGrantedScopeIdsInput {
  userId: string;
  scopeIds: readonly string[];
}

export interface IUserResourceProfilesRepository {
  findGrantedScopeIds(input: FindUserGrantedScopeIdsInput): Promise<string[]>;
}
