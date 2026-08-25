import { getRequiredAbsoluteUrlEnv } from '@/utils/environment/environmentVariables.js';

const issuer = getRequiredAbsoluteUrlEnv('ACCESS_TOKEN_ISSUER');

export const oidcConfig = {
  issuer,
  endpoints: {
    authorization: new URL('/oauth/authorize', issuer).toString(),
    token: new URL('/oauth/token', issuer).toString(),
    userInfo: new URL('/oauth/userinfo', issuer).toString(),
    jwks: new URL('/.well-known/jwks.json', issuer).toString(),
  },
  signingAlgorithm: 'RS256' as const,
  responseTypesSupported: ['code'] as const,
  grantTypesSupported: ['authorization_code'] as const,
  subjectTypesSupported: ['public'] as const,
  tokenEndpointAuthMethodsSupported: [
    'client_secret_basic',
    'client_secret_post',
    'none',
  ] as const,
  scopesSupported: ['openid', 'profile', 'email'] as const,
  claimsSupported: ['sub', 'name', 'preferred_username', 'email'] as const,
  codeChallengeMethodsSupported: ['S256'] as const,
};

export interface OpenIdProviderConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  response_types_supported: readonly string[];
  grant_types_supported: readonly string[];
  subject_types_supported: readonly string[];
  id_token_signing_alg_values_supported: readonly string[];
  token_endpoint_auth_methods_supported: readonly string[];
  scopes_supported: readonly string[];
  claims_supported: readonly string[];
  code_challenge_methods_supported: readonly string[];
}

export const openIdProviderConfiguration: OpenIdProviderConfiguration = {
  issuer: oidcConfig.issuer,
  authorization_endpoint: oidcConfig.endpoints.authorization,
  token_endpoint: oidcConfig.endpoints.token,
  userinfo_endpoint: oidcConfig.endpoints.userInfo,
  jwks_uri: oidcConfig.endpoints.jwks,
  response_types_supported: oidcConfig.responseTypesSupported,
  grant_types_supported: oidcConfig.grantTypesSupported,
  subject_types_supported: oidcConfig.subjectTypesSupported,
  id_token_signing_alg_values_supported: [oidcConfig.signingAlgorithm],
  token_endpoint_auth_methods_supported: oidcConfig.tokenEndpointAuthMethodsSupported,
  scopes_supported: oidcConfig.scopesSupported,
  claims_supported: oidcConfig.claimsSupported,
  code_challenge_methods_supported: oidcConfig.codeChallengeMethodsSupported,
};
