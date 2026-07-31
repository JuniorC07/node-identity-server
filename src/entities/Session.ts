export interface SessionProps {
  id: string;
  userId: string;
  identityId: string;
  tokenHash: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}

export class Session {
  public readonly id: string;
  public readonly userId: string;
  public readonly identityId: string;
  public readonly tokenHash: string;
  public ipAddress: string | null;
  public userAgent: string | null;
  public readonly createdAt: Date;
  public lastUsedAt: Date;
  public expiresAt: Date;
  public revokedAt: Date | null;

  constructor(props: SessionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.identityId = props.identityId;
    this.tokenHash = props.tokenHash;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.createdAt = props.createdAt;
    this.lastUsedAt = props.lastUsedAt;
    this.expiresAt = props.expiresAt;
    this.revokedAt = props.revokedAt;
  }
}
