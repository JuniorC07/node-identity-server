import { describe, expect, it } from 'vitest';

import { InvalidOAuthClientCredentialsError } from '@/errors/oauth/InvalidOAuthClientCredentialsError.js';
import { TokenRequestValidator } from '@/validators/oauth/Token/TokenRequestValidator.js';

const requestBody = {
  grant_type: 'authorization_code',
  code: 'authorization-code',
  redirect_uri: 'https://client.example.com/callback',
  code_verifier: 'A'.repeat(43),
};

describe('TokenRequestValidator', () => {
  it('should accept a public client id in the body', () => {
    const validator = new TokenRequestValidator();

    expect(validator.validate({ ...requestBody, client_id: 'public-client' }, undefined)).toEqual({
      grantType: 'authorization_code',
      code: 'authorization-code',
      redirectUri: 'https://client.example.com/callback',
      codeVerifier: 'A'.repeat(43),
      clientId: 'public-client',
      clientSecret: null,
    });
  });

  it('should parse confidential client credentials from HTTP Basic', () => {
    const validator = new TokenRequestValidator();
    const basic = Buffer.from('client-id:client-secret').toString('base64');

    expect(validator.validate(requestBody, `Basic ${basic}`)).toMatchObject({
      clientId: 'client-id',
      clientSecret: 'client-secret',
    });
  });

  it('should reject multiple client authentication methods', () => {
    const validator = new TokenRequestValidator();
    const basic = Buffer.from('client-id:client-secret').toString('base64');

    expect(() =>
      validator.validate({ ...requestBody, client_secret: 'body-secret' }, `Basic ${basic}`)
    ).toThrow(InvalidOAuthClientCredentialsError);
  });
});
