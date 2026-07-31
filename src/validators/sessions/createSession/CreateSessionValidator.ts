import { schema } from '@/validators/sessions/createSession/CreateSessionSchema.js';
import { BadRequestError } from '@/errors/general/BadRequestError.js';
import { CreateLocalSessionInput } from '@/useCases/sessions/CreateLocalSessionUseCase.js';

export class CreateSessionValidator {
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
