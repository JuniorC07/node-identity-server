import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { makeCreateUser } from '@/main/factories/useCases/users/makeCreateUserUseCase.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeCreateLocalSessionUseCase } from '@/main/factories/useCases/sessions/makeCreateSessionUseCase.js';
import { CreateUserInput } from '@/useCases/users/CreateUserUseCase.js';
import { CreateLocalSessionOutput } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { User } from '@/entities/User.js';

let createdSession: null | CreateLocalSessionOutput = null;
let createdUser: null | User = null;

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

  createdUser = user;

  createdSession = await createSession.execute({
    identifier: email,
    password,
    ipAddress: null,
    userAgent: null,
  });

  return { sessionOutput: createdSession, user };
}

describe('GET /users/me', () => {
  beforeAll(async () => {
    await createUserAndSession();
  });

  afterAll(async () => {
    await db('users').delete();
    await db.destroy();
  });

  it('should return 200 with correct user data', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...createdUser,
      createdAt: createdUser?.createdAt.toISOString(),
      updatedAt: createdUser?.updatedAt.toISOString(),
    });
  });

  it('should return 401 with invalid cookie name but valid value', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `invalid=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });

  it('should return 401 with valid cookie name but invalid value', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=invalid-token; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });

  it('should return 401 with invalid cookie name and invalid value', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `invalid-name=invalid-token; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });

  it('should return 401 with valid cookie name and valid value, but expired', async () => {
    const { sessionOutput } = await createUserAndSession();
    const sessionTokenService = makeSHA256SessionTokenService();
    const hashedToken = sessionTokenService.hash(sessionOutput.rawToken);

    await db('sessions').update({ expires_at: new Date() }).where({ token_hash: hashedToken });

    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=${sessionOutput?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });

  it('should return 401 with valid cookie name and valid value, but revoked', async () => {
    const { sessionOutput } = await createUserAndSession();
    const sessionTokenService = makeSHA256SessionTokenService();
    const hashedToken = sessionTokenService.hash(sessionOutput.rawToken);

    await db('sessions').update({ revoked_at: new Date() }).where({ token_hash: hashedToken });

    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=${sessionOutput?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });
});
