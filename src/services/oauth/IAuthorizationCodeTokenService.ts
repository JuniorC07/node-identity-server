export interface AuthorizationCodeTokenPair {
  rawToken: string;
  tokenHash: string;
}

export interface IAuthorizationCodeTokenService {
  generate(): AuthorizationCodeTokenPair;
  hash(rawToken: string): string;
}
