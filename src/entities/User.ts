export interface UserProps {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public readonly id: string;
  public name: string | null;
  public email: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
