import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { makeCreateUser } from '@/main/factories/useCases/makeCreateUser.js';
import { CreateUserInput } from '@/useCases/CreateUser.js';

async function createUser(overrides: Partial<CreateUserInput> = {}): Promise<void> {
  const useCase = makeCreateUser();
  await useCase.execute({
    name: 'John Doe',
    email: 'john@example.com',
    username: 'john',
    password: 'secret12345@',
    ...overrides,
  });
}

describe.skip('POST /sessions', () => {
  beforeEach(async () => {
    await db('users').delete();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should return 401 with incorrect email but correct password', async () => {
    await createUser({ email: 'example@test.com', password: 's3cretP4ssw0rd' });
    const response = await request(app).post('/sessions').send({
      email: 'example-incorrect@test.com',
      password: 's3cretP4ssw0rd',
    });

    expect(response.status).toBe(401);
    expect(response.body.name).toBe('invalid_credentials');
  });

  it('should return 401 with incorrect password but correct email', async () => {
    await createUser({ email: 'example@test.com', password: 's3cretP4ssw0rd' });
    const response = await request(app).post('/sessions').send({
      email: 'example@test.com',
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.name).toBe('invalid_credentials');
  });

  it('should return 401 with incorrect email and incorrect email', async () => {
    await createUser({ email: 'example@test.com', password: 's3cretP4ssw0rd' });
    const response = await request(app).post('/sessions').send({
      email: 'example-incorrect@test.com',
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.name).toBe('invalid_credentials');
  });

  it('should return 201 with correct email and correct email', async () => {
    await createUser({ email: 'example@test.com', password: 's3cretP4ssw0rd' });
    const response = await request(app).post('/sessions').send({
      email: 'example@test.com',
      password: 's3cretP4ssw0rd',
    });

    expect(response.status).toBe(201);
  });
});
