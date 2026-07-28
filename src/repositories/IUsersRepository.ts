import { Identity, type IdentityProvider } from '@/entities/Identity.js';
import { User } from '@/entities/User.js';

export interface IUsersRepository {
  create(user: User, identity: Identity): Promise<void>;
  findIdentityByProviderSubject(
    provider: IdentityProvider,
    providerSubject: string
  ): Promise<Identity | null>;
  findUserByEmail: (email: string) => Promise<User | null>;
}
