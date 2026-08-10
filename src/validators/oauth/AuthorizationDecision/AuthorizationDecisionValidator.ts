import { InvalidOAuthAuthorizationDecisionError } from '@/errors/oauth/InvalidOAuthAuthorizationDecisionError.js';
import type { DecideAuthorizationInput } from '@/useCases/oauth/DecideAuthorizationUseCase.js';
import { schema } from '@/validators/oauth/AuthorizationDecision/AuthorizationDecisionSchema.js';

export type AuthorizationDecisionRequestInput = Pick<
  DecideAuthorizationInput,
  'authorizationRequestToken' | 'decision'
>;

export class AuthorizationDecisionValidator {
  validate(data: unknown): AuthorizationDecisionRequestInput {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new InvalidOAuthAuthorizationDecisionError();
    }

    return {
      authorizationRequestToken: result.data.authorization_request_token,
      decision: result.data.decision,
    };
  }
}
