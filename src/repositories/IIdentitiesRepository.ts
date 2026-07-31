import { Identity, type IdentityProvider } from '@/entities/Identity.js';

export interface IIdentitiesRepository {
  findByProviderSubject(
    provider: IdentityProvider,
    providerSubject: string
  ): Promise<Identity | null>;
}
