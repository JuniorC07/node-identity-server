export interface GeneratedSessionToken {
  rawToken: string;
  tokenHash: string;
}

export interface ISessionTokenService {
  generate(): GeneratedSessionToken;
  hash(rawToken: string): string;
}
