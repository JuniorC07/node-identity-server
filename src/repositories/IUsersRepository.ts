import { User } from '@/entities/User.js';

export interface IUsersRepository {
  create(user: User): Promise<void>;
  findUserByLogin: (login: string) => Promise<User | null>;
  findUserByEmail: (email: string) => Promise<User | null>;
}
