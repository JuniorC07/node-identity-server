export type OAuthClientType = 'public' | 'confidential';

interface BaseOAuthClientProps {
  id: string;
  clientId: string;
  name: string;
  redirectUris: string[];
  allowedScopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface PublicOAuthClientProps extends BaseOAuthClientProps {
  type: 'public';
  clientSecretHash: null;
}

interface ConfidentialOAuthClientProps extends BaseOAuthClientProps {
  type: 'confidential';
  clientSecretHash: string;
}

export type OAuthClientProps = PublicOAuthClientProps | ConfidentialOAuthClientProps;

export class OAuthClient {
  public readonly id: string;
  public readonly clientId: string;
  public readonly name: string;
  public readonly type: OAuthClientType;
  public readonly clientSecretHash: string | null;
  public readonly redirectUris: readonly string[];
  public readonly allowedScopes: readonly string[];
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: OAuthClientProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.name = props.name;
    this.type = props.type;
    this.clientSecretHash = props.clientSecretHash;
    this.redirectUris = [...props.redirectUris];
    this.allowedScopes = [...props.allowedScopes];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isPublic(): boolean {
    return this.type === 'public';
  }

  isConfidential(): boolean {
    return this.type === 'confidential';
  }

  allowsRedirectUri(redirectUri: string): boolean {
    return this.redirectUris.includes(redirectUri);
  }

  allowsScopes(requestedScopes: string[]): boolean {
    const allowedScopes = new Set(this.allowedScopes);

    return requestedScopes.every((scope) => allowedScopes.has(scope));
  }
}
