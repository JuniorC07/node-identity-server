import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { makeCreateUser } from '@/main/factories/useCases/users/makeCreateUserUseCase.js';
import { makeCreateLocalSessionUseCase } from '@/main/factories/useCases/sessions/makeCreateSessionUseCase.js';
import { CreateUserInput } from '@/useCases/users/CreateUserUseCase.js';
import { CreateLocalSessionOutput } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { User } from '@/entities/User.js';

let createdSession: null | CreateLocalSessionOutput = null;

interface createUserAndSessionOutput {
  user: User;
  sessionOutput: CreateLocalSessionOutput;
}

async function createUserAndSession(
  overrides: Partial<CreateUserInput> = {}
): Promise<createUserAndSessionOutput> {
  const createUser = makeCreateUser();
  const createSession = makeCreateLocalSessionUseCase();
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

  return { sessionOutput: createdSession, user };
}

describe('POST /admin/oauth/clients', () => {
  beforeAll(async () => {
    await createUserAndSession();
  });

  afterAll(async () => {
    await db('users').delete();
    await db('oauth_clients').delete();
    await db.destroy();
  });

  it('should return 201 with correct client data(type `public`)', async () => {
    const name = faker.internet.domainWord();
    const url = faker.internet.url();
    const scope = faker.animal.cat();
    const response = await request(app)
      .post('/admin/oauth/clients')
      .send({
        name,
        type: 'public',
        redirectUris: [url],
        allowedScopes: [scope],
      })
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    expect(response.status).toBe(201);
    expect(response.body.secret).toBeNull();
    expect(response.body.clientId).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.redirectUris).toEqual([url]);
    expect(response.body.allowedScopes).toEqual([scope]);
  });

  it('should return 201 with correct client data(type `confidential`)', async () => {
    const name = faker.internet.domainWord();
    const url = faker.internet.url();
    const scope = faker.animal.cat();
    const response = await request(app)
      .post('/admin/oauth/clients')
      .send({
        name,
        type: 'confidential',
        redirectUris: [url],
        allowedScopes: [scope],
      })
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    expect(response.status).toBe(201);
    expect(response.body.secret).not.toBeNull();
    expect(response.body.clientId).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.redirectUris).toEqual([url]);
    expect(response.body.allowedScopes).toEqual([scope]);
  });

  it('should return 400 if type is not present', async () => {
    const name = faker.internet.domainWord();
    const url = faker.internet.url();
    const scope = faker.animal.cat();
    const response = await request(app)
      .post('/admin/oauth/clients')
      .send({
        name,
        redirectUris: [url],
        allowedScopes: [scope],
      })
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    expect(response.status).toBe(400);
  });
});
