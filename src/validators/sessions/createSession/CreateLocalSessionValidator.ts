import { schema } from '@/validators/sessions/createSession/CreateLocalSessionSchema.js';
import { BadRequestError } from '@/errors/general/BadRequestError.js';
import { CreateLocalSessionInput } from '@/useCases/sessions/CreateLocalSessionUseCase.js';

export class CreateLocalSessionValidator {
  validate(data: unknown): CreateLocalSessionInput {
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
