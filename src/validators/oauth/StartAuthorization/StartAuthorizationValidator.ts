import { StartAuthorizationRequestInput } from '@/useCases/oauth/StartAuthorizationUseCase.js';
import { BadRequestError } from '@/errors/general/BadRequestError.js';
import { schema } from '@/validators/oauth/StartAuthorization/StartAuthorizationSchema.js';

export class AuthorizeRequestValidator {
  validate(data: unknown): StartAuthorizationRequestInput {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new BadRequestError({
        message: result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', '),
      });
    }

    return {
      responseType: result.data.response_type,
      clientId: result.data.client_id,
      redirectUri: result.data.redirect_uri,
      scope: result.data.scope,
      state: result.data.state,
      nonce: result.data.nonce ?? null,
      codeChallenge: result.data.code_challenge,
      codeChallengeMethod: result.data.code_challenge_method,
    };
  }
}
