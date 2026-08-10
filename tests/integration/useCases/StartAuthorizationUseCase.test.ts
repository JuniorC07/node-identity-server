import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { makeCreateUser } from '@/main/factories/useCases/users/makeCreateUserUseCase.js';
import { makeCreateOAuthClientUseCase } from '@/main/factories/useCases/oauth/makeCreateOAuthClientUseCase.js';
import { makeCreateLocalSessionUseCase } from '@/main/factories/useCases/sessions/makeCreateSessionUseCase.js';
import { CreateUserInput } from '@/useCases/users/CreateUserUseCase.js';
import { CreateLocalSessionOutput } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { User } from '@/entities/User.js';
import { CreateOAuthClientOutput } from '@/useCases/oauth/CreateOAuthClientUseCase.js';

let createdSession: null | CreateLocalSessionOutput = null;
let createdClient: null | CreateOAuthClientOutput = null;

interface createUserAndSessionOutput {
  user: User;
  sessionOutput: CreateLocalSessionOutput;
  client: CreateOAuthClientOutput;
}

async function createUserAndSession(
  overrides: Partial<CreateUserInput> = {}
): Promise<createUserAndSessionOutput> {
  const createUser = makeCreateUser();
  const createSession = makeCreateLocalSessionUseCase();
  const createClient = makeCreateOAuthClientUseCase();
  const email = faker.internet.email();
  const password = faker.internet.password();
  const { user } = await createUser.execute({
    name: faker.person.fullName(),
    username: faker.internet.username(),
    password,
    email,
    ...overrides,
  });

  createdSession = await createSession.execute({
    identifier: email,
    password,
    ipAddress: null,
    userAgent: null,
  });

  createdClient = await createClient.execute({
    allowedScopes: ['openid'],
    name: 'client',
    type: 'public',
    redirectUris: ['http://localhost:3001/callback'],
  });
  return { sessionOutput: createdSession, user, client: createdClient };
}

describe('POST /oauth/authorize', () => {
  beforeAll(async () => {
    await createUserAndSession();
  });

  afterAll(async () => {
    await db('users').delete();
    await db('oauth_clients').delete();
    await db.destroy();
  });

  it('should return 200 with correct client params', async () => {
    const response = await request(app)
      .get('/oauth/authorize')
      .query({
        response_type: 'code',
        client_id: createdClient?.client.clientId,
        redirect_uri: 'http://localhost:3001/callback',
        scope: 'openid',
        state: 'E9Melhoa2OwvFrEMTJgu',
        nonce: 'EMTJguCHaoeK1t8URWbuGJ',
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
      })
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    expect(response.status).toBe(200);
    expect(response.body.authorizationRequestToken).toBeDefined();
  });
});
