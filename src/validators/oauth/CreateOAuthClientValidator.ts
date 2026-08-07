import { schema } from '@/validators/oauth/CreateOAuthClientSchema.js';
import { BadRequestError } from '@/errors/general/BadRequestError.js';
import { CreateOAuthClientInput } from '@/useCases/oauth/CreateOAuthClientUseCase.js';

export class CreateOAuthClientValidator {
  validate(data: unknown): CreateOAuthClientInput {
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
