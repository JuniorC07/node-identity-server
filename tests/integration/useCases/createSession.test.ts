import request from 'supertest';
import * as cookie from 'cookie';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { makeCreateUser } from '@/main/factories/useCases/users/makeCreateUserUseCase.js';
import { CreateUserInput } from '@/useCases/users/CreateUserUseCase.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';

async function createUser(overrides: Partial<CreateUserInput> = {}): Promise<void> {
  const useCase = makeCreateUser();
  await useCase.execute({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password(),
    ...overrides,
  });
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
});
