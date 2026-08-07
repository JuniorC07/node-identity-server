import { randomUUID } from 'node:crypto';

import { OAuthClient } from '@/entities/OAuthClient.js';
import type { IOAuthClientsRepository } from '@/repositories/IOAuthClientsRepository.js';
import type { IPasswordHasherService } from '@/services/IPasswordHasherService.js';
import type { IOAuthClientCredentialsService } from '@/services/IOAuthClientCredentialsService.js';

export interface CreateOAuthClientInput {
  name: string;
  type: 'public' | 'confidential';
  redirectUris: string[];
  allowedScopes: string[];
}

export interface CreateOAuthClientOutput {
  client: OAuthClient;
  clientSecret: string | null;
}

export class CreateOAuthClientUseCase {
  constructor(
    private readonly clientsRepository: IOAuthClientsRepository,
    private readonly credentialsService: IOAuthClientCredentialsService,
    private readonly secretHasher: IPasswordHasherService
  ) {}

  async execute(input: CreateOAuthClientInput): Promise<CreateOAuthClientOutput> {
    const clientId = this.credentialsService.generateClientId();

    const rawClientSecret =
      input.type === 'confidential' ? this.credentialsService.generateClientSecret() : null;

    const clientSecretHash = rawClientSecret ? await this.secretHasher.hash(rawClientSecret) : null;

    const now = new Date();

    const commonProps = {
      id: randomUUID(),
      clientId,
      name: input.name,
      redirectUris: [...new Set(input.redirectUris)],
      allowedScopes: [...new Set(input.allowedScopes)],
      createdAt: now,
      updatedAt: now,
    };

    const client =
      input.type === 'confidential'
        ? new OAuthClient({
            ...commonProps,
            type: 'confidential',
            clientSecretHash: clientSecretHash!,
          })
        : new OAuthClient({
            ...commonProps,
            type: 'public',
            clientSecretHash: null,
          });

    await this.clientsRepository.create(client);

    return {
      client,
      clientSecret: rawClientSecret,
    };
  }
}
