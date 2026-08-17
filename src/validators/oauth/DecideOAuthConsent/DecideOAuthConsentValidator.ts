import { BadRequestError } from '@/errors/general/BadRequestError.js';
import type { DecideOAuthConsentRequestInput } from '@/useCases/oauth/DecideOAuthConsentUseCase.js';
import { schema } from '@/validators/oauth/DecideOAuthConsent/DecideOAuthConsentSchema.js';

export class DecideOAuthConsentValidator {
  validate(data: unknown): DecideOAuthConsentRequestInput {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new BadRequestError({
        message: result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', '),
      });
    }

    return result.data;
  }
}
