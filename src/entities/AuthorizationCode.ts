export interface AuthorizationCodeProps {
  id: string;
  codeHash: string;
  oauthClientId: string;
  userId: string;
  sessionId: string;
  redirectUri: string;
  grantedScopes: string[];
  nonce: string | null;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
}

export class AuthorizationCode {
  public readonly id: string;
  public readonly codeHash: string;
  public readonly oauthClientId: string;
  public readonly userId: string;
  public readonly sessionId: string;
  public readonly redirectUri: string;
  public readonly grantedScopes: readonly string[];
  public readonly nonce: string | null;
  public readonly codeChallenge: string;
  public readonly codeChallengeMethod: 'S256';
  public readonly createdAt: Date;
  public readonly expiresAt: Date;
  public usedAt: Date | null;

  constructor(props: AuthorizationCodeProps) {
    this.id = props.id;
    this.codeHash = props.codeHash;
    this.oauthClientId = props.oauthClientId;
    this.userId = props.userId;
    this.sessionId = props.sessionId;
    this.redirectUri = props.redirectUri;
    this.grantedScopes = [...props.grantedScopes];
    this.nonce = props.nonce;
    this.codeChallenge = props.codeChallenge;
    this.codeChallengeMethod = props.codeChallengeMethod;
    this.createdAt = props.createdAt;
    this.expiresAt = props.expiresAt;
    this.usedAt = props.usedAt;
  }

  isExpired(now: Date): boolean {
    return this.expiresAt.getTime() <= now.getTime();
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }
}
