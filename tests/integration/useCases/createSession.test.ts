import request from 'supertest';
import * as cookie from 'cookie';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { makeCreateUser } from '@/main/factories/useCases/users/makeCreateUserUseCase.js';
import { CreateUserInput, CreateUserOutput } from '@/useCases/users/CreateUserUseCase.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';

async function createUser(overrides: Partial<CreateUserInput> = {}): Promise<CreateUserOutput> {
  const useCase = makeCreateUser();
  const user = await useCase.execute({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password(),
    ...overrides,
  });
  return user;
}

describe('POST /sessions', () => {
  beforeEach(async () => {
    await db('users').delete();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should return 401 with incorrect email but correct password', async () => {
    await createUser({ password: 's3cretP4ssw0rd' });
    const response = await request(app).post('/sessions').send({
      identifier: 'example-incorrect@test.com',
      password: 's3cretP4ssw0rd',
    });

    expect(response.status).toBe(401);
    expect(response.body.name).toBe('invalid_credentials');
  });

  it('should return 401 with incorrect password but correct email', async () => {
    await createUser({ email: 'example@test.com' });
    const response = await request(app).post('/sessions').send({
      identifier: 'example@test.com',
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.name).toBe('invalid_credentials');
  });

  it('should return 401 with incorrect email and incorrect email', async () => {
    await createUser();
    const response = await request(app).post('/sessions').send({
      identifier: 'example-incorrect@test.com',
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.name).toBe('invalid_credentials');
  });

  it('should return 201 with correct email and correct password', async () => {
    const testUser = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: faker.internet.password(),
    };
    await createUser(testUser);
    const response = await request(app).post('/sessions').send({
      identifier: testUser.email,
      password: testUser.password,
    });
    const [rawCookie] = response.headers['set-cookie'] ?? [];

    expect(rawCookie).toBeDefined();
    const sessionCookie = cookie.parseSetCookie(rawCookie);

    expect(sessionCookie.name).toBe(sessionCookieConfig.name);
    expect(sessionCookie.value).toBeDefined();

    expect(response.status).toBe(201);
  });

  it('should return 400 with no email', async () => {
    const testUser = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: faker.internet.password(),
    };
    await createUser(testUser);
    const response = await request(app).post('/sessions').send({
      password: testUser.password,
    });

    expect(response.status).toBe(400);
  });

  it('should return 201 and slice userAgent when its > 1000', async () => {
    const testUser = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: faker.internet.password(),
    };
    const userAgent = 'X'.repeat(2000);
    const { identity } = await createUser(testUser);

    const response = await request(app).post('/sessions').set('user-agent', userAgent).send({
      identifier: testUser.email,
      password: testUser.password,
    });
    const persistedSession = await db('sessions').where({ identity_id: identity.id }).first();
    expect(response.status).toBe(201);
    expect(persistedSession.user_agent?.length).toBe(1000);
  });
});
