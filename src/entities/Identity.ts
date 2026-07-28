export type IdentityProvider = 'local';

interface BaseIdentityProps {
  id: string;
  userId: string;
  providerSubject: string;
  providerEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LocalIdentityProps extends BaseIdentityProps {
  provider: 'local';
  passwordHash: string;
}

interface ExternalIdentityProps extends BaseIdentityProps {
  provider: Exclude<IdentityProvider, 'local'>;
  passwordHash: null;
}

export type IdentityProps = LocalIdentityProps | ExternalIdentityProps;

export class Identity {
  public readonly id: string;
  public readonly userId: string;
  public readonly provider: IdentityProvider;
  public providerSubject: string;
  public passwordHash: string | null;
  public providerEmail: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: IdentityProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.provider = props.provider;
    this.providerSubject = props.providerSubject;
    this.passwordHash = props.passwordHash;
    this.providerEmail = props.providerEmail;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
