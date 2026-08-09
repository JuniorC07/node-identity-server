export interface AuthorizationRequestProps {
  id: string;
  requestTokenHash: string;

  oauthClientId: string;
  userId: string;
  sessionId: string;

  redirectUri: string;
  requestedScopes: string[];
  state: string;
  nonce: string | null;

  codeChallenge: string;
  codeChallengeMethod: 'S256';

  createdAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
}

export class AuthorizationRequest {
  public readonly id: string;
  public readonly requestTokenHash: string;
  public readonly oauthClientId: string;
  public readonly userId: string;
  public readonly sessionId: string;
  public readonly redirectUri: string;
  public readonly requestedScopes: readonly string[];
  public readonly state: string;
  public readonly nonce: string | null;
  public readonly codeChallenge: string;
  public readonly codeChallengeMethod: 'S256';
  public readonly createdAt: Date;
  public readonly expiresAt: Date;
  public consumedAt: Date | null;

  constructor(props: AuthorizationRequestProps) {
    this.id = props.id;
    this.requestTokenHash = props.requestTokenHash;
    this.oauthClientId = props.oauthClientId;
    this.userId = props.userId;
    this.sessionId = props.sessionId;
    this.redirectUri = props.redirectUri;
    this.requestedScopes = [...props.requestedScopes];
    this.state = props.state;
    this.nonce = props.nonce;
    this.codeChallenge = props.codeChallenge;
    this.codeChallengeMethod = props.codeChallengeMethod;
    this.createdAt = props.createdAt;
    this.expiresAt = props.expiresAt;
    this.consumedAt = props.consumedAt;
  }

  isExpired(now: Date): boolean {
    return this.expiresAt.getTime() <= now.getTime();
  }

  isConsumed(): boolean {
    return this.consumedAt !== null;
  }
}
