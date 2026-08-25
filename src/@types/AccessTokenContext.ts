export interface AccessTokenContext {
  userId: string;
  clientId: string;
  sessionId: string;
  scopes: string[];
  audience: string | string[];
}
