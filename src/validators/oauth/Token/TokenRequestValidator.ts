import { InvalidOAuthClientError } from '@/errors/oauth/InvalidOAuthClientError.js';
import { InvalidOAuthAuthorizationRequestError } from '@/errors/oauth/InvalidOAuthAuthorizationRequestError.js';
import type { ExchangeAuthorizationCodeRequestInput } from '@/useCases/oauth/ExchangeAuthorizationCodeUseCase.js';
import { schema } from '@/validators/oauth/Token/TokenRequestSchema.js';
import { InvalidCrendentialsError } from '@/errors/general/InvalidCrendentialsError.js';

interface ClientCredentials {
  clientId: string;
  clientSecret: string | null;
}

export class TokenRequestValidator {
  validate(
    data: unknown,
    authorizationHeader: string | undefined
  ): ExchangeAuthorizationCodeRequestInput {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new InvalidOAuthAuthorizationRequestError();
    }

    const credentials = authorizationHeader
      ? this.parseBasicCredentials(
          authorizationHeader,
          result.data.client_id,
          result.data.client_secret
        )
      : this.parseBodyCredentials(result.data.client_id, result.data.client_secret);

    return {
      grantType: result.data.grant_type,
      code: result.data.code,
      redirectUri: result.data.redirect_uri,
      codeVerifier: result.data.code_verifier,
      ...credentials,
    };
  }

  private parseBasicCredentials(
    authorizationHeader: string,
    bodyClientId: string | undefined,
    bodyClientSecret: string | undefined
  ): ClientCredentials {
    if (bodyClientSecret || !authorizationHeader.startsWith('Basic ')) {
      throw new InvalidOAuthClientError(true);
    }

    try {
      const decoded = Buffer.from(authorizationHeader.slice(6), 'base64').toString('utf8');
      const separatorIndex = decoded.indexOf(':');

      if (separatorIndex < 1) {
        throw new InvalidCrendentialsError('Malformed client credentials');
      }

      const clientId = this.decodeCredential(decoded.slice(0, separatorIndex));
      const clientSecret = this.decodeCredential(decoded.slice(separatorIndex + 1));

      if (!clientSecret || (bodyClientId && bodyClientId !== clientId)) {
        throw new InvalidCrendentialsError('Conflicting client credentials');
      }

      return { clientId, clientSecret };
    } catch {
      throw new InvalidOAuthClientError(true);
    }
  }

  private parseBodyCredentials(
    clientId: string | undefined,
    clientSecret: string | undefined
  ): ClientCredentials {
    if (!clientId) {
      throw new InvalidOAuthClientError(true);
    }

    return { clientId, clientSecret: clientSecret ?? null };
  }

  private decodeCredential(value: string): string {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  }
}
