export interface UserProps {
  id: string;
  name: string | null;
  email: string | null;
  login: string | null;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public readonly id: string;
  public name: string | null;
  public email: string | null;
  public login: string | null;
  public passwordHash: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.login = props.login;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
