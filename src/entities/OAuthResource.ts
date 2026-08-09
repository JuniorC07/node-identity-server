export interface OAuthResourceProps {
  id: string;
  key: string;
  audience: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class OAuthResource {
  public readonly id: string;
  public readonly key: string;
  public readonly audience: string;
  public readonly name: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: OAuthResourceProps) {
    this.id = props.id;
    this.key = props.key;
    this.audience = props.audience;
    this.name = props.name;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
