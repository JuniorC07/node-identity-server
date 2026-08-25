import type { IUsersRepository } from '@/repositories/IUsersRepository.js';
import { InsufficientAccessTokenScopeError } from '@/errors/accessTokens/InsufficientAccessTokenScopeError.js';
import { InvalidAccessTokenError } from '@/errors/accessTokens/InvalidAccessTokenError.js';

interface GetUserInfoInput {
  scopes: string[];
  userId: string;
}

interface UserInfoOutput {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
}

export class GetUserInfoUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(input: GetUserInfoInput): Promise<UserInfoOutput> {
    const scopes = new Set(input.scopes);

    if (!scopes.has('openid')) {
      throw new InsufficientAccessTokenScopeError(['openid']);
    }

    const user = await this.usersRepository.findUserById(input.userId);

    if (!user) {
      throw new InvalidAccessTokenError();
    }

    const output: UserInfoOutput = {
      sub: user.id,
    };

    if (scopes.has('profile')) {
      output.preferred_username = user.username;

      if (user.name) {
        output.name = user.name;
      }
    }

    if (scopes.has('email') && user.email) {
      output.email = user.email;
    }

    return output;
  }
}
