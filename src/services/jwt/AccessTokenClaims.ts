export interface AccessTokenClaims {
  issuer: string;
  subject: string;
  sessionId: string;
  clientId: string;
  scopes: string[];
  audience: string[];
  issuedAt: Date;
  expiresAt: Date;
}
