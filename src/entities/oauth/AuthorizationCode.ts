export interface AuthorizationCodeProps {
  id: string;
  authorizationRequestId: string;
  codeHash: string;
  createdAt: Date;
  expiresAt: Date;
  approvedAt: Date | null;
  deniedAt: Date | null;
}

export class AuthorizationCode {
  public readonly id: string;
  public readonly authorizationRequestId: string;
  public readonly codeHash: string;
  public readonly createdAt: Date;
  public readonly expiresAt: Date;
  public readonly approvedAt: Date | null;
  public readonly deniedAt: Date | null;

  constructor(props: AuthorizationCodeProps) {
    this.id = props.id;
    this.authorizationRequestId = props.authorizationRequestId;

    this.codeHash = props.codeHash;
    this.createdAt = props.createdAt;
    this.expiresAt = props.expiresAt;
    this.approvedAt = props.approvedAt;
    this.deniedAt = props.deniedAt;
  }

  isConsumed(): boolean {
    return !!(this.approvedAt || this.deniedAt);
  }
}
