export interface AccessTokenClaims {
  issuer: string;
  subject: string;
  sessionId: string;
  audience: string[];
  issuedAt: Date;
  expiresAt: Date;
}
