import { Identity } from '@/entities/Identity.js';
import { User } from '@/entities/User.js';

export interface IUsersRepository {
  create(user: User, identity: Identity): Promise<void>;
  findUserByEmail: (email: string) => Promise<User | null>;
  findUserByUsername: (username: string) => Promise<User | null>;
}
