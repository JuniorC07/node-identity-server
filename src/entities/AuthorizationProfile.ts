export interface AuthorizationProfileProps {
  id: string;
  resourceId: string;
  key: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthorizationProfile {
  public readonly id: string;
  public readonly resourceId: string;
  public readonly key: string;
  public readonly name: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: AuthorizationProfileProps) {
    this.id = props.id;
    this.resourceId = props.resourceId;
    this.key = props.key;
    this.name = props.name;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
