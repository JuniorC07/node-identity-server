export interface OAuthConsentGrantProps {
  id: string;
  userId: string;
  oauthClientId: string;
  scopeId: string;
  grantedAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
}

export class OAuthConsentGrant {
  public readonly id: string;
  public readonly userId: string;
  public readonly oauthClientId: string;
  public readonly scopeId: string;
  public readonly grantedAt: Date;
  public readonly expiresAt: Date | null;
  public revokedAt: Date | null;

  constructor(props: OAuthConsentGrantProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.oauthClientId = props.oauthClientId;
    this.scopeId = props.scopeId;
    this.grantedAt = props.grantedAt;
    this.expiresAt = props.expiresAt;
    this.revokedAt = props.revokedAt;
  }

  isActive(now: Date): boolean {
    return this.revokedAt === null && (this.expiresAt === null || this.expiresAt > now);
  }
}
