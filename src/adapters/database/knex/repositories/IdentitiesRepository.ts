import type { Knex } from 'knex';

import { Identity, type IdentityProvider } from '@/entities/Identity.js';
import type { IIdentitiesRepository } from '@/repositories/IIdentitiesRepository.js';

interface IdentityRow {
  id: string;
  user_id: string;
  provider: IdentityProvider;
  provider_subject: string;
  password_hash: string | null;
  provider_email: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export class KnexIdentitiesRepository implements IIdentitiesRepository {
  constructor(private readonly db: Knex) {}

  async findByProviderSubject(
    provider: IdentityProvider,
    providerSubject: string
  ): Promise<Identity | null> {
    const identity = await this.db<IdentityRow>('identities')
      .where({ provider: provider, provider_subject: providerSubject })
      .first();

    return identity ? this.toDomain(identity) : null;
  }

  private toDomain(identity: IdentityRow): Identity {
    const commonProps = {
      id: identity.id,
      userId: identity.user_id,
      providerSubject: identity.provider_subject,
      providerEmail: identity.provider_email,
      createdAt: new Date(identity.created_at),
      updatedAt: new Date(identity.updated_at),
    };

    return identity.provider === 'local'
      ? new Identity({ ...commonProps, provider: 'local', passwordHash: identity.password_hash! })
      : new Identity({ ...commonProps, provider: identity.provider, passwordHash: null });
  }
}
