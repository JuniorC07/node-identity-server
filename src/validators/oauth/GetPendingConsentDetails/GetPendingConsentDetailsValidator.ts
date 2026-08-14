import { schema } from '@/validators/oauth/GetPendingConsentDetails/GetPendingConsentDetailsSchema.js';
import { BadRequestError } from '@/errors/general/BadRequestError.js';
import { GetPendingConsentDetailsInputRequest } from '@/useCases/oauth/GetPendingConsentDetailsUseCase.js';

export class GetPendingConsentDetailsValidator {
  validate(data: unknown): GetPendingConsentDetailsInputRequest {
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
