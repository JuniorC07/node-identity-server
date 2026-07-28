import { schema } from '@/validators/users/createUser/schema.js';
import { BadRequestError } from '@/errors/general/BadRequestError.js';
import { CreateUserInput } from '@/useCases/CreateUser.js';

export class CreateUserValidator {
  validate(data: unknown): CreateUserInput {
    const result = schema.safeParse(data);

    if (!result.success) {
      console.log();
      throw new BadRequestError({
        message: result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', '),
      });
    }

    return result.data;
  }
}
