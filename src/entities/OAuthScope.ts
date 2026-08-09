interface BaseOAuthScopeProps {
  id: string;
  key: string;
  description: string;
  consentRequired: boolean;
  enabled: boolean;
}

interface OidcOAuthScopeProps extends BaseOAuthScopeProps {
  type: 'oidc';
  resource: null;
  module: null;
  action: null;
}

interface ResourceOAuthScopeProps extends BaseOAuthScopeProps {
  type: 'resource';
  resource: {
    id: string;
    audience: string;
  };
  module: {
    id: string;
    key: string;
  };
  action: {
    id: string;
    key: string;
  };
}

export type OAuthScopeProps = OidcOAuthScopeProps | ResourceOAuthScopeProps;

export class OAuthScope {
  public readonly id: string;
  public readonly key: string;
  public readonly type: 'oidc' | 'resource';
  public readonly resource: OAuthScopeProps['resource'];
  public readonly module: OAuthScopeProps['module'];
  public readonly action: OAuthScopeProps['action'];
  public readonly description: string;
  public readonly consentRequired: boolean;
  public readonly enabled: boolean;

  constructor(props: OAuthScopeProps) {
    this.id = props.id;
    this.key = props.key;
    this.type = props.type;
    this.resource = props.resource;
    this.module = props.module;
    this.action = props.action;
    this.description = props.description;
    this.consentRequired = props.consentRequired;
    this.enabled = props.enabled;
  }

  isOidc(): boolean {
    return this.type === 'oidc';
  }

  isResource(): this is OAuthScope & {
    resource: NonNullable<OAuthScope['resource']>;
    module: NonNullable<OAuthScope['module']>;
    action: NonNullable<OAuthScope['action']>;
  } {
    return this.type === 'resource';
  }
}
